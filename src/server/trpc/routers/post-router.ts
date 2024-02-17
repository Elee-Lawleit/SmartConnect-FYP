import { postSchema } from "../../validation schemas/postSchema"
import { privateProcedure, publicProcedure, router } from "../trpc"
import { TRPCError } from "@trpc/server"
import * as z from "zod"
import clerk from "@clerk/clerk-sdk-node"
import { PostWithRelations } from "../../../../prisma/types"
import { filterUserForClient } from "../../../server/helpers/filterUserForClient"
import { observable } from "@trpc/server/observable"

const addUserDataToPosts = async (posts: PostWithRelations[]) => {
  const userIds = posts.map((post) => post.userId)
  const usersList = (
    await clerk.users.getUserList({
      userId: userIds,
    })
  ).map(filterUserForClient)

  return posts.map((post) => {
    const user = usersList.find((user) => user.id === post.userId)

    if (!user) {
      console.error("USER NOT FOUND", post)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Author for post not found. POST ID: ${post.id}, USER ID: ${post.userId}`,
      })
    }
    return {
      post,
      user,
    }
  })
}
export const postRouter = router({
  onCreated: publicProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .subscription(({ ctx, input }) => {
      const { userId } = input

      return observable<PostWithRelations>((emit) => {
        const sendPostCreatedEvent = async (post: PostWithRelations) => {
          const friends = await ctx.prisma.friend.findMany({
            where: {
              OR: [{ userId: post.userId }, { friendId: post.userId }],
            },
          })

          friends.forEach((friend) => {
            //sending to every friend other than the creator
            if (
              (friend.friendId === userId || friend.userId === userId) &&
              post.userId !== userId
            ) {
              emit.next(post)
            }
          })
        }

        ctx.ee.on("onPostCreated", sendPostCreatedEvent)

        return () => {
          ctx.ee.off("onPostCreated", sendPostCreatedEvent)
        }
      })
    }),

  //just gonna make it private for now
  //might adjust to be public when I change other things as well
  fetchAllPosts: privateProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).nullish(),
        cursor: z.string().uuid().nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const limit = input.limit ?? 50
      const { cursor } = input

      let rawPosts: PostWithRelations[]
      try {
        rawPosts = await ctx.prisma.post.findMany({
          take: limit + 1,
          cursor: cursor ? { id: cursor } : undefined,
          orderBy: [
            {
              createdAt: "desc",
            },
            {
              likes: "desc",
            },
          ],
          include: {
            _count: {
              select: {
                comments: true,
                postLikes: true,
              },
            },
            postLikes: true,
            media: true,
          },
        })
      } catch (error) {
        console.log("🔴 Prisma Error: ", error)
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" })
      }

      let posts = await addUserDataToPosts(rawPosts)

      posts = posts.map((post) => {
        if (!ctx.user)
          return { ...post, post: { ...post.post, isLikedByUser: false } }
        const isLikedByUser = post.post.postLikes.some(
          (like) => like.userId === ctx.user?.id
        )
        return { ...post, post: { ...post.post, isLikedByUser } }
      })

      let nextCursor: typeof cursor | undefined = undefined

      //it means there still are posts to retrieve
      if (posts.length > limit) {
        const nextItem = posts.pop()
        nextCursor = nextItem!.post.id
      }

      return { success: true, posts, nextCursor }
    }),

  fetchPost: publicProcedure
    .input(
      z.object({
        postId: z.string().uuid(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { postId } = input

      if (!postId) throw new TRPCError({ code: "BAD_REQUEST" })

      let post: PostWithRelations | null

      post = await ctx.prisma.post.findFirst({
        where: {
          id: postId,
        },
        include: {
          _count: {
            select: {
              comments: true,
              postLikes: true,
            },
          },
          postLikes: true,
          media: true,
        },
      })

      if (!post) throw new TRPCError({ code: "NOT_FOUND" })

      const postWithUser = (await addUserDataToPosts([post]))[0]

      return { success: true, post: postWithUser }
    }),

  fetchUserPosts: privateProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).nullish(),
        cursor: z.string().uuid().nullish(),
        userId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const limit = input.limit ?? 50
      const { cursor, userId } = input

      if (!userId) {
        throw new TRPCError({ code: "BAD_REQUEST" })
      }

      let rawPosts: PostWithRelations[]
      try {
        rawPosts = await ctx.prisma.post.findMany({
          where: {
            userId: userId,
          },
          take: limit + 1,
          cursor: cursor ? { id: cursor } : undefined,
          orderBy: [
            {
              createdAt: "desc",
            },
          ],
          include: {
            _count: {
              select: {
                comments: true,
                postLikes: true,
              },
            },
            postLikes: true,
            media: true,
          },
        })
      } catch (error) {
        console.log("🔴 Prisma Error: ", error)
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" })
      }

      let posts = await addUserDataToPosts(rawPosts)
      posts = posts.map((post) => {
        if (!ctx.user)
          return { ...post, post: { ...post.post, isLikedByUser: false } }
        const isLikedByUser = post.post.postLikes.some(
          (like) => like.userId === ctx.user?.id
        )
        return { ...post, post: { ...post.post, isLikedByUser } }
      })

      let nextCursor: typeof cursor | undefined = undefined

      //it means there still are posts to retrieve
      if (posts.length > limit) {
        const nextItem = posts.pop()
        nextCursor = nextItem!.post.id
      }

      return { success: true, posts, nextCursor }
    }),

  createPost: privateProcedure
    .input(postSchema)
    .mutation(async ({ ctx, input }) => {
      const { caption, mediaUrls, fileTypes } = input
      const userId = ctx.user.id

      if (!caption && mediaUrls?.length == 0) {
        throw new TRPCError({ code: "BAD_REQUEST" })
      }

      let post
      try {
        post = await ctx.prisma.post.create({
          data: {
            userId: userId,
            caption: caption ?? null,
            media: {
              createMany: {
                data: mediaUrls!.map((url, index) => ({
                  // Assuming fileTypes is an array with the same length as mediaUrls
                  type: fileTypes![index].startsWith("image")
                    ? "image"
                    : "video",
                  url: url,
                  userId: ctx.user.id,
                })),
              },
            },
          },
        })
      } catch (error) {
        console.log("🔴 Prisma Error: ", error)
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" })
      }

      ctx.ee.emit("onPostCreated", post)

      return { success: true, post }
    }),

  deletePost: privateProcedure
    .input(
      z.object({
        postId: z.string().uuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { postId } = input

      if (!postId) {
        throw new TRPCError({ code: "BAD_REQUEST" })
      }

      try {
        const batchPayload = await ctx.prisma.post.deleteMany({
          where: {
            id: postId,
            userId: ctx.user.id,
          },
        })
      } catch (error) {
        console.log("🔴 Prisma Error: ", error)
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" })
      }
      return { success: true }
    }),

  likePost: privateProcedure
    .input(
      z.object({
        postId: z.string().uuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { postId } = input

      if (!postId) {
        throw new TRPCError({ code: "BAD_REQUEST" })
      }

      try {
        //maybe make this more secure later by checking if the user has already liked the post
        await ctx.prisma.post.update({
          data: {
            likes: {
              increment: 1,
            },
            postLikes: {
              create: {
                userId: ctx.user.id,
              },
            },
          },
          where: {
            id: postId,
          },
        })
      } catch (error) {
        console.log("🔴 Prisma Error: ", error)
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" })
      }
      return { success: true }
    }),
  unlikePost: privateProcedure
    .input(
      z.object({
        postId: z.string().uuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { postId } = input

      if (!postId) {
        throw new TRPCError({ code: "BAD_REQUEST" })
      }

      try {
        await ctx.prisma.post.update({
          data: {
            likes: {
              decrement: 1,
            },
            postLikes: {
              deleteMany: {},
            },
          },
          where: {
            id: postId,
          },
        })
      } catch (error) {
        console.log("🔴 Prisma Error: ", error)
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" })
      }
      return { success: true }
    }),

  savePost: privateProcedure
    .input(
      z.object({
        postId: z.string().uuid(),
        userId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { postId, userId } = input

      if (!postId || !userId) {
        throw new TRPCError({ code: "BAD_REQUEST" })
      }

      try {
        await ctx.prisma.savedPosts.create({
          data: {
            postId: postId,
            userId: userId,
          },
        })
      } catch (error) {
        console.log("🔴 Prisma Error: ", error)
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" })
      }
      return { success: true }
    }),
})

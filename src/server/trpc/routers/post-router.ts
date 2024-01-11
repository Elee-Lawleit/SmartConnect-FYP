import { postSchema } from "../../validation schemas/postSchema"
import { privateProcedure, publicProcedure, router } from "../trpc"
import { TRPCError } from "@trpc/server"
import * as z from "zod"
import { PrismaClient } from "@prisma/client"
import clerk from "@clerk/clerk-sdk-node"
import { PostWithRelations } from "../../../../prisma/types"
import { filterUserForClient } from "../../../server/helpers/filterUserForClient"

const prisma = new PrismaClient()

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
  fetchAllPosts: publicProcedure
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
        rawPosts = await prisma.post.findMany({
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
                postLikes: true
              }
            },
            postLikes: true,
            media: true,
          },
        })
      } catch (error) {
        console.log("🔴 Prisma Error: ", error)
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" })
      }

      const posts = await addUserDataToPosts(rawPosts)

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
    .query(async ({ input }) => {
      const { postId } = input

      if (!postId) throw new TRPCError({ code: "BAD_REQUEST" })

      let post: PostWithRelations | null
      try {
        post = await prisma.post.findFirst({
          where: {
            id: postId,
          },
          include: {
            _count: {
              select: {
                comments: true,
                postLikes: true
              }
            },
            postLikes: true,
            media: true,
          },
        })

        if (!post) throw new TRPCError({ code: "NOT_FOUND" })
      } catch (error) {
        console.log("🔴 Prisma Error: ", error)
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" })
      }

      const postWithUser = (await addUserDataToPosts([post]))[0]

      return { success: true, post: postWithUser }
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
        post = await prisma.post.create({
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
        const batchPayload = await prisma.post.deleteMany({
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
        await prisma.post.update({
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
    .mutation(async ({ input }) => {
      const { postId } = input

      if (!postId) {
        throw new TRPCError({ code: "BAD_REQUEST" })
      }

      try {
        await prisma.post.update({
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
})

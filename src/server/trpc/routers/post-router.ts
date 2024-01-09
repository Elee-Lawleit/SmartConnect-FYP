import { postSchema } from "../../validation schemas/postSchema"
import { privateProcedure, publicProcedure, router } from "../trpc"
import { TRPCError } from "@trpc/server"
import * as z from "zod"
import { PrismaClient } from "@prisma/client"
import clerk, { User } from "@clerk/clerk-sdk-node"
import {
  ExtendedPost,
  ExtendedPosts,
} from "../../../../prisma/typings/ExtendedPost"

const prisma = new PrismaClient()

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

      let posts: ExtendedPosts[] = []
      let rawPosts
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
            comments: {
              take: 10,
              orderBy: [
                {
                  likes: "desc",
                },
                {
                  createdAt: "desc",
                },
              ],
            },
            postLikes: true,
            media: true
          },
        })

        // Fetch users for each post concurrently
        const userIds = rawPosts.map((post) => post.userId)
        const users = await Promise.allSettled(
          userIds.map((userId) => clerk.users.getUser(userId))
        )

        function isFulfilledUser(
          result: PromiseSettledResult<User>
        ): result is PromiseFulfilledResult<User> {
          return result.status === "fulfilled"
        }

        posts = rawPosts.map((post, index) => {
          const userResult = users[index]
          const isFulfilled = isFulfilledUser(userResult)

          return {
            ...post,
            user: isFulfilled ? userResult.value : null,
            // media: post.media?.map((mediaId) => media[mediaId]) // If using a separate Media table
          }
        })
      } catch (error) {
        console.log("🔴 Prisma Error: ", error)
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" })
      }
      let nextCursor: typeof cursor | undefined = undefined

      //it means there still are posts to retrieve
      if (rawPosts.length > limit) {
        const nextItem = rawPosts.pop()
        nextCursor = nextItem!.id

        posts.pop()
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

      let post: ExtendedPost, user
      try {
        post = (await prisma.post.findFirst({
          where: {
            id: postId,
          },
          include: {
            comments: {
              take: 10,
              orderBy: [
                {
                  likes: "desc",
                },
                {
                  createdAt: "desc",
                },
              ],
            },
            postLikes: true,
            media: true
          },
        })) as ExtendedPost
        user = await clerk.users.getUser(post?.userId!)
        if (post) {
          post.user = user //->attaching the user here
        }
      } catch (error) {
        console.log("🔴 Prisma Error: ", error)
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" })
      }

      if (!post) {
        throw new TRPCError({ code: "NOT_FOUND" })
      }

      return { success: true, post }
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
    .mutation(async ({ input }) => {
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

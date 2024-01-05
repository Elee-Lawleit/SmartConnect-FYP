import { postSchema } from "../../validation schemas/postSchema"
import { privateProcedure, publicProcedure, router } from "../trpc"
import { TRPCError } from "@trpc/server"
import * as z from "zod"
import { PrismaClient } from "@prisma/client"

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

      let posts
      try {
        posts = await prisma.post.findMany({
          take: limit + 1,
          cursor: cursor ? { id: cursor } : undefined,
          orderBy: [
            {
              likes: "desc",
            },
            {
              createdAt: "desc",
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
          },
        })
      } catch (error) {
        console.log("🔴 Prisma Error: ", error)
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" })
      }
      let nextCursor: typeof cursor | undefined = undefined

      //it means there still are posts to retrieve
      if (posts.length > limit) {
        const nextItem = posts.pop()
        nextCursor = nextItem!.id
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

      let post
      try {
        post = await prisma.post.findFirst({
          where: {
            id: postId,
          },
          include: {
            comments: {
              take: 10,
              orderBy: {
                likes: "desc",
              },
            },
          },
        })
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
      const { caption, mediaUrls } = input
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
            mediaUrls: mediaUrls?.length! > 0 ? mediaUrls : [],
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

      try {
        const batchPayload = await prisma.post.deleteMany({
          where: {
            id: postId,
            userId: ctx.user.id,
          },
        })
        // *****TODO***** not quite bc post id can be wrong as well, just come back to this later dude
        if (batchPayload.count === 0) {
          throw new TRPCError({ code: "UNAUTHORIZED" }) //this is to see that only the original poster can delete the post
        }
      } catch (error) {
        console.log("🔴 Prisma Error: ", error)
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" })
      }
      return { success: true }
    }),
})

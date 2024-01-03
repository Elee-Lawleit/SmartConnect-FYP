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
    .query(async ({input, ctx}) => {

      const limit = input.limit ?? 50
      const {cursor} = input

      let posts
      try {
        posts = await prisma.post.findMany({
          take: limit + 1,
          cursor: cursor? {id: cursor} : undefined,
          orderBy: {
            id: "asc"
          }
        })
      } catch (error) {
        console.log("🔴 Prisma Error: ", error)
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" })
      }
      let nextCursor: typeof cursor | undefined = undefined

      //it means there still are posts to retrieve
      if(posts.length > limit){
        const nextItem = posts.pop()
        nextCursor = nextItem!.id
      }

      return { success: true, posts, nextCursor }
    }),

  fetchPost: publicProcedure
    .input(
      z.object({
        postId: z.string(),
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
            // *****TODO***** change this comment logic to include most liked comments instead
            comments: {
              take: 10,
              orderBy: {
                createdAt: "desc",
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

  createPost: privateProcedure
    .input(postSchema)
    .mutation(async ({ ctx, input }) => {
      const { caption, mediaUrls } = input
      const userId = ctx.user.id

      //this will be true anyway, but why not check it again
      if (!ctx.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" })
      }
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
})

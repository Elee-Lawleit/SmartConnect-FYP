import { z } from "zod"
import { privateProcedure, publicProcedure, router } from "../trpc"
import { TRPCError } from "@trpc/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const commentRouter = router({
  fetchAllComments: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().uuid().nullish(),
        postId: z.string().uuid(),
      })
    )
    .query(async ({ input }) => {
      const limit = input.limit ?? 50
      const { cursor, postId } = input

      if (!postId) {
        throw new TRPCError({ code: "BAD_REQUEST" })
      }

      let comments

      try {
        console.log("Cursor Value: ", cursor)
        comments = await prisma.comment.findMany({
          skip: !cursor ? 10 : undefined,
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
          where: {
            postId: postId,
          },
        })
      } catch (error) {
        console.log("🔴 Prisma Error: ", error)
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" })
      }
      let nextCursor: typeof cursor | undefined = undefined

      // it means there still are posts to retrieve
      if (comments.length > limit) {
        const nextItem = comments.pop()
        nextCursor = nextItem!.id
      }

      return { success: true, comments, nextCursor }
    }),

  createComment: privateProcedure
    .input(
      z.object({
        text: z.string(),
        postId: z.string().uuid(),
        parentCommentId: z.string().uuid().nullish(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { text, postId, parentCommentId } = input
      console.log("data: ", {text, postId})

      if (!text || !postId) {
        throw new TRPCError({ code: "BAD_REQUEST" })
      }

      let comment
      try {
        comment = await prisma.comment.create({
          data: {
            userId: ctx.user.id,
            text: text,
            postId: postId,
            parentId: parentCommentId ?? null,
          },
        })
      } catch (error) {
        console.log("🔴 Prisma Error: ", error)
      }

      return { success: true, comment }
    }),

  fetchComment: publicProcedure
    .input(
      z.object({
        commentId: z.string().uuid(),
      })
    )
    .query(async ({ input }) => {
      const { commentId } = input

      if (!commentId) throw new TRPCError({ code: "BAD_REQUEST" })

      let comment
      try {
        comment = await prisma.comment.findFirst({
          where: {
            id: commentId,
          },
        })
      } catch (error) {
        console.log("🔴 Prisma Error: ", error)
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" })
      }

      if (!comment) {
        throw new TRPCError({ code: "NOT_FOUND" })
      }

      return { success: true, comment }
    }),

  updateComment: privateProcedure
    .input(
      z.object({
        commentId: z.string().uuid(),
        text: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { text, commentId } = input

      if (!commentId) {
        throw new TRPCError({ code: "BAD_REQUEST" })
      }

      try {
        await prisma.comment.update({
          data: {
            text: text,
          },
          where: {
            id: commentId,
            userId: ctx.user.id,
          },
        })
      } catch (error) {
        console.log("🔴 Prisma Error: ", error)
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" })
      }
    }),

  deleteComment: privateProcedure
    .input(
      z.object({
        commentId: z.string().uuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { commentId } = input

      if (!commentId) {
        throw new TRPCError({ code: "BAD_REQUEST" })
      }

      try {
        await prisma.comment.delete({
          where: {
            id: commentId,
            userId: ctx.user.id,
          },
        })
      } catch (error) {
        console.log("🔴 Prisma Error: ", error)
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" })
      }
      return { success: true }
    }),
  likeComment: privateProcedure
    .input(
      z.object({
        commentId: z.string().uuid(),
      })
    )
    .mutation(async ({ input }) => {
      const { commentId } = input

      if (!commentId) {
        throw new TRPCError({ code: "BAD_REQUEST" })
      }

      try {
        await prisma.comment.update({
          data: {
            likes: {
              increment: 1,
            },
          },
          where: {
            id: commentId,
          },
        })
      } catch (error) {
        console.log("🔴 Prisma Error: ", error)
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" })
      }
      return { success: true }
    }),
  unlikeComment: privateProcedure
    .input(
      z.object({
        commentId: z.string().uuid(),
      })
    )
    .mutation(async ({ input }) => {
      const { commentId } = input

      if (!commentId) {
        throw new TRPCError({ code: "BAD_REQUEST" })
      }

      try {
        await prisma.comment.update({
          data: {
            likes: {
              decrement: 1,
            },
          },
          where: {
            id: commentId,
          },
        })
      } catch (error) {
        console.log("🔴 Prisma Error: ", error)
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" })
      }
      return { success: true }
    }),
})

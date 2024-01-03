import { z } from "zod"
import { privateProcedure, publicProcedure, router } from "../trpc"
import { TRPCError } from "@trpc/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const commentRouter = router({
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

      if (!ctx.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" })
      }

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
          include: {
            post: true, //include the post data for now, will remove this later for sure 'cause not needed
          },
        })
      } catch (error) {
        console.log("🔴 Prisma Error: ", error)
      }

      return { success: true, comment }
    }),

  // I don't think we need a single comment but I'll make it just in case
  fetchComment: publicProcedure
    .input(
      z.object({
        commentId: z.string().uuid(),
      })
    )
    .query(async({input}) => {
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

      if (!ctx.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" })
      }

      const comment = await prisma.comment.findFirst({
        where: {
          id: commentId,
        },
      })
      if (ctx.user.id !== commentId) {
        throw new TRPCError({ code: "UNAUTHORIZED" })
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

      if (!ctx.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" })
      }

      try {
        // *****TODO***** man, I really don't have to, there are already so many checks to see it the user is correct but whatever, will change this if I feel like it
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
})

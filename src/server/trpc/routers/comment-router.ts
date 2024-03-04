import { z } from "zod"
import { privateProcedure, publicProcedure, router } from "../trpc"
import { TRPCError } from "@trpc/server"
import { Comment } from "@prisma/client"
import clerk from "@clerk/clerk-sdk-node"
import {
  ParentCommentsWithReplyCount,
  ReplyComments,
} from "../../../../prisma/types"

export const addUserDataToComments = async (
  comments: ParentCommentsWithReplyCount[] | ReplyComments[]
) => {
  const userIds = comments.map((comment) => comment.userId)
  const usersList = await clerk.users.getUserList({
    userId: userIds, //"userId" is an array btw, really should put an "S" at the end there, would be a lot clearer
  })

  return comments.map((comment) => {
    const user = usersList.find((user) => user.id === comment.userId)
    if (!user)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `User for comment not found. POST ID: ${comment.id}, USER ID: ${comment.userId}`,
      })

    return {
      comment,
      user,
    }
  })
}

export const commentRouter = router({
  fetchAllParentComments: privateProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().uuid().nullish(),
        postId: z.string().uuid(),
      })
    )
    .query(async ({ input, ctx }) => {
      const limit = input.limit ?? 50
      const { cursor, postId } = input

      if (!postId) {
        throw new TRPCError({ code: "BAD_REQUEST" })
      }

      let rawComments: ParentCommentsWithReplyCount[]

      try {
        rawComments = await ctx.prisma.comment.findMany({
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
            AND: [
              {
                postId: postId,
              },
              {
                parentId: null,
              },
            ],
          },
          include: {
            _count: {
              select: {
                replies: true,
              },
            },
            commentLikes: true,
          },
        })
      } catch (error) {
        console.log("🔴 Prisma Error: ", error)
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" })
      }

      let comments = await addUserDataToComments(rawComments)

      comments = comments.map((comment) => {
        if (!ctx.user)
          return {
            ...comment,
            comment: { ...comment.comment, isLikedByUser: false },
          }
        const isLikedByUser = comment.comment.commentLikes.some(
          (like) => like.userId === ctx.user?.id
        )
        return { ...comment, comment: { ...comment.comment, isLikedByUser } }
      })

      let nextCursor: typeof cursor | undefined = undefined

      // it means there still are comments to retrieve
      if (comments.length > limit) {
        const nextItem = comments.pop()
        nextCursor = nextItem!.comment.id
      }

      return { success: true, comments, nextCursor }
    }),
  fetchAllReplies: privateProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().uuid().nullish(),
        postId: z.string().uuid(),
        parentCommentId: z.string().uuid(),
      })
    )
    .query(async ({ input, ctx }) => {
      const limit = input.limit ?? 50
      const { cursor, postId, parentCommentId } = input

      if (!postId || !parentCommentId) {
        throw new TRPCError({ code: "BAD_REQUEST" })
      }

      let rawComments: ReplyComments[]

      try {
        rawComments = await ctx.prisma.comment.findMany({
          take: limit + 1,
          cursor: cursor ? { id: cursor } : undefined,
          orderBy: [
            {
              createdAt: "asc",
            },
          ],
          where: {
            AND: [
              {
                postId: postId,
              },
              {
                parentId: parentCommentId,
              },
            ],
          },
          include: {
            commentLikes: true,
          },
        })
      } catch (error) {
        console.log("🔴 Prisma Error: ", error)
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" })
      }

      let comments = await addUserDataToComments(rawComments)

      comments = comments.map((comment) => {
        if (!ctx.user)
          return {
            ...comment,
            comment: { ...comment.comment, isLikedByUser: false },
          }
        const isLikedByUser = comment.comment.commentLikes.some(
          (like) => like.userId === ctx.user?.id
        )
        return {
          ...comment,
          comment: { ...comment.comment, isLikedByUser },
        }
      })

      let nextCursor: typeof cursor | undefined = undefined

      // it means there still are posts to retrieve
      if (comments.length > limit) {
        const nextItem = comments.pop()
        nextCursor = nextItem!.comment.id
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
      console.log("data: ", { text, postId })

      if (!text || !postId) {
        throw new TRPCError({ code: "BAD_REQUEST" })
      }

      let comment
      try {
        comment = await ctx.prisma.comment.create({
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
    .query(async ({ input, ctx }) => {
      const { commentId } = input

      let rawComment: ParentCommentsWithReplyCount | null
      try {
        rawComment = await ctx.prisma.comment.findFirst({
          where: {
            id: commentId,
          },
          include: {
            _count: {
              select: {
                replies: true,
              },
            },
            commentLikes: true,
          },
        })
        if (!rawComment) {
          throw new TRPCError({ code: "NOT_FOUND" })
        }
      } catch (error) {
        console.log("🔴 Prisma Error: ", error)
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" })
      }

      const comment = (await addUserDataToComments([rawComment]))[0]

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
        await ctx.prisma.comment.update({
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
        await ctx.prisma.comment.delete({
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
    .mutation(async ({ input, ctx }) => {
      const { commentId } = input

      if (!commentId) {
        throw new TRPCError({ code: "BAD_REQUEST" })
      }

      try {
        await ctx.prisma.comment.update({
          data: {
            likes: {
              increment: 1,
            },
            commentLikes: {
              create: {
                userId: ctx.user.id,
              },
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
    .mutation(async ({ input, ctx }) => {
      const { commentId } = input

      if (!commentId) {
        throw new TRPCError({ code: "BAD_REQUEST" })
      }

      try {
        await ctx.prisma.comment.update({
          data: {
            likes: {
              decrement: 1,
            },
            commentLikes: {
              deleteMany: {},
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

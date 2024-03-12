import { z } from "zod"
import { privateProcedure, router } from "../trpc"
import { PostWithRelations } from "../../../../prisma/types"
import { addUserDataToPosts } from "./post-router"
import { TRPCError } from "@trpc/server"

export const groupRouter = router({
  createGroup: privateProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { name, description } = input

      let group
      try {
        group = await ctx.prisma.group.create({
          data: {
            name,
            description,
            adminId: ctx.user.id,
            groupUsers: {
              create: {
                userId: ctx.user.id,
              },
            },
          },
        })
      } catch (error) {
        console.log("🔴 Prisma Error: ", error)
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" })
      }

      return { success: true, group }
    }),

  fetchGroups: privateProcedure.query(async ({ ctx }) => {
    const {
      user: { id },
    } = ctx

    let groups, notJoined
    try {
      groups = await ctx.prisma.group.findMany({
        where: {
          groupUsers: {
            some: {
              userId: {
                equals: id,
              },
            },
          },
        },
      })

      notJoined = await ctx.prisma.group.findMany({
        where: {
          groupUsers: {
            none: {
              userId: id,
            },
          },
        },
      })
    } catch (error) {
      console.log("🔴 Prisma Error: ", error)
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" })
    }

    return { success: true, groups, notJoined }
  }),

  fetchGroupById: privateProcedure
    .input(
      z.object({
        groupId: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { groupId } = input

      let group
      try {
        group = await ctx.prisma.group.findFirst({
          where: {
            id: groupId,
          },
        })
      } catch (error) {
        console.log("🔴 Prisma Error: ", error)
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" })
      }

      return { success: true, group }
    }),

  joinGroup: privateProcedure
    .input(
      z.object({
        groupId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { groupId } = input

      let groupUser
      try {
        groupUser = await ctx.prisma.groupUsers.create({
          data: {
            groupId,
            userId: ctx.user.id,
          },
        })
      } catch (error) {
        console.log("🔴 Prisma Error: ", error)
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" })
      }

      return { success: true, groupUser }
    }),

  leaveGroup: privateProcedure
    .input(
      z.object({
        groupId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { groupId } = input

      let deletedRow
      try {
        deletedRow = await ctx.prisma.groupUsers.delete({
          where: {
            userId_groupId: {
              userId: ctx.user.id,
              groupId,
            },
          },
        })
      } catch (error) {
        console.log("🔴 Prisma Error: ", error)
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" })
      }

      return { success: true, deletedRow }
    }),

  fetchPosts: privateProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).nullish(),
        cursor: z.string().uuid().nullish(),
        groupId: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { groupId, cursor } = input
      const limit = input.limit ?? 50

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
          where: {
            groupId,
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
})

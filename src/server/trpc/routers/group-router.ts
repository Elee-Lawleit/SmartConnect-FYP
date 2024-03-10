import { z } from "zod"
import { privateProcedure, router } from "../trpc"
import { PostWithRelations } from "../../../../prisma/types"
import { addUserDataToPosts } from "./post-router"

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

      const group = await ctx.prisma.group.create({
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

      return { success: true, group }
    }),

  fetchGroups: privateProcedure.query(async ({ ctx }) => {
    const {
      user: { id },
    } = ctx

    const groups = await ctx.prisma.group.findMany({
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

    const notJoined = await ctx.prisma.group.findMany({
      where: {
        groupUsers: {
          none: {
            userId: id,
          },
        },
      },
    })

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

      const group = await ctx.prisma.group.findFirst({
        where: {
          id: groupId,
        },
      })

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

      const groupUser = await ctx.prisma.groupUsers.create({
        data: {
          groupId,
          userId: ctx.user.id
        }
      })

      return { success: true, groupUser }

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

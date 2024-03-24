import { z } from "zod"
import { privateProcedure, publicProcedure, router } from "../trpc"
import { TRPCError } from "@trpc/server"
import clerk from "@clerk/clerk-sdk-node"
import { filterUserForClient } from "../../helpers/filterUserForClient"

export const profileRouter = router({
  fetchUserInfo: publicProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .query(async ({ ctx, input: { userId } }) => {
      let filteredUser
      try {
        const user = await clerk.users.getUser(userId)
        filteredUser = filterUserForClient(user)
      } catch (error) {
        console.log("🔴 Error: ", error)
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" })
      }

      return { success: true, user: filteredUser }
    }),

  fetchCoverImage: publicProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .query(async ({ input: { userId }, ctx }) => {
      let coverImage
      try {
        coverImage = await ctx.prisma.userCoverImages.findFirst({
          where: {
            userId,
            isActive: true,
          },
        })
      } catch (error) {
        console.log("🔴 Prisma Error: ", error)
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" })
      }

      if (!coverImage) {
        throw new TRPCError({ code: "NOT_FOUND" })
      }

      return { success: true, coverImage }
    }),

  fetchFriends: privateProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .query(async ({ ctx, input: { userId } }) => {
      const friends = await ctx.prisma.friend.findMany({
        where: {
          OR: [{ userId }, { friendId: userId }],
        },
      })

      return { success: true, friends }
    }),

  sendFriendRequest: privateProcedure
    .input(
      z.object({
        receiverId: z.string(),
      })
    )
    .mutation(async ({ ctx, input: { receiverId } }) => {
      await ctx.prisma.friendRequests.create({
        data: {
          senderId: ctx.user.id,
          receiverId: receiverId,
        },
      })
    }),

  updateCoverImage: privateProcedure
    .input(
      z.object({
        imageUrl: z.string().url(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { imageUrl } = input

      let row
      try {
        row = await ctx.prisma.userCoverImages.create({
          data: {
            url: imageUrl,
            userId: ctx.user.id,
            isActive: true,
          },
        })

        //set every other image's active state to false
        await ctx.prisma.userCoverImages.updateMany({
          data: {
            isActive: false,
          },
          where: {
            AND: [
              { userId: row.userId },
              {
                id: {
                  not: row.id,
                },
              },
            ],
          },
        })
      } catch (error) {
        console.log("🔴 Prisma Error: ", error)
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" })
      }

      return { success: true }
    }),
})

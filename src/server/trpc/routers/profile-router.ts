import { z } from "zod"
import { privateProcedure, publicProcedure, router } from "../trpc"
import { TRPCError } from "@trpc/server"

export const profileRouter = router({
  fetchCoverImage: publicProcedure.input(z.object({
    userId: z.string()
  })).query(async({input: {userId}, ctx})=>{
    const coverImage = await ctx.prisma.userCoverImages.findFirst({
      where: {
        userId,
        isActive: true
      }
    })

    if(!coverImage){
      throw new TRPCError({code: "NOT_FOUND"})
    }

    return {success: true, coverImage}

  }),
  updateCoverImage: privateProcedure
    .input(
      z.object({
        imageUrl: z.string().url(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { imageUrl } = input

      const row = await ctx.prisma.userCoverImages.create({
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

      return { success: true }
    }),
})

import { z } from "zod"
import { privateProcedure, router } from "../trpc"
import { TRPCError } from "@trpc/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const commentRouter = router({
  createComment: privateProcedure
    .input(
      z.object({
        text: z.string(),
        postId: z.string(),
      })
    )
    .mutation(async({ctx, input}) => {
      const {text, postId} = input

      if (!ctx.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" })
      }

      if(!text || !postId){
        throw new TRPCError({code: "BAD_REQUEST"})
      }

      let comment
      try{
        comment = await prisma.comment.create({
          data: {
            text: text,
            postId: postId
          },
          include: {
            post: true //include the post data for now, will remove this later for sure 'cause not needed
          }
        })
      }catch(error){
        console.log("🔴 Prisma Error: ", error)
      }
      
      return {success: true, comment}

    }),
})

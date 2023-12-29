import { drizzle } from "../../../db/connection"
import { postSchema } from "../../schema/postSchema"
import { privateProcedure, router } from "../trpc"
import { post } from "../../../db/schema/post"
import { TRPCError } from "@trpc/server"


export const postRouter = router({
  post: privateProcedure.input(postSchema).mutation(async ({ctx, input}) => {

    const { caption, mediaUrls } = input
    const userId = ctx.user.id

    //this will be true anyway, but why not check it again
    if (!ctx.user.id) {
      throw new TRPCError({ code: "BAD_REQUEST" })
    }
    if(!caption && mediaUrls?.length == 0) {
      throw new TRPCError({code: "BAD_REQUEST"})
    }
    let response;
    try {
      response = await drizzle
        .insert(post)
        .values({ caption: caption, mediaUrl: mediaUrls, userId: userId })
        .returning()

    } catch (error) {
      console.log(error)
      throw new TRPCError({code: "INTERNAL_SERVER_ERROR"})
    }
    const [createdPost] = response

    return { success: true, post: createdPost}
  }),
})

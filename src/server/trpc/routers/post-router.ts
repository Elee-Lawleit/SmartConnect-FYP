import { drizzle } from "../../../db/connection"
import { postSchema } from "../../validation schemas/postSchema"
import { privateProcedure, publicProcedure, router } from "../trpc"
import { post, selectPost } from "../../../db/schema/post"
import { TRPCError } from "@trpc/server"
import * as z from "zod"

export const postRouter = router({

  fetchAllPosts: publicProcedure.query(async()=>{
    let posts;
    try{
      posts = await drizzle.select().from(post)
    } catch(error){
      console.log("Error: ", error)
      throw new TRPCError({code: "INTERNAL_SERVER_ERROR"})
    }
    return {success: true, posts}
  }),

  fetchPost: publicProcedure.input(z.object({
    postId: z.string()
  })).query(async({input})=>{
    const {postId} = input

    if(!postId) throw new TRPCError({code: "BAD_REQUEST"})

    let posts: selectPost[]
    try{
      posts = await drizzle.select().from(post)
    } catch(error){
      console.log("Error: ", error)
      throw new TRPCError({code: "INTERNAL_SERVER_ERROR"})

    }
    const [fetchedPost] = posts
  

    return {success: true, post: fetchedPost}

  }),

  createPost: privateProcedure.input(postSchema).mutation(async ({ctx, input}) => {

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

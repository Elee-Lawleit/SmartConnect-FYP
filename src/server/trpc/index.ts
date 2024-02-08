import { commentRouter } from "./routers/comment-router"
import { postRouter } from "./routers/post-router"
import { profileRouter } from "./routers/profile-router"
import { router } from "./trpc"

//pass sub routes into this main router
export const appRouter = router({
  postRouter: postRouter,
  commentRouter: commentRouter,
  profileRouter: profileRouter
})

//to get typesafety on front end
export type AppRouter = typeof appRouter

import { authRouter } from "./routers/auth-router"
import { postRouter } from "./routers/post-router"
import { publicProcedure, router } from "./trpc"

//pass sub routes into this main router
export const appRouter = router({
  auth: authRouter,
  testAPI: publicProcedure.query(() => 5),
  postRouter: postRouter
})

//to get typesafety on front end
export type AppRouter = typeof appRouter

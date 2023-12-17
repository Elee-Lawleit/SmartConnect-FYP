import { authRouter } from "./routers/auth-router"
import { publicProcedure, router } from "./trpc"

//pass sub routes into this main router
export const appRouter = router({
  auth: authRouter,
  testAPI: publicProcedure.query(() => 5),
})

//to get typesafety on front end
export type AppRouter = typeof appRouter

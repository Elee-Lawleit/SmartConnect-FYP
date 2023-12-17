import { TRPCError, initTRPC } from "@trpc/server"
import { ExpressContext } from "../server"

const t = initTRPC.context<ExpressContext>().create()
const middleware = t.middleware

//will later change to protect routes
const exampleMiddleware = middleware(({ ctx: context, next }) => {
  return next({
    ctx: {},
  })
})

export const router = t.router
export const publicProcedure = t.procedure
export const privateProcedure = t.procedure.use(exampleMiddleware)

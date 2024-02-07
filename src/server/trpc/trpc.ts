import { TRPCError, initTRPC } from "@trpc/server"
import { ExpressContext } from "../server"

const t = initTRPC.context<ExpressContext>().create()
const middleware = t.middleware

//will later change to protect routes
const authMiddleware = middleware(async ({ ctx, next }) => {

  try {

    if (!ctx.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" })
    }
  } catch (error) {
    console.log("Error: ", error)
    throw new TRPCError({code: "INTERNAL_SERVER_ERROR"})
  }

  //don't need to attach the user here again,
  //just doing this to make ts happy (errors bc in case the returned user is null from the createContext())
  return next({
    ctx: {
      user: ctx.user
    },
  })
})

export const router = t.router
export const publicProcedure = t.procedure
export const privateProcedure = t.procedure.use(authMiddleware)

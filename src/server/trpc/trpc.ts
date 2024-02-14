import { TRPCError, initTRPC } from "@trpc/server"
import { Context } from "../server"
import Cookies from "cookies"
import type { Response } from "express"
import clerk from "@clerk/clerk-sdk-node"

const t = initTRPC.context<Context>().create()
const middleware = t.middleware

//will later change to protect routes
const authMiddleware = middleware(async ({ ctx, next }) => {
  const cookies = new Cookies(ctx.req, ctx.res as Response)
  const sessionToken = cookies.get("__session") as string
  let user
  try {
    const decodeInfo = await clerk.verifyToken(sessionToken)
    const userId = decodeInfo.sub
    user = await clerk.users.getUser(userId)

    if (!user) {
      throw new TRPCError({ code: "UNAUTHORIZED" })
    }
  } catch (error) {
    console.log("Error: ", error)
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" })
  }

  return next({
    ctx: {
      user,
    },
  })
})

interface ParsedCookies {
  [cookieName: string]: string
}


const subscriptionMiddleware = middleware(async ({ ctx, next }) => {
  const cookieHeader = ctx.req.headers.cookie
  const cookiePairs = cookieHeader?.split(";")
  const cookies: ParsedCookies = {}

  if (cookiePairs) {
    for (const cookie of cookiePairs) {
      const [name, value] = cookie.trim().split("=")
      const decodedValue = decodeURIComponent(value)
      cookies[name] = decodedValue
    }
  }

  const sessionToken = cookies["__session"]
  const decodeInfo = await clerk.verifyToken(sessionToken)
  const userId = decodeInfo.sub
  const user = await clerk.users.getUser(userId)

  const users = {}

  if (!user) {
    console.log("No user found")
    return next()
  }

  return next()
})

export const router = t.router
export const publicProcedure = t.procedure
export const privateProcedure = t.procedure.use(authMiddleware)
export const subscriptionProcedure = t.procedure.use(subscriptionMiddleware)

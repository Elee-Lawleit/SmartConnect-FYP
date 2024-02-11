import express from "express"
import { nextApp, nextHandler } from "./next-utils"
import * as trpcExpress from "@trpc/server/adapters/express"
import { appRouter } from "./trpc"
import { TRPCError, inferAsyncReturnType } from "@trpc/server"
import type { WebhookEvent } from "@clerk/clerk-sdk-node"
import Cookies from "cookies"
import clerk from "@clerk/clerk-sdk-node"
import { PrismaClient } from "@prisma/client"
import {
  CreateWSSContextFnOptions,
  applyWSSHandler,
} from "@trpc/server/adapters/ws"
import ws from "ws"

const app = express()
const prisma = new PrismaClient()

const PORT = Number(process.env.PORT) || 3000

function isExpressRequest(
  options: trpcExpress.CreateExpressContextOptions | CreateWSSContextFnOptions
): options is trpcExpress.CreateExpressContextOptions {
  return (options as trpcExpress.CreateExpressContextOptions).req !== undefined
}

//goes into createExpressMiddlware for trpc
const createContext = async (
  options: trpcExpress.CreateExpressContextOptions | CreateWSSContextFnOptions
) => {
  if (isExpressRequest(options)) {
    const cookies = new Cookies(options.req, options.res)
    const sessionToken = cookies.get("__session") as string
    let user = null

    //okay, so I am hopeful that if the user can't be found, clerk will return null and not throw an error
    try {
      const decodeInfo = await clerk.verifyToken(sessionToken)
      const userId = decodeInfo.sub
      user = await clerk.users.getUser(userId)

      //just making it's not anything other than null
      if (!user) user = null
    } catch (error) {
      console.log("Error: ", error)
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" })
    }

    return {
      req: options.req,
      res: options.res,
      user,
      prisma,
    }
  }
  return { req: options.req, res: options.res, user: null, prisma }
}


export type Context = Awaited<ReturnType<typeof createContext>>

const start = () => {
  app.use("/api/clerk", (req, res) => {
    if (req.body.evt == "undefined")
      return res.status(401).json({ error: "can only be called by clerk" })

    console.log("Web hook request received!")
    const evt = req.body.evt as WebhookEvent
    switch (evt.type) {
      case "user.created":
        console.log("New User created")
        console.log("event: ", evt)

      case "session.created":
        console.log("session created")
        console.log("event: ", evt)
    }
  })

  app.use(
    "/api/trpc",
    trpcExpress.createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  )

  app.use((req, res) => nextHandler(req, res)) //use nextHandler to render templates

  //prepare the nextjs app and then start the server
  nextApp.prepare().then(() => {
    const server = app.listen(PORT, async () => {
      console.log(`Server started on port ${PORT}`)
    })

    applyWSSHandler({
      wss: new ws.Server({ server: server }),
      router: appRouter,
      createContext,
    })
  })
}

start()

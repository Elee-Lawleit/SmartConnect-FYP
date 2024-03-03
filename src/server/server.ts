import express from "express"
import { nextApp, nextHandler } from "./next-utils"
import * as trpcExpress from "@trpc/server/adapters/express"
import { appRouter } from "./trpc"
import { applyWSSHandler } from "@trpc/server/adapters/ws"
import { NodeHTTPCreateContextFnOptions } from "@trpc/server/adapters/node-http"
import { IncomingMessage } from "http"
import { inferAsyncReturnType } from "@trpc/server"
import { EventEmitter } from "events"
import { PrismaClient } from "@prisma/client"
import ws from "ws"


const app = express()

const PORT = Number(process.env.PORT) || 3000

const prisma = new PrismaClient()
const ee = new EventEmitter()

//goes into createExpressMiddleware for trpc
export const createContext = async (
  options:
    | trpcExpress.CreateExpressContextOptions
    | NodeHTTPCreateContextFnOptions<IncomingMessage, ws>
) => {
  return {
    req: options.req,
    res: options.res,
    prisma,
    ee,
  }
}

export type Context = inferAsyncReturnType<typeof createContext>

const start = () => {
  app.use(
    "/api/trpc",
    trpcExpress.createExpressMiddleware({
      router: appRouter,
      createContext: createContext,
    })
  )

  app.use((req, res) => nextHandler(req, res)) //use nextHandler to render templates

  //prepare the nextjs app and then start the server
  nextApp.prepare().then(() => {
    const server = app.listen(PORT, async () => {
      console.log(`Server started on port ${PORT}`)
    })

    if (process.env.NODE_ENV === "production") {
      const wss = new ws.Server({ server })
      const handler = applyWSSHandler({
        wss,
        router: appRouter,
        createContext,
      })

      process.on("SIGTERM", () => {
        console.log("SIGTERM")
        handler.broadcastReconnectNotification()
        wss.close()
      })
    }
    else{
      const wss = new ws.Server({
        port: 3001,
      })

      const handler = applyWSSHandler({
        wss,
        router: appRouter,
        createContext,
      })

      wss.on("connection", (ws) => {
        console.log(`➕➕ Connection (${wss.clients.size})`)
        ws.once("close", () => {
          console.log(`➖➖ Connection (${wss.clients.size})`)
        })
      })
      console.log("✅ WebSocket Server listening on ws://localhost:3001")

      process.on("SIGTERM", () => {
        console.log("SIGTERM")
        handler.broadcastReconnectNotification()
        wss.close()
      })
    }
  })
}

start()

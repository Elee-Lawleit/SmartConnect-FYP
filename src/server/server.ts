import express from "express"
import { nextApp, nextHandler } from "./next-utils"
import * as trpcExpress from "@trpc/server/adapters/express"
import { appRouter } from "./trpc"
import { inferAsyncReturnType } from "@trpc/server"
import { PrismaClient } from "@prisma/client"
import { applyWSSHandler } from "@trpc/server/adapters/ws"
import ws from "ws"
import { NodeHTTPCreateContextFnOptions } from "@trpc/server/adapters/node-http"
import { IncomingMessage } from "http"
import { EventEmitter } from "events"

const app = express()
const prisma = new PrismaClient()
const ee = new EventEmitter()

const PORT = Number(process.env.PORT) || 3000

//goes into createExpressMiddleware for trpc
const createContext = async (
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
      createContext,
    })
  )

  app.use((req, res) => nextHandler(req, res)) //use nextHandler to render templates

  //prepare the nextjs app and then start the server
  nextApp.prepare().then(() => {
    const server = app.listen(PORT, async () => {
      console.log(`Server started on port ${PORT}`)
    })

    const wss = new ws.Server({ server })

    const handler = applyWSSHandler({
      wss,
      router: appRouter,
      createContext,
    })

    //about WEB SOCKETS
    // it's not working because of some weird thing inside nextjs' base-server.js file
    // change line number 460 in next/base-server.js provided below
    // const origSetHeader = _res.setHeader.bind(_res); --> from this
    // const origSetHeader = _res && typeof _res.setHeader === "function" ? _res.setHeader.bind(_res) : null --> to this

    wss.on("connection", () => {
      console.log("+++ Connection ", wss.clients.size)
    })
    wss.on("close", () => {
      console.log("--- Connection ", wss.clients.size)
    })

    process.on("SIGTERM", () => {
      console.log("SIGTERM")
      handler.broadcastReconnectNotification()
      wss.close()
    })
  })
}

start()

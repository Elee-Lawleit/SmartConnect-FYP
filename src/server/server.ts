import express from "express"
import {nextApp, nextHandler} from "./next-utils"
import * as trpcExpress from "@trpc/server/adapters/express"
import { appRouter } from "./trpc"
import { inferAsyncReturnType } from "@trpc/server"

const app = express()

const PORT = Number(process.env.PORT) || 3000

//goes into createExpressMiddlware for trpc
const createContext = ({ req, res } : trpcExpress.CreateExpressContextOptions) =>(
  {
  req,
  res
  }
)

export type ExpressContext = inferAsyncReturnType<typeof createContext>


const start = ()=>{

  app.use(
    "/api/trpc",
    trpcExpress.createExpressMiddleware({
      router: appRouter,
      createContext
    })
  )

  app.use((req, res) => nextHandler(req, res)) //use nextHandler to render templates

  //prepare the nextjs app and then start the server
  nextApp.prepare().then(() => {

    app.listen(PORT, async () => {
      console.log(`Server started on port ${PORT}`)
    })
  })
}

start()
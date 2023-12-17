import express from "express"
import {nextApp, nextHandler} from "./next-utils"

const app = express()

const PORT = Number(process.env.PORT) || 3000


const start = ()=>{

  app.use((req, res) => nextHandler(req, res)) //use nextHandler to render templates

  //prepare the nextjs app and then start the server
  nextApp.prepare().then(() => {

    app.listen(PORT, async () => {
      console.log(`Server started on port ${PORT}`)
    })
  })
}

start()
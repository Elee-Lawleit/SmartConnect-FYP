"use client"
import CreatePost from "@/components/CreatePost"
import Navbar from "@/components/Navbar"
import PostReel from "@/components/PostReel"
import { trpc } from "@/server/trpc/client"
import React from "react"


const UserFeed = () => {

  trpc.commentRouter.onCreated.useSubscription(undefined, {
    onData: (data)=>{
      console.log("Comment created: ", data)
    }
  })

  return (
      <div className="w-full flex flex-col items-center gap-1">
        <Navbar/>
        <CreatePost/>
        <PostReel />
      </div>
  )
}

export default UserFeed
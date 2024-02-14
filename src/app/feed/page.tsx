"use client"
import CreatePost from "@/components/CreatePost"
import Navbar from "@/components/Navbar"
import PostReel from "@/components/PostReel"
import { toast } from "@/components/ui/use-toast"
import { trpc } from "@/server/trpc/client"
import { useUser } from "@clerk/nextjs"
import React from "react"
import { ToastAction } from "@/components/ui/toast"

const UserFeed = () => {
  const { user } = useUser()

  trpc.postRouter.onCreated.useSubscription(
    { userId: user?.id || "" },
    {
      onData: (post) => {
        console.log("Data received on front end: ", post)
        toast({
          title: "Your friend just created a new post!",
          action: (
              <ToastAction altText="view post" ><a href={`/post/${post.id}`} target="_blank">View post</a></ToastAction>
          ),
        })
      },
      enabled: user?.id ? true : false,
    }
  )

  return (
    <div className="w-full flex flex-col items-center gap-1">
      <Navbar />
      <CreatePost />
      <PostReel />
    </div>
  )
}

export default UserFeed

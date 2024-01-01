"use client"
import { trpc } from "@/server/trpc/client"
import { UserButton, useUser, useClerk } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import { QueryClient } from "@tanstack/react-query"

export default function Home() {

  const utils = trpc.useUtils()

  //move this useeffect to root layout (can't do that there, so maybe move in the providers file) and add the condition to only add the listener when the user is on pages other than signup/signin

  const{data: posts, isLoading: loadingPosts} = trpc.postRouter.fetchAllPosts.useQuery()
  const {data: post, isLoading: loadingPost} = trpc.postRouter.fetchPost.useQuery({postId: "afcb2b11-a30c-469d-80aa-b88bf272019f"})

  const { mutate: createPost, isLoading } = trpc.postRouter.createPost.useMutation({
    onError: (error) => {
      console.log("Bad thing happened: ", error)
    },
    onSuccess: (response) => {
      console.log("Good thing happened. Here it is: ", response)
      utils.postRouter.fetchAllPosts.invalidate()
    },
  })
  const createDummyPost = () => {
    const data = {
      userId: "48fda264-4026-49a5-b513-569d7e842333",
      caption: "some weird caption",
      mediaUrls: [
        "https://www.example-media-url.com",
        "https://www.example-media-url2.com",
        "https://www.example-media-url3.com",
      ],
    }
    createPost(data)
  }

  return (
    <>
      <UserButton afterSignOutUrl="/sign-in" />
      <div>Home page</div>
      <button onClick={createDummyPost}>
        {isLoading ? "Creating post..." : "Create a post"}
      </button>

    </>
  )
}

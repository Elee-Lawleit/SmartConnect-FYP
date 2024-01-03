"use client"
import { trpc } from "@/server/trpc/client"
import { UserButton, useUser, useClerk } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import { QueryClient } from "@tanstack/react-query"

export default function Home() {
  const utils = trpc.useUtils()

  //move this useeffect to root layout (can't do that there, so maybe move in the providers file) and add the condition to only add the listener when the user is on pages other than signup/signin

  const { data: posts, isLoading: loadingPosts,  fetchNextPage} =
    trpc.postRouter.fetchAllPosts.useInfiniteQuery(
      { limit: 2 },
      {
        getNextPageParam: (lastPageResponse) => lastPageResponse.nextCursor,
      }
    )

  console.log("Infinite Posts: ", posts)

  const { data: post, isLoading: loadingPost } =
    trpc.postRouter.fetchPost.useQuery({
      postId: "13a6afdf-565b-4920-9b83-2f92edbf70a8",
    })
  // console.log("Fetching single post: ", post)

  const { mutate: createComment, isLoading: creatingComment } =
    trpc.commentRouter.createComment.useMutation({
      onError: (error) => {
        // console.log("Error creating comment: ", error)
      },
      onSuccess: (response) => {
        // console.log("Comment created: ", response)
      },
    })

  const { mutate: createPost, isLoading } =
    trpc.postRouter.createPost.useMutation({
      onError: (error) => {
        console.log("Bad thing happened: ", error)
      },
      onSuccess: (response) => {
        console.log("Good thing happened. Here it is: ", response)
        // utils.postRouter.fetchAllPosts.invalidate()
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

  const createDummyComment = () => {
    const data = {
      text: "Example comment text",
      postId: "13a6afdf-565b-4920-9b83-2f92edbf70a8",
    }
    createComment(data)
  }

  return (
    <>
      <UserButton afterSignOutUrl="/sign-in" />
      <div>Home page</div>
      <button onClick={createDummyPost}>
        {isLoading ? "Creating post..." : "Create a post"}
      </button>
      <br />
      <button onClick={createDummyComment}>
        {creatingComment ? "Creating comment on post..." : "Create comment"}
      </button>
      <br />
      <button onClick={()=>fetchNextPage()}>Load more posts</button>
    </>
  )
}

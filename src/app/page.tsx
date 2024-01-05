"use client"
import { trpc } from "@/server/trpc/client"
import { UserButton, useUser, useClerk } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import { QueryClient } from "@tanstack/react-query"

export default function Home() {
  const utils = trpc.useUtils()


  const {
    data: posts,
    isLoading: loadingPosts,
    fetchNextPage,
  } = trpc.postRouter.fetchAllPosts.useInfiniteQuery(
    { limit: 2 },
    {
      getNextPageParam: (lastPageResponse) => lastPageResponse.nextCursor,
    }
  )

  console.log("Infinite Posts: ", posts)


  const {
    data: comments,
    isLoading: loadingComments,
    fetchNextPage: fetchMoreComments,
    hasNextPage,

  } = trpc.commentRouter.fetchAllComments.useInfiniteQuery(
    { limit: 2, postId: "87e11d5b-5728-425c-9005-2b17706cc9a7" },
    {
      getNextPageParam: (lastPageResponse) => lastPageResponse.nextCursor,
    }
  )

  console.log("Comments: ", comments)

  const { data: post, isLoading: loadingPost } =
    trpc.postRouter.fetchPost.useQuery({
      postId: "87e11d5b-5728-425c-9005-2b17706cc9a7",
    })
  console.log("Fetching single post: ", post)

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

  const createDummyComment = () => {
    const data = {
      text: "Example comment text",
      postId: "87e11d5b-5728-425c-9005-2b17706cc9a7",
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
      <button onClick={() => fetchMoreComments()}>Load more comments</button>
      <button onClick={() => fetchNextPage()}>Load more posts</button>
    </>
  )
}

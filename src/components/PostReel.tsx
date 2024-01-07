"use client"

import React from "react"
import InfiniteScroll from "react-infinite-scroll-component"
import Post from "./Post"
import { trpc } from "@/server/trpc/client"
import { Loader2 } from "lucide-react"

const PostReel = () => {
  // fetch all posts here

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
  } = trpc.postRouter.fetchAllPosts.useInfiniteQuery(
    { limit: 2 },
    {
      getNextPageParam: (lastPageResponse) => lastPageResponse.nextCursor,
    }
  )

  return (
    <>
      <InfiniteScroll
        hasMore={hasNextPage ?? false}
        dataLength={data?.pages.length || 0}
        next={fetchNextPage}
        loader={<Loader2 className="animate-spin" />} //add skeletons here later
      >
        {data?.pages.map((response) =>
          response.posts.map((post) => (
            <Post
              key={post?.id}
              caption={post?.caption || ""}
              createdAt={post?.createdAt || ""}
              likes={post?.likes || 0}
              mediaUrls={post?.mediaUrls || []}
              userImageUrl={post?.user?.imageUrl || ""}
              userDisplayName={
                (post?.user?.username ??
                  post?.user?.emailAddresses[0].emailAddress) ||
                ""
              }
            />
          ))
        )}
      </InfiniteScroll>
    </>
  )
}

export default PostReel

//will hold all the posts

// <ReactInifiniteScroll>
//   <Post/>
// </ReactInifiniteScroll>

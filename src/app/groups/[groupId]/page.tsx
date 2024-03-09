"use client"
import Post from "@/components/Post"
import { trpc } from "@/server/trpc/client"
import React from "react"

interface PageProps {
  params: {
    groupId: string
  }
}

const page = ({ params: { groupId } }: PageProps) => {
  const { data } = trpc.groupRouter.fetchGroupById.useQuery({ groupId })

  const {
    data: groupPosts,
    isLoading,
    isError,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
  } = trpc.groupRouter.fetchPosts.useInfiniteQuery(
    { limit: 2, groupId },
    {
      getNextPageParam: (lastPageResponse) => lastPageResponse.nextCursor,
    }
  )

  console.log("group posts: ", groupPosts)

  return (
    <>
      {data && data.group && (
        <div>
          <h1 className="text-2xl">{data?.group.name}</h1>
          <p>{data.group.description}</p>
        </div>
      )}
      {!isLoading && groupPosts?.pages.map((response) =>
        response.posts.map((post) => {
          return (
            <Post
              key={post?.post.id}
              id={post?.post.id || ""}
              caption={post?.post.caption || ""}
              createdAt={post?.post.createdAt || ""}
              likes={post?.post._count.postLikes || 0}
              commentCount={post?.post._count.comments || 0}
              userImageUrl={post?.user?.imageUrl || ""}
              userDisplayName={
                (post?.user?.username ??
                  post?.user?.emailAddresses[0].emailAddress.split("@")[0]) ||
                ""
              }
              media={post!.post.media}
              postLikes={post!.post.postLikes}
              userId={post.user.id}
              isLikedByUser={post.post.isLikedByUser ?? false}
            />
          )
        })
      )}
    </>
  )
}

export default page

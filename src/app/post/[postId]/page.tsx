"use client"
import CommentList from "@/components/CommentList"
import Post from "@/components/Post"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { trpc } from "@/server/trpc/client"
import { notFound } from "next/navigation"
import React from "react"

interface PageProps {
  params: {
    postId: string
  }
}

const PostPage = ({ params: { postId } }: PageProps) => {
  const { data, isLoading, isError, error } =
    trpc.postRouter.fetchPost.useQuery(
      {
        postId,
      },
      { retry: false }
    )

  if (isLoading) {
    return (
      <Skeleton className="flex flex-col w-full max-w-[512px] bg-gray-200 border rounded-sm shadow-sm p-4 gap-4">
        <div className="flex items-center gap-4">
          <Skeleton className="w-16 h-16 rounded-full" />
          <div className="flex flex-col">
            <Skeleton className="w-32 h-4" />
            <Skeleton className="w-20 h-2 mt-1" />
          </div>
        </div>
        <Skeleton className="w-full h-4" />
        <Skeleton className="w-full h-64 relative" />
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Skeleton className="w-8 h-8" />
            <Skeleton className="w-16 h-4" />
          </div>
          <div className="flex justify-between w-full items-center gap-2">
            <Skeleton className="w-8 h-8" />
            <div className="flex flex-col">
              <Skeleton className="w-24 h-4" />
              <Skeleton className="w-8 h-4 mt-1" />
            </div>
          </div>
        </div>
      </Skeleton>
    )
  }

  console.log(data)

  if (isError) {
    return notFound()
  }

  return (
    <div className="flex flex-col items-center justify-center">
      {data && (
        <Post
          id={data?.post.post.id}
          caption={data?.post.post.caption || ""}
          createdAt={data?.post.post.createdAt || ""}
          likes={data?.post.post._count.postLikes || 0}
          commentCount={data?.post.post._count.comments || 0}
          userImageUrl={data?.post.user?.imageUrl || ""}
          userDisplayName={
            (data?.post.user?.username ??
              data?.post.user?.emailAddresses[0].emailAddress.split("@")[0]) ||
            ""
          }
          media={data.post.post.media}
          postLikes={data.post.post.postLikes}
          userId={data.post.user.id}
        />
      )}
      <ScrollArea>
        <CommentList postId={postId}/>
      </ScrollArea>

      
    </div>
  )
}

export default PostPage

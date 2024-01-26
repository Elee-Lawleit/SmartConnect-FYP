import { trpc } from "@/server/trpc/client"
import React from "react"
import { Button } from "./ui/button"
import { useUser } from "@clerk/nextjs"
import Comment from "./Comment"
import { Skeleton } from "./ui/skeleton"
import { Input } from "./ui/input"
import { Loader2, Send } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "./ui/use-toast"

interface CommentListProps {
  postId: string
}

const commentSchema = z.object({
  text: z.string().min(1),
  postId: z.string().uuid(),
})

const CommentList = ({ postId }: CommentListProps) => {
  const { user, isLoaded, isSignedIn } = useUser()
  const utils = trpc.useUtils()

  const {
    register,
    formState: { errors },
    handleSubmit,
    resetField,
  } = useForm({
    resolver: zodResolver(commentSchema),
  })

  // Fetch all the parent comments

  const {
    data,
    isLoading: loadingParentComments,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage
  } = trpc.commentRouter.fetchAllParentComments.useInfiniteQuery(
    {
      postId: postId,
      limit: 2,
    },
    {
      getNextPageParam: (lastPageResponse) => lastPageResponse.nextCursor,
    }
  )

  console.log("Comments: ", data)

  const { mutate: postComment, isLoading: postingComment } =
    trpc.commentRouter.createComment.useMutation()

  if (loadingParentComments) {
    return (
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full bg-gray-400" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px] bg-gray-400" />
          <Skeleton className="h-4 w-[200px] bg-gray-400" />
        </div>
      </div>
    )
  }

  const createComment = async (data: any) => {
    postComment(data, {
      onSuccess: () => {
        toast({ title: "Success", description: "Comment created successfully" })
        resetField("text")
        utils.commentRouter.fetchAllParentComments.invalidate()
      },
      onError: () =>
        toast({
          variant: "destructive",
          title: "Error",
          description: "Something went wrong. Please try again later.",
        }),
    })
  }

  return (
    <>
      {/* <hr className="mt-2 mb-2" /> */}
      <div className="mt-4">
        {/* post comment form on top now */}
        <div className="flex gap-2 items-center mt-3">
          <img
            src={user?.imageUrl}
            alt="User Avatar"
            className="w-8 h-8 rounded-full"
          />
          <form
            className="block w-full relative mr-3"
            onSubmit={handleSubmit(createComment)}
          >
            <Input
              type="hidden"
              value={postId} // Add hidden field`
              {...register("postId")}
            />
            <Input
              className="rounded-md h-7"
              placeholder="Post a comment..."
              {...register("text")}
            />
            {!postingComment ? (
              <Button
                className="absolute -right-1 -top-1 hover:bg-transparent"
                variant="ghost"
                type="submit"
              >
                <Send className=" h-4 w-4 text-gray-600" />
              </Button>
            ) : (
              <Loader2 className="absolute right-3 top-2 h-4 w-4 animate-spin text-gray-600" />
            )}
          </form>
        </div>

        {/* all comments will be mapped here */}
        {data?.pages.map((response) =>
          response.comments.map((comment) => {
            return (
              <Comment
                key={comment.comment.id}
                comment={comment}
                postId={postId}
                // @ts-ignore
                replyCount={comment.comment._count.replies}
              />
            )
          })
        )}
        {hasNextPage && (
          <div className="mt-2">
            <Button variant="link" onClick={() => fetchNextPage()}>
              {!isFetchingNextPage ? "Show more coments" : "Loading..."}
            </Button>
          </div>
        )}
        <hr className="mt-2 mb-2" />
      </div>
    </>
  )
}

export default CommentList

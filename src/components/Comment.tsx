"use client"
import React, { useState } from "react"
import { Input } from "./ui/input"
import { formatRelativeTime } from "@/lib/utils"
import { Button } from "./ui/button"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, MessageSquareReply, Send, ThumbsUpIcon } from "lucide-react"
import { trpc } from "@/server/trpc/client"
import { toast } from "./ui/use-toast"
import { useUser } from "@clerk/nextjs"
import CommentReply from "./CommentReply"

interface CommentProps {
  comment: any
  postId: string
  replyCount: number
  commentLikes: any
  likeCount: number
  isLikedByUser: boolean
}

const replySchema = z.object({
  text: z.string().min(1),
  postId: z.string().uuid(),
  parentCommentId: z.string().uuid(),
})

const Comment = ({
  comment,
  postId,
  replyCount,
  commentLikes,
  likeCount,
  isLikedByUser,
}: CommentProps) => {
  const { user } = useUser()
  const utils = trpc.useUtils()
  const [openReply, setOpenReply] = useState<boolean>(false)
  const [showReplies, setShowReplies] = useState<boolean>(false)

  const [optimisticLikeCount, setOptimisticLikeCount] =
    useState<number>(likeCount)
  const [optimisticLikeStatus, setOptimisticLikeStatus] =
    useState<boolean>(isLikedByUser)
  const [invalidatingQuery, setInvalidatingQuery] = useState<boolean>(false)

  const { mutate, isLoading: postingReply } =
    trpc.commentRouter.createComment.useMutation()

  const { mutate: likeComment, isLoading: likingComment } =
    trpc.commentRouter.likeComment.useMutation()
  const { mutate: unlikeComment, isLoading: unLikingComment } =
    trpc.commentRouter.unlikeComment.useMutation()

  const {
    data: commentReplies,
    isLoading: loadingReplies,
    isError: errorLoadingReplies,
  } = trpc.commentRouter.fetchAllReplies.useInfiniteQuery(
    {
      parentCommentId: comment.comment.id,
      postId,
      limit: 20,
    },
    { enabled: showReplies }
  )

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(replySchema) })

  const postReply = (data: any) => {
    mutate(data, {
      onError: () => {
        //display toast
      },
      onSuccess: () => {
        reset()
        setOpenReply(false)
        utils.commentRouter.fetchAllParentComments.invalidate()
        utils.commentRouter.fetchAllReplies.invalidate()
        // maybe display a toast here as well, don't really need to tho
      },
    })
  }

  const updateLikeStatus = () => {
    setOptimisticLikeStatus((prev) => !prev)
    setInvalidatingQuery((prev) => !prev)
    if (isLikedByUser) {
      setOptimisticLikeCount((prev) => prev - 1)
      unlikeComment(
        { commentId: comment.comment.id },
        {
          onSuccess: () => {
            utils.commentRouter.fetchAllParentComments
              .invalidate()
              .then(() => setInvalidatingQuery((prev) => !prev))
            toast({
              title: "Success",
              description: "Comment unliked successfully",
            })
          },
          onError: () => {
            setOptimisticLikeCount((prev) => prev + 1)
            setOptimisticLikeStatus((prev) => !prev)
            setInvalidatingQuery((prev) => !prev)
            toast({
              variant: "destructive",
              title: "Couldn't unlike comment.",
              description: "Something went wrong. Please try again later.",
            })
          },
        }
      )
    } else {
      setOptimisticLikeCount((prev) => prev + 1)
      likeComment(
        { commentId: comment.comment.id },
        {
          onSuccess: () => {
            utils.commentRouter.fetchAllParentComments
              .invalidate()
              .then(() => setInvalidatingQuery((prev) => !prev))
            toast({
              title: "Success",
              description: "Comment liked successfully",
            })
          },
          onError: () => {
            setOptimisticLikeCount((prev) => prev - 1)
            setOptimisticLikeStatus((prev) => !prev)
            setInvalidatingQuery((prev) => !prev)
            toast({
              variant: "destructive",
              title: "Couldn't like comment.",
              description: "Something went wrong. Please try again later.",
            })
          },
        }
      )
    }
  }

  return (
    <div className="flex flex-col items-start space-x-2 mt-2">
      <div className="flex items-start space-x-2">
        <img
          src={comment.user.imageUrl}
          alt="User Avatar"
          className="w-6 h-6 rounded-full"
        />
        <div className="flex flex-col justify-start ">
          <div className="flex gap-1 items-center justify-start">
            <p className="text-gray-800 font-semibold">
              {comment.user?.username ??
                comment?.user?.emailAddresses[0].emailAddress.split("@")[0]}
            </p>
            <span className="h-fit text-xs">.</span>
            <p className="text-xs h-fit">
              {formatRelativeTime(comment?.comment.createdAt)}
            </p>
            {replyCount > 0 && (
              <>
                <span className="h-fit text-xs">.</span>
                <Button
                  onClick={() => setShowReplies((prev) => !prev)}
                  variant="link"
                  className="text-xs p-0 bg-none h-3 w-fit text-gray-600"
                >
                  {!showReplies
                    ? `Show ${replyCount} repl${replyCount > 1 ? "ies" : "y"}`
                    : loadingReplies
                    ? `Loading ${replyCount} repl${
                        replyCount > 1 ? "ies" : "y"
                      }`
                    : "Hide replies"}
                </Button>
              </>
            )}
          </div>
          <p className="text-gray-500 text-sm">{comment?.comment.text}</p>
          <div className="flex gap-2 mt-2">
            <Button
              onClick={() => setOpenReply((prev) => !prev)}
              variant="link"
              className="text-xs p-0 bg-none h-3 w-fit"
            >
              <MessageSquareReply className="h-4 w-4" />
            </Button>
            <div className="flex gap-2 items-start">
              <Button
                disabled={likingComment || unLikingComment || invalidatingQuery}
                onClick={() => updateLikeStatus()}
                variant="link"
                className="text-xs p-0 bg-none h-3 w-fit"
              >
                <ThumbsUpIcon
                  className="h-4 w-4 "
                  fill={optimisticLikeStatus ? "#4267b2" : "none"}
                />
              </Button>
              <span className="text-xs">{optimisticLikeCount}</span>
            </div>
          </div>
        </div>
      </div>
      {openReply && (
        <div className="mt-3 ml-10 w-full flex gap-2 mr-3">
          <img
            src={comment.user.imageUrl}
            alt="User Avatar"
            className="w-8 h-8 rounded-full"
          />
          <form className="w-full relative" onSubmit={handleSubmit(postReply)}>
            <Input
              type="hidden"
              value={postId} // Add hidden field
              {...register("postId")}
            />
            <Input
              type="hidden"
              value={comment.comment.id} // Add hidden field
              {...register("parentCommentId")}
            />
            <Input
              className="rounded-md h-8"
              placeholder="Post a reply..."
              {...register("text")}
            />
            {!postingReply ? (
              <Button
                className="absolute right-1 -top-1 hover:bg-transparent"
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
      )}
      {showReplies &&
        commentReplies &&
        commentReplies.pages.map((response) =>
          response.comments.map((reply) => {
            console.log("Reply: ", reply)
            return (
              <CommentReply
                key={reply.comment.id}
                id={reply.comment.id}
                likeCount={reply.comment.likes}
                isLikedByUser={reply.comment.isLikedByUser ?? false}
                userImageUrl={reply.user.imageUrl}
                userDisplayName={reply.user.username || ""}
                userEmailAddress={reply.user.emailAddresses[0].emailAddress || ""}
                createdAt={reply.comment.createdAt}
                text={reply.comment.text}
              />
            )
          })
        )}
    </div>
  )
}

export default Comment

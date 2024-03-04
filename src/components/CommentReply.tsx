import React, { useState } from "react"
import { formatRelativeTime } from "@/lib/utils"
import { Button } from "./ui/button"
import { ThumbsUpIcon } from "lucide-react"
import { trpc } from "@/server/trpc/client"
import { toast } from "./ui/use-toast"

interface CommentReplyProps {
  id: string
  likeCount: number
  isLikedByUser: boolean
  userImageUrl: string
  userDisplayName: string
  userEmailAddress: string
  createdAt: string
  text: string
}

const CommentReply = ({
  id,
  likeCount,
  isLikedByUser,
  userImageUrl,
  userDisplayName,
  userEmailAddress,
  createdAt,
  text,
}: CommentReplyProps) => {
  const [optimisticLikeCount, setOptimisticLikeCount] =
    useState<number>(likeCount)
  const [optimisticLikeStatus, setOptimisticLikeStatus] =
    useState<boolean>(isLikedByUser)
  const [invalidatingQuery, setInvalidatingQuery] = useState<boolean>(false)

    const { mutate: likeComment, isLoading: likingComment } =
      trpc.commentRouter.likeComment.useMutation()
    const { mutate: unlikeComment, isLoading: unLikingComment } =
      trpc.commentRouter.unlikeComment.useMutation()

      
  const utils = trpc.useUtils()

  const updateLikeStatus = () => {
    setOptimisticLikeStatus((prev) => !prev)
    setInvalidatingQuery((prev) => !prev)
    if (isLikedByUser) {
      setOptimisticLikeCount((prev) => prev - 1)
      unlikeComment(
        { commentId: id },
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
        { commentId: id },
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
    <div className="flex items-start space-x-2 ml-5 pl-3 mt-3">
      <img
        src={userImageUrl}
        alt="User Avatar"
        className="w-6 h-6 rounded-full"
      />
      <div className="flex flex-col justify-start">
        <div className="flex gap-1 items-center justify-start">
          <p className="text-gray-800 font-semibold">
            {userDisplayName ?? userEmailAddress.split("@")[0]}
          </p>
          <span className="h-fit text-xs">.</span>
          <p className="text-xs h-fit">{formatRelativeTime(createdAt)}</p>
        </div>
        <p className="text-gray-500 text-sm">{text}</p>
        <div className="flex gap-2 mt-2">
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
  )
}

export default CommentReply

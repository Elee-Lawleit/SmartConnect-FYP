"use client"
import React, { useState } from "react"
import { Input } from "./ui/input"
import { formatRelativeTime } from "@/lib/utils"
import { Button } from "./ui/button"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, Send } from "lucide-react"
import { trpc } from "@/server/trpc/client"

interface CommentProps {
  comment: any
  userImageUrl: string
  postId: string
}

const commentSchema = z.object({
  text: z.string().min(1),
  postId: z.string().uuid(),
  parentCommentId: z.string().uuid(),
})

const Comment = ({ comment, userImageUrl, postId }: CommentProps) => {
  const utils = trpc.useUtils()
  const [openReply, setOpenReply] = useState<boolean>(false)

  const { mutate, isLoading } = trpc.commentRouter.createComment.useMutation()

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(commentSchema) })

  const postReply = (data: any) => {
    mutate(data, {
      onError: () => {
        //display toast
      },
      onSuccess: () => {
        reset()
        setOpenReply(false)
        utils.postRouter.fetchAllPosts.invalidate()
        // maybe display a toast here as well, don't really need to tho
      },
    })
  }

  console.log("comment: ", comment)


  return (
    <div className="flex flex-col items-start space-x-2 mt-2">
      <div className="flex items-start space-x-2">
        <img
          src="https://placekitten.com/32/32"
          alt="User Avatar"
          className="w-6 h-6 rounded-full"
        />
        <div className="flex flex-col justify-start ">
          <div className="flex gap-1 items-center justify-start">
            <p className="text-gray-800 font-semibold">John Doe</p>
            <span className="h-fit text-xs">.</span>
            <p className="text-xs h-fit">
              {formatRelativeTime(comment?.createdAt)}
            </p>
          </div>
          <p className="text-gray-500 text-sm">{comment?.text}</p>
          <Button
            onClick={() => setOpenReply((prev) => !prev)}
            variant="link"
            className="text-xs p-0 bg-none h-3 w-fit"
          >
            reply
          </Button>
        </div>
      </div>

      {openReply && (
        <div className="mt-3 ml-10 w-full flex gap-2">
          <img
            src={userImageUrl}
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
              value={comment.id} // Add hidden field
              {...register("parentCommentId")}
            />
            <Input
              className="rounded-md h-8"
              placeholder="Post a reply..."
              {...register("text")}
            />
            {!isLoading ? (
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
      {comment.replies &&
        comment.replies.map((reply: any) => (
          <div className="flex items-start space-x-2 ml-5 pl-3 mt-3">
            <img
              src="https://placekitten.com/32/32"
              alt="User Avatar"
              className="w-6 h-6 rounded-full"
            />
            <div className="flex flex-col justify-start">
              <div className="flex gap-1 items-center justify-start">
                <p className="text-gray-800 font-semibold">John Doe</p>
                <span className="h-fit text-xs">.</span>
                <p className="text-xs h-fit">
                  {formatRelativeTime(reply?.createdAt)}
                </p>
              </div>
              <p className="text-gray-500 text-sm">{reply?.text}</p>
            </div>
          </div>
          
        ))}
    </div>
  )
}

export default Comment

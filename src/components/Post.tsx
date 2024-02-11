"use client"
import { cn, formatRelativeTime } from "@/lib/utils"
import {
  Bookmark,
  Heart,
  Repeat,
  Trash,
  Trash2,
  TwitterIcon,
} from "lucide-react"
import React, { useEffect, useRef, useState } from "react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import { trpc } from "@/server/trpc/client"
import { toast } from "./ui/use-toast"
import { useUser } from "@clerk/nextjs"
import { Comment as CommentType, Media, PostLikes } from "@prisma/client"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog"
import { ScrollArea } from "./ui/scroll-area"
import CommentList from "./CommentList"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import Link from "next/link"

type MediaWithStringDate = Omit<Media, "createdAt"> & {
  createdAt: string // Modified type
}

interface PostProps {
  id: string
  userImageUrl: string
  userDisplayName: string | undefined
  createdAt: string
  caption: string
  likes: number
  media?: MediaWithStringDate[]
  commentCount: number
  postLikes?: PostLikes[]
  userId: string
  isLikedByUser: boolean
}

const Post = ({
  id,
  userImageUrl,
  caption,
  createdAt,
  likes,
  userDisplayName,
  media,
  commentCount,
  postLikes,
  userId,
  isLikedByUser,
}: PostProps) => {
  const { user } = useUser()

  const [isCopied, setIsCopied] = useState(false)
  const copyElement = useRef<HTMLInputElement | null>(null)

  const [api, setApi] = React.useState<CarouselApi>()
  const [mediaLoaded, setMediaLoaded] = useState<boolean>(false)
  const [optimisticLikeCount, setOptimisticLikeCount] = useState<number>(likes)
  const [optimisticLikeStatus, setOptimisticLikeStatus] = useState<boolean>(isLikedByUser)
  const [invalidatingQuery, setInvalidatingQuery] = useState<boolean>(false)
  const utils = trpc.useUtils()

  const { mutate: likePost, isLoading: isLikingPost } =
    trpc.postRouter.likePost.useMutation()

  const { mutate: unlikePost, isLoading: isUnlikingPost } =
    trpc.postRouter.unlikePost.useMutation()

  const {
    mutate: savePost,
    isLoading: savingPost,
    isError: errorSavingPost,
  } = trpc.postRouter.savePost.useMutation()

  const {
    mutate: deletePost,
    isLoading: deletingPost,
    isError: errorDeletingPost,
  } = trpc.postRouter.deletePost.useMutation()

  useEffect(() => {
    if (!api) {
      return
    }

    const setCarouselHeight = () => {
      const currentSlide = api.selectedScrollSnap()
      const slideList: HTMLElement[] = api.slideNodes()

      if (slideList.length > 1) {
        const slide: ChildNode | null = slideList[currentSlide].firstChild

        const rootCarouselDiv: HTMLElement = api.containerNode()
        if ((slide as HTMLElement).offsetHeight !== 0 && mediaLoaded) {
          const height = (slide as HTMLElement).offsetHeight
          rootCarouselDiv.style.height = `${height}px`
        }
      }
    }
    setCarouselHeight()
    api.on("slidesInView", setCarouselHeight)
    api.on("select", setCarouselHeight)
  }, [api, mediaLoaded])

  const updateLikeStatus = () => {
    setOptimisticLikeStatus((prev) => !prev)
    if (
      postLikes &&
      postLikes.filter((postLike) => postLike.userId === user?.id)
        .length !== 0
    ) {
      setOptimisticLikeCount((prev) => prev - 1)
      unlikePost(
        { postId: id },
        {
          onError: () => {
            setOptimisticLikeCount((prev) => prev + 1)
            setOptimisticLikeStatus((prev) => !prev)
            toast({
              variant: "destructive",
              title: "Couldn't unlike post.",
              description: "Something went wrong. Please try again later.",
            })
          },
          onSuccess: async () => {
            utils.postRouter.fetchAllPosts
              .invalidate()
              .then(() => setInvalidatingQuery(false))
            toast({
              title: "Success",
              description: "Post unliked successfully",
            })
          },
        }
      )
    } else {
      setOptimisticLikeCount((prev) => prev + 1)
      likePost(
        { postId: id },
        {
          onError: () => {
            setOptimisticLikeCount((prev) => prev - 1)
            setOptimisticLikeStatus((prev) => !prev)
            toast({
              variant: "destructive",
              title: "Couldn't like post.",
              description: "Something went wrong. Please try again later.",
            })
          },
          onSuccess: async () => {
            utils.postRouter.fetchAllPosts
              .invalidate()
              .then(() => setInvalidatingQuery(false))
            toast({
              title: "Success",
              description: "Post liked successfully",
            })
          },
        }
      )
    }
  }

  return (
    <div className="bg-gray-100 max-w-full mx-auto w-[512px]">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-lg">
        {/* <!-- User Info with Three-Dot Menu --> */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Link href={`/profile/${userId}`} className="hover:no-underline relative">
              <img
                src={userImageUrl}
                alt="User Avatar"
                className="w-8 h-8 rounded-full"
              />
              <div className="absolute bg-transparent hover:bg-gray-200 inset-0 rounded-full opacity-20" />
            </Link>
            <div>
              <Link href={`/profile/${userId}`} className="hover:underline underline-offset-2">
                <p className="text-gray-800 font-semibold">{userDisplayName}</p>
              </Link>
              <p className="text-gray-500 text-sm hover:underline-none">
                {formatRelativeTime(createdAt)}
              </p>
            </div>
          </div>
          <div className="text-gray-500 cursor-pointer">
            {/* <!-- Three-dot menu icon --> */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="hover:bg-gray-50 rounded-full p-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="7" r="1" />
                    <circle cx="12" cy="12" r="1" />
                    <circle cx="12" cy="17" r="1" />
                  </svg>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-40 shadow-lg">
                <DropdownMenuItem className="flex gap-2 items-center cursor-pointer">
                  <Bookmark className="w-4 h-4" />
                  <button
                    className="text-base font-medium"
                    onClick={() => {
                      if (user) {
                        savePost(
                          { postId: id, userId: user.id },
                          {
                            onSuccess: () => {
                              toast({
                                title: "Success",
                                description: "Post saved successfully",
                              })
                            },
                            onError: () => {
                              toast({
                                variant: "destructive",
                                title: "Couldn't save post",
                                description:
                                  "Something went wrong. Please try again later.",
                              })
                            },
                          }
                        )
                      }
                    }}
                  >
                    Save Post
                  </button>
                </DropdownMenuItem>
                {user?.id === userId && (
                  <DropdownMenuItem className="flex gap-2 items-center cursor-pointer">
                    <Trash2 className="w-4 h-4" />
                    <button
                      className="text-base font-medium"
                      onClick={() => {
                        deletePost(
                          { postId: id },
                          {
                            onSuccess: () => {
                              utils.postRouter.fetchAllPosts.invalidate()
                              toast({
                                title: "Success",
                                description: "Post deleted successfully",
                              })
                            },
                            onError: () => {
                              toast({
                                variant: "destructive",
                                title: "Couldn't delete post",
                                description:
                                  "Something went wrong. Please try again later.",
                              })
                            },
                          }
                        )
                      }}
                    >
                      Delete Post
                    </button>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {/* <!-- Message --> */}
        <div className="mb-4">
          <p className="text-gray-800">{caption + " "}</p>
        </div>
        {media && (
          <div className="mb-4">
            <Carousel setApi={setApi} orientation="horizontal">
              <CarouselContent>
                {" "}
                {/* this should adjust height based on CaroselItem */}
                {media.map((media, index: number) => {
                  return (
                    <CarouselItem key={index} className="align-middle">
                      {media.type === "image" ? (
                        <img
                          onLoad={() =>
                            setMediaLoaded((prev) => (prev ? prev : !prev))
                          }
                          src={media.url}
                          alt="post image"
                          className="w-full h-auto rounded-md align-middle"
                        />
                      ) : (
                        <video
                          onLoadedData={() =>
                            setMediaLoaded((prev) => (prev ? prev : !prev))
                          }
                          src={media.url}
                          controls
                          className="w-full rounded-md align-middle"
                        />
                      )}
                    </CarouselItem>
                  )
                })}
              </CarouselContent>
              <CarouselPrevious
                className={cn("ml-14", {
                  hidden: media.length < 2,
                })}
              />
              <CarouselNext
                className={cn("mr-14", {
                  hidden: media.length < 2,
                })}
              />
            </Carousel>
          </div>
        )}
        {/* <!-- Like and Comment Section --> */}
        <div className="flex items-center justify-between text-gray-500">
          <div className="flex items-center space-x-2">
            <button
              className="flex justify-center items-center gap-2 px-2 hover:bg-gray-50 rounded-full p-1"
              onClick={updateLikeStatus}
              disabled={isLikingPost || isUnlikingPost || invalidatingQuery}
            >
              <Heart
                className={`h-6 w-6 transition-all duration-300 ease-in-out ${
                  optimisticLikeStatus ? "filled" : ""
                }`}
                fill={optimisticLikeStatus ? "#DC143C" : "none"}
                strokeWidth={optimisticLikeStatus ? "0" : "1"}
              />

              <span className="text-lg">{optimisticLikeCount}</span>
            </button>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <button className="flex justify-center items-center gap-2 px-2 hover:bg-gray-50 rounded-full p-1">
                <svg
                  width="22px"
                  height="22px"
                  viewBox="0 0 24 24"
                  className="w-5 h-5 fill-current"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                  <g
                    id="SVGRepo_tracerCarrier"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></g>
                  <g id="SVGRepo_iconCarrier">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 13.5997 2.37562 15.1116 3.04346 16.4525C3.22094 16.8088 3.28001 17.2161 3.17712 17.6006L2.58151 19.8267C2.32295 20.793 3.20701 21.677 4.17335 21.4185L6.39939 20.8229C6.78393 20.72 7.19121 20.7791 7.54753 20.9565C8.88837 21.6244 10.4003 22 12 22ZM8 13.25C7.58579 13.25 7.25 13.5858 7.25 14C7.25 14.4142 7.58579 14.75 8 14.75H13.5C13.9142 14.75 14.25 14.4142 14.25 14C14.25 13.5858 13.9142 13.25 13.5 13.25H8ZM7.25 10.5C7.25 10.0858 7.58579 9.75 8 9.75H16C16.4142 9.75 16.75 10.0858 16.75 10.5C16.75 10.9142 16.4142 11.25 16 11.25H8C7.58579 11.25 7.25 10.9142 7.25 10.5Z"
                    ></path>
                  </g>
                </svg>
                <span>{commentCount} Comment(s)</span>
              </button>
            </DialogTrigger>
            <DialogContent>
              <ScrollArea className="max-h-[90vh]">
                <DialogHeader>
                  <DialogTitle className="text-center">{`${userDisplayName}'s post's comments`}</DialogTitle>
                  <hr className="mt-2 mb-2" />
                </DialogHeader>
                <CommentList postId={id} />
              </ScrollArea>
            </DialogContent>
          </Dialog>
          <div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost">
                  Share Post <Repeat className="h-4 w-4 ml-1.5" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <div>
                  <div>
                    <Button className="text-sm leading-none" variant="ghost">
                      Share
                    </Button>
                  </div>
                  <div className="max-w-sm">
                    <div>
                      <div>Share Post</div>
                      <div>Share the post with others.</div>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <Label className="sr-only" htmlFor="link">
                          Link
                        </Label>
                        <Input
                          className="flex-1 text-sm"
                          id="link"
                          placeholder="Link"
                          readOnly
                          value={`${process.env.NEXT_PUBLIC_SERVER_URL}/post/${id}`}
                          ref={copyElement}
                        />
                        <Button
                          size="sm"
                          onClick={() => {
                            if (copyElement.current) {
                              const link = copyElement.current.value
                              if (navigator.clipboard) {
                                navigator.clipboard.writeText(link).then(() => {
                                  setIsCopied(true)
                                  setTimeout(() => setIsCopied(false), 3000)
                                  return
                                })
                                copyElement.current.select()
                                document.execCommand("copy")
                                setIsCopied(true)
                                setTimeout(() => setIsCopied(false), 3000)
                              }
                            }
                          }}
                        >
                          {isCopied ? "Copied!" : "Copy"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <hr className="mt-2 mb-2" />
      </div>
    </div>
  )
}

export default Post

"use client"
import { formatRelativeTime } from "@/lib/utils"
import { Heart } from "lucide-react"
import React, { useEffect } from "react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"

interface PostProps {
  userImageUrl: string
  userDisplayName: string | undefined
  createdAt: string
  caption: string
  likes: number
  hasUserLiked: Boolean
  media?: any
}

const Post = ({
  userImageUrl,
  caption,
  createdAt,
  likes,
  userDisplayName,
  hasUserLiked,
  media,
}: PostProps) => {
  console.log("media: ", media)
  const [api, setApi] = React.useState<CarouselApi>()

  useEffect(() => {
    if (!api) {
      return
    }

    const setCarouselHeight = () => {
      const currentSlide = api.selectedScrollSnap()
      const slideList: HTMLElement[] = api.slideNodes()

      const slide: ChildNode | null = slideList[currentSlide].firstChild

      const rootCarouselDiv: HTMLElement = api.containerNode()
      if (slide) {
        const height = (slide as HTMLElement).offsetHeight
        rootCarouselDiv.style.height = `${height}px`
      }
    }
    setCarouselHeight() //set initial height
    api.on("select", setCarouselHeight)
    return api.off("select", setCarouselHeight) //remove listener
  }, [api])

  return (
    <div className="bg-gray-100 flex items-center mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-lg">
        {/* <!-- User Info with Three-Dot Menu --> */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <img
              src={userImageUrl}
              alt="User Avatar"
              className="w-8 h-8 rounded-full"
            />

            <div>
              <p className="text-gray-800 font-semibold">{userDisplayName}</p>
              <p className="text-gray-500 text-sm">
                {formatRelativeTime(createdAt)}
              </p>
            </div>
          </div>
          <div className="text-gray-500 cursor-pointer">
            {/* <!-- Three-dot menu icon --> */}
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
          </div>
        </div>
        {/* <!-- Message --> */}
        <div className="mb-4">
          <p className="text-gray-800">
            {caption + " "}
            {/* <a href="" className="text-blue-600">
              #CuteKitten
            </a>
            <a href="" className="text-blue-600">
              #AdventureCat
            </a> */}
          </p>
        </div>
        {media.length !== 0 && (
          <div className="mb-4">
            <Carousel setApi={setApi} orientation="horizontal">
              <CarouselContent>
                {" "}
                {/* this should adjust height based on CaroselItem */}
                {media.map((media: any, index: number) => {
                  return (
                    <CarouselItem key={index}>
                      {media.type === "image" ? (
                        <img
                          src={media.url}
                          alt="post image"
                          className="w-full rounded-md align-middle"
                        />
                      ) : (
                        <video
                          src={media.url}
                          controls
                          className="w-full rounded-md align-middle"
                        />
                      )}
                    </CarouselItem>
                  )
                })}
              </CarouselContent>
              <CarouselPrevious className="ml-14" />
              <CarouselNext className="mr-14" />
            </Carousel>
          </div>
        )}
        {/* <!-- Like and Comment Section --> */}
        <div className="flex items-center justify-between text-gray-500">
          <div className="flex items-center space-x-2">
            <button className="flex justify-center items-center gap-2 px-2 hover:bg-gray-50 rounded-full p-1">
              <Heart
                className="h-6 w-6"
                fill={hasUserLiked ? "#DC143C" : "none"}
                strokeWidth={hasUserLiked ? "0" : "1"}
              />

              <span className="text-lg">{likes}</span>
            </button>
          </div>
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
            <span>3 Comment</span>
          </button>
        </div>
        <hr className="mt-2 mb-2" />
        <p className="text-gray-800 font-semibold">Comment</p>
        <hr className="mt-2 mb-2" />
        <div className="mt-4">
          <div className="flex items-center space-x-2">
            <img
              src="https://placekitten.com/32/32"
              alt="User Avatar"
              className="w-6 h-6 rounded-full"
            />
            <div>
              <p className="text-gray-800 font-semibold">Jane Smith</p>
              <p className="text-gray-500 text-sm">Lovely shot! 📸</p>
            </div>
          </div>
          {/* <!-- Comment 2 --> */}
          <div className="flex items-center space-x-2 mt-2">
            <img
              src="https://placekitten.com/32/32"
              alt="User Avatar"
              className="w-6 h-6 rounded-full"
            />
            <div>
              <p className="text-gray-800 font-semibold">Bob Johnson</p>
              <p className="text-gray-500 text-sm">
                I can't handle the cuteness! Where can I get one?
              </p>
            </div>
          </div>
          {/* <!-- Reply from John Doe with indentation --> */}
          <div className="flex items-center space-x-2 mt-2 ml-6">
            <img
              src="https://placekitten.com/40/40"
              alt="User Avatar"
              className="w-6 h-6 rounded-full"
            />
            <div>
              <p className="text-gray-800 font-semibold">John Doe</p>
              <p className="text-gray-500 text-sm">
                That little furball is from a local shelter. You should check it
                out! 🏠😺
              </p>
            </div>
          </div>
          {/* <!-- Add more comments and replies as needed --> */}
        </div>
      </div>
    </div>
  )
}

export default Post

"use client"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { ImagePlus, Loader2, Trash2 } from "lucide-react"
import Image from "next/image"
import { ChangeEvent, useState } from "react"
import { Button } from "@/components/ui/button"
import getSignedUrls from "../app/actions/getSignedUrls"
import { useUser } from "@clerk/nextjs"
import { trpc } from "@/server/trpc/client"

const CreatePost = () => {
  const { mutate, isLoading } = trpc.postRouter.createPost.useMutation()

  const [loading, setLoading] = useState<boolean>(false)

  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [fileTypes, setFileType] = useState<string[]>([])
  const [fileSizes, setFileSize] = useState<number[]>([])
  const [fileChecksums, setFileChecksum] = useState<string[]>([])

  const [caption, setCaption] = useState<string>("")

  const user = useUser()

  const computeSHA256 = async (file: File) => {
    //do this for media array
    const buffer = await file.arrayBuffer()
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("")
    return hashHex
  }

  const handleCaption = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setCaption(event.target.value)
  }

  const handleImageUploads = async (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const fileArray = Array.from(event.target.files)

      if (fileArray.length > 0) {
        setSelectedFiles((prev) => [...prev, ...fileArray])
        setFileType((prev) => [...prev, ...fileArray.map((file) => file.type)])
        setFileSize((prev) => [...prev, ...fileArray.map((file) => file.size)])
        const checksums = await Promise.all(
          fileArray.map(async (file) => await computeSHA256(file))
        )

        setFileChecksum((prev) => [...prev, ...checksums])
      }
    }
  }

  const uploadPost = async (e: any) => {
    setLoading(true)
    e.preventDefault()
    if (!caption && selectedFiles.length === 0) {
      console.log("Cannot post bro...")
      setLoading(false)
      return
    }
    let response: any //will deal with the type later
    try {
      response = await getSignedUrls(
        fileTypes,
        fileSizes,
        fileChecksums,
        user?.user!.id
      )
      if (!response.success) {
        if (response.code === "BAD_REQUEST" && response.fileType) {
          // show toast for unsupported file type
        }
        if (response.code === "BAD_REQUEST" && response.fileSize) {
          // file at index + 1 exceeds the size of 50MB
        } else {
          // show toast for internal server error
        }
      }
    } catch (error) {
      //show toast for internal server error
    }
    setLoading(false)

    let mediaUrls: string[] = []

    await Promise.allSettled(
      response.signedUrls.forEach(async (url: string, index: number) => {
        mediaUrls.push(url.split("?")[0])
        try {
          const response = await fetch(url, {
            method: "PUT",
            headers: {
              "Content-Type": selectedFiles[index].type,
            },
            body: selectedFiles[index],
          })
          //handle non okay responses
          if (!response.ok) {
            //show toast that upload to s3 failed
            //don't worry about the which file, just fail all, but I will then need to delete from s3 as well
            //use the mediaUrls array here to map and delete files, if you don't want ghost files in bucket
            //because the mediaUrls array contains ALL urls, use the index to figure out which url is not needed
            //map over the rest and delete from s3
            return
          }

          //finally insert in database
          mutate({ caption, mediaUrls })
        } catch (error) {
          //handle fetch errors here, maybe I am over doing it at this point
        }
      })
    )

    setSelectedFiles([])
    setFileType([])
    setFileSize([])
    setFileChecksum([])
    setCaption("")
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-md mb-3 w-full max-w-lg mx-auto">
      <div className="w-full">
        <Textarea
          className="resize-none"
          placeholder="Share your thoughts..."
          value={caption}
          onChange={handleCaption}
        />
        <div className="mt-3">
          <div className=" h-full w-full">
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex gap-2 rounded-md border w-full">
                {selectedFiles?.map((file, index) => {
                  const url = URL.createObjectURL(file)
                  return (
                    <div key={index} className="shrink-0 relative">
                      {file.type.startsWith("image") ? (
                        <Image
                          width={130}
                          height={130}
                          src={url}
                          alt="post"
                          className="relative aspect-square object-cover rounded-md shadow-md"
                          onLoad={() => URL.revokeObjectURL(url)}
                        />
                      ) : (
                        <video
                          src={URL.createObjectURL(file)}
                          width={130}
                          height={130}
                          controls
                          onLoad={() => URL.revokeObjectURL(url)}
                          className="relative aspect-square object-cover rounded-md shadow-md"
                        />
                      )}
                      <button
                        onClick={() => {
                          const updatedFiles = selectedFiles.filter(
                            (_, i) => i !== index
                          )
                          setSelectedFiles(updatedFiles)
                        }}
                        title="remove media"
                        aria-label="remove media"
                        className="absolute z-50 bottom-2 left-2 bg-black opacity-50 rounded-md p-1 hover:opacity-95"
                      >
                        <Trash2
                          aria-label="hidden"
                          className="h-4 w-4 text-white"
                        />
                      </button>
                    </div>
                  )
                })}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        </div>
        <div className="mt-2 flex w-full justify-between">
          <label
            htmlFor="mediaInput"
            title="Add media"
            className="cursor-pointer hover:cursor-pointer"
          >
            <ImagePlus className="text-gray-700" />
            <input
              id="mediaInput"
              type="file"
              className="hidden"
              multiple
              accept="image/*,video/mp4,video/webm"
              onChange={handleImageUploads}
              value=""
            />
          </label>
          <Button
            size="sm"
            onClick={uploadPost}
            disabled={
              loading || isLoading || (!caption && selectedFiles.length === 0)
            }
          >
            {loading || isLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
              "Create Post"
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default CreatePost

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
import { useToast } from "@/components/ui/use-toast"

const CreatePost = () => {
  const { toast } = useToast()
  const utils = trpc.useUtils()
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
    let response
    try {
      response = await getSignedUrls(
        fileTypes,
        fileSizes,
        fileChecksums,
        user?.user!.id
      )
    } catch (error: any) {
      if (error.cause.fileType) {
        toast({
          variant: "destructive",
          title: "Invalid file type.",
          description: `Invalid file type ${error.cause.fileType} at position ${error.cause.index}`,
        })
      } else if (error.cause.fileSize) {
        toast({
          variant: "destructive",
          title: "File size exceeded 50MB.",
          description: `Too large file size ${error.cause.fileSize} at position ${error.cause.index}`,
        })
      } else {
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong",
          description: `An internal server error occurred. Please try again later.`,
        })
      }
    }

    let mediaUrls: string[] = []
    if (response) {
      response.signedUrls.forEach(async (url, index) => {
        mediaUrls.push(url.split("?")[0])
        const res = await fetch(url, {
          method: "PUT",
          headers: {
            "Content-Type": selectedFiles[index].type,
          },
          body: selectedFiles[index],
        })
        if (!res.ok) {
          toast({
            variant: "destructive",
            title: "Error uploading media.",
            description: `An internal server error occurred. Please try again later.`,
          })
          setLoading(false)
          //show error toast and delete files from s3 (maybe make another server action to do that!)
          //send the media urls array other than the index that errored out
        }
      })
    }
    console.log("Media urls: ", mediaUrls)

    //finally insert in database
    mutate(
      { caption, mediaUrls },
      {
        onSuccess: () => {
          toast({
            color: "green",
            title: "Post created.",
            description: "Your post was created successfully.",
          })
          utils.postRouter.fetchAllPosts.invalidate()
          setLoading(false)
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong",
            description: `An internal server error occurred. Please try again later.`,
          })
          setLoading(false)
        },
      }
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

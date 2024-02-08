"use client"
import Navbar from "@/components/Navbar"
import { UserProfile, useUser } from "@clerk/nextjs"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { trpc } from "@/server/trpc/client"
import Post from "@/components/Post"
import { useInView } from "react-intersection-observer"
import { useEffect, useRef } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import useNFTMarketplace from "@/web3/useMarketplace"
import NFTCard from "@/components/marketpalce/NFTCard"
import { Button } from "@/components/ui/button"
import getSignedUrls from "@/app/actions/getSignedUrls"
import { toast } from "@/components/ui/use-toast"

const UserProfilePage = () => {
  const { user } = useUser()

  const coverImageElement = useRef<HTMLInputElement | null>(null)

    const {
      data: coverImageResponse,
      isLoading: loadingCoverImage,
      isError: coverImageError,
    } = trpc.profileRouter.fetchCoverImage.useQuery({ userId: "user_2bUdXgzXjCD3F0A1GyuAl59eAsN" },)

  const { mutate: updateCoverImage, isLoading: updatingCoverImage } =
    trpc.profileRouter.updateCoverImage.useMutation()

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
  } = trpc.postRouter.fetchUserPosts.useInfiniteQuery(
    { userId: user?.id as string, limit: 2 },
    {
      getNextPageParam: (lastPageResponse) => lastPageResponse.nextCursor,
      enabled: user?.id ? true : false,
    }
  )
  const { ownedNfts } = useNFTMarketplace()

  const { ref, inView, entry } = useInView()

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage()
    }
  }, [fetchNextPage, inView])

  const handleCoverImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!event.target.files || !event.target.files[0] || !user) {
      return
    }
    const selectedFile = event.target.files[0]

    const checksum = await computeSHA256(selectedFile)

    const response = await getSignedUrls(
      [selectedFile.type],
      [selectedFile.size],
      [checksum],
      user.id
    )

    if (response) {
      const [first] = response.signedUrls

      const res = await fetch(first, {
        method: "PUT",
        headers: {
          "Content-Type": selectedFile.type,
        },
        body: selectedFile,
      })
      const url = first.split("?")[0]
      updateCoverImage(
        { imageUrl: url },
        {
          onError: () => {
            toast({
              variant: "destructive",
              title: "Uh oh! Something went wrong",
              description: `An internal server error occurred. Please try again later.`,
            })
          },
          onSuccess: () => {
            toast({
              title: "Success.",
              description: "Cover image updated successfully.",
            })
          },
        }
      )
    }
  }

  //MOVE THIS TO A SEPARATE FILE LATER AND IMPORT FROM THERE "helpers.ts"
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

  if (!user) {
    return (
      <div className="flex flex-col w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-sm shadow-lg p-6 gap-6 animate-pulse">
        <header className="flex flex-col gap-6">
          <Skeleton className="w-full h-36 relative bg-gray-200 dark:bg-gray-700 rounded-md" />
          <div className="flex items-center gap-6">
            <Skeleton className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700" />
            <div className="flex flex-col">
              <Skeleton className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
              <Skeleton className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mt-2" />
              <Skeleton className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded mt-4" />
              <Skeleton className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mt-4" />
            </div>
          </div>
          <div className="mt-6">
            <div className="flex justify-around items-center text-gray-800 dark:text-gray-200">
              <Skeleton className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
              <Skeleton className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
              <Skeleton className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
              <Skeleton className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
              <Skeleton className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
              <Skeleton className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        </header>
        <main className="flex flex-col gap-6">
          <div>
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
              <Skeleton className="h-64 bg-gray-200 dark:bg-gray-700 rounded-md" />
              <Skeleton className="h-64 bg-gray-200 dark:bg-gray-700 rounded-md" />
            </section>
          </div>
          <div>
            <section className="flex flex-col gap-6 mt-10">
              <Skeleton className="h-64 bg-gray-200 dark:bg-gray-700 rounded-md" />
            </section>
          </div>
        </main>
      </div>
    )
  }

  console.log(coverImageResponse)
  return (
    <div>
      <header className="flex flex-col gap-1">
        <Navbar />
        <div className="w-full relative flex flex-col gap-2 px-2">
          <img
            className="w-full h-full object-cover rounded-md"
            height="144"
            src={coverImageResponse?.coverImage.url ?? "/placeholder.svg"}
            style={{
              aspectRatio: "1024/144",
              objectFit: "cover",
            }}
            width="1024"
          />
          <div>
            <Button
              className="absolute z-50 bottom-32 left-10 bg-black opacity-50 rounded-md p-1 hover:opacity-95"
              onClick={() => coverImageElement.current?.click()}
              disabled={updatingCoverImage}
            >
              {updatingCoverImage ? "updating..." : "Edit Cover Image"}
            </Button>
            <input
              ref={coverImageElement}
              className="hidden"
              type="file"
              accept="image/*"
              onChange={handleCoverImageUpload}
            />
          </div>
          <div className="flex items-center gap-6 justify-center">
            <img
              className="w-20 h-20 rounded-full"
              height="80"
              src={user?.imageUrl}
              style={{
                aspectRatio: "80/80",
                objectFit: "cover",
              }}
              width="80"
            />
            <div className="flex flex-col ">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                {user?.fullName ??
                  user?.emailAddresses[0].emailAddress.split("@")[0]}
              </h2>
              {user?.username && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  @{user?.username}
                </p>
              )}
              <p className="text-gray-600 dark:text-gray-400 mt-4">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque
                nisl eros, pulvinar facilisis justo mollis, auctor consequat
                urna.
              </p>
              {/* <button className="bg-blue-500 text-white rounded-md px-4 py-2 mt-4">
                Edit Profile
              </button> */}
            </div>
          </div>
        </div>
      </header>
      <div className="mt-3 w-full">
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="posts" className="text-lg" id="0">
              Posts
            </TabsTrigger>
            <TabsTrigger value="nfts" className="text-lg" id="1">
              NFTs
            </TabsTrigger>
          </TabsList>
          <TabsContent
            value="posts"
            className="flex flex-col max-w-full mx-auto w-[512px]"
          >
            {isLoading ? (
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
            ) : (
              data?.pages.map((response) =>
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
                          post?.user?.emailAddresses[0].emailAddress.split(
                            "@"
                          )[0]) ||
                        ""
                      }
                      media={post!.post.media}
                      postLikes={post!.post.postLikes}
                      userId={post.user.id}
                    />
                  )
                })
              )
            )}
            <div
              ref={ref}
              className={cn(
                isFetchingNextPage || hasNextPage ? "block" : "hidden"
              )}
            >
              {<Loader2 className="animate-spin mx-auto text-gray-400 mt-3" />}
            </div>
            <div
              className={cn(
                "mt-3 mb-3 text-gray-800 font-lg text-center hidden",
                {
                  block: !hasNextPage && !isFetchingNextPage,
                }
              )}
            >
              You&apos;re all caught with your posts!
            </div>
          </TabsContent>
          <TabsContent value="nfts">
            {!ownedNfts ? (
              <div className="flex justify-center flex-wrap gap-2 p-3">
                {new Array(2).fill(null).map((_, index) => (
                  <Skeleton
                    key={index}
                    className="flex flex-col w-64 bg-gray-200 border rounded-sm shadow-sm"
                  >
                    <div className="h-48 relative">
                      <Skeleton className="w-full h-full object-cover object-center rounded-sm" />
                    </div>
                    <div className="bg-gray-200 px-2 py-1 flex flex-col gap-1">
                      <Skeleton className="w-full h-6 bg-gray-300 rounded-md" />
                      <Skeleton className="w-full h-6 bg-gray-300 rounded-md" />
                      <div className="flex items-center gap-1">
                        <Skeleton className="w-8 h-8" />
                        <Skeleton className="w-8 h-8" />
                        <Skeleton className="w-8 h-8" />
                      </div>
                    </div>
                  </Skeleton>
                ))}
              </div>
            ) : ownedNfts.length === 0 ? (
              <div>no owned nfts</div>
            ) : (
              ownedNfts?.map((nft) => <NFTCard key={nft.id} nft={nft} />)
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default UserProfilePage

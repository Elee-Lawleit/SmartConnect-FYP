"use client"
import { trpc } from '@/server/trpc/client'
import { UserButton } from '@clerk/nextjs'

export default function Home() {
  const {mutate: createPost, isLoading} = trpc.postRouter.post.useMutation({
    onError: (error)=>{
      console.log("Bad thing happened: ", error)
    },
    onSuccess: (response)=>{
      console.log("Good thing happened. Here it is: ", response)
    },
    
  }, )

  // const {getToken} = useAuth();
  // console.log(getToken().then((res)=>console.log("token: ", res)))

  const createDummyPost = () =>{

    const data = {
      userId: "48fda264-4026-49a5-b513-569d7e842333",
      caption: "some weird caption",
      mediaUrls: [
        "https://www.example-media-url.com",
        "https://www.example-media-url2.com",
        "https://www.example-media-url3.com",
      ],
    }
    createPost(data)
  }

  return (
    <>
    <UserButton/>
      <div>Home page</div>
      <button  onClick={createDummyPost}>{isLoading? "Creating post..." : "Create a post"}</button>
    </>
  )
}

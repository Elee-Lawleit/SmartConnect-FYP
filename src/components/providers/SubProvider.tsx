import { trpc } from "@/server/trpc/client"
import { useUser } from "@clerk/nextjs"
import { toast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"

export function useSubscription() {
  const { user } = useUser()

  trpc.postRouter.onCreated.useSubscription(
    { userId: user?.id || "" },
    {
      onData: (post) => {
        console.log("Data received on front end: ", post)
        toast({
          title: "Your friend just created a new post!",
          action: (
            <ToastAction altText="view post">
              <a href={`/post/${post.id}`} target="_blank">
                View post
              </a>
            </ToastAction>
          ),
        })
      },
      enabled: user?.id ? true : false,
    }
  )
}

export const SubProvider = (props: { children: React.ReactNode }) => {
  useSubscription()
  return <>{props.children}</>
}

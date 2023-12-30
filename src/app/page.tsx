"use client"
import { trpc } from "@/server/trpc/client"
import { UserButton, useUser, useClerk } from "@clerk/nextjs"
import { useEffect, useState } from "react"

export default function Home() {
  const clerk = useClerk()
  const { user, isSignedIn } = useUser()

  useEffect(() => {
    async function checkWalletConnection() {
      if (user && isSignedIn) {
        // @ts-ignore
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        })
        const [account] = accounts

        console.log("address: ", account)

        const clerkWeb3Wallets = user?.web3Wallets
        const wallets = clerkWeb3Wallets.map((wallet) => wallet.web3Wallet)
        if (!wallets.includes(account)) {
          window.alert(
            "Wallet is not associated with clerk account. It will be disconnected! Please connect a valid wallet address or cancel"
          )
          try {
            // @ts-ignore
            await window.ethereum.send("wallet_requestPermissions", [
              { eth_accounts: {} },
            ])
          } catch (error: any) {
            if (error.code == "4001")
              alert("Wallet disconected. You can connect it anytime!")
          }
        }
      }
    }

    checkWalletConnection() //initial check

    // @ts-ignore
    window.ethereum.on("accountsChanged", checkWalletConnection)
  }, [user])

  const { mutate: createPost, isLoading } = trpc.postRouter.post.useMutation({
    onError: (error) => {
      console.log("Bad thing happened: ", error)
    },
    onSuccess: (response) => {
      console.log("Good thing happened. Here it is: ", response)
    },
  })
  const createDummyPost = () => {
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
      <UserButton afterSignOutUrl="/sign-in" />
      <div>Home page</div>
      <button onClick={createDummyPost}>
        {isLoading ? "Creating post..." : "Create a post"}
      </button>
    </>
  )
}

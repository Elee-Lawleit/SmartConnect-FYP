// define all the providers here
"use client"

import { PropsWithChildren, useState, useEffect } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { trpc } from "@/server/trpc/client"
import { httpBatchLink } from "@trpc/client"
import { ClerkProvider, useUser } from "@clerk/nextjs"
import {ApolloProvider, ApolloClient, InMemoryCache} from "@apollo/client"


const Providers = ({ children }: PropsWithChildren) => {
  const [queryClient] = useState(() => new QueryClient())
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${process.env.NEXT_PUBLIC_SERVER_URL}/api/trpc`,
          fetch(url, options) {
            return fetch(url, {
              ...options,
              credentials: "include",
            })
          },
        }),
      ],
    })
  )
  const [apolloClient] = useState(
    () =>
      new ApolloClient({
        cache: new InMemoryCache(),
        uri: process.env.NEXT_PUBLIC_SUBGRAPH_API_KEY,
      })
  )

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <ClerkProvider>
        <WalletEventChange />
        <QueryClientProvider client={queryClient}>
          <ApolloProvider client={apolloClient}>{children}</ApolloProvider>
        </QueryClientProvider>
      </ClerkProvider>
    </trpc.Provider>
  )
}

export default Providers

const WalletEventChange = () => {
  const { user, isSignedIn } = useUser()

  useEffect(() => {
    async function checkWalletConnection() {
      console.log("user: ", user)
      console.log("signed in: ", isSignedIn)

      if (user && isSignedIn) {
        // @ts-ignore
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        })
        const [account] = accounts

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

    //remove listener on unmount
    return () =>
      // @ts-ignore
      window.ethereum.removeListener("accountsChanged", checkWalletConnection)
  }, [user])

  return <></>
}

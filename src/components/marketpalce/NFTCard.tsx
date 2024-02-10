"use client"
import Link from "next/link"
import AddressAvatar from "./AddressAvatar"
import Image from "next/image"
import { Badge } from "../ui/badge"
import { NFT } from "../../../prisma/types"
import { useEffect, useState } from "react"
import { Button } from "../ui/button"
import useSigner from "@/contexts/SignerContext"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "../ui/dialog"
import SellModal from "./SellModal"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

type NFTCardProps = {
  nft: NFT
}

type nftMetadata = {
  name: string
  description: string
  imageUrl: string
}

const NFTCard = ({ nft }: NFTCardProps) => {
  const [nftMeta, setNftMeta] = useState<nftMetadata>()
  const [error, setError] = useState<boolean>(false)

  const { address } = useSigner()

  useEffect(() => {
    const fetchMetadata = async () => {
      const metadataResponse = await fetch(ipfsToHTTPS(nft.tokenURI))
      if (metadataResponse.status != 200) return
      let json
      try {
        json = await metadataResponse.json()
      } catch (e) {
        console.log(e)
        setError(() => true)
      }
      setNftMeta({
        name: json.name,
        description: json.description,
        imageUrl: ipfsToHTTPS(json.image),
      })
    }
    void fetchMetadata()
  }, [nft.tokenURI])

  console.log("nft Meta: ", nftMeta)

  return (
    <>
      <Link
        href="#"
        className="flex flex-col w-64 bg-white border rounded-sm shadow-sm"
      >
        <div
          className={cn("h-48 relative w-full", {
            "grid place-items-center": !nftMeta?.imageUrl,
          })}
        >
          {nftMeta?.imageUrl ? (
            <Image
              fill
              className="w-full h-full object-cover object-center rounded-sm"
              src={error? "/placeholder.svg" : `${nftMeta?.imageUrl}`}
              alt="nft card"
            />
          ) : (
            <Loader2
              className={cn("hidden animate-spin", {
                block: !nftMeta?.imageUrl,
              })}
            />
          )}
        </div>

        <div className="bg-white px-2 py-1 flex flex-col gap-1">
          <p className=" font-bold">{nftMeta?.name}</p>
          {nft.price == "0" ? (
            <Badge className="w-fit">Not Listed</Badge>
          ) : (
            <p className="text-xs">{nft.price} ETH</p>
          )}
          <div className="flex items-center gap-1">
            <AddressAvatar seed={nft.owner} />
          </div>
        </div>
      </Link>
      <br />
      {nft.owner === address?.toLowerCase() && nft.price == "0" && (
        <Dialog>
          <DialogTrigger asChild>
            <Button className="block">Sell NFT</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>Set price in ETH to sell</DialogHeader>
            <SellModal tokenId={nft.id} />
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

export default NFTCard

export const ipfsToHTTPS = (url: string) => {
  if (!url.startsWith("ipfs://")) throw new Error("Not an IPFS url")
  const cid = url.substring(7)
  return `https://ipfs.io/ipfs/${cid}`
}

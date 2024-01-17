"use client"
import Link from "next/link"
import AddressAvatar from "./AddressAvatar"
import Image from "next/image"
import { Badge } from "../ui/badge"
import { NFT } from "../../../prisma/types"
import { useEffect, useState } from "react"
import { Button } from "../ui/button"
import useSigner from "@/contexts/SignerContext"
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from "../ui/dialog"
import SellModal from "./SellModal"

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

  const {address} = useSigner()

    useEffect(() => {
      const fetchMetadata = async () => {
        const metadataResponse = await fetch(`https://ipfs.io/ipfs${nft.tokenURI.substring(7)}`)
        if (metadataResponse.status != 200) return
        const json = await metadataResponse.json()
        setNftMeta({
          name: json.name,
          description: json.description,
          imageUrl: `https://ipfs.io/ipfs${json.image.substring(7)}`,
        })
      }
      void fetchMetadata()
    }, [nft.tokenURI])

  
    console.log("Address: ", address)
    console.log("NFT Owner: ", nft.owner)
  return (
    <>
      <Link
        href="#"
        className="flex flex-col w-64 bg-white border rounded-sm shadow-sm"
      >
        <div className="h-48 relative">
          <Image
            fill
            className="w-full h-full object-cover object-center rounded-sm"
            src={`https://ipfs.io/ipfs/${nftMeta?.imageUrl}`}
            alt="nft card"
          />
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
      {nft.owner === address?.toLowerCase() && (
        <Dialog>
          <DialogTrigger asChild>
            <Button className="block">Sell NFT</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>Set price in ETH to sell</DialogHeader>
            <SellModal tokenId={nft.id}/>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

export default NFTCard

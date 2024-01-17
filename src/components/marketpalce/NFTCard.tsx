"use client"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import AddressAvatar from "./AddressAvatar"
import Image from "next/image"

type NFTCardProps = {
  imageUrl: string
  name: string
  price: string
  href: string
  seed: string
}

const NFTCard = ({ imageUrl, name, price, href, seed }: NFTCardProps) => {
  return (
    <Link
      href={href}
      className="flex flex-col w-64 bg-white border rounded-sm shadow-sm"
    >
      <div className="h-48 relative">
        <Image
          fill
          className="w-full h-full object-cover object-center rounded-sm"
          src={`https://ipfs.io/ipfs/${imageUrl.substring(7)}`}
          alt="nft card"
        />
      </div>

      <div className="bg-white px-2 py-1 flex flex-col gap-1">
        <p className=" font-bold">{name}</p>
        <p className="text-xs">{price}</p>
        <div className="flex items-center gap-1">
          <AddressAvatar seed={seed} />
        </div>
      </div>
    </Link>
  )
}

const NFTPlaceHolder = () => {
  return (
    <div className="flex flex-col w-full">
      <div className="relative bg-zinc-100 aspect-square w-full overflow-hidden rounded-xl">
        <Skeleton className="h-full w-full" />
      </div>
      <Skeleton className="mt-4 w-2/3 h-4 rounded-lg" />
      <Skeleton className="mt-2 w-16 h-4 rounded-lg" />
      <Skeleton className="mt-2 w-12 h-4 rounded-lg" />
    </div>
  )
}

export default NFTCard

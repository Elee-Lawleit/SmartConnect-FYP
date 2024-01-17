"use client"
import NFTCard from "@/components/marketpalce/NFTCard"
import { Skeleton } from "@/components/ui/skeleton"
import useNFTMarketplace from "@/web3/useMarketplace"

const MarketplaceHome = () => {
  const { allNfts } = useNFTMarketplace()

  console.log("Owned nfts: ", allNfts)

  if (!allNfts) {
    return (
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
    )
  }

  return (
    <div className="flex justify-center flex-wrap gap-2 p-3">
      {allNfts?.map((nft) => (
        <NFTCard
          key={nft.id}
          nft={nft}
        />
      ))}
      {/* <NFTCard
        imageUrl="/jotaro.jpg"
        name="Jotaro Kujo"
        price="10 ETH"
        href=""
      />
      <NFTCard
        imageUrl="/gintoki.jpg"
        name="Gintoki Sakata"
        price="0.04 ETH"
        href=""
      />
      <NFTCard
        imageUrl="/anime.jpg"
        name="Kintoki Yamata"
        price="0.006 ETH"
        href=""
      />
      <NFTCard
        imageUrl="/anya.webp"
        name="Anya Forger"
        price="0.006 ETH"
        href=""
      /> */}
    </div>
  )
}

export default MarketplaceHome

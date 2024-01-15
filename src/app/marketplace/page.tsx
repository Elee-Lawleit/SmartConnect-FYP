import NFTCard from "@/components/marketpalce/NFTCard"

const MarketplaceHome = async () => {
  return (
    <div className="flex justify-center flex-wrap gap-2 p-3">
      <NFTCard
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
      />
    </div>
  )
}

export default MarketplaceHome

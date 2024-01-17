import { BigNumber, ethers } from "ethers"
import { useState } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import useNFTMarketplace from "@/web3/useMarketplace"

const SellModal = ({ tokenId }: { tokenId: string }) => {
  const [price, setPrice] = useState("")
  const [error, setError] = useState<string>()
  const { listNft } = useNFTMarketplace()

  const onConfirm = async () => {
    if (!price) return setError("Must be a valid number")
    const wei = ethers.utils.parseEther(price)
    if (wei.lte(0)) return setError("Must be a greater than 0")
    console.log("Price: ", wei)
    await listNft(tokenId, wei)
    console.log("nft listed successfully!")
  }

  return (
    <div className="flex items-end">
      <div className="mr-2 flex flex-grow flex-col">
        <label
          htmlFor="price"
          className="ml-2 text-xs font-semibold text-gray-500"
        >
          PRICE (ETH)
        </label>
        <Input
          name="price"
          id="price"
          type="number"
          onChange={(e) => setPrice(e.target.value)}
        />
      </div>
      <Button onClick={onConfirm}>CONFIRM</Button>
    </div>
  )
}

export default SellModal

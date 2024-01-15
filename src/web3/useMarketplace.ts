import useSigner from "@/contexts/SignerContext"
import { BigNumber, Contract } from "ethers"
import useOwnedNfts from "./useOwnedNfts"
import NFT_MARKETPLACE_CONTRACT_ABI from "./NFTMarket.json"
import useOwnedListedNfts from "./useOwnedListedNfts"
import uesListedNfts from "./useListedNfts"
import { TransactionResponse } from "@ethersproject/providers"
import { parseEther } from "ethers/lib/utils"
import { NFT } from "../../prisma/types"

const useNFTMarketplace = () => {
  const { signer } = useSigner()

  const nftMarket = new Contract(
    process.env.NFT_MARKET_ADDRESS as string,
    NFT_MARKETPLACE_CONTRACT_ABI.abi,
    signer
  )

  const ownedNfts = useOwnedNfts()
  const ownedListedNfts = useOwnedListedNfts()
  const listedNfts = uesListedNfts()

  //this will receive the json file, the nft image/video will be uploaded inside the page (I COULD technically do it here as well, oh well)
  const createNft = async () => {}

  const listNft = async (tokenId: string, price: BigNumber) => {
    const tx: TransactionResponse = await nftMarket.listNFT(tokenId, price)
    await tx.wait()
  }

  const cancelListing = async (tokenId: string) => {
    const tx: TransactionResponse = await nftMarket.cancelListing(tokenId)
    await tx.wait()
  }

  const buyNft = async (nft: NFT) => {
    const tx: TransactionResponse = await nftMarket.buyNFT(nft.id, {
      value: parseEther(nft.price),
    })
    await tx.wait()
  }

  return {
    createNft,
    listNft,
    cancelListing,
    buyNft,
    ...ownedNfts,
    ...ownedListedNfts,
    ...listedNfts,
  }
}

export default useNFTMarketplace

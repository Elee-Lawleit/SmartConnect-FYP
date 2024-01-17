import useSigner from "@/contexts/SignerContext"
import { BigNumber, Contract } from "ethers"
import useOwnedNfts from "./useOwnedNfts"
import NFT_MARKETPLACE_CONTRACT_ABI from "./NFTMarket.json"
import useOwnedListedNfts from "./useOwnedListedNfts"
import uesListedNfts from "./useListedNfts"
import { TransactionResponse } from "@ethersproject/providers"
import { parseEther } from "ethers/lib/utils"
import { NFT } from "../../prisma/types"
import { NFTStorage } from "nft.storage"
import getIpfsURI from "@/app/actions/getIpfsURI"
import useAllNfts from "./useAllNfts"

const useNFTMarketplace = () => {
  const { signer } = useSigner()
  const nftStorageClient = new NFTStorage({
    token: `${process.env.NEXT_PUBLIC_NFT_STORAGE_KEY}`,
  })

  const nftMarket = new Contract(
    process.env.NEXT_PUBLIC_NFT_MARKET_ADDRESS as string,
    NFT_MARKETPLACE_CONTRACT_ABI.abi,
    signer
  )

  const ownedNfts = useOwnedNfts()
  const ownedListedNfts = useOwnedListedNfts()
  const listedNfts = uesListedNfts()
  const allNfts = useAllNfts()

  const createNft = async (name: string, description: string, nft: File) => {
    const formData = new FormData()
    formData.append("name", name)
    formData.append("description", description)
    formData.append("nft", nft)
    const ipfsURI = await getIpfsURI(formData)
    const tx: TransactionResponse = await nftMarket.createNFT(ipfsURI)
    await tx.wait()
  }

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
    ...allNfts
  }
}

export default useNFTMarketplace

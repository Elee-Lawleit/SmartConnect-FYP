"use server"
import { NFTStorage } from "nft.storage"

const getIpfsURI = async (data: FormData) => {
  if (!process.env.NFT_STORAGE_KEY) {
    console.log("🔴 ERROR: nft.storage API KEY not found!")
  }
  const nftStorageClient = new NFTStorage({
    token: `${process.env.NFT_STORAGE_KEY}`,
  })

  const ipfsData = await nftStorageClient.store({
    name: data.get("name") as string,
    description: data.get("description") as string,
    image: data.get("nft") as File,
  })

  return ipfsData.url
}

export default getIpfsURI

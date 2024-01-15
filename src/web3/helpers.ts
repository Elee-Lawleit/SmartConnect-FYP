import { formatEther } from "ethers/lib/utils"
import { GetOwnedNfts_nfts } from "./__generated__/GetOwnedNfts"

export const parseRawNft = (raw: GetOwnedNfts_nfts) => {
    return {
        id: raw.id,
        owner: raw.price == "0" ? raw.to : raw.from,
        price: raw.price == "0" ? "0" : formatEther(raw.price).toString(),
        tokenURI: raw.tokenURI
    }
}
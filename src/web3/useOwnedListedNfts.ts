import useSigner from "@/contexts/SignerContext"
import { gql, useQuery } from "@apollo/client"
import {
  GetOwnedListedNfts,
  GetOwnedListedNftsVariables,
} from "./__generated__/GetOwnedListedNfts"
import { parseRawNft } from "./helpers"

const useOwnedListedNfts = () => {
  const { address } = useSigner()

  const { data } = useQuery<GetOwnedListedNfts, GetOwnedListedNftsVariables>(
    GET_OWNED_LISTED_NFTS,
    {
      variables: { owner: address ?? "" },
      skip: !address,
    }
  )

  const ownedListedNfts = data?.nfts.map(parseRawNft)

  return {ownedListedNfts}
}

const GET_OWNED_LISTED_NFTS = gql`
    query GetOwnedListedNfts($owner: String!){
        nfts(where: {
            to: "${process.env.NEXT_PUBLIC_NFT_MARKET_ADDRESS as string}"
            from: $owner
        }) {
            id
            from
            to
            tokenURI
            price
        }
    }
`
export default useOwnedListedNfts
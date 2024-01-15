import useSigner from "@/contexts/SignerContext"
import { gql, useQuery } from "@apollo/client"
import {
  GetOwnedNfts,
  GetOwnedNftsVariables,
} from "./__generated__/GetOwnedNfts"
import { parseRawNft } from "./helpers"

const useOwnedNfts = () => {
  const { address } = useSigner()

  const { data } = useQuery<GetOwnedNfts, GetOwnedNftsVariables>(
    GET_OWNED_NFTS,
    {
      variables: { owner: address ?? "" },
      skip: !address,
    }
  )

  const ownedNfts = data?.nfts.map(parseRawNft)

  return { ownedNfts }
}

const GET_OWNED_NFTS = gql`
  query GetOwnedNfts($owner: String!) {
    nfts(where: { to: $owner }) {
      id
      from
      to
      tokenURI
      price
    }
  }
`

export default useOwnedNfts

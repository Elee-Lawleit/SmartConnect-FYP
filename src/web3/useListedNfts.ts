import useSigner from "@/contexts/SignerContext";
import { gql, useQuery } from "@apollo/client";
import { parseRawNft } from "./helpers";
import { GetListedNfts, GetListedNftsVariables } from "./__generated__/GetListedNfts";


const uesListedNfts = ()=>{
    const {address} = useSigner()

    const {data} = useQuery<GetListedNfts, GetListedNftsVariables>(GET_LISTED_NFTS, {
        variables: {currentAddress: address ?? ""}, skip: !address
    })

    const listedNfts = data?.nfts.map(parseRawNft)

    return {listedNfts}

}

const GET_LISTED_NFTS = gql`
    query GetListedNfts($currentAddress: String!){
        nfts(where: {
            to: "${process.env.NEXT_PUBLIC_NFT_MARKET_ADDRESS as string}"
            from_not: $currentAddress
        }) {
            id
            from
            to
            tokenURI
            price
        }
    }
`

export default uesListedNfts
import useSigner from "@/contexts/SignerContext";
import { gql, useQuery } from "@apollo/client";
import { GetListedNFTs, GetListedNFTsVariables } from "./graphql/GetListedNFTs";
import { parseRawNft } from "./helpers";


const uesListedNfts = ()=>{
    const {address} = useSigner()

    const {data} = useQuery<GetListedNFTs, GetListedNFTsVariables>(GET_LISTED_NFTS, {
        variables: {currentAddress: address ?? ""}, skip: !address
    })

    const listedNfts = data?.nfts.map(parseRawNft)

    return {listedNfts}

}

const GET_LISTED_NFTS = gql`
    query GetListedNfts($currentAddress: String!){
        nfts(where: {
            to: "${process.env.NFT_MARKET_ADDRESS as string}"
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
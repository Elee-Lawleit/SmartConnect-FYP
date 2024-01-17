import { gql, useQuery } from "@apollo/client";
import { GetAllNfts } from "./__generated__/GetAllNfts";
import { parseRawNft } from "./helpers";


const useAllNfts = ()=>{
 const{data} = useQuery<GetAllNfts>(GET_ALL_NFTS)

 const allNfts = data?.nfts.map(parseRawNft)

 return {allNfts}
}

const GET_ALL_NFTS = gql`
  query GetAllNfts {
    nfts {
      id
      from
      to
      tokenURI
      price
    }
  }
`
export default useAllNfts
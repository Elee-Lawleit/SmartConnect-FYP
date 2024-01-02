import { gql } from "@apollo/client"

const NFT_MARKET_ADDRESS = process.env.NEXT_PUBLIC_NFT_MARKET_ADDRESS
if (!NFT_MARKET_ADDRESS) {
  console.log("🔴Error: NFT MARKET ADDRESS NOT FOUND")
}

const GET_LISTED_NFTS = gql`
  query GetListedNFTs($currentAddress: String!){
    nfts(where: {
      to: "${NFT_MARKET_ADDRESS}"
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

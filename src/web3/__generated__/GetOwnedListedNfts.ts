/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetOwnedListedNfts
// ====================================================

export interface GetOwnedListedNfts_nfts {
  __typename: "NFT";
  id: string;
  from: any;
  to: any;
  tokenURI: string;
  price: any;
}

export interface GetOwnedListedNfts {
  nfts: GetOwnedListedNfts_nfts[];
}

export interface GetOwnedListedNftsVariables {
  owner: string;
}

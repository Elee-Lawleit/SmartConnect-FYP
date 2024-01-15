/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetOwnedNfts
// ====================================================

export interface GetOwnedNfts_nfts {
  __typename: "NFT";
  id: string;
  from: any;
  to: any;
  tokenURI: string;
  price: any;
}

export interface GetOwnedNfts {
  nfts: GetOwnedNfts_nfts[];
}

export interface GetOwnedNftsVariables {
  owner: string;
}

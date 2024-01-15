/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetListedNfts
// ====================================================

export interface GetListedNfts_nfts {
  __typename: "NFT";
  id: string;
  from: any;
  to: any;
  tokenURI: string;
  price: any;
}

export interface GetListedNfts {
  nfts: GetListedNfts_nfts[];
}

export interface GetListedNftsVariables {
  currentAddress: string;
}

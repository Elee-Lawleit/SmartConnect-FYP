"use client"
import getIpfsURI from "@/app/actions/getIpfsURI"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import useSigner from "@/contexts/SignerContext"
import useNFTMarketplace from "@/web3/useMarketplace"
import { zodResolver } from "@hookform/resolvers/zod"
import React from "react"
import { FieldValues, useForm, SubmitHandler } from "react-hook-form"
import { z } from "zod"

const nftSchema = z.object({
  name: z.string(),
  description: z.string(),
  nft: z.unknown().refine((val) => {
    console.log(typeof val)
    if (!(val instanceof FileList)) {
      if ((val as FileList).length > 1) return false
    }
    return true
  }),
})

type NftSchemaType = z.infer<typeof nftSchema>

const CreateNFT = () => {
  const { createNft } = useNFTMarketplace()
  const { connectWallet, address, loading } = useSigner()

  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<NftSchemaType>({
    resolver: zodResolver(nftSchema),
  })

  const postNft: SubmitHandler<NftSchemaType> = (data) => {
    const nft = (data.nft as any)[0] as File
    createNft(data.name, data.description, nft)
  }

  return (
    <div>
      <Button onClick={connectWallet}>
        {loading ? "Connecting..." : !address ? "Connect Wallet" : "Connected"}
      </Button>
      <form onSubmit={handleSubmit(postNft)}>
        <Input type="text" placeholder="name" {...register("name")} />
        <Textarea placeholder="description" {...register("description")} />
        <Input
          type="file"
          accept="image/*"
          multiple={false}
          {...register("nft")}
        />
        <Button type="submit">Post NFT</Button>
      </form>
    </div>
  )
}

export default CreateNFT

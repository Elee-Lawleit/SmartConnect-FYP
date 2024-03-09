"use client"
import React from "react"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { trpc } from "@/server/trpc/client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "./ui/button"
import { toast } from "./ui/use-toast"

const groupSchema = z.object({
  name: z.string(),
  description: z.string(),
})

const CreateGroup = () => {
  const {
    mutate: createGroup,
    isLoading,
    isError,
  } = trpc.groupRouter.createGroup.useMutation()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(groupSchema),
  })

  const handleCreateGroup = (data: any) => {
    console.log("data: ", data)
    createGroup(data, {
      onError: ()=>{
        toast({
          title: "An error occurred",
          description: "Something went wrong dawg",
          variant: "destructive"
        })
      },
      onSuccess: ()=>{
        toast({
          title: "Group successfully created",
          description: "Group has been created successfully",
          variant: "default"
        })
      }
    })
  }

  return (
    <div className="max-w-2xl">
      <form onSubmit={handleSubmit(handleCreateGroup)}>
        <div>
          <Label>Group name: </Label>
          <Input placeholder="...." {...register("name")} />
        </div>
        <div>
          <Label>Group description: </Label>
          <Textarea {...register("description")} />
        </div>
        <div>
          <Button type="submit">Create Group</Button>
        </div>
      </form>
    </div>
  )
}

export default CreateGroup

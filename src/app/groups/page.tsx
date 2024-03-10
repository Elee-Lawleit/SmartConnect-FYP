"use client"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { trpc } from "@/server/trpc/client"
import Link from "next/link"
import React from "react"

const page = () => {
  const { data } = trpc.groupRouter.fetchGroups.useQuery()
  const {
    mutate: joinGroup,
    isLoading,
    isError,
  } = trpc.groupRouter.joinGroup.useMutation()

  console.log("Data: ", data)

  return (
    <div className="">
      {data?.groups.map((group) => {
        return (
          <Link
            key={group.id}
            href={`/groups/${group.id}`}
            className="w-full border-2 border-green-400 border-solid rounded-md bg-slate-700"
          >
            <p>{group.name}</p>
            <p>{group.description}</p>
          </Link>
        )
      })}
      {data && (
        <div>
          <h1 className="text-2xl">Other groups you're not a part of</h1>
          {data?.notJoined.map((group) => {
            return (
              <Link
                key={group.id}
                href={`/groups/${group.id}`}
                className="w-full border-2 border-green-400 border-solid rounded-md bg-slate-700"
              >
                <p>{group.name}</p>
                <p>{group.description}</p>
                <Button onClick={() => {
                  joinGroup(
                    { groupId: group.id },
                    {
                      onError: () =>
                        toast({
                          variant: "destructive",
                          title: "Error",
                          description:
                            "Error joining group, please try again later",
                        }),
                      onSuccess: () =>
                        toast({
                          variant: "default",
                          title: "Success",
                          description:
                            "Group joined successfully",
                        }),
                    }
                  )
                }}>Join now</Button>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default page

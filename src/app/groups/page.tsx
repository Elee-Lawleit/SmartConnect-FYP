"use client"
import { trpc } from '@/server/trpc/client'
import Link from 'next/link'
import React from 'react'

const page = () => {

  const{data} = trpc.groupRouter.fetchGroups.useQuery()

  console.log("Data: ", data)

  return (
    <div className=''>
      {
        data?.groups.map((group)=>{
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
        })
      }
    </div>
  )
}

export default page
"use client"
import { trpc } from '@/server/trpc/client'
import Image from 'next/image'
import { Suspense } from 'react';

export default function Home() {
  const {data, isLoading} = trpc.testAPI.useQuery();
  console.log("Data from trpc backend: ", data)
  return (
    <div>Home page</div>
  )
}

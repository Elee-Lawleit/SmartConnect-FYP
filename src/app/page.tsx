"use client"
import { UserButton } from "@clerk/nextjs"

export default function Home() {
  return (
    <div className="flex justify-center w-full">
      <UserButton afterSignOutUrl="/sign-in" />
    </div>
  )
}

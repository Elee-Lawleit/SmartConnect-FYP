"use client"
import GetStarted from "@/components/GetStarted"
import Landingpage_nav from "@/components/LandingPageNav"
import { UserButton } from "@clerk/nextjs"

export default function Home() {
  return (
    <section>
      <div className=" min-w-screen min-h-screen bg-white">
        <Landingpage_nav />
        <GetStarted />
      </div>
      </section>
  )
}

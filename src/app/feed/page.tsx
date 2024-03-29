"use client"
import CreatePost from "@/components/CreatePost"
import Navbar from "@/components/Navbar"
import PostReel from "@/components/PostReel"
import React from "react"

const UserFeed = () => {
  return (
    <div className="w-full flex flex-col items-center gap-1">
      <Navbar />
      <CreatePost />
      <PostReel />
    </div>
  )
}

export default UserFeed

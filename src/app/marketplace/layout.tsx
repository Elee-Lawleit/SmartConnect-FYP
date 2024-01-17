import Navbar from "@/components/marketpalce/Navbar"
import React from "react"

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Navbar />
      <div>{children}</div>
    </>
  )
}

export default layout

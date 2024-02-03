"use client"
import React, { useState, useEffect } from "react"
import Link from "next/link"
import Logo from "./Logo"

type LandingPageNavProps = {}
function Landingpage_nav(props: LandingPageNavProps) {
  const [header, setHeader] = useState(false)

  const scrollHeader = () => {
    if (window.scrollY >= 20) {
      setHeader(true)
    } else {
      setHeader(false)
    }
  }

  useEffect(() => {
    window.addEventListener("scroll", scrollHeader)
    return () => {
      window.removeEventListener("scroll", scrollHeader)
    }
  }, [])

  return (
    <header className="min-w-[26rem]">
      <div
        className={
          header
            ? "fixed w-[100%] h-15 backdrop-blur-lg mt-2"
            : "bg-[transparent]"
        }
      >
        <nav className="pt-5 mt-0 flex justify-between w-[92%] mx-auto rounded-xl">
          <Link href="#GetStarted" scroll={true}>
            <Logo />
          </Link>

          <div className="md:block ">
            <ul className="gap-[10px] text-sm space-x-0 md:text-lg mt-3 flex mr-14 md:space-x-4 lg:space-x-8 xl:space-x-10 md:mr-4 xl:mr-6">
              <li className="cursor-pointer hover:text-[#85b3b6]">
                Introduction
              </li>
              <li className="cursor-pointer hover:text-[#85b3b6]">
                What's new?
              </li>
              <li className="cursor-pointer hover:text-[#85b3b6]">About us</li>
              <Link href="/SignInpage">
                <li className="cursor-pointer hover:text-[#85b3b6] rounded-xl hover:scale-110 duration-300">
                  Sign In
                </li>
              </Link>
            </ul>
          </div>
        </nav>
      </div>
    </header>
  )
}

export default Landingpage_nav

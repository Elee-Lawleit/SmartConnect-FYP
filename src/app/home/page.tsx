import React from "react"
import Layoutpage from "@/components/Navbar/Layout"

function Home() {
  return (
    <Layoutpage>
      <section id="Home">
        <div className=" p-8 bg-white rounded-lg shadow-sm border border-gray-200 pb-52 md:pb-80 w-90 md:ml-60 tb:ml-40 tb:mr-10">
          <div className="pl-2 pt-4  pr-3  md:pt-3">
            <div className="h-24 pl-3 pt-2 pb-3 rounded-md mb-4 border border-gray-200">
              <div className="w-16 h-16 bg-white rounded-full overflow-hidden">
                <img
                  src="/Images/landing-image.pnga"
                  alt="Profile"
                  className="w-full h-full object-cover "
                />
              </div>
              <p className="text-gray-500 text-[10px] pl-5">story...</p>
            </div>

            <div className="flex items-center justify-center"></div>

            <div className="text-center mt-4">
              <h2 className="text-xl  bg-gradient-to-r from-[#98D1CF] to-[#1F7074] bg-clip-text text-transparent">
                Welcome to SmartConnect
              </h2>
              <p className="text-gray-500">
                Start following friends, influencers or account you’re are
                interested in
              </p>
            </div>
          </div>
        </div>
        <div className=" md:mt-[-35px] tb:mt-[-35px] lg:mt-[-35px]"></div>
      </section>
    </Layoutpage>
  )
}

export default Home

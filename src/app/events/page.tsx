import React from "react"
import Layoutpage from "@/components/Navbar/Layout"
function Events() {
  return (
    <Layoutpage>
      <section id="Explore">
        <div className=" p-8 bg-white rounded-lg shadow-sm border border-gray-200 pb-52 md:pb-80 w-90 md:ml-60 tb:ml-40 tb:mr-10">
          <div className="bg-whitep-4">
            <div className=" h-32 rounded-md mb-4"></div>
            <div className="text-center mt-4">
              <p className="text-sm text-gray-700 mt-2">
                Create new Event..........
              </p>
            </div>
          </div>
        </div>
        <div className=" md:mt-[-35px] tb:mt-[-35px] lg:mt-[-10px]"></div>
      </section>
    </Layoutpage>
  )
}

export default Events

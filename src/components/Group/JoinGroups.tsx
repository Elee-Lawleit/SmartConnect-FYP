import Link from "next/link"

function JoinGroup() {
  return (
    <div className="mt-2 items-center justify-center ">
      <div className="md:flex tbb:flex tb:flex shadow-sm h-50 md:w-[550px] m-2 mt-4 tb:ml-28 tb:h-46 tbbb:h-46 tb:pr-2 tbb:ml-28 tbb:h-26 md:h-24 tbb:pr-2 md:ml-[170px] mdd:ml-[400px] xl:ml-[400px] space-x-4 border border-gray-100 rounded-[30px] pt-5 pl-8 pb-5 tb:pl-4">
        <div className="w-8 h-8 rounded-full overflow-hidden  mt-3 ">
          <img
            src="/images/Ai.jpg"
            alt="Profile"
            className="object-cover bg-gray-200 "
          />
        </div>
        <div className="pl-2 ">
          <p className="text-lg  text-[#10676B] -mt-8 ml-6 tb:mt-2 tb:ml-0">
            Explore Nature
          </p>
          <p className="text-gray-300 mr-32 ml-6 md:mr-20 tb:ml-0 tbbb:pr-9 tbb:mr-46 ">
            whatever
          </p>
        </div>
        <div className="ml-10 tb:ml-0">
          <Link href="/CreatedGroup">
            <button className=" text-white rounded bg-gradient-to-r bg-[#2EC7AB] hover:from-[#2EC7AB] hover:to-[#3dd3ba] h-10 w-20 transition duration-200 mt-2  sb:mr-2 tb:-ml-14 tbbb:ml-0">
              View
            </button>
          </Link>
          <button className="bg-gradient-to-r  from-blue-500 to-purple-500 hover:from-purple-500 hover:to-blue-500 text-white h-10 w-32 rounded transition duration-200  mt-2 mr-10 tb:-ml-[104px] tbbb:ml-0">
            Join Group
          </button>
        </div>
      </div>
    </div>
  )
}

export default JoinGroup

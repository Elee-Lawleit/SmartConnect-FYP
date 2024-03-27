import React from "react"
import Link from "next/link"
import Logo from "@/components/landingpage/Logo"
function SignInpage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 mt-2">
      <div className="max-w-md mx-auto p-8 mb-8 bg-white rounded-lg shadow-sm">
        <div className=" pl-12 md:pl-16">
          <Logo />
        </div>
        <h1 className="text-gray-500 pl-24 md:pl-32 font-bold text-1xl mt-9">
          Sign In
        </h1>
        <form className="max-w-md mx-auto h-[500px] bg-white p-8 rounded-lg shadow-md">
          <div className="mb-4">
            <input
              className="shadow  border rounded-1.5xl w-full py-2 px-3 mr-8 text-gray-100 bg-[#ECF8F7] text-sm"
              id="username"
              type="text"
              placeholder="Username or Email"
            />
          </div>
          <div className="mb-4">
            <input
              className="shadow  border rounded-1.5xl w-full py-2 px-3 text-gray-100 bg-[#ECF8F7] text-sm"
              id="password"
              type="password"
              placeholder="Password"
            />
          </div>
          <Link href="/changePassword">
            <p className="inline-block align-baseline  text-sm text-gray-400 hover:text-gray-600">
              Forget password?
            </p>
          </Link>
          <div className="mb-4 flex items-center justify-between mt-40 pl-[45px] md:pl-[70px]">
            <button
              className="bg-gradient-to-r  from-[#95EEE0] to-[#2EC7AB] hover:from-[#2EC7AB] hover:to-[#349E8D] text-white  py-2 px-6 rounded"
              type="button"
            >
              Sign In
            </button>
          </div>
          <p className="text-[12px] text-blue-500 hover:text-blue-800 pl-[85px] md:pl-28 mb-3">
            Or
          </p>
          <div className="flex items-center justify-between mt-22 pl-5 md:pl-8">
            <button
              className="bg-gradient-to-r text-sm from-blue-500 to-purple-500 hover:from-purple-500 hover:to-blue-500 text-white  py-2 px-3 md:px-4 rounded"
              type="button"
            >
              Login with Metamask
            </button>
          </div>
          <Link href="/signUpPage">
            <p className="inline-block align-baseline  text-[10px] md:text-[12px] text-blue-500 hover:text-blue-800 pl-6 md:pl-10">
              Don't have an account? Sign Up
            </p>
          </Link>
        </form>
      </div>
    </div>
  )
}
export default SignInpage

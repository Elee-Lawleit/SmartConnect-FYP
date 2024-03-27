"use client"
import React from "react"
import Link from "next/link"
import Logo from "@/components/landingpage/Logo"
import { useRef } from "react"

function SignUppage() {
  //   const usernameRef = useRef();
  //   const emailRef = useRef();
  //   const passwordRef = useRef();
  //   const retypePasswordRef = useRef();

  //   const SignUpForm = (event) => {
  //     event?.preventDefault();
  //     const username = usernameRef.current.value;
  //     const email = emailRef.current.value;
  //     const password = passwordRef.current.value;
  //     const retypePassword = retypePasswordRef.current.value;

  //     const signUpData = {
  //       username: username,
  //       email: email,
  //       password: password,
  //       retypePassword: retypePassword,
  //     };
  //     console.log(signUpData);
  //   };
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 mt-2">
      <div className="max-w-md mx-auto p-8 mb-8 bg-white rounded-lg shadow-sm">
        <div className=" pl-12 md:pl-16">
          <Logo />
        </div>
        <h1 className="text-gray-500 pl-24 md:pl-32 font-bold text-1xl mt-9">
          Sign up
        </h1>
        <form className="max-w-md mx-auto h-[500px] bg-white p-8 rounded-lg shadow-md">
          <div className="mb-4">
            <input
              className="shadow  border rounded-1.5xl w-full py-2 px-3 mr-8 text-gray-100 bg-[#ECF8F7] text-sm"
              id="username"
              type="text"
              placeholder="Username"
            />
          </div>
          <div className="mb-4">
            <input
              className="shadow  border rounded-1.5xl w-full py-2 px-3 mr-8 text-gray-100 bg-[#ECF8F7] text-sm"
              id="email"
              type="text"
              placeholder="Email"
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
          <div className="mb-4">
            <input
              className="shadow  border rounded-1.5xl w-full py-2 px-3 text-gray-100 bg-[#ECF8F7] text-sm"
              id="retypepassword"
              type="password"
              placeholder="Confirm Password"
            />
          </div>

          <div className="mb-4 flex items-center justify-between pl-[45px] md:pl-[70px] mt-24">
            <Link href="/Home">
              <button
                className="bg-gradient-to-r  from-[#95EEE0] to-[#2EC7AB] hover:from-[#2EC7AB] hover:to-[#349E8D] text-white  py-2 px-6 rounded"
                type="button"
              >
                Sign Up
              </button>
            </Link>
          </div>
          <p className="text-[12px] text-blue-500 hover:text-blue-800 pl-[85px] md:pl-28 mb-3">
            Or
          </p>
          <div className="flex items-center justify-between mt-22 pl-5 md:pl-8">
            <button
              className="bg-gradient-to-r text-sm from-blue-500 to-purple-500 hover:from-purple-500 hover:to-blue-500 text-white  py-2 px-3 md:px-4 rounded"
              type="button"
            >
              Sign Up with Metamask
            </button>
          </div>
          <Link href="/signInpage">
            <p className="inline-block align-baseline  text-[10px] md:text-[12px] text-blue-500 hover:text-blue-800 pl-6 md:pl-10">
              Already have an account? Sign In
            </p>
          </Link>
        </form>
      </div>
    </div>
  )
}

export default SignUppage

import React from "react";

function Button() {
  return (
    <button className="bg-[#40D2DA] ml:2 px-3 flex py-3 pr-6 rounded-xl text-white hover:text-[#3b4849] hover:bg-[#57d2db] hover:scale-110 duration-300">
      Get Started
      <svg
        className="w-5 pt-1 ml-2 sh"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        //   className="w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
        />
      </svg>
    </button>
  );
}
export function SignIn() {
  return (
    <button className="bg-[#40D2DA] ml:2 px-2 flex py-2  rounded-xl text-white hover:text-[#3b4849] hover:bg-[#57d2db] hover:scale-110 duration-300">
      Sign In
    </button>
  );
}
export default Button;

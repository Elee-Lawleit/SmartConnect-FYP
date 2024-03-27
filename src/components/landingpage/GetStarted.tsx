import React from "react";
import Button from "../Button/Button";
import Link from "next/link";
function GetStarted() {
  return (
    <main className="grid gap-8 ml-10 lg:ml-44 xl:ml-52 lg:bg-red xd:border-x-red-950">
      <div className="main md:flex">
        <div className="mb-6 ">
          <h1 className="bg-gradient-to-r from-[#98D1CF] to-[#1F7074] animate-gradient bg-clip-text text-transparent ml-10 mb-4 text-3xl lg:text-5xl mt-16 md:mt-44 md:ml-14 lg:ml-5">
            Welcome to SmartConnect
          </h1>
          <h1 className="text-black ml-10 text-2xl md:ml-14 md:mt-6 lg:ml-5">
            A decentralized world awaits
          </h1>
          <h1 className="text-black ml-10 text-2xl md:ml-14 lg:ml-5">
            Take matters into your own hands
          </h1>
          <div className="buttons ml-10 mt-6 md:ml-14 md:mt-8 lg:ml-5">
            <Link href="/SignUpPage">
              <Button />
            </Link>
          </div>
        </div>
        <div>
          <img
            src="/images/landing-image.png"
            alt="landing image"
            className="rounded-lg max-w-[70%] sb:max-w-[80%] h-96 ml-10 mr-20 md:pr-0 md:ml-20 md:w-80 md:mr-40 mdd:mr-50 md:max-w-[70%] md:mt-20 lg:mr-20 lg:ml-32 xl:ml-60 "
          />
        </div>
      </div>
    </main>
  );
}

export default GetStarted;

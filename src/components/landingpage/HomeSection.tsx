import React from "react";

function HomeSection() {
  return (
    <section
      id="HomeSection"
      className="h-screen bg-white flex items-center justify-center ml-20 "
    >
      <div className="max-w-[440px] m-auto">
        <div className="ml-[-200px] mt-16">
          <img
            className="md:w-60 px-4 pt-3 pb-2 animate-pulse hidden md:block lg:block"
            src="/images/ethereum.svg"
            alt="logo"
          />
          {/* <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
            <path
              fill="#63E6BE"
              d="M311.9 260.8L160 353.6 8 260.8 160 0l151.9 260.8zM160 383.4L8 290.6 160 512l152-221.4-152 92.8z"
            />
          </svg> */}
        </div>
        <div className="md:mt-[-400px] md:ml-16 ">
          <h1 className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent   text-5xl lg:text-7xl mr-[-100px]">
            How to use our platform
          </h1>
          <p className="text-purple-400  text-1xl md:ml-14 lg:ml-5 mb-4">
            Just three steps and you're ready to go!
          </p>
          <img
            className="h-15 w-20 md:w-20 px-4 pt-3 pb-2 mt-3 ml-[-20px] md:ml-0"
            src="/images/cube3.svg"
            alt="logo"
          />
          <div className="ml-14 mt-[-50px]">
            <h4 className="text-black  text-lg md:ml-14 lg:ml-5 mr-[-100px]">
              Create Account and Connect wallet
            </h4>
          </div>
          <img
            className="h-15 w-20 md:w-20 px-4 pt-3 pb-2 mt-3 ml-[-20px] md:ml-0"
            src="/images/cube1.svg"
            alt="logo"
          />
          <div className="ml-14 mt-[-45px]">
            <h2 className="text-black text-lg md:ml-14 lg:ml-5">
              Explore and connect with others
            </h2>
          </div>

          <img
            className="h-15 w-20 md:w-20 px-4 pt-3 pb-2 mt-3 ml-[-20px] md:ml-0"
            src="/images/cube2.svg"
            alt="logo"
          />
          <div className="ml-14 mt-[-45px]">
            <h2 className="text-black text-lg md:ml-14 lg:ml-5">
              Upload Post and NFTs
            </h2>
          </div>
        </div>
      </div>
    </section>
  );
}
export default HomeSection;

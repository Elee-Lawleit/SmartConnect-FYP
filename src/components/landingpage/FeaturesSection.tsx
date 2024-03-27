import React from "react";

function FeaturesSection() {
  return (
    <section
      id="FeaturesSection"
      className="h-screen bg-white flex items-center justify-center ml-12 md:mt-60 md:ml-[-10px]"
    >
      <div className="max-w-[440px] m-auto">
        <div className="ml-[-300px] mt-10">
          <img
            className="md:w-80  px-4 pt-3 pb-2 animate-spin hidden  lg:block"
            src="/images/circle.svg"
            alt="logo"
          />
        </div>
        <div className="md:mt-[-400px] md:ml-16 ml-3 mr-30 ">
          <h1 className="bg-gradient-to-r from-red-500 to-purple-500 bg-clip-text text-transparent   text-3xl lg:text-7xl mr-[-200px]">
            Discover Our Unique Features
          </h1>
          <p className="text-orange-400  text-sm md:text-1xl md:ml-14 lg:ml-5 mb-4  mr-[-90px]">
            Our features are designed to provide you with the best possible
            decentralizes experience
          </p>
          <img
            className="h-15 w-20 md:w-20 px-4 pt-3 pb-2 ml-[-20px] md:ml-0 "
            src="/images/circle2.svg"
            alt="logo"
          />
          <div className="ml-14 mt-[-50px]">
            <h4 className="text-black  text-lg md:ml-14 lg:ml-5 mr-[-100px]">
              Data privacy and Ownership
            </h4>
          </div>
          <img
            className="h-15 w-20 md:w-20 px-4 pt-3 pb-2 mt-3 ml-[-20px] md:ml-0"
            src="/images/circle1.svg"
            alt="logo"
          />
          <div className="ml-14 mt-[-45px]">
            <h2 className="text-black text-lg md:ml-14 lg:ml-5">
              NFT Maketplace
            </h2>
          </div>

          <img
            className="h-15 w-20 md:w-20 px-4 pt-3 pb-2 mt-3 ml-[-20px] md:ml-0 "
            src="/images/circle3.svg"
            alt="logo"
          />
          <div className="ml-14 mt-[-45px]">
            <h2 className="text-black  text-lg md:ml-14 lg:ml-5">
              Censorship Resistance
            </h2>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FeaturesSection;

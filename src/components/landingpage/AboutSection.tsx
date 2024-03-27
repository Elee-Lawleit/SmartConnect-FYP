import React from "react";

function AboutSection() {
  return (
    <section
      id="AboutSection"
      className="h-screen bg-white flex items-center justify-center ml-8 md:ml-60"
    >
      <div className="max-w-[440px] m-auto">
        <div className="mt-[-400px] ml-16 ">
          <h1 className="bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent mt-[500px]  text-3xl ml-[-50px] mr-[-60px] md:text-3xl lg:text-7xl md:ml-[-250px]">
            About SmartConnect
          </h1>
          <img
            className="h-15 w-40 md:w-20 px-4 pt-3 pb-2 mt-[-200px] md:mt-3 md:ml-[-250px]"
            src="/images/about.svg"
            alt="logo"
          />
          <div className="ml-14 mt-[-45px]">
            <p className="text-black text-sm md:text-lg ml-[-100px] md:ml-[-250px] mt-[100px] md:mt-[-60px]">
              SmartConnect social media platform that integrates AI algorithms
              and blockchain technology. It will encompass features likes
              personalized content recommendation, secure data storage,
              user-controlled privacy settings, and content filtering.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutSection;

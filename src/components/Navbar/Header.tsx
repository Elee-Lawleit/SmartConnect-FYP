import React from "react";
import Logo from "../landingpage/Logo";
function Header() {
  return (
    <header className="fixed  inset-x-0  mx-auto py-3 lg:py-3 px-4 sm:px-6 lg:px-8 bg-white border border-[#f4f2f2]">
    
        <Logo />
        <div className="flex-row">
        <div className="mb-4 pl-32 pt-2 pr-2 md:pl-0 md:pr-0 md:ml-48 md:mr-8 mt-[-50px] lg:ml-64 lg:mr-8 lg:pl-0 lg:pr-0">
      <input
        type="text"
        placeholder="Search..."
        className="w-full border text-sm md:text-lg p-2 rounded"
      />
        </div>
      </div>

    </header>
   
  );
}

export default Header;

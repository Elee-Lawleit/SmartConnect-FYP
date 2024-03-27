"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import {
  Home,
  PlusCircle,
  Compass,
  Store,
  Users,
  CalendarCheck,
  User,
  LogOut
} from "lucide-react";

function Navbar() {
  const pathname = usePathname();
  const isActive = (path) => pathname === path;
  const activeLinkClass = "text-[#10676B]";
  const linkClass = "flex items-center px-2 py-1 sb:px-2 sb:ml-1 sbb:px-2 sbb:ml-3 tb:px-4 tb:py-2 tb:mr-5 md:ml-0 md:mr-3 rounded md:px-4 md:py-2  lg:px-4 lg:py-2 lg:mr-3  hover:text-[#85b3b6] hover:bg-[#F2F2F2]";
  return (
    
    <nav className="fixed bottom-0 shadow-md tb:mt-20 md:mt-24 lg:mt-24 md:inset-y-0 tb:inset-y-0 left-0 w-full pt-3 pb-3 tb:w-24 tb:pt-5 md:pt-5  md:w-48 lg:pt-5  lg:w-48 bg-white border border-[#e0e0e0]">
       <ul className="flex flex-row md:flex-col tb:flex-col tb:ml-1 md:ml-5 lg:ml-5 md:space-x-0 tb:space-x-0 md:space-y-4  tb:space-y-4 ml-1">
        <li>
          <Link href="/Home">
            <div className={`${linkClass} ${isActive('/Home') ? activeLinkClass : ''}`}>
              <Home className="" />
              <span className="hidden md:block  lg:block pl-2 tb:pl-3" >
                Home
              </span>
            </div>
          </Link>
        </li>

        <li>
          <Link href="/Explore">
            <div className={`${linkClass} ${isActive('/Explore') ? activeLinkClass : ''}`}>
              <Compass />
              <span className="hidden md:block lg:block pl-2 tb:pl-3">
                Explore
              </span>
            </div>
          </Link>
        </li>

        <li>
          <Link href="/Create">
            <div className={`${linkClass} ${isActive('/Create') ? activeLinkClass : ''}`}>
              <PlusCircle />
              <span className="hidden md:block lg:block pl-2 tb:pl-3">
                Create
              </span>
            </div>
          </Link>
        </li>
        <li>
          <Link href="/NFTMarketPlace">
            <div className={`${linkClass} ${isActive('/NFTMarketPlace') ? activeLinkClass : ''}`}>
              <Store />
              <span className="hidden md:block  lg:block pl-3 md:pl-3 tb:pl-3 mr-[-20px]">
                NFT MarketPlace
              </span>
            </div>
          </Link>
        </li>
        <li>
          <Link href="/Groups">
            <div className={`${linkClass} ${isActive('/Groups') ? activeLinkClass : ''}`}>
              <Users />
              <span className="hidden md:block  lg:block pl-2 tb:pl-3">
                Groups
              </span>
            </div>
          </Link>
        </li>
        <li>
          <Link href="/Events">
          <div className={`${linkClass} ${isActive('/Events') ? activeLinkClass : ''}`}>
              <CalendarCheck />
              <span className="hidden md:block  lg:block pl-2 tb:pl-3">
                Events
              </span>
            </div>
          </Link>
        </li>

        <li>
          <Link href="/Profile">
          <div className={`${linkClass} ${isActive('/Profile') ? activeLinkClass : ''}`}>
              <User />
              <span className="hidden md:block  lg:block pl-2 tb:pl-3">
                Profile
              </span>
            </div>
          </Link>
        </li>
      </ul>

      <div className="hidden lg:block md:block tb:mt-32 md:mt-32 lg:mt-32 tb:ml-2 md:ml-8 lg:ml-8">
        <Link href="/landingpage">
          <button className="bg-red-500 text-white px-4 py-2 rounded">
           Logout
          </button>
        </Link></div>
        <div className="hidden tb:block tb:mt-32 md:mt-32 lg:mt-32 tb:ml-3 md:ml-5 lg:ml-5">
        <Link href="/landingpage">
          <button className="bg-red-500 text-white px-4 py-2 rounded">
          <LogOut />
          </button>
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;

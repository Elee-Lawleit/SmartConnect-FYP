// Landingpage_nav.tsx
"use client";
import React, { useState, useEffect } from "react";
import Logo from "./Logo";
import { SmallLogo } from "./Logo";
import Link from "next/link";

type LandingPageNavProps = {};

function smoothScroll(target: string, duration: number) {
  const targetElement = document.getElementById(target);
  if (!targetElement) return;

  const targetPosition = targetElement.offsetTop;
  const startPosition = window.pageYOffset;
  const distance = targetPosition - startPosition;
  let startTime = null;

  function animation(currentTime: number) {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const progress = Math.min(timeElapsed / duration, 1);
    window.scrollTo(0, startPosition + distance * easeInOut(progress));

    if (timeElapsed < duration) {
      requestAnimationFrame(animation);
    }
  }

  function easeInOut(t: number) {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
  }

  requestAnimationFrame(animation);
}

function Landingpage_nav(props: LandingPageNavProps) {
  const [header, setHeader] = useState(false);

  const scrollHeader = () => {
    if (window.scrollY >= 20) {
      setHeader(true);
    } else {
      setHeader(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", scrollHeader);
    return () => {
      window.removeEventListener("scroll", scrollHeader);
    };
  }, []);

  const handleSmoothScroll = (target: string) => {
    smoothScroll(target, 800);
  };

  return (
    <header className="min-w-[26rem] tb:mr-[-100px] mr-[-100px] lg:mr-0">
      <div
        className={
          header
            ? "fixed w-[100%] h-15 backdrop-blur-lg mt-2"
            : "bg-[transparent]"
        }
      >
        <nav className="pt-5 mt-0 flex justify-between w-[100%] mx-auto rounded-xl ">
          <Link href="#GetStarted" scroll={true}>
            <div className="hidden tb:block md:block xl:block">
              <Logo />
            </div>
          </Link>
          <Link href="#GetStarted" scroll={true}>
            <div className="w-14 h-14 tb:hidden md:hidden xl:hidden tbb:hidden ">
              <SmallLogo/>
            </div>
          </Link>

          <div className="md:block">
            {/* <ul className="gap-[10px] text-lg space-x-4 md:text-lg mt-3 flex md:space-x-4 tb:mr-0  tb:space-x-4 lg:space-x-8 xl:space-x-10 md:mr-4 xl:mr-6"> */}
             <ul className="text-[12px] tb:text-[14px] tbb:text-[16px] tb:space-x-2 tbb:space-x-4 mt-4 tb:mt-5 flex mr-40 sb:mr-2  md:text-lg md:space-x-6 lg:space-x-8 xl:space-x-10 md:mr-30 mdd:mr-4">
             <p className=" md:hidden xl:hidden tbb:hidden">|</p>
              <li
                onClick={() => handleSmoothScroll("HomeSection")}
                className="cursor-pointer hover:text-[#85b3b6] mr-2 "
              >
                Introduction
              </li>
              <p className=" md:hidden xl:hidden tbb:hidden">|</p>
              <li
                onClick={() => handleSmoothScroll("FeaturesSection")}
                className="cursor-pointer hover:text-[#85b3b6] mr-1"
              >
                What's new?
              </li>
              <p className=" md:hidden xl:hidden tbb:hidden">|</p>
              <li
                onClick={() => handleSmoothScroll("AboutSection")}
                className="cursor-pointer hover:text-[#85b3b6] mr-1"
              >
                About us
              </li>
              <p className=" md:hidden xl:hidden tbb:hidden">|</p>
              <Link href="/SignInpage">
                <li className="cursor-pointer hover:text-[#85b3b6] rounded-xl hover:scale-110 duration-300 mr-2 tb:mr-2">
                  Sign In
                </li>
              </Link>
            </ul>
          </div>
        </nav>
      </div>
    </header>
  );
}

export default Landingpage_nav;

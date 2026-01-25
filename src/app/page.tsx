"use client";

import React from "react";
import { StartButton } from "@/components/ui/start-button";
import { LearnMoreButton } from "@/components/ui/learn-more-button";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header Navigation */}
      <header className="w-full py-4 px-4 md:px-8">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="text-lg md:text-xl font-bold">Jeev Veda</div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <StartButton
              className="px-3 py-2 text-xs sm:text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-400"
              onClick={() => window.location.href = "/login"}
            >
              Log in
            </StartButton>
            <StartButton
              className="px-3 py-2 text-xs sm:text-sm bg-green-400 text-black font-medium hover:bg-green-500"
              onClick={() => window.location.href = "/signup"}
            >
              Sign up
            </StartButton>
          </div>
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-0 mx-4 md:mx-24 border-[0.5px] border-gray-200">
      {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="hidden md:block border-[0.5px] border-gray-200 h-14"></div>
        ))}
        {/* Empty placeholders hidden on mobile */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="hidden md:block border-[0.5px] border-gray-200 h-14"></div>
        ))}

        {/* Backed by badge */}
        <div className="hidden md:flex col-span-2 items-center justify-center border-[0.5px] border-gray-200 h-14">
          <span className="font-medium text-gray-600">Backed by</span>
          <div className="bg-orange-500 text-white px-2 py-1 text-sm font-bold ml-2">NITRR</div>
        </div>

        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i + 5} className="hidden md:block border-[0.5px] border-gray-200 h-14"></div>
        ))}

        {/* Content region and side placeholders */}
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={`l${i}`} className="hidden md:block border-[0.5px] border-gray-200 h-14"></div>
        ))}

        {/* Main Content Area */}
        <div className="col-span-1 md:col-span-6 row-span-8 border-[0.5px] border-gray-200 bg-white h-auto md:h-[448px] min-h-[400px]">
          <div className="p-6 sm:p-8 md:px-12 flex flex-col justify-center items-center w-full h-full">
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-semibold text-center leading-tight pb-6 sm:pb-8 text-gray-900">
              <span className="block">Your health analysis,</span>
              <span className="underline decoration-green-400 decoration-2 sm:decoration-4">
                finally
              </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-400"> meaningful</span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 text-center max-w-sm sm:max-w-md md:max-w-3xl mx-auto font-light leading-relaxed">
              Jeev Veda analyzes your health data for early cancer indicators you might overlook. We deliver personalized screening recommendations that make all the difference.
            </p>
            <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 mt-6 sm:mt-8 w-full sm:w-auto">
              <StartButton
                className="rounded-[3px] font-medium flex items-center justify-center w-full sm:w-auto min-w-[140px]"
                onClick={() => window.location.href = "/login"}
              >
                Start Now
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </StartButton>
              {/* <LearnMoreButton
                className="rounded-[3px] cursor-pointer w-full font-[family-name:var(--font-outfit)] sm:w-auto min-w-[140px]"
                onClick={() => console.log("Learn more clicked")}
              >
                Learn More
              </LearnMoreButton> */}
            </div>
          </div>
        </div>

        {Array.from({ length: 5 }).map((_, i) => (
          <div key={`r${i}`} className="hidden md:block border-[0.5px] border-gray-200 h-14"></div>
        ))}

        {/* Fill out remaining placeholders only visible on desktop */}
        {Array.from({ length: 64 }).map((_, i) => (
          <div key={i + 20} className="hidden md:block border-[0.5px] border-gray-200 h-14"></div>
        ))}
      </div>
    </div>
  );
}

import React from "react";
import { BackgroundLines } from "@/components/ui/background-lines";
import { Spotlight } from "@/components/ui/spotlight-new";
import HomeButton from "@/components/ui/HomeButton";


export default function BackgroundLinesDemo() {
  return (
    <>
      <BackgroundLines className="flex items-center justify-center w-full min-h-screen flex-col px-4 sm:px-6 lg:px-8 overflow-hidden">
        <Spotlight />
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="mt-[-5rem] bg-clip-text text-transparent text-center bg-gradient-to-b from-neutral-900 to-neutral-700 dark:from-neutral-600 dark:to-white text-4xl md:text-4xl lg:text-7xl font-sans py-2 md:py-10 relative z-20 font-bold tracking-tight">
            Jeev Veda, <br />{" "}
            <span className="block text-3xl bg-clip-text text-transparent font-regular bg-gradient-to-b from-neutral-900 to-neutral-700 dark:from-neutral-600 dark:to-white ">
              Early Satage{" "}
              <span className="italic font-normal">Cancer Detection</span>
            </span>
          </h2>
          <p className="max-w-xl mx-auto text-sm md:text-lg text-neutral-700 dark:text-neutral-400 text-center">
            Spot the early signs of cancer — powered by intelligent analysis, guided by care. Completely free.
          </p>
          <div className="mt-6 sm:mt-8 md:mt-10">
            <HomeButton />
          </div>
        </div>
      </BackgroundLines>
    </>
  );
}

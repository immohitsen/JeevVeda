"use client";
import { cn } from "@/lib/utils";
import React from "react";

export const BackgroundLines = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "h-[20rem] md:h-screen w-full bg-white dark:bg-black",
        className
      )}
    >
      {children}
    </div>
  );
};

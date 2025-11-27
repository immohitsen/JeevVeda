"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface StartButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export function StartButton({
  children,
  onClick,
  className,
  disabled = false,
  type = "button",
  ...props
}: StartButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "font-mono transition-all duration-200 inline-flex items-center justify-center cursor-pointer px-4 py-2 text-sm",
        "bg-green-400 hover:bg-green-500 text-black",
        "border-2 border-black border-b-2 border-r-2",
        "shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
        "hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none",
        "active:border-b-0 active:border-r-0",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
} 
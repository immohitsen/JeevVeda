"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface BrutalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export function BrutalButton({
  children,
  variant = "primary",
  size = "md",
  onClick,
  className,
  disabled = false,
  type = "button",
  ...props
}: BrutalButtonProps) {
  const baseClasses = cn(
    "font-mono transition-all duration-200 inline-flex items-center justify-center cursor-pointer",
    "border-2 border-black",
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
  );

  const variants = {
    primary: cn(
      "bg-green-400 hover:bg-green-500 text-black",
      "border-b-2 border-r-2",
      "shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
      "hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
    ),
    secondary: cn(
      "bg-blue-400 hover:bg-blue-500 text-black",
      "border-b-2 border-r-2", 
      "shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
      "hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
    ),
    ghost: cn(
      "bg-white hover:bg-gray-50 text-black",
      "border-b-2 border-r-2",
      "shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]",
      "hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
    ),
    danger: cn(
      "bg-red-400 hover:bg-red-500 text-black",
      "border-b-2 border-r-2",
      "shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
      "hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
    ),
    success: cn(
      "bg-emerald-400 hover:bg-emerald-500 text-black", 
      "border-b-2 border-r-2",
      "shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
      "hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
    ),
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface LearnMoreButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export function LearnMoreButton({
  children,
  onClick,
  className,
  disabled = false
}: LearnMoreButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "font-mono flex items-center justify-center font-light text-gray-600 hover:text-gray-900 group transition-colors hover:bg-gray-50",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
    >
      <div className="w-10 h-10 border border-gray-200 flex items-center justify-center mr-3 group-hover:border-green-300 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="6 3 20 12 6 21 6 3"></polygon>
        </svg>
      </div>
      {children}
    </button>
  );
} 
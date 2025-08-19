"use client"

import React from "react"
import CancerChatbot from "@/components/CancerChatbot"

export default function ChatbotPage() {
  return (
    <div className="h-full flex flex-col">
      {/* Chat Interface - Fixed Height, No Scrolling */}
      <div className="flex-1 overflow-hidden">
        <CancerChatbot />
      </div>
    </div>
  )
}

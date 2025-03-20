"use client"

import type React from "react"

import { useRef, useEffect, useState } from "react"
import type { Chat, Message } from "@/types"
import { formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, ArrowLeft } from "lucide-react"
import { useAuth } from "@/context/auth-context"

interface ChatWindowProps {
  chat: Chat
  messages: Message[]
  currentUserId: string
  isTyping: boolean
  messageInput: string
  setMessageInput: (value: string) => void
  onSendMessage: () => void
  onTyping: (isTyping: boolean) => void
}

export default function ChatWindow({
  chat,
  messages,
  currentUserId,
  isTyping,
  messageInput,
  setMessageInput,
  onSendMessage,
  onTyping,
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null)
  const { user } = useAuth()

  const getChatName = (): string => {
    if (chat.isGroup) return chat.groupName || "Group Chat"

    const otherParticipant = chat.participants.find((p) => p._id !== currentUserId)
    return otherParticipant?.name || "Unknown User"
  }

  const getChatAvatar = (): string | undefined => {
    if (chat.isGroup) return chat.groupAvatar

    const otherParticipant = chat.participants.find((p) => p._id !== currentUserId)
    return otherParticipant?.avatar
  }

  const getParticipantStatus = (): "online" | "offline" => {
    if (chat.isGroup) return "offline"

    const otherParticipant = chat.participants.find((p) => p._id !== currentUserId)
    return otherParticipant?.status || "offline"
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value)

    // Handle typing indicator
    onTyping(true)

    if (typingTimeout) {
      clearTimeout(typingTimeout)
    }

    const timeout = setTimeout(() => {
      onTyping(false)
    }, 2000)

    setTypingTimeout(timeout)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      onSendMessage()
    }
  }

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  // Clear typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout)
      }
    }
  }, [typingTimeout])

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="p-4 border-b border-border flex items-center">
        <Button variant="ghost" size="icon" className="mr-2 md:hidden" onClick={() => window.history.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            {getChatAvatar() ? (
              <img
                src={getChatAvatar() || "/placeholder.svg"}
                alt={getChatName()}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <span className="text-primary font-medium">{getChatName().charAt(0).toUpperCase()}</span>
            )}
          </div>
          {!chat.isGroup && (
            <span
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card ${getParticipantStatus() === "online" ? "bg-green-500" : "bg-gray-400"
                }`}
            />
          )}
        </div>

        <div className="ml-3">
          <p className="font-medium">{getChatName()}</p>
          <p className="text-xs text-muted-foreground">
            {chat.isGroup
              ? `${chat.participants.length} participants`
              : getParticipantStatus() === "online"
                ? "Online"
                : "Offline"}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No messages yet</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isCurrentUser = (message.sender === currentUserId) || (message.sender?._id === currentUserId);
            const showAvatar = index === 0 || messages[index - 1].sender !== message.sender;

            return (
              <div
                key={message._id}
                className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} mb-2 transition-all duration-300`}
              >
                {!isCurrentUser && showAvatar && (
                  <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center mr-3 shadow-lg">
                    <span className="text-primary text-sm font-semibold">
                      {getChatName().charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}

                <div className={`max-w-[70%] ${!isCurrentUser && !showAvatar ? "ml-12" : ""}`}>
                  <div
                    className={`p-3 rounded-2xl ${isCurrentUser
                      ? "bg-primary text-white shadow-md hover:shadow-xl"
                      : "bg-gray-200 text-gray-800 shadow-sm hover:shadow-md"
                      } ${isCurrentUser ? "rounded-br-none" : "rounded-bl-none"} transition-all duration-300`}
                  >
                    <p className="text-base font-medium">{message.content}</p>
                  </div>
                  <p className={`text-xs text-gray-500 mt-1 flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                    {message.timestamp ? formatDistanceToNow(new Date(message.timestamp), { addSuffix: true }) : "just now"}
                  </p>
                </div>
              </div>
            )
          })
        )}

        {isTyping && (
          <div className="flex justify-start">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
              <span className="text-primary text-xs font-medium">{getChatName().charAt(0).toUpperCase()}</span>
            </div>
            <div className="p-3 rounded-lg bg-muted">
              <div className="flex space-x-1">
                <div
                  className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></div>
                <div
                  className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"
                  style={{ animationDelay: "200ms" }}
                ></div>
                <div
                  className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"
                  style={{ animationDelay: "400ms" }}
                ></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Type a message..."
            value={messageInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          <Button onClick={onSendMessage} disabled={!messageInput.trim()} size="icon">
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}


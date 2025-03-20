"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, ArrowLeft } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

// AI response patterns
const AI_RESPONSES = [
  {
    pattern: "hello|hi|hey",
    responses: [
      "Hello! How can I help you today?",
      "Hi there! What can I do for you?",
      "Hey! I'm your AI assistant. What do you need help with?",
    ],
  },
  {
    pattern: "how are you",
    responses: [
      "I'm just a program, but I'm functioning well! How can I assist you?",
      "I don't have feelings, but I'm ready to help you with whatever you need!",
      "I'm operational and ready to assist. What can I help you with?",
    ],
  },
  {
    pattern: "thank|thanks",
    responses: [
      "You're welcome! Is there anything else I can help with?",
      "Happy to help! Let me know if you need anything else.",
      "Anytime! What else would you like to know?",
    ],
  },
  {
    pattern: "bye|goodbye",
    responses: [
      "Goodbye! Feel free to chat again if you have more questions.",
      "See you later! Have a great day!",
      "Bye for now! Come back anytime you need assistance.",
    ],
  },
  {
    pattern: "name",
    responses: [
      "I'm your AI assistant. You can call me AI.",
      "I don't have a personal name, but you can think of me as your helpful AI assistant.",
      "I'm an AI chatbot designed to assist you with your questions.",
    ],
  },
  {
    pattern: "weather",
    responses: [
      "I don't have access to real-time weather data. You might want to check a weather app or website for that information.",
      "I can't check the weather for you, but I can help with many other questions!",
      "I don't have the capability to check current weather conditions. Is there something else I can help with?",
    ],
  },
  {
    pattern: "joke|funny",
    responses: [
      "Why don't scientists trust atoms? Because they make up everything!",
      "What did one wall say to the other wall? I'll meet you at the corner!",
      "Why did the scarecrow win an award? Because he was outstanding in his field!",
    ],
  },
  {
    pattern: "help|assist",
    responses: [
      "I'm here to help! You can ask me questions, and I'll do my best to assist you.",
      "I can help with information, answer questions, or just chat. What do you need?",
      "I'm your AI assistant, ready to help with whatever you need. What can I do for you?",
    ],
  },
  {
    pattern: "time|date",
    responses: [
      "I don't have access to the current time or date. You can check your device for that information.",
      "I can't tell you the exact time or date right now, as I don't have that capability.",
      "I don't have real-time access to time or date information. Is there something else I can help with?",
    ],
  },
  {
    pattern: ".*", // Default pattern for any other input
    responses: [
      "That's an interesting question. Can you tell me more about what you're looking for?",
      "I'm not sure I understand. Could you rephrase your question?",
      "I don't have specific information about that. Is there something else I can help with?",
    ],
  },
]

interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
}

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! I'm your AI assistant. How can I help you today?",
      sender: "ai",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const getAIResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase()

    // Find matching pattern
    for (const item of AI_RESPONSES) {
      const regex = new RegExp(item.pattern, "i")
      if (regex.test(lowerInput)) {
        // Return random response from matching pattern
        const randomIndex = Math.floor(Math.random() * item.responses.length)
        return item.responses[randomIndex]
      }
    }

    // Fallback to default response
    const defaultResponses = AI_RESPONSES.find((item) => item.pattern === ".*")?.responses || []
    const randomIndex = Math.floor(Math.random() * defaultResponses.length)
    return defaultResponses[randomIndex]
  }

  const handleSendMessage = () => {
    if (!input.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    // Simulate AI typing delay (1-2 seconds)
    const typingDelay = Math.floor(Math.random() * 1000) + 1000

    setTimeout(() => {
      const aiResponse = getAIResponse(userMessage.content)

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        sender: "ai",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMessage])
      setIsTyping(false)
    }, typingDelay)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="p-4 border-b border-border flex items-center">
        <Button variant="ghost" size="icon" className="mr-2 md:hidden" onClick={() => window.history.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-primary font-medium">AI</span>
        </div>

        <div className="ml-3">
          <p className="font-medium">AI Assistant</p>
          <p className="text-xs text-muted-foreground">Always online</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isUser = message.sender === "user"

          return (
            <div key={message.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
              {!isUser && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                  <span className="text-primary text-xs font-medium">AI</span>
                </div>
              )}

              <div>
                <div className={`p-3 rounded-lg ${isUser ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  <p className="text-sm">{message.content}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(message.timestamp, { addSuffix: true })}
                </p>
              </div>
            </div>
          )
        })}

        {isTyping && (
          <div className="flex justify-start">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
              <span className="text-primary text-xs font-medium">AI</span>
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
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          <Button onClick={handleSendMessage} disabled={!input.trim() || isTyping} size="icon">
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}


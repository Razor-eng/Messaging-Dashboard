"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { io, type Socket } from "socket.io-client"
import { useAuth } from "./auth-context"
import { useToast } from "@/components/ui/use-toast"

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider")
  }
  return context
}

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (!user) return

    // Get socket URL from environment or fallback to localhost
    const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000"

    try {
      const socketInstance = io(socketUrl, {
        auth: {
          token: localStorage.getItem("token"),
        },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      })

      socketInstance.on("connect", () => {
        console.log("Socket connected")
        setIsConnected(true)
      })

      socketInstance.on("disconnect", () => {
        console.log("Socket disconnected")
        setIsConnected(false)
      })

      socketInstance.on("connect_error", (error) => {
        console.error("Socket connection error:", error)
        toast({
          title: "Connection Error",
          description: "Failed to connect to the messaging server. Retrying...",
          variant: "destructive",
        })
      })

      setSocket(socketInstance)

      return () => {
        socketInstance.disconnect()
      }
    } catch (error) {
      console.error("Socket initialization error:", error)
      toast({
        title: "Connection Error",
        description: "Failed to initialize socket connection",
        variant: "destructive",
      })
    }
  }, [user, toast])

  return <SocketContext.Provider value={{ socket, isConnected }}>{children}</SocketContext.Provider>
}


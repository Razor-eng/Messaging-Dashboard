import axios, { type AxiosError } from "axios"
import { toast } from "@/components/ui/use-toast"
import type { User, Chat, Message } from "@/types"

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  withCredentials: true,
  timeout: 10000,
})

const extractErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message || "An unexpected error occurred"
  }
  return "An unexpected error occurred"
}


// Add request interceptor to add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const message = error.response?.data?.message || "An unexpected error occurred"

    // Don't show toast for 401 errors (handled by auth context)
    if (error.response?.status !== 401) {
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
    }

    return Promise.reject(error)
  },
)

// Auth services
export const authService = {
  login: async (email: string, password: string): Promise<{ token: string; user: User }> => {
    try {
      const response = await api.post("/api/auth/login", { email, password })
      return response.data
    } catch (error) {
      const message = extractErrorMessage(error)
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
      throw new Error(message)
    }

  },

  register: async (name: string, email: string, password: string): Promise<{ token: string; user: User }> => {
    try {
      const response = await api.post("/api/auth/register", { name, email, password })
      return response.data
    } catch (error) {
      const message = extractErrorMessage(error)
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
      throw new Error(message)
    }

  },

  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await api.get("/api/auth/me")
      return response.data
    } catch (error) {
      const message = extractErrorMessage(error)
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
      throw new Error(message)
    }

  },
}

// Chat services
export const chatService = {
  getChats: async (): Promise<Chat[]> => {
    try {
      const response = await api.get("/api/chats")
      return response.data
    } catch (error) {
      const message = extractErrorMessage(error)
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
      throw new Error(message)
    }

  },

  getMessages: async (chatId: string): Promise<Message[]> => {
    try {
      const response = await api.get(`/api/chats/${chatId}/messages`)
      return response.data
    } catch (error) {
      const message = extractErrorMessage(error)
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
      throw new Error(message)
    }

  },

  createChat: async (participantId: string): Promise<Chat> => {
    try {
      const response = await api.post("/api/chats", { participantId })
      return response.data
    } catch (error) {
      const message = extractErrorMessage(error)
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
      throw new Error(message)
    }

  },

  createGroupChat: async (name: string, participantIds: string[]): Promise<Chat> => {
    try {
      const response = await api.post("/api/chats/group", { name, participantIds })
      return response.data
    } catch (error) {
      const message = extractErrorMessage(error)
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
      throw new Error(message)
    }

  },
}

// User services
export const userService = {
  getUsers: async (): Promise<User[]> => {
    try {
      const response = await api.get("/api/users")
      return response.data
    } catch (error) {
      const message = extractErrorMessage(error)
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
      throw new Error(message)
    }

  },

  getUserById: async (userId: string): Promise<User> => {
    try {
      const response = await api.get(`/api/users/${userId}`)
      return response.data
    } catch (error) {
      const message = extractErrorMessage(error)
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
      throw new Error(message)
    }

  },

  updateProfile: async (data: { name?: string; avatar?: string }): Promise<User> => {
    try {
      const response = await api.put("/api/users/profile", data)
      return response.data
    } catch (error) {
      const message = extractErrorMessage(error)
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
      throw new Error(message)
    }

  },
}

export default api


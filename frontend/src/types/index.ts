export interface User {
  _id: string
  name: string
  email: string
  avatar?: string
  status: "online" | "offline"
  lastSeen?: Date
}

export interface Message {
  _id: string
  sender: string | { _id: string, name: string }
  receiver: string
  content: string
  timestamp: Date
  read: boolean
  chatId: string
}

export interface Chat {
  _id: string
  participants: User[]
  lastMessage?: Message
  unreadCount: number
  isGroup: boolean
  groupName?: string
  groupAvatar?: string
}

export interface AIResponse {
  pattern: string
  responses: string[]
}


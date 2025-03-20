"use client"

import type { Chat } from "@/types"
import { formatDistanceToNow } from "date-fns"

interface ChatListProps {
  chats: Chat[]
  currentUserId: string
  onSelectChat: (chat: Chat) => void
  selectedChatId?: string
}

export default function ChatList({ chats, currentUserId, onSelectChat, selectedChatId }: ChatListProps) {
  const getChatName = (chat: Chat): string => {
    if (chat.isGroup) return chat.groupName || "Group Chat"

    const otherParticipant = chat.participants.find((p) => p._id !== currentUserId)
    return otherParticipant?.name || "Unknown User"
  }

  const getChatAvatar = (chat: Chat): string | undefined => {
    if (chat.isGroup) return chat.groupAvatar

    const otherParticipant = chat.participants.find((p) => p._id !== currentUserId)
    return otherParticipant?.avatar
  }

  const getLastMessagePreview = (chat: Chat): string => {
    if (!chat.lastMessage) return "No messages yet"
    return chat.lastMessage.content.length > 30
      ? `${chat.lastMessage.content.substring(0, 30)}...`
      : chat.lastMessage.content
  }

  const getLastMessageTime = (chat: Chat): string => {
    if (!chat.lastMessage || !chat.lastMessage.timestamp) return ""

    try {
      return formatDistanceToNow(new Date(chat.lastMessage.timestamp), { addSuffix: true })
    } catch (error) {
      console.error("Date formatting error:", error)
      return ""
    }
  }

  const getParticipantStatus = (chat: Chat): "online" | "offline" => {
    if (chat.isGroup) return "offline" // Groups don't have online status

    const otherParticipant = chat.participants.find((p) => p._id !== currentUserId)
    return otherParticipant?.status || "offline"
  }

  return (
    <div className="space-y-2">
      {chats.length === 0 ? (
        <p className="text-sm text-muted-foreground p-2">No chats yet</p>
      ) : (
        chats.map((chat) => (
          <div
            key={chat._id}
            className={`flex items-center p-2 rounded-md cursor-pointer ${selectedChatId === chat._id ? "bg-accent" : "hover:bg-accent/50"
              }`}
            onClick={() => onSelectChat(chat)}
          >
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                {getChatAvatar(chat) ? (
                  <img
                    src={getChatAvatar(chat) || "/placeholder.svg?height=48&width=48"}
                    alt={getChatName(chat)}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-primary font-medium">{getChatName(chat).charAt(0).toUpperCase()}</span>
                )}
              </div>
              {!chat.isGroup && (
                <span
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card ${getParticipantStatus(chat) === "online" ? "bg-green-500" : "bg-gray-400"
                    }`}
                />
              )}
              {chat.unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {chat.unreadCount}
                </span>
              )}
            </div>
            <div className="ml-3 flex-1 overflow-hidden">
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium truncate">{getChatName(chat)}</p>
                <p className="text-xs text-muted-foreground">{getLastMessageTime(chat)}</p>
              </div>
              <p className="text-xs text-muted-foreground truncate">{getLastMessagePreview(chat)}</p>
            </div>
          </div>
        ))
      )}
    </div>
  )
}


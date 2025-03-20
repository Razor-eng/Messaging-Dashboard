"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/context/auth-context"
import { useSocket } from "@/context/socket-context"
import type { Chat, User, Message } from "@/types"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Search, Menu, X, LogOut, Bot } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import ChatList from "@/components/chat-list"
import ChatWindow from "@/components/chat-window"
import AIChat from "@/components/ai-chat"
import { chatService, userService } from "@/services/api"

export default function Dashboard() {
  const { user, logout } = useAuth()
  const { socket, isConnected } = useSocket()
  const { toast } = useToast()
  const [chats, setChats] = useState<Chat[]>([])
  const [contacts, setContacts] = useState<User[]>([])
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [messageInput, setMessageInput] = useState("")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isAIChat, setIsAIChat] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch chats and contacts
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [chatsData, contactsData] = await Promise.all([chatService.getChats(), userService.getUsers()])
        setChats(chatsData)
        setContacts(contactsData.filter((contact: User) => contact._id !== user?._id))
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchData()
    }
  }, [user, toast])

  // Socket event listeners
  useEffect(() => {
    if (!socket) return

    // New message received
    const handleNewMessage = (message: Message) => {
      if (selectedChat && selectedChat._id === message.chatId) {
        setMessages((prev) => [...prev, message])
        // Mark as read
        socket.emit("read_message", { chatId: message.chatId })
      }

      // Update chat list
      setChats((prev) => {
        return prev.map((chat) => {
          if (chat._id === message.chatId) {
            return {
              ...chat,
              lastMessage: message,
              unreadCount: selectedChat && selectedChat._id === message.chatId ? 0 : chat.unreadCount + 1,
            }
          }
          return chat
        })
      })
    }

    // User status change
    const handleUserStatus = ({ userId, status }: { userId: string; status: "online" | "offline" }) => {
      setContacts((prev) => {
        return prev.map((contact) => {
          if (contact._id === userId) {
            return { ...contact, status }
          }
          return contact
        })
      })
    }

    // Typing indicator
    const handleTyping = ({ chatId, isTyping }: { chatId: string; isTyping: boolean }) => {
      if (selectedChat && selectedChat._id === chatId) {
        setIsTyping(isTyping)
      }
    }

    // Register event listeners
    socket.on("new_message", handleNewMessage)
    socket.on("user_status", handleUserStatus)
    socket.on("typing", handleTyping)

    // Clean up event listeners
    return () => {
      socket.off("new_message", handleNewMessage)
      socket.off("user_status", handleUserStatus)
      socket.off("typing", handleTyping)
    }
  }, [socket, selectedChat])

  // Load messages when a chat is selected
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedChat) return

      try {
        const messagesData = await chatService.getMessages(selectedChat._id)
        setMessages(messagesData)

        // Mark messages as read
        if (selectedChat.unreadCount > 0 && socket) {
          socket.emit("read_message", { chatId: selectedChat._id })
          setChats((prev) => {
            return prev.map((chat) => {
              if (chat._id === selectedChat._id) {
                return { ...chat, unreadCount: 0 }
              }
              return chat
            })
          })
        }
      } catch (error) {
        console.error("Error fetching messages:", error)
        toast({
          title: "Error",
          description: "Failed to load messages",
          variant: "destructive",
        })
      }
    }

    if (selectedChat && !isAIChat) {
      fetchMessages()
      setIsMobileMenuOpen(false)
    }
  }, [selectedChat, isAIChat, socket, toast])

  const handleSendMessage = useCallback(() => {
    if (!messageInput.trim() || !selectedChat || !socket) return

    const newMessage = {
      content: messageInput,
      chatId: selectedChat._id,
      timestamp: new Date(),
      sender: user?._id,
    }

    setMessageInput("")

    try {
      socket.emit("send_message", newMessage)
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    }
  }, [messageInput, selectedChat, socket, toast])

  const handleStartChat = useCallback(
    async (contactId: string) => {
      try {
        const newChat = await chatService.createChat(contactId)

        // Check if chat already exists in the list
        const chatExists = chats.some((chat) => chat._id === newChat._id)

        if (!chatExists) {
          setChats((prev) => [newChat, ...prev])
        }

        setSelectedChat(newChat)
        setIsAIChat(false)
      } catch (error) {
        console.error("Error starting chat:", error)
        toast({
          title: "Error",
          description: "Failed to start chat",
          variant: "destructive",
        })
      }
    },
    [chats, toast],
  )

  const handleStartAIChat = useCallback(() => {
    setSelectedChat(null)
    setIsAIChat(true)
    setIsMobileMenuOpen(false)
  }, [])

  const filteredChats = chats.filter((chat) => {
    if (!searchQuery) return true

    // For regular chats, search in participant names
    if (!chat.isGroup) {
      const otherParticipant = chat.participants.find((p) => p._id !== user?._id)
      return otherParticipant?.name.toLowerCase().includes(searchQuery.toLowerCase())
    }

    // For group chats, search in group name
    return chat.groupName?.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your messages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 left-4 z-20">
        <Button variant="outline" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Theme toggle */}
      <div className="fixed top-4 right-4 z-20 hidden">
        <ModeToggle />
      </div>

      {/* Sidebar */}
      <div
        className={`w-full md:w-80 bg-card border-r border-border h-full flex flex-col z-10 transition-transform duration-300 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          } fixed md:relative`}
      >
        <div className="p-4 flex items-center justify-between">
          <h1 className={`text-xl font-bold ml-12 md:ml-0`}>Messages</h1>
          <Button variant="ghost" size="icon" onClick={logout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-4">
          <div className="relative">
            <Input
              placeholder="Search chats and contacts..."
              className="pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition duration-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          </div>
        </div>

        <Button variant="secondary" className="mx-4 mb-2 flex items-center gap-2" onClick={handleStartAIChat}>
          <Bot /> Chat with AI Assistant
        </Button>

        <Separator />

        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-sm font-semibold mb-2">Recent Chats</h2>
            <ChatList
              chats={filteredChats}
              currentUserId={user?._id || ""}
              onSelectChat={(chat) => {
                setSelectedChat(chat)
                setIsAIChat(false)
              }}
              selectedChatId={selectedChat?._id}
            />
          </div>

          <Separator />

          <div className="p-4">
            <h2 className="text-sm font-semibold mb-2">Contacts</h2>
            <div className="space-y-2">
              {filteredContacts.length === 0 ? (
                <p className="text-sm text-muted-foreground p-2">No contacts found</p>
              ) : (
                filteredContacts.map((contact) => (
                  <div
                    key={contact._id}
                    className="flex items-center p-2 rounded-md hover:bg-accent cursor-pointer"
                    onClick={() => handleStartChat(contact._id)}
                  >
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        {contact.avatar ? (
                          <img
                            src={contact.avatar || "/placeholder.svg?height=40&width=40"}
                            alt={contact.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-primary font-medium">{contact.name.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <span
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card ${contact.status === "online" ? "bg-green-500" : "bg-gray-400"
                          }`}
                      />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium">{contact.name}</p>
                      <p className="text-xs text-muted-foreground">{contact.status}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-border">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-medium">{user?.name.charAt(0).toUpperCase()}</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{isConnected ? "Online" : "Connecting..."}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col h-full">
        {isAIChat ? (
          <AIChat />
        ) : selectedChat ? (
          <ChatWindow
            chat={selectedChat}
            messages={messages}
            currentUserId={user?._id || ""}
            isTyping={isTyping}
            messageInput={messageInput}
            setMessageInput={setMessageInput}
            onSendMessage={handleSendMessage}
            onTyping={(typing) => {
              if (socket && selectedChat) {
                socket.emit("typing", { chatId: selectedChat._id, isTyping: typing })
              }
            }}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Welcome to the Messaging Dashboard</h2>
              <p className="text-muted-foreground">Select a chat to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


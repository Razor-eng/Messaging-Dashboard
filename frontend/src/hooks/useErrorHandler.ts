"use client"

import { useCallback } from "react"
import { useToast } from "@/components/ui/use-toast"

export function useErrorHandler() {
  const { toast } = useToast()

  const handleError = useCallback(
    (error: any, fallbackMessage = "An unexpected error occurred") => {
      console.error("Error:", error)

      const errorMessage = error?.response?.data?.message || error?.message || fallbackMessage

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })

      return errorMessage
    },
    [toast],
  )

  return { handleError }
}


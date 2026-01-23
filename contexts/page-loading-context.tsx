"use client"

import * as React from "react"

interface PageLoadingContextType {
  isLoading: boolean
  loadingMessage: string
  showPageLoading: (message: string, duration?: number) => void
}

const PageLoadingContext = React.createContext<PageLoadingContextType | undefined>(undefined)

export function PageLoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = React.useState(false)
  const [loadingMessage, setLoadingMessage] = React.useState("")

  const showPageLoading = React.useCallback((message: string, duration = 1000) => {
    setLoadingMessage(message)
    setIsLoading(true)
    
    setTimeout(() => {
      setIsLoading(false)
    }, duration)
  }, [])

  return (
    <PageLoadingContext.Provider value={{ isLoading, loadingMessage, showPageLoading }}>
      {children}
    </PageLoadingContext.Provider>
  )
}

export function usePageLoading() {
  const context = React.useContext(PageLoadingContext)
  if (context === undefined) {
    throw new Error("usePageLoading must be used within a PageLoadingProvider")
  }
  return context
}

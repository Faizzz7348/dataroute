"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"
import { usePageLoading } from "@/contexts/page-loading-context"

export function PageLoading() {
  const { isLoading, loadingMessage } = usePageLoading()
  const [dots, setDots] = React.useState("")

  React.useEffect(() => {
    if (!isLoading) return
    
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? "" : prev + ".")
    }, 400)
    
    return () => clearInterval(interval)
  }, [isLoading])

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-background/90 backdrop-blur-md" />
      <div className="relative z-10 flex flex-col items-center gap-3">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          {loadingMessage}{dots}
        </p>
      </div>
    </div>
  )
}

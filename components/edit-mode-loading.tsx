"use client"

import * as React from "react"
import { Loader2, Settings, Check, X } from "lucide-react"
import { useEditMode } from "@/contexts/edit-mode-context"

export function EditModeLoading() {
  const { isLoading, isEditMode } = useEditMode()
  const [dots, setDots] = React.useState("")

  React.useEffect(() => {
    if (!isLoading) return
    
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? "" : prev + ".")
    }, 300)
    
    return () => clearInterval(interval)
  }, [isLoading])

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center animate-in fade-in duration-300">
      {/* Backdrop with blur - simulating page transition */}
      <div className="absolute inset-0 bg-background/95 backdrop-blur-xl" />
      
      {/* Loading content - looks like a page loading */}
      <div className="relative z-10 flex flex-col items-center gap-8 animate-in zoom-in-95 duration-500">
        {/* Large icon with rotation animation */}
        <div className="relative">
          {/* Spinning border */}
          <div className="absolute -inset-4 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
          <div className="absolute -inset-2 rounded-full border-2 border-primary/20 border-b-primary animate-spin" style={{ animationDuration: "2s", animationDirection: "reverse" }} />
          
          {/* Center icon */}
          <div className="relative rounded-full bg-gradient-to-br from-primary/20 to-primary/5 p-8 shadow-2xl border border-primary/30">
            <Settings className="h-16 w-16 text-primary animate-pulse" />
          </div>
        </div>
        
        {/* Loading text */}
        <div className="flex flex-col items-center gap-4 min-w-[300px]">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">
              {isEditMode ? "Disabling" : "Enabling"} Edit Mode{dots}
            </h2>
            <p className="text-muted-foreground text-sm">
              Please wait while we update your settings
            </p>
          </div>
          
          {/* Progress bar */}
          <div className="w-full max-w-xs h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-primary/60 animate-pulse rounded-full" 
                 style={{ 
                   animation: "progress 1.2s ease-in-out infinite",
                 }} 
            />
          </div>
          
          {/* Status indicator */}
          <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-muted/50 border border-border">
            <div className="flex gap-1">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "0.2s" }} />
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "0.4s" }} />
            </div>
            <span className="text-sm font-medium">Loading page state</span>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes progress {
          0% { width: 0%; margin-left: 0%; }
          50% { width: 50%; margin-left: 25%; }
          100% { width: 0%; margin-left: 100%; }
        }
      `}</style>
    </div>
  )
}

"use client"

import * as React from "react"
import { Loader2, CheckCircle2 } from "lucide-react"
import { useEditMode } from "@/contexts/edit-mode-context"

export function EditModeLoading() {
  const { isLoading, isEditMode, savingMessage } = useEditMode()
  const [dots, setDots] = React.useState("")
  const [shouldRender, setShouldRender] = React.useState(false)
  const isSuccess = savingMessage && savingMessage.includes('✅')
  const isSaving = savingMessage && savingMessage.length > 0

  React.useEffect(() => {
    if (isLoading) {
      setShouldRender(true)
    } else {
      const timer = setTimeout(() => setShouldRender(false), 300)
      return () => clearTimeout(timer)
    }
  }, [isLoading])

  React.useEffect(() => {
    if (!isLoading) return
    
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? "" : prev + ".")
    }, 400)
    
    return () => clearInterval(interval)
  }, [isLoading])

  if (!shouldRender) return null

  return (
    <div className={`fixed inset-0 z-[200] flex items-center justify-center transition-opacity duration-300 ${
      isLoading ? 'opacity-100' : 'opacity-0'
    }`}>
      <div className="absolute inset-0 bg-background backdrop-blur-md" />
      <div className="relative z-10 flex flex-col items-center gap-4">
        {isSaving ? (
          <>
            {isSuccess ? (
              <div className="relative">
                <CheckCircle2 className="h-16 w-16 text-green-500 animate-in zoom-in duration-300" />
              </div>
            ) : (
              <div className="relative">
                <Loader2 className="h-16 w-16 text-primary animate-spin" />
              </div>
            )}
            <div className="flex flex-col items-center gap-2">
              <p className="text-lg font-semibold text-foreground">
                {savingMessage.replace(/[🔄💾✅❌]/g, '').trim()}{!isSuccess && dots}
              </p>
              {!isSuccess && (
                <p className="text-sm text-muted-foreground">
                  Do not close this window
                </p>
              )}
            </div>
            {/* Progress bar */}
            {!isSuccess && (
              <div className="w-64 h-1 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary animate-pulse" style={{ width: '100%' }} />
              </div>
            )}
          </>
        ) : (
          <>
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <p className="text-sm font-medium text-muted-foreground animate-pulse">
              {isEditMode ? "Edit Mode turning on" : "Edit Mode turning off"}{dots}
            </p>
          </>
        )}
      </div>
    </div>
  )
}

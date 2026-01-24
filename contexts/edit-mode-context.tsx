"use client"

import * as React from "react"
import { Delivery } from "@/app/data"

interface PendingChange {
  id: number
  type: 'update' | 'delete'
  data?: Delivery
}

interface EditModeContextType {
  isEditMode: boolean
  setIsEditMode: (value: boolean) => void
  isLoading: boolean
  setIsLoading: (value: boolean) => void
  hasUnsavedChanges: boolean
  pendingChanges: PendingChange[]
  addPendingChange: (change: PendingChange) => void
  clearPendingChanges: () => void
  saveAllChanges: () => Promise<void>
}

const EditModeContext = React.createContext<EditModeContextType | undefined>(undefined)

export function EditModeProvider({ children }: { children: React.ReactNode }) {
  const [isEditMode, setIsEditMode] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [pendingChanges, setPendingChanges] = React.useState<PendingChange[]>([])

  const hasUnsavedChanges = pendingChanges.length > 0

  const addPendingChange = React.useCallback((change: PendingChange) => {
    setPendingChanges((prev) => {
      // Remove existing change for same id if any
      const filtered = prev.filter(c => c.id !== change.id)
      const updated = [...filtered, change]
      console.log('Pending changes updated:', updated)
      return updated
    })
  }, [])

  const clearPendingChanges = React.useCallback(() => {
    setPendingChanges([])
  }, [])

  const saveAllChanges = React.useCallback(async () => {
    setIsLoading(true)
    try {
      // Process all pending changes
      for (const change of pendingChanges) {
        if (change.type === 'update') {
          await fetch(`/api/locations/${change.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(change.data),
          })
        } else if (change.type === 'delete') {
          await fetch(`/api/locations/${change.id}`, {
            method: 'DELETE',
          })
        }
      }
      clearPendingChanges()
    } catch (error) {
      console.error('Error saving changes:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [pendingChanges, clearPendingChanges])

  return (
    <EditModeContext.Provider value={{ 
      isEditMode, 
      setIsEditMode, 
      isLoading, 
      setIsLoading,
      hasUnsavedChanges,
      pendingChanges,
      addPendingChange,
      clearPendingChanges,
      saveAllChanges
    }}>
      {children}
    </EditModeContext.Provider>
  )
}

export function useEditMode() {
  const context = React.useContext(EditModeContext)
  if (context === undefined) {
    throw new Error("useEditMode must be used within an EditModeProvider")
  }
  return context
}

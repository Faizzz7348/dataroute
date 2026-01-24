"use client"

import * as React from "react"
import { Delivery } from "@/app/data"

interface PendingChange {
  id: number
  type: 'update' | 'delete' | 'create'
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
  savingMessage: string
}

const EditModeContext = React.createContext<EditModeContextType | undefined>(undefined)

export function EditModeProvider({ children }: { children: React.ReactNode }) {
  const [isEditMode, setIsEditMode] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [pendingChanges, setPendingChanges] = React.useState<PendingChange[]>([])
  const [savingMessage, setSavingMessage] = React.useState('')

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
    setSavingMessage('🔄 Initializing save process')
    
    try {
      const totalChanges = pendingChanges.length
      let processedChanges = 0
      
      // Process all pending changes
      for (const change of pendingChanges) {
        processedChanges++
        const percentage = Math.round((processedChanges / totalChanges) * 100)
        setSavingMessage(`💾 Saving your data (${percentage}%)... Please wait`)
        
        if (change.type === 'create') {
          // New row - use POST
          const response = await fetch('/api/locations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(change.data),
          })
          if (!response.ok) {
            const error = await response.text()
            throw new Error(`Failed to create location: ${error}`)
          }
        } else if (change.type === 'update') {
          // Existing row - use PUT
          const response = await fetch(`/api/locations/${change.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(change.data),
          })
          if (!response.ok) {
            const error = await response.text()
            throw new Error(`Failed to update location: ${error}`)
          }
        } else if (change.type === 'delete') {
          const response = await fetch(`/api/locations/${change.id}`, {
            method: 'DELETE',
          })
          if (!response.ok) {
            const error = await response.text()
            throw new Error(`Failed to delete location: ${error}`)
          }
        }
      }
      
      setSavingMessage('✅ Changes saved successfully! Refreshing data')
      clearPendingChanges()
      
      // Small delay to show success message
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Smooth reload
      window.location.reload()
    } catch (error) {
      console.error('Error saving changes:', error)
      setSavingMessage('')
      setIsLoading(false)
      alert(`❌ Save failed: ${error}`)
      throw error
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
      saveAllChanges,
      savingMessage
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

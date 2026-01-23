"use client"

import * as React from "react"

interface EditModeContextType {
  isEditMode: boolean
  setIsEditMode: (value: boolean) => void
  isLoading: boolean
  setIsLoading: (value: boolean) => void
}

const EditModeContext = React.createContext<EditModeContextType | undefined>(undefined)

export function EditModeProvider({ children }: { children: React.ReactNode }) {
  const [isEditMode, setIsEditMode] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)

  return (
    <EditModeContext.Provider value={{ isEditMode, setIsEditMode, isLoading, setIsLoading }}>
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

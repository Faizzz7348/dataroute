"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Delivery } from "@/app/data"

interface PowerModeModalProps {
  visible: boolean
  onHide: () => void
  rowData: Delivery | null
  onSave: (mode: string | null) => void
}

// Helper functions untuk check status
const isEvenDate = () => {
  const today = new Date().getDate()
  return today % 2 === 0
}

const isOddDate = () => {
  const today = new Date().getDate()
  return today % 2 !== 0
}

const isWeekday = () => {
  const day = new Date().getDay() // 0=Sunday, 6=Saturday
  return day >= 0 && day <= 4 // Sunday to Thursday
}

const isWeekend = () => {
  const day = new Date().getDay()
  return day >= 1 && day <= 5 // Monday to Friday
}

const getModeStatus = (mode: string | null): { isActive: boolean; label: string } => {
  switch(mode) {
    case 'daily':
      return { isActive: true, label: 'ON' }
    case 'alt1':
      return { isActive: isEvenDate(), label: isEvenDate() ? 'ON' : 'OFF' }
    case 'alt2':
      return { isActive: isOddDate(), label: isOddDate() ? 'ON' : 'OFF' }
    case 'weekday':
      return { isActive: isWeekday(), label: isWeekday() ? 'ON' : 'OFF' }
    case 'weekend':
      return { isActive: isWeekend(), label: isWeekend() ? 'ON' : 'OFF' }
    case 'notset':
    case null:
      return { isActive: false, label: 'Not Set' }
    default:
      return { isActive: false, label: 'Unknown' }
  }
}

export function PowerModeModal({ visible, onHide, rowData, onSave }: PowerModeModalProps) {
  const [selectedMode, setSelectedMode] = React.useState(rowData?.powerMode || null)
  const [tempSelectedMode, setTempSelectedMode] = React.useState(rowData?.powerMode || null)

  const powerModes = [
    { value: 'daily', label: 'Daily', icon: '📅', description: 'Delivery available every day' },
    { value: 'alt1', label: 'Alt 1', icon: '2️⃣', description: 'Delivery available on even dates only' },
    { value: 'alt2', label: 'Alt 2', icon: '1️⃣', description: 'Delivery available on odd dates only' },
    { value: 'weekday', label: 'Weekday', icon: '📆', description: 'On from Sunday to Thursday' },
    { value: 'weekend', label: 'Weekend', icon: '🗓️', description: 'On from Monday to Friday' },
    { value: 'notset', label: 'Not Set', icon: '❓', description: 'None' },
  ]

  React.useEffect(() => {
    if (visible) {
      setTempSelectedMode(rowData?.powerMode || null)
    }
  }, [visible, rowData])

  const handleCancel = () => {
    setTempSelectedMode(selectedMode)
    onHide()
  }

  const handleApply = () => {
    setSelectedMode(tempSelectedMode)
    if (onSave) {
      onSave(tempSelectedMode)
    }
    onHide()
  }

  return (
    <Dialog open={visible} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[520px] shadow-2xl" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Power Mode Configuration</DialogTitle>
          <DialogDescription className="text-sm">
            Configure power mode for <strong className="text-primary">{rowData?.location || 'this location'}</strong>
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-3">
            {powerModes.map((mode) => {
              const status = getModeStatus(mode.value)
              const isSelected = tempSelectedMode === mode.value
              
              return (
                <div
                  key={mode.label}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer hover:shadow-md ${
                    isSelected
                      ? 'border-primary/50 bg-primary/5 shadow-sm' 
                      : 'border-border hover:border-primary/30'
                  }`}
                  onClick={() => setTempSelectedMode(mode.value as string | null)}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-3xl p-2 bg-muted/50 rounded-lg">{mode.icon}</div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{mode.label}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded transition-colors ${
                          mode.value === 'notset' || mode.value === null
                            ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                            : status.isActive
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {status.label}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {mode.description}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setTempSelectedMode(mode.value as string | null)
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 shadow-inner ${
                      isSelected ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-all duration-300 ease-in-out ${
                        isSelected
                          ? 'translate-x-[22px]'
                          : 'translate-x-[2px]'
                      }`}
                    />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleCancel} className="hover:bg-muted transition-all duration-200">
            Cancel
          </Button>
          <Button onClick={handleApply} className="shadow-md hover:shadow-lg transition-all duration-200">
            Apply Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

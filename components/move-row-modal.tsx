"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Delivery } from "@/app/data"
import { useEditMode } from "@/contexts/edit-mode-context"
import { toast } from "sonner"
import { ArrowRight, CheckCircle2 } from "lucide-react"

interface Route {
  id: number
  name: string
  slug: string
  description?: string
}

interface MoveRowModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRouteSlug: string
  currentRouteId: number
  allData: Delivery[]
  onMoveComplete: () => void
}

export function MoveRowModal({
  open,
  onOpenChange,
  currentRouteSlug,
  allData,
  onMoveComplete,
}: MoveRowModalProps) {
  const { addPendingChange } = useEditMode()
  const [routes, setRoutes] = useState<Route[]>([])
  const [selectedRouteId, setSelectedRouteId] = useState<string>("")
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(false)

  // Fetch all routes
  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const response = await fetch('/api/routes')
        if (response.ok) {
          const data = await response.json()
          // Filter out current route
          const otherRoutes = data.filter((r: Route) => r.slug !== currentRouteSlug)
          setRoutes(otherRoutes)
        }
      } catch (error) {
        console.error('Error fetching routes:', error)
      }
    }
    if (open) {
      fetchRoutes()
    }
  }, [open, currentRouteSlug])

  // Reset selections when modal opens/closes
  useEffect(() => {
    if (!open) {
      setSelectedRows(new Set())
      setSelectedRouteId("")
    }
  }, [open])

  const handleSelectRow = (rowId: number, checked: boolean) => {
    const newSelected = new Set(selectedRows)
    if (checked) {
      newSelected.add(rowId)
    } else {
      newSelected.delete(rowId)
    }
    setSelectedRows(newSelected)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(allData.map(row => row.id))
      setSelectedRows(allIds)
    } else {
      setSelectedRows(new Set())
    }
  }

  const handleMoveRows = async () => {
    if (!selectedRouteId || selectedRows.size === 0) return

    setLoading(true)
    try {
      const targetRouteId = parseInt(selectedRouteId)
      const targetRoute = routes.find(r => r.id === targetRouteId)
      const movedCount = selectedRows.size
      
      // Add pending changes for each selected row
      Array.from(selectedRows).forEach(rowId => {
        const row = allData.find(r => r.id === rowId)
        if (row) {
          // Update the routeId for the row
          addPendingChange({
            id: rowId,
            type: 'update',
            data: {
              ...row,
              routeId: targetRouteId
            }
          })
        }
      })

      // Close modal immediately
      onOpenChange(false)
      
      // Show success toast
      toast.success(
        `Moved ${movedCount} row${movedCount !== 1 ? 's' : ''} to ${targetRoute?.name || 'destination route'}`,
        {
          description: "Changes will be applied when you save.",
          duration: 4000,
        }
      )

      // Call parent callback to refresh data (removes rows from UI)
      setTimeout(() => {
        onMoveComplete()
      }, 100)
    } catch (error) {
      console.error('Error moving rows:', error)
      toast.error("Failed to move rows", {
        description: "Please try again."
      })
    } finally {
      setLoading(false)
    }
  }

  const isAllSelected = allData.length > 0 && selectedRows.size === allData.length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <ArrowRight className="h-5 w-5 text-primary" />
            Move Rows to Another Route
          </DialogTitle>
          <DialogDescription>
            Select rows to move and choose the destination route. Changes will be applied when you save.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Route Selector with improved visual */}
          <div className="space-y-2 p-4 rounded-lg border-2 border-primary/20 bg-primary/5">
            <label className="text-sm font-semibold text-primary flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Destination Route
            </label>
            <Select value={selectedRouteId} onValueChange={setSelectedRouteId}>
              <SelectTrigger className="h-11 text-base font-medium">
                <SelectValue placeholder="Choose a route..." />
              </SelectTrigger>
              <SelectContent>
                {routes.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No other routes available
                  </div>
                ) : (
                  routes.map((route) => (
                    <SelectItem key={route.id} value={route.id.toString()} className="text-base">
                      <div className="flex items-center gap-2">
                        <ArrowRight className="h-4 w-4 text-primary" />
                        {route.name}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Data Table with improved styling */}
          <div className="flex-1 overflow-auto border-2 rounded-lg shadow-sm">
            <Table>
              <TableHeader className="sticky top-0 bg-muted/80 backdrop-blur-sm z-10">
                <TableRow className="h-10">
                  <TableHead className="w-14 py-2 text-center">
                    <div className="flex items-center justify-center">
                      <Checkbox
                        checked={isAllSelected}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all"
                        className="h-4 w-4"
                      />
                    </div>
                  </TableHead>
                  <TableHead className="w-20 font-semibold text-[11px] py-2 text-center">Code</TableHead>
                  <TableHead className="font-semibold text-[11px] py-2 text-center">Location</TableHead>
                  <TableHead className="w-28 font-semibold text-[11px] py-2 text-center">Delivery</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground h-32 text-sm">
                      No data available
                    </TableCell>
                  </TableRow>
                ) : (
                  allData.map((row) => (
                    <TableRow
                      key={row.id}
                      className={`h-10 transition-colors ${
                        selectedRows.has(row.id) 
                          ? "bg-primary/10 hover:bg-primary/15 border-l-4 border-l-primary" 
                          : "hover:bg-muted/50"
                      }`}
                    >
                      <TableCell className="py-2 text-center">
                        <div className="flex items-center justify-center">
                          <Checkbox
                            checked={selectedRows.has(row.id)}
                            onCheckedChange={(checked) =>
                              handleSelectRow(row.id, checked as boolean)
                            }
                            aria-label={`Select row ${row.code}`}
                            className="h-4 w-4"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-[11px] py-2 text-center">{row.code}</TableCell>
                      <TableCell className="text-[11px] py-2 leading-tight text-center">{row.location}</TableCell>
                      <TableCell className="py-2 text-center">
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-medium bg-muted leading-none">
                          {row.delivery}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Selection Info with improved design */}
          {selectedRows.size > 0 && (
            <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold text-primary">
                  {selectedRows.size} row{selectedRows.size !== 1 ? 's' : ''} selected
                </span>
              </div>
              {selectedRouteId && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Ready to move to</span>
                  <span className="font-medium text-foreground">
                    {routes.find(r => r.id.toString() === selectedRouteId)?.name}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleMoveRows}
            disabled={!selectedRouteId || selectedRows.size === 0 || loading}
            className="min-w-[140px]"
          >
            {loading ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Moving...
              </>
            ) : (
              <>
                <ArrowRight className="mr-2 h-4 w-4" />
                Move {selectedRows.size > 0 ? `${selectedRows.size} ` : ''}Row{selectedRows.size !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

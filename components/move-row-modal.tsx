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

      // Call parent callback to refresh data
      onMoveComplete()
      onOpenChange(false)
    } catch (error) {
      console.error('Error moving rows:', error)
    } finally {
      setLoading(false)
    }
  }

  const isAllSelected = allData.length > 0 && selectedRows.size === allData.length
  const isSomeSelected = selectedRows.size > 0 && selectedRows.size < allData.length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Move Rows to Another Route</DialogTitle>
          <DialogDescription>
            Select rows to move and choose the destination route. Selected rows will be moved when you save changes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Route Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Destination Route</label>
            <Select value={selectedRouteId} onValueChange={setSelectedRouteId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a route" />
              </SelectTrigger>
              <SelectContent>
                {routes.map((route) => (
                  <SelectItem key={route.id} value={route.id.toString()}>
                    {route.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Data Table */}
          <div className="flex-1 overflow-auto border rounded-md">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all"
                      className="translate-y-[2px]"
                      {...(isSomeSelected && { "data-indeterminate": true })}
                    />
                  </TableHead>
                  <TableHead className="w-20">Code</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Delivery</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No data available
                    </TableCell>
                  </TableRow>
                ) : (
                  allData.map((row) => (
                    <TableRow
                      key={row.id}
                      className={selectedRows.has(row.id) ? "bg-muted/50" : ""}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedRows.has(row.id)}
                          onCheckedChange={(checked) =>
                            handleSelectRow(row.id, checked as boolean)
                          }
                          aria-label={`Select row ${row.code}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{row.code}</TableCell>
                      <TableCell>{row.location}</TableCell>
                      <TableCell>{row.delivery}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Selection Info */}
          {selectedRows.size > 0 && (
            <div className="text-sm text-muted-foreground">
              {selectedRows.size} row{selectedRows.size !== 1 ? 's' : ''} selected
            </div>
          )}
        </div>

        <DialogFooter>
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
          >
            {loading ? "Moving..." : `Move ${selectedRows.size} Row${selectedRows.size !== 1 ? 's' : ''}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

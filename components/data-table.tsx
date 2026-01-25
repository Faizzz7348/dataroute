"use client"

/* eslint-disable @typescript-eslint/no-explicit-any */

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ChevronDown, ChevronUp, Info, Power, Minus, Plus, Settings, Edit, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

import { Delivery } from "@/app/data"
import { PowerModeModal } from "@/components/power-mode-modal"
import { InfoModal } from "@/components/info-modal"
import { MoveRowModal } from "@/components/move-row-modal"
import { useEditMode } from "@/contexts/edit-mode-context"

// Helper functions untuk check power mode status
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

const isPowerModeActive = (mode: string | null | undefined): boolean => {
  if (!mode || mode === 'notset') return false
  
  switch(mode) {
    case 'daily':
      return true
    case 'alt1':
      return isEvenDate()
    case 'alt2':
      return isOddDate()
    case 'weekday':
      return isWeekday()
    case 'weekend':
      return isWeekend()
    default:
      return false
  }
}

const getPowerIconColor = (mode: string | null | undefined): { bg: string; text: string; title: string } => {
  if (!mode || mode === 'notset') {
    return { 
      bg: 'rgba(148, 163, 184, 0.1)', 
      text: '#94a3b8',
      title: 'Not Set'
    }
  }
  
  const isActive = isPowerModeActive(mode)
  
  if (isActive) {
    return { 
      bg: 'rgba(34, 197, 94, 0.1)', 
      text: '#22c55e',
      title: 'Power ON'
    }
  } else {
    return { 
      bg: 'rgba(239, 68, 68, 0.1)', 
      text: '#ef4444',
      title: 'Power OFF'
    }
  }
}

interface DataTableProps {
  data: Delivery[]
  onLocationClick?: (locationName: string) => void
  onEditRow?: (rowId: number) => void
  onDeleteRow?: (rowId: number) => Promise<void>
  onAddRow?: (row: Delivery) => void
  onPowerModeChange?: (rowId: number, powerMode: string | null) => void
  onMoveComplete?: () => void
  currentRouteSlug?: string
  currentRouteId?: number
  showMap?: boolean
}

export function DataTable({ data, onLocationClick, onEditRow, onDeleteRow, onAddRow, onPowerModeChange, onMoveComplete, currentRouteSlug, currentRouteId, showMap = true }: DataTableProps) {
  'use no memo'
  
  const { isEditMode } = useEditMode()
  const [tableData, setTableData] = React.useState<Delivery[]>(data)
  const [columnDialogOpen, setColumnDialogOpen] = React.useState(false)
  const [rowDialogOpen, setRowDialogOpen] = React.useState(false)
  const [addRowDialogOpen, setAddRowDialogOpen] = React.useState(false)
  const [moveRowModalOpen, setMoveRowModalOpen] = React.useState(false)
  const [editRouteDialogOpen, setEditRouteDialogOpen] = React.useState(false)
  const [powerModalOpen, setPowerModalOpen] = React.useState(false)
  const [selectedPowerRow, setSelectedPowerRow] = React.useState<Delivery | null>(null)
  const [infoModalOpen, setInfoModalOpen] = React.useState(false)
  const [selectedInfoRow, setSelectedInfoRow] = React.useState<Delivery | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [selectedDeleteRow, setSelectedDeleteRow] = React.useState<Delivery | null>(null)
  const [newRowData, setNewRowData] = React.useState({ code: "", location: "", delivery: "" })
  const [newRowCodeError, setNewRowCodeError] = React.useState<string>('')
  const [checkingNewRowDuplicate, setCheckingNewRowDuplicate] = React.useState(false)
  const [rowCount, setRowCount] = React.useState(data.length)
  const [tempRowData, setTempRowData] = React.useState<Delivery[]>([])
  const [orderInputs, setOrderInputs] = React.useState<{ [key: number]: string }>({})
  const [routeInfo, setRouteInfo] = React.useState({ name: "", slug: "", description: "" })
  const [isUpdatingRoute, setIsUpdatingRoute] = React.useState(false)
  const [slugError, setSlugError] = React.useState<string>('')
  const [deleteRouteDialogOpen, setDeleteRouteDialogOpen] = React.useState(false)
  const [isDeletingRoute, setIsDeletingRoute] = React.useState(false)
  const [columnSettings, setColumnSettings] = React.useState([
    { id: "code", label: "Code", visible: true },
    { id: "location", label: "Location", visible: true },
    { id: "delivery", label: "Delivery", visible: true },
  ])
  const [duplicateCodes, setDuplicateCodes] = React.useState<Map<number, Array<{id: number, location: string, routeName: string, routeSlug: string}>>>(new Map())
  const [settingsDropdownOpen, setSettingsDropdownOpen] = React.useState(false)
  const duplicateCheckTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  React.useEffect(() => {
    const fetchRouteInfo = async () => {
      if (currentRouteSlug) {
        try {
          const response = await fetch(`/api/routes/${currentRouteSlug}`)
          if (response.ok) {
            const route = await response.json()
            setRouteInfo({ name: route.name, slug: route.slug, description: route.description || "" })
          }
        } catch (error) {
          console.error('Error fetching route info:', error)
        }
      }
    }
    fetchRouteInfo()
  }, [currentRouteSlug])

  // Check for duplicate codes
  React.useEffect(() => {
    const checkDuplicates = async () => {
      const duplicatesMap = new Map<number, Array<{id: number, location: string, routeName: string, routeSlug: string}>>()
      
      for (const delivery of data) {
        try {
          const params = new URLSearchParams({
            code: delivery.code.toString(),
            excludeId: delivery.id.toString()
          })
          
          const response = await fetch(`/api/locations/check-duplicate?${params}`)
          if (response.ok) {
            const result = await response.json()
            if (result.hasDuplicate) {
              duplicatesMap.set(delivery.code, result.duplicates)
            }
          }
        } catch (error) {
          console.error('Error checking duplicate for code:', delivery.code, error)
        }
      }
      
      setDuplicateCodes(duplicatesMap)
    }
    
    if (data.length > 0) {
      checkDuplicates()
    }
  }, [data])

  React.useEffect(() => {
    // Sort data berdasarkan power mode status, kemudian by code
    const sortedData = [...data].sort((a, b) => {
      const aMode = a.powerMode
      const bMode = b.powerMode
      
      // Calculate priority untuk setiap row
      const getPriority = (mode: string | null | undefined): number => {
        if (!mode || mode === 'notset') return 1 // Not set = middle (priority 1)
        
        const isActive = isPowerModeActive(mode)
        return isActive ? 2 : 0 // Active = top (priority 2), Inactive = bottom (priority 0)
      }
      
      const aPriority = getPriority(aMode)
      const bPriority = getPriority(bMode)
      
      // Sort descending by priority (higher priority first)
      if (bPriority !== aPriority) {
        return bPriority - aPriority
      }
      
      // Jika priority sama, sort by code ascending
      return a.code - b.code
    })
    
    setTableData(sortedData)
    setRowCount(sortedData.length)
  }, [data])

  const toggleColumnVisibility = (columnId: string) => {
    setColumnSettings(prev => 
      prev.map(col => 
        col.id === columnId ? { ...col, visible: !col.visible } : col
      )
    )
  }

  const moveColumn = (index: number, direction: 'up' | 'down') => {
    const newSettings = [...columnSettings]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    
    if (targetIndex >= 0 && targetIndex < columnSettings.length) {
      [newSettings[index], newSettings[targetIndex]] = [newSettings[targetIndex], newSettings[index]]
      setColumnSettings(newSettings)
    }
  }

  const adjustRowCount = (direction: 'up' | 'down') => {
    if (direction === 'up') {
      setRowCount(rowCount + 1)
    } else {
      if (rowCount > 1) {
        setRowCount(rowCount - 1)
      }
    }
  }

  const handleRowInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    if (!isNaN(value) && value > 0 && value <= 1000) {
      setRowCount(value)
    }
  }

  const openRowDialog = () => {
    setTempRowData([...tableData])
    setRowCount(tableData.length)
    setOrderInputs({})
    setRowDialogOpen(true)
  }

  const handleOrderChange = (rowIndex: number, value: string) => {
    setOrderInputs(prev => ({ ...prev, [rowIndex]: value }))
  }

  const handleOrderBlur = (rowIndex: number) => {
    const orderValue = orderInputs[rowIndex]
    if (!orderValue) return

    const orderNum = parseInt(orderValue)
    if (isNaN(orderNum) || orderNum < 1 || orderNum > tempRowData.length) {
      return
    }

    if (orderNum - 1 === rowIndex) {
      return
    }

    const newData = [...tempRowData]
    const item = newData[rowIndex]
    newData.splice(rowIndex, 1)
    newData.splice(orderNum - 1, 0, item)
    
    setTempRowData(newData)
    setOrderInputs({})
  }

  const applyRowOrder = () => {
    let finalData = [...tempRowData]
    
    // Apply row count adjustment
    if (rowCount !== finalData.length) {
      if (rowCount > finalData.length) {
        // Add new rows
        const rowsToAdd = rowCount - finalData.length
        for (let i = 0; i < rowsToAdd; i++) {
          const newId = Math.max(...finalData.map(row => row.id), 0) + i + 1
          finalData.push({
            id: newId,
            code: 0,
            location: "",
            delivery: "",
            lat: 0,
            lng: 0,
          })
        }
      } else {
        // Remove rows
        finalData = finalData.slice(0, rowCount)
      }
    }
    
    setTableData(finalData)
    setRowDialogOpen(false)
  }

  const handleAddNewRow = () => {
    const newId = Math.max(...tableData.map(row => row.id), 0) + 1
    const newRow: Delivery = {
      id: newId,
      code: parseInt(newRowData.code) || 0,
      location: newRowData.location || "",
      delivery: newRowData.delivery || "",
      lat: 0,
      lng: 0,
      color: "#3b82f6", // Default blue color
      powerMode: 'notset',
    }
    if (onAddRow) {
      onAddRow(newRow)
    }
    setTableData([...tableData, newRow])
    setNewRowData({ code: "", location: "", delivery: "" })
    setAddRowDialogOpen(false)
  }

  const handleDeleteRow = async () => {
    if (selectedDeleteRow) {
      try {
        if (onDeleteRow) {
          await onDeleteRow(selectedDeleteRow.id)
        }
        setTableData(tableData.filter(row => row.id !== selectedDeleteRow.id))
        setDeleteDialogOpen(false)
        setSelectedDeleteRow(null)
      } catch (error) {
        console.error('Error deleting row:', error)
        // Keep dialog open if error occurs
      }
    }
  }

  const columns: ColumnDef<Delivery>[] = [
    {
      id: "rowNumber",
      header: () => <div className="text-center font-bold">No</div>,
      cell: ({ row }) => {
        const rowIndex = row.index + 1
        return <div className="text-center font-bold text-primary">{rowIndex}</div>
      },
      enableSorting: false,
      size: 60,
    },
    ...columnSettings.filter(col => col.visible).map((colSetting): ColumnDef<Delivery> => {
      if (colSetting.id === "code") {
        return {
          accessorKey: "code",
          header: () => <div className="text-center">Code</div>,
          cell: ({ row }) => {
            const value = row.getValue("code") as number
            const duplicates = duplicateCodes.get(value)
            const hasDuplicate = duplicates && duplicates.length > 0
            
            return (
              <div className="text-center p-2 relative group">
                <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded ${
                  hasDuplicate 
                    ? 'bg-destructive/10 text-destructive font-semibold border border-destructive/30' 
                    : ''
                }`}>
                  {hasDuplicate && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                      <line x1="12" y1="9" x2="12" y2="13"/>
                      <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                  )}
                  {value}
                </div>
                {hasDuplicate && duplicates && (
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block z-50 w-64">
                    <div className="bg-destructive text-destructive-foreground text-xs rounded-lg p-3 shadow-lg border border-destructive/20">
                      <div className="font-semibold mb-1.5 flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"/>
                          <line x1="12" y1="8" x2="12" y2="12"/>
                          <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        Duplicate Code Detected!
                      </div>
                      <div className="text-xs opacity-90">
                        This code also exists in:
                        <ul className="mt-1 space-y-0.5">
                          {duplicates.map((dup, idx) => (
                            <li key={idx} className="pl-2 border-l-2 border-destructive-foreground/30">
                              • <strong>{dup.location}</strong>
                              <br />
                              <span className="text-[10px] opacity-75">Route: {dup.routeName}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          },
        }
      } else if (colSetting.id === "location") {
        return {
          accessorKey: "location",
          header: () => <div className="text-center">Location</div>,
          cell: ({ row, table }) => {
            const locationName = row.getValue("location") as string
            const onLocationClick = (table.options.meta as any)?.onLocationClick
            const showMap = (table.options.meta as any)?.showMap
            
            return (
              <div 
                className={`text-center p-2 rounded-md transition-all duration-200 ${
                  showMap 
                    ? 'cursor-pointer hover:bg-primary/10 hover:text-primary hover:font-medium' 
                    : ''
                }`}
                onClick={() => {
                  if (showMap) {
                    onLocationClick?.(locationName)
                  }
                }}
              >
                {locationName}
              </div>
            )
          },
        }
      } else {
        return {
          accessorKey: "delivery",
          header: () => <div className="text-center">Delivery</div>,
          cell: ({ row }) => {
            const value = row.getValue("delivery")
            return (
              <div className="text-center p-2">
                {value as string}
              </div>
            )
          },
        }
      }
    }),
    {
      id: "actions",
      enableHiding: false,
      header: () => <div className="text-center text-destructive font-semibold">Actions</div>,
      cell: ({ row, table }) => {
        const delivery = row.original
        const onEditRow = (table.options.meta as any)?.onEditRow
        const powerColor = getPowerIconColor(delivery.powerMode)
        const isActive = isPowerModeActive(delivery.powerMode)

        return (
          <div className="flex justify-center gap-1.5">
            {isEditMode && (
              <button
                onClick={() => onEditRow?.(delivery.id)}
                className="p-2 rounded-lg hover:bg-primary/10 hover:text-primary transition-all duration-200 group"
                title="Edit Row"
              >
                <Edit className="h-4 w-4 group-hover:scale-110 transition-transform" />
              </button>
            )}
            {isEditMode && (
              <button
                onClick={() => {
                  setSelectedDeleteRow(delivery)
                  setDeleteDialogOpen(true)
                }}
                className="p-2 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-all duration-200 group"
                title="Delete Row"
              >
                <Trash2 className="h-4 w-4 group-hover:scale-110 transition-transform" />
              </button>
            )}
            <button
              onClick={() => {
                setSelectedInfoRow(delivery)
                setInfoModalOpen(true)
              }}
              className="p-2 rounded-lg hover:bg-blue-500/10 hover:text-blue-600 transition-all duration-200 group"
              title="Info"
            >
              <Info className="h-4 w-4 group-hover:scale-110 transition-transform" />
            </button>
            <button
              onClick={() => {
                if (isEditMode) {
                  setSelectedPowerRow(delivery)
                  setPowerModalOpen(true)
                }
              }}
              className={`p-2 rounded-lg transition-all duration-200 group ${
                isEditMode ? 'cursor-pointer' : 'cursor-default'
              }`}
              title={powerColor.title}
              style={{
                color: powerColor.text
              }}
            >
              <Power className={`h-4 w-4 ${isEditMode ? 'group-hover:scale-110' : ''} transition-transform ${!isActive && delivery.powerMode && delivery.powerMode !== 'notset' ? 'animate-pulse' : ''}`} />
            </button>
          </div>
        )
      },
    },
  ]

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const table = useReactTable({
    data: tableData,
    columns,
    getRowId: (row) => String(row.id),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    enableSorting: false,
    manualSorting: true,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    meta: {
      onLocationClick,
      onEditRow,
      showMap,
    },
  })

  return (
    <div className="w-full">
      {/* Duplicate Warning Banner */}
      {duplicateCodes.size > 0 && (
        <div className="mb-4 p-4 rounded-lg border-2 border-destructive/30 bg-destructive/10 animate-pulse">
          <div className="flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-destructive flex-shrink-0 mt-0.5">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <div className="flex-1">
              <h3 className="font-bold text-destructive mb-1">⚠️ Duplicate Codes Detected!</h3>
              <p className="text-sm text-destructive/90 mb-2">
                The following code(s) are duplicated across multiple routes. You must resolve these duplicates before saving:
              </p>
              <ul className="space-y-1 text-sm">
                {Array.from(duplicateCodes.entries()).map(([code, dups]) => (
                  <li key={code} className="flex items-start gap-2">
                    <span className="font-semibold text-destructive">• Code {code}:</span>
                    <span className="text-destructive/90">
                      {dups.map(d => `${d.location} (${d.routeName})`).join(', ')}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-destructive/80 mt-2 font-medium">
                💡 Hover over the highlighted codes in the table to see details, or edit them to use unique values.
              </p>
            </div>
          </div>
        </div>
      )}
      <div className="rounded-lg border bg-card overflow-hidden">
        {/* Table Toolbar */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
          <div>
            <h2 className="text-base font-bold text-foreground">Data Management</h2>
            <p className="text-sm text-muted-foreground font-medium">Configure your table settings</p>
          </div>
          <DropdownMenu open={settingsDropdownOpen} onOpenChange={setSettingsDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 dark:from-blue-500/20 dark:to-purple-500/20 dark:hover:from-blue-500/30 dark:hover:to-purple-500/30 border border-blue-500/20 dark:border-blue-500/30 backdrop-blur-sm transition-all duration-300"
              >
                <Settings className={`h-4 w-4 transition-transform duration-500 ease-in-out ${
                  settingsDropdownOpen ? 'rotate-180' : 'rotate-0'
                }`} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="backdrop-blur-md bg-background/95 border-primary/20">
              <DropdownMenuItem
                onClick={() => setColumnDialogOpen(true)}
                className="cursor-pointer"
              >
                Column Settings
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => openRowDialog()}
                className="cursor-pointer"
              >
                Row Settings
              </DropdownMenuItem>
              {isEditMode && (
                <>
                  <DropdownMenuItem
                    onClick={() => setAddRowDialogOpen(true)}
                    className="cursor-pointer"
                  >
                    Add New Row
                  </DropdownMenuItem>
                  {currentRouteSlug && currentRouteId && (
                    <DropdownMenuItem
                      onClick={() => setMoveRowModalOpen(true)}
                      className="cursor-pointer"
                    >
                      Move Rows
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={() => setEditRouteDialogOpen(true)}
                    className="cursor-pointer"
                  >
                    Edit Route Info
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="overflow-auto max-h-[400px] bg-muted/30">
        <table className="w-full caption-bottom text-sm relative">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b sticky top-0 z-[30]">
                {headerGroup.headers.map((header) => {
                  return (
                    <th key={header.id} className="h-12 px-4 text-center align-middle font-bold text-foreground bg-background" style={{ fontSize: '13px' }}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody className="text-xs">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, rowIndex) => {
                const delivery = row.original
                const isActive = isPowerModeActive(delivery.powerMode)
                const hasMode = delivery.powerMode && delivery.powerMode !== 'notset'
                
                return (
                  <tr
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={`transition-all duration-200 ${
                      hasMode && !isActive 
                        ? 'opacity-40 bg-muted/20 hover:bg-primary/5' 
                        : 'hover:bg-primary/5'
                    }`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="p-3 align-middle text-center font-semibold">
                        {flexRender(
                          cell.column.columnDef.cell,
                          { ...cell.getContext(), rowIndex }
                        )}
                      </td>
                    ))}
                  </tr>
                )
              })
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="h-24 text-center p-4 align-middle"
                >
                  No results.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
        {/* Table Footer */}
        <div className="flex items-center justify-center px-4 py-3 border-t bg-muted/30">
          <div className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
            {rowCount} of {tableData.length} Records
          </div>
        </div>
      </div>

      {/* Column Settings Dialog */}
      <Dialog open={columnDialogOpen} onOpenChange={setColumnDialogOpen}>
        <DialogContent className="backdrop-blur-sm" onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Column Settings</DialogTitle>
            <DialogDescription>
              Customize which columns to display and their order.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {columnSettings.map((col, index) => (
              <div key={col.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/30 transition-all duration-200">
                <div className="flex items-center gap-3">
                  <Checkbox 
                    id={col.id}
                    checked={col.visible}
                    onCheckedChange={() => toggleColumnVisibility(col.id)}
                  />
                  <Label htmlFor={col.id} className="cursor-pointer font-normal text-sm">
                    {col.label}
                  </Label>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveColumn(index, 'up')}
                    disabled={index === 0}
                    className={index !== 0 ? 'text-green-700 dark:text-green-600 hover:text-green-800 dark:hover:text-green-500' : ''}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveColumn(index, 'down')}
                    disabled={index === columnSettings.length - 1}
                    className={index !== columnSettings.length - 1 ? 'text-green-700 dark:text-green-600 hover:text-green-800 dark:hover:text-green-500' : ''}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setColumnDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add New Row Dialog */}
      <Dialog open={addRowDialogOpen} onOpenChange={setAddRowDialogOpen}>
        <DialogContent className="backdrop-blur-sm" onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Add New Row</DialogTitle>
            <DialogDescription>
              Enter the details for the new row.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="code" className={newRowCodeError ? 'text-destructive' : ''}>Code</Label>
              <Input
                id="code"
                type="number"
                value={newRowData.code}
                onChange={(e) => {
                  const code = e.target.value
                  setNewRowData({ ...newRowData, code })
                  
                  // Clear previous timeout
                  if (duplicateCheckTimeoutRef.current) {
                    clearTimeout(duplicateCheckTimeoutRef.current)
                  }
                  
                  // Clear error immediately when typing
                  setNewRowCodeError('')
                  
                  if (code && !isNaN(parseInt(code))) {
                    // Debounce duplicate check - wait 500ms after user stops typing
                    duplicateCheckTimeoutRef.current = setTimeout(async () => {
                      setCheckingNewRowDuplicate(true)
                      try {
                        const params = new URLSearchParams({
                          code: code
                        })
                        
                        const response = await fetch(`/api/locations/check-duplicate?${params}`)
                        if (response.ok) {
                          const result = await response.json()
                          if (result.hasDuplicate) {
                            const duplicateInfo = result.duplicates.map((d: any) => 
                              `"${d.location}" in ${d.routeName}`
                            ).join(', ')
                            setNewRowCodeError(`Code ${code} already exists in: ${duplicateInfo}`)
                          }
                        }
                      } catch (error) {
                        console.error('Error checking duplicate:', error)
                      }
                      setCheckingNewRowDuplicate(false)
                    }, 500)
                  }
                }}
                placeholder="Enter code"
                className={newRowCodeError ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
              {checkingNewRowDuplicate && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Checking for duplicates...
                </p>
              )}
              {newRowCodeError && (
                <p className="text-sm text-destructive font-medium flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {newRowCodeError}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={newRowData.location}
                onChange={(e) => setNewRowData({ ...newRowData, location: e.target.value })}
                placeholder="Enter location"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="delivery">Delivery</Label>
              <Select
                value={newRowData.delivery}
                onValueChange={(value) => setNewRowData({ ...newRowData, delivery: value })}
              >
                <SelectTrigger id="delivery">
                  <SelectValue placeholder="Select delivery type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Daily">Daily</SelectItem>
                  <SelectItem value="Weekday">Weekday</SelectItem>
                  <SelectItem value="Alt 1">Alt 1</SelectItem>
                  <SelectItem value="Alt 2">Alt 2</SelectItem>
                  <SelectItem value="Weekly">Weekly</SelectItem>
                  <SelectItem value="Monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setAddRowDialogOpen(false)
              setNewRowData({ code: "", location: "", delivery: "" })
              setNewRowCodeError('')
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddNewRow}
              disabled={!!newRowCodeError || !newRowData.code || !newRowData.location || !newRowData.delivery}
              className={newRowCodeError ? 'opacity-50 cursor-not-allowed' : ''}
            >
              Add Row
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Row Settings Dialog */}
      <Dialog open={rowDialogOpen} onOpenChange={setRowDialogOpen}>
        <DialogContent className="max-w-[75vw] backdrop-blur-sm flex flex-col max-h-[80vh]" onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader className="space-y-2 pb-4 border-b flex-shrink-0">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Row Settings
            </DialogTitle>
            <DialogDescription className="text-base">
              Manage your table rows with ease - reorder and adjust row count
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-auto py-6 space-y-6">
            {/* Row Reorder Preview */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-1 bg-gradient-to-b from-primary to-primary/40 rounded-full"></div>
                <Label className="text-lg font-bold">Reorder Rows</Label>
              </div>
              <p className="text-sm text-muted-foreground pl-4">
                💡 Enter order number (1-{tempRowData.length}) to reorder rows. Changes will apply after clicking Apply button.
              </p>
              <div className="rounded-xl border-2 border-primary/10 overflow-hidden bg-gradient-to-br from-background to-muted/20">
                <div className="overflow-auto" style={{ height: '300px' }}>
                  <table className="w-full caption-bottom text-sm">
                    <thead>
                      <tr className="border-b-2 border-primary/20 sticky top-0 z-[30]">
                        <th className="h-12 px-4 text-center align-middle font-bold text-foreground w-[120px] bg-background" style={{ fontSize: '13px' }}>Order</th>
                        <th className="h-12 px-4 text-center align-middle font-bold text-foreground w-[150px] bg-background" style={{ fontSize: '13px' }}>Code</th>
                        <th className="h-12 px-4 text-center align-middle font-bold text-foreground w-[300px] bg-background" style={{ fontSize: '13px' }}>Location</th>
                        <th className="h-12 px-4 text-center align-middle font-bold text-foreground w-[250px] bg-background" style={{ fontSize: '13px' }}>Delivery</th>
                      </tr>
                    </thead>
                    <tbody>
                    {tempRowData.map((row, index) => (
                      <tr key={row.id} className="transition-all duration-200 hover:bg-primary/5">
                        <td className="p-3 align-middle text-center w-[120px]">
                          <Input
                            type="number"
                            value={orderInputs[index] || ''}
                            onChange={(e) => handleOrderChange(index, e.target.value)}
                            onBlur={() => handleOrderBlur(index)}
                            placeholder={(index + 1).toString()}
                            className="w-[80px] text-center text-sm h-9 font-semibold border-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
                            min={1}
                            max={tempRowData.length}
                          />
                        </td>
                        <td className="p-3 align-middle text-center text-sm font-semibold w-[150px]">{row.code}</td>
                        <td className="p-3 align-middle text-center text-sm font-medium w-[300px]">{row.location}</td>
                        <td className="p-3 align-middle text-center text-sm w-[250px]">{row.delivery}</td>
                      </tr>
                    ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="border-t-2 border-dashed border-primary/20" />

            {/* Row Count Control */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-6 w-1 bg-gradient-to-b from-primary to-primary/40 rounded-full"></div>
                <Label className="text-sm font-semibold">Entire Rows</Label>
              </div>
              {rowCount > tempRowData.length && (
                <div className="flex items-center gap-2 p-2 bg-destructive/10 border border-destructive/30 rounded-md">
                  <span className="text-sm">⚠️</span>
                  <p className="text-xs text-destructive font-medium">
                    This route has only {tempRowData.length} row{tempRowData.length !== 1 ? 's' : ''}. Please add new row at main table settings.
                  </p>
                </div>
              )}
              <div className="flex items-center justify-center gap-4 p-4 bg-gradient-to-br from-muted/30 to-muted/10 rounded-lg border border-primary/10">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => adjustRowCount('down')}
                  disabled={rowCount <= 1}
                  className="h-8 w-8 rounded-full hover:scale-110 transition-transform disabled:opacity-30"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  value={rowCount}
                  onChange={handleRowInputChange}
                  className={`w-28 text-center text-base font-bold h-9 rounded-lg border ${rowCount > tempRowData.length ? 'border-destructive text-destructive bg-destructive/5' : 'border-primary/30 focus:border-primary focus:ring-2 focus:ring-primary/20'}`}
                  min={1}
                  max={1000}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => adjustRowCount('up')}
                  className="h-8 w-8 rounded-full hover:scale-110 transition-transform"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-3 pt-4 border-t flex-shrink-0">
            <Button variant="outline" onClick={() => setRowDialogOpen(false)} className="px-6 h-11 text-base font-semibold">
              Cancel
            </Button>
            <Button onClick={applyRowOrder} disabled={rowCount > tempRowData.length} className="px-8 h-11 text-base font-semibold bg-gradient-to-r from-primary to-primary/80 transition-all">
              Apply Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Power Mode Modal */}
      <PowerModeModal
        visible={powerModalOpen}
        onHide={() => {
          setPowerModalOpen(false)
          setSelectedPowerRow(null)
        }}
        rowData={selectedPowerRow}
        onSave={(newMode) => {
          if (selectedPowerRow) {
            // Call parent handler if provided
            if (onPowerModeChange) {
              onPowerModeChange(selectedPowerRow.id, newMode)
            }
            
            // Update local data dengan power mode baru
            const updatedData = tableData.map((row) =>
              row.id === selectedPowerRow.id 
                ? { ...row, powerMode: newMode as 'daily' | 'alt1' | 'alt2' | 'weekday' | 'weekend' | 'notset' | null } 
                : row
            )
            
            // Sort semula berdasarkan priority, kemudian by code
            const sortedData = [...updatedData].sort((a, b) => {
              const getPriority = (mode: string | null | undefined): number => {
                if (!mode || mode === 'notset') return 1 // Not set = middle
                const isActive = isPowerModeActive(mode)
                return isActive ? 2 : 0 // Active = top, Inactive = bottom
              }
              
              const aPriority = getPriority(a.powerMode)
              const bPriority = getPriority(b.powerMode)
              
              // Jika priority sama, sort by code ascending
              if (aPriority === bPriority) {
                return a.code - b.code
              }
              
              return bPriority - aPriority
            })
            
            setTableData(sortedData)
          }
        }}
      />

      {/* Info Modal */}
      <InfoModal
        visible={infoModalOpen}
        onHide={() => {
          setInfoModalOpen(false)
          setSelectedInfoRow(null)
        }}
        rowData={selectedInfoRow}
        onSave={(descriptionsObj) => {
          if (selectedInfoRow) {
            const updatedData = tableData.map((row) =>
              row.id === selectedInfoRow.id ? { ...row, descriptionsObj } : row
            )
            setTableData(updatedData)
          }
        }}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Row</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this row? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedDeleteRow && (
            <div className="py-4 space-y-2">
              <div className="text-sm">
                <span className="font-semibold">Code:</span> {selectedDeleteRow.code}
              </div>
              <div className="text-sm">
                <span className="font-semibold">Location:</span> {selectedDeleteRow.location}
              </div>
              <div className="text-sm">
                <span className="font-semibold">Delivery:</span> {selectedDeleteRow.delivery}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteRow}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Route Dialog */}
      <Dialog open={editRouteDialogOpen} onOpenChange={setEditRouteDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Route Information</DialogTitle>
            <DialogDescription>
              Update the route name, slug (URL), and description
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="routeName">Route Name *</Label>
              <Input
                id="routeName"
                placeholder="e.g., KL 7 - 3PVK04"
                value={routeInfo.name}
                onChange={(e) => setRouteInfo({ ...routeInfo, name: e.target.value })}
                disabled={isUpdatingRoute}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="routeSlug" className={slugError ? 'text-destructive' : ''}>Route Slug (URL) *</Label>
              <Input
                id="routeSlug"
                placeholder="e.g., kl-7"
                value={routeInfo.slug}
                onChange={(e) => {
                  const newSlug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')
                  setRouteInfo({ ...routeInfo, slug: newSlug })
                  setSlugError('')
                }}
                disabled={isUpdatingRoute}
                className={slugError ? 'border-destructive' : ''}
              />
              {slugError && (
                <p className="text-sm text-destructive font-medium">{slugError}</p>
              )}
              <p className="text-xs text-muted-foreground">
                This will change the URL. Use lowercase and hyphens only. Page will redirect to new URL.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="routeDescription">Description</Label>
              <Input
                id="routeDescription"
                placeholder="Route description"
                value={routeInfo.description}
                onChange={(e) => setRouteInfo({ ...routeInfo, description: e.target.value })}
                disabled={isUpdatingRoute}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button 
              variant="destructive" 
              onClick={() => {
                setEditRouteDialogOpen(false)
                setDeleteRouteDialogOpen(true)
              }}
              disabled={isUpdatingRoute}
              className="mr-auto"
            >
              Delete Route
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setEditRouteDialogOpen(false)}
              disabled={isUpdatingRoute}
            >
              Cancel
            </Button>
            <Button 
              onClick={async () => {
                if (!currentRouteSlug || !routeInfo.name.trim() || !routeInfo.slug.trim()) return
                
                // Validate slug format
                if (!/^[a-z0-9-]+$/.test(routeInfo.slug)) {
                  setSlugError('Slug must contain only lowercase letters, numbers, and hyphens')
                  return
                }
                
                setIsUpdatingRoute(true)
                try {
                  const response = await fetch(`/api/routes/${currentRouteSlug}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      name: routeInfo.name,
                      slug: routeInfo.slug,
                      description: routeInfo.description
                    })
                  })
                  
                  if (response.ok) {
                    setEditRouteDialogOpen(false)
                    // If slug changed, redirect to new URL
                    if (routeInfo.slug !== currentRouteSlug) {
                      window.location.href = `/${routeInfo.slug}`
                    } else {
                      // Just reload if slug didn't change
                      window.location.reload()
                    }
                  } else {
                    const error = await response.json()
                    setSlugError(error.error || 'Failed to update route')
                  }
                } catch (error) {
                  console.error('Error updating route:', error)
                  setSlugError('Failed to update route. Please try again.')
                } finally {
                  setIsUpdatingRoute(false)
                }
              }}
              disabled={isUpdatingRoute || !routeInfo.name.trim() || !routeInfo.slug.trim() || !!slugError}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isUpdatingRoute ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Updating...
                </span>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Route Confirmation Dialog */}
      <Dialog open={deleteRouteDialogOpen} onOpenChange={setDeleteRouteDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete Route</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this route? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-destructive text-xl">⚠️</span>
                <div className="flex-1">
                  <p className="font-semibold text-destructive">Warning: Permanent Deletion</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Deleting "<strong>{routeInfo.name}</strong>" will permanently remove:
                  </p>
                  <ul className="text-sm text-muted-foreground mt-2 ml-4 list-disc space-y-1">
                    <li>The route and all its settings</li>
                    <li>All locations associated with this route</li>
                    <li>All delivery data for this route</li>
                  </ul>
                  <p className="text-sm text-destructive font-medium mt-3">
                    This action cannot be undone!
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setDeleteRouteDialogOpen(false)}
              disabled={isDeletingRoute}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={async () => {
                if (!currentRouteSlug) return
                
                setIsDeletingRoute(true)
                try {
                  const response = await fetch(`/api/routes/${currentRouteSlug}`, {
                    method: 'DELETE'
                  })
                  
                  if (response.ok) {
                    const result = await response.json()
                    // Show success message
                    alert(`✅ ${result.message}`)
                    // Redirect to home
                    window.location.href = '/'
                  } else {
                    const error = await response.json()
                    alert(`❌ ${error.error || 'Failed to delete route'}`)
                  }
                } catch (error) {
                  console.error('Error deleting route:', error)
                  alert('❌ Failed to delete route. Please try again.')
                } finally {
                  setIsDeletingRoute(false)
                }
              }}
              disabled={isDeletingRoute}
            >
              {isDeletingRoute ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Deleting...
                </span>
              ) : (
                'Delete Permanently'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move Row Modal */}
      {currentRouteSlug && currentRouteId && (
        <MoveRowModal
          open={moveRowModalOpen}
          onOpenChange={setMoveRowModalOpen}
          currentRouteSlug={currentRouteSlug}
          currentRouteId={currentRouteId}
          allData={tableData}
          onMoveComplete={() => {
            // Call parent callback to refresh data
            onMoveComplete?.()
          }}
        />
      )}
    </div>
  )
}

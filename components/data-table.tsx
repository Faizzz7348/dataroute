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
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ChevronDown, ChevronUp, Info, Power, Minus, Plus, Settings, Edit } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

import { Delivery } from "@/app/data"
import { PowerModeModal } from "@/components/power-mode-modal"
import { InfoModal } from "@/components/info-modal"
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
  showMap?: boolean
}

export function DataTable({ data, onLocationClick, onEditRow, showMap = true }: DataTableProps) {
  'use no memo'
  
  const { isEditMode } = useEditMode()
  const [tableData, setTableData] = React.useState<Delivery[]>(data)
  const [columnDialogOpen, setColumnDialogOpen] = React.useState(false)
  const [rowDialogOpen, setRowDialogOpen] = React.useState(false)
  const [addRowDialogOpen, setAddRowDialogOpen] = React.useState(false)
  const [powerModalOpen, setPowerModalOpen] = React.useState(false)
  const [selectedPowerRow, setSelectedPowerRow] = React.useState<Delivery | null>(null)
  const [infoModalOpen, setInfoModalOpen] = React.useState(false)
  const [selectedInfoRow, setSelectedInfoRow] = React.useState<Delivery | null>(null)
  const [newRowData, setNewRowData] = React.useState({ code: "", location: "", delivery: "" })
  const [rowCount, setRowCount] = React.useState(data.length)
  const [tempRowData, setTempRowData] = React.useState<Delivery[]>([])
  const [orderInputs, setOrderInputs] = React.useState<{ [key: number]: string }>({})
  const [columnSettings, setColumnSettings] = React.useState([
    { id: "code", label: "Code", visible: true },
    { id: "location", label: "Location", visible: true },
    { id: "delivery", label: "Delivery", visible: true },
  ])

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
    const newCount = direction === 'up' ? rowCount + 1 : Math.max(1, rowCount - 1)
    setRowCount(newCount)
  }

  const handleRowInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    if (!isNaN(value) && value > 0 && value <= 1000) {
      setRowCount(value)
    }
  }

  const openRowDialog = () => {
    setTempRowData([...tableData])
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
    setTableData(tempRowData)
    setRowDialogOpen(false)
  }

  const handleAddNewRow = () => {
    const newId = Math.max(...tableData.map(row => row.id), 0) + 1
    const newRow: Delivery = {
      id: newId,
      code: parseInt(newRowData.code) || 0,
      location: newRowData.location,
      delivery: newRowData.delivery,
      lat: 0,
      lng: 0,
    }
    setTableData([...tableData, newRow])
    setNewRowData({ code: "", location: "", delivery: "" })
    setAddRowDialogOpen(false)
  }

  const columns: ColumnDef<Delivery>[] = [
    {
      id: "rowNumber",
      header: () => <div className="text-center font-bold">No</div>,
      cell: ({ table, ...context }) => {
        const pageIndex = table.getState().pagination.pageIndex
        const pageSize = table.getState().pagination.pageSize
        const visualRowIndex = (context as any).rowIndex ?? 0
        const sequentialNo = pageIndex * pageSize + visualRowIndex + 1
        return <div className="text-center font-bold text-primary">{sequentialNo}</div>
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
            const value = row.getValue("code")
            return (
              <div className="text-center p-2">
                {value as number}
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
                    ? 'cursor-pointer hover:bg-primary/10 hover:text-primary hover:font-medium hover:shadow-sm' 
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
      header: () => <div className="text-center">Actions</div>,
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
                isEditMode ? 'hover:shadow-md cursor-pointer' : 'cursor-default'
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
    getPaginationRowModel: getPaginationRowModel(),
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
      <div className="flex items-center justify-between py-6">
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg border bg-card shadow-md hover:shadow-lg transition-all duration-200">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-sm">
              <svg className="h-5 w-5 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                Data Management
                <span className="px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full">Active</span>
              </h2>
              <p className="text-xs text-muted-foreground font-medium">Configure your table settings</p>
            </div>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="shadow-sm hover:shadow-md transition-all duration-200">
              <Settings className="mr-2 h-4 w-4" />
              Settings
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
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
              <DropdownMenuItem
                onClick={() => setAddRowDialogOpen(true)}
                className="cursor-pointer"
              >
                Add New Row
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-lg border shadow-sm bg-card overflow-hidden transition-all duration-200 hover:shadow-md">
        <div className="overflow-auto max-h-[600px]">
        <Table>
          <TableHeader className="sticky top-0 bg-muted/50 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-muted/50 border-b-2 border-primary/10">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="text-center font-semibold text-foreground bg-muted/50">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="text-xs">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, rowIndex) => {
                const delivery = row.original
                const isActive = isPowerModeActive(delivery.powerMode)
                const hasMode = delivery.powerMode && delivery.powerMode !== 'notset'
                
                return (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={`transition-all duration-300 ${
                      hasMode && !isActive 
                        ? 'opacity-40 bg-muted/20 hover:bg-muted/30' 
                        : 'hover:bg-muted/30'
                    }`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="text-center">
                        {flexRender(
                          cell.column.columnDef.cell,
                          { ...cell.getContext(), rowIndex }
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between py-6 px-2">
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
            {table.getFilteredRowModel().rows.length} Records
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="shadow-sm hover:shadow-md transition-all duration-200"
          >
            Previous
          </Button>
          <div className="px-3 py-1 text-sm text-muted-foreground font-medium">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="shadow-sm hover:shadow-md transition-all duration-200"
          >
            Next
          </Button>
        </div>
        </div>
      </div>

      {/* Column Settings Dialog */}
      <Dialog open={columnDialogOpen} onOpenChange={setColumnDialogOpen}>
        <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
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
        <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Add New Row</DialogTitle>
            <DialogDescription>
              Enter the details for the new row.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                type="number"
                value={newRowData.code}
                onChange={(e) => setNewRowData({ ...newRowData, code: e.target.value })}
                placeholder="Enter code"
              />
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
              <Input
                id="delivery"
                value={newRowData.delivery}
                onChange={(e) => setNewRowData({ ...newRowData, delivery: e.target.value })}
                placeholder="Enter delivery"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setAddRowDialogOpen(false)
              setNewRowData({ code: "", location: "", delivery: "" })
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddNewRow}
              disabled={!newRowData.code || !newRowData.location || !newRowData.delivery}
            >
              Add Row
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Row Settings Dialog */}
      <Dialog open={rowDialogOpen} onOpenChange={setRowDialogOpen}>
        <DialogContent className="max-w-7xl max-h-[70vh]" onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Row Settings</DialogTitle>
            <DialogDescription>
              Adjust the number of rows and reorder them.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Row Reorder Preview */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Reorder Rows</Label>
              <p className="text-xs text-muted-foreground">
                Enter order number (1-{tempRowData.length}) to reorder rows. Changes will apply after clicking Apply button.
              </p>
              <div className="rounded-md border">
                <div className="max-h-[300px] overflow-y-auto overflow-x-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead className="[&_tr]:border-b sticky top-0 z-50 bg-muted shadow-sm">
                      <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted bg-muted">
                        <th className="h-10 px-2 text-center align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] w-[120px] text-xs bg-muted">Order</th>
                        <th className="h-10 px-2 text-center align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] w-[150px] text-xs bg-muted">Code</th>
                        <th className="h-10 px-2 text-center align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] w-[300px] text-xs bg-muted">Location</th>
                        <th className="h-10 px-2 text-center align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] w-[250px] text-xs bg-muted">Delivery</th>
                      </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                    {tempRowData.map((row, index) => (
                      <tr key={row.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <td className="p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] text-center w-[120px]">
                          <Input
                            type="number"
                            value={orderInputs[index] || ''}
                            onChange={(e) => handleOrderChange(index, e.target.value)}
                            onBlur={() => handleOrderBlur(index)}
                            placeholder={(index + 1).toString()}
                            className="w-[70px] text-center text-xs h-8"
                            min={1}
                            max={tempRowData.length}
                          />
                        </td>
                        <td className="p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] text-center text-xs w-[150px]">{row.code}</td>
                        <td className="p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] text-center text-xs w-[300px]">{row.location}</td>
                        <td className="p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] text-center text-xs w-[250px]">{row.delivery}</td>
                      </tr>
                    ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="border-t" />

            {/* Row Count Control */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Number of Rows</Label>
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => adjustRowCount('down')}
                  disabled={rowCount <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  value={rowCount}
                  onChange={handleRowInputChange}
                  className="w-32 text-center"
                  min={1}
                  max={1000}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => adjustRowCount('up')}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRowDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={applyRowOrder}>
              Apply
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
            // Update data dengan power mode baru
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
    </div>
  )
}

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
import { ChevronDown, ChevronUp, Info, Power, Minus, Plus, Settings } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
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

interface DataTableProps {
  data: Delivery[]
  onLocationClick?: (locationName: string) => void
  showMap?: boolean
}

export function DataTable({ data, onLocationClick, showMap = true }: DataTableProps) {
  "use no memo"
  
  const [editingCell, setEditingCell] = React.useState<{ rowId: string; columnId: string } | null>(null)
  const [tableData, setTableData] = React.useState<Delivery[]>(data)
  const [columnDialogOpen, setColumnDialogOpen] = React.useState(false)
  const [rowDialogOpen, setRowDialogOpen] = React.useState(false)
  const [rowCount, setRowCount] = React.useState(data.length)
  const [tempRowData, setTempRowData] = React.useState<Delivery[]>([])
  const [orderInputs, setOrderInputs] = React.useState<{ [key: number]: string }>({})
  const [columnSettings, setColumnSettings] = React.useState([
    { id: "code", label: "Code", visible: true },
    { id: "location", label: "Location", visible: true },
    { id: "delivery", label: "Delivery", visible: true },
  ])

  React.useEffect(() => {
    setTableData(data)
    setRowCount(data.length)
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

  const updateData = (rowId: string, columnId: string, value: any) => {
    setTableData((old) =>
      old.map((row) => {
        if (String(row.id) === rowId) {
          return {
            ...row,
            [columnId]: columnId === "code" ? Number(value) : value,
          }
        }
        return row
      })
    )
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
            const rowId = row.id
            const columnId = "code"
            const isEditing = editingCell?.rowId === rowId && editingCell?.columnId === columnId
            const value = row.getValue("code")

            if (isEditing) {
              return (
                <input
                  type="number"
                  defaultValue={value as number}
                  className="w-full text-center bg-transparent focus:outline-none"
                  autoFocus
                  onBlur={(e) => {
                    updateData(rowId, columnId, e.target.value)
                    setEditingCell(null)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      updateData(rowId, columnId, e.currentTarget.value)
                      setEditingCell(null)
                    }
                    if (e.key === "Escape") {
                      setEditingCell(null)
                    }
                  }}
                />
              )
            }

            return (
              <div 
                className="text-center cursor-pointer hover:bg-muted/50 p-2 rounded"
                onClick={() => setEditingCell({ rowId, columnId })}
              >
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
            const rowId = row.id
            const columnId = "location"
            const isEditing = editingCell?.rowId === rowId && editingCell?.columnId === columnId
            const locationName = row.getValue("location") as string
            const onLocationClick = (table.options.meta as any)?.onLocationClick
            const showMap = (table.options.meta as any)?.showMap

            if (isEditing) {
              return (
                <input
                  type="text"
                  defaultValue={locationName}
                  className="w-full text-center bg-transparent focus:outline-none"
                  autoFocus
                  onBlur={(e) => {
                    updateData(rowId, columnId, e.target.value)
                    setEditingCell(null)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      updateData(rowId, columnId, e.currentTarget.value)
                      setEditingCell(null)
                    }
                    if (e.key === "Escape") {
                      setEditingCell(null)
                    }
                  }}
                />
              )
            }
            
            return (
              <div 
                className={`text-center p-2 rounded ${showMap ? 'cursor-pointer hover:text-primary hover:underline' : 'cursor-pointer hover:bg-muted/50'} transition-colors`}
                onClick={() => {
                  if (showMap) {
                    onLocationClick?.(locationName)
                  } else {
                    setEditingCell({ rowId, columnId })
                  }
                }}
                onDoubleClick={() => setEditingCell({ rowId, columnId })}
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
            const rowId = row.id
            const columnId = "delivery"
            const isEditing = editingCell?.rowId === rowId && editingCell?.columnId === columnId
            const value = row.getValue("delivery")

            if (isEditing) {
              return (
                <select
                  defaultValue={value as string}
                  className="w-full text-center bg-background focus:outline-none cursor-pointer px-2 py-1"
                  style={{ textAlignLast: 'center' }}
                  autoFocus
                  onChange={(e) => {
                    updateData(rowId, columnId, e.target.value)
                    setEditingCell(null)
                  }}
                  onBlur={() => {
                    setEditingCell(null)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setEditingCell(null)
                    }
                  }}
                >
                  <option value="Daily" className="text-center">Daily</option>
                  <option value="Weekday" className="text-center">Weekday</option>
                  <option value="Alt 1" className="text-center">Alt 1</option>
                  <option value="Alt 2" className="text-center">Alt 2</option>
                </select>
              )
            }

            return (
              <div 
                className="text-center cursor-pointer hover:bg-muted/50 p-2 rounded"
                onClick={() => setEditingCell({ rowId, columnId })}
              >
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
      header: () => <div className="text-center">Action</div>,
      cell: ({ row }) => {
        const delivery = row.original

        return (
          <div className="flex justify-center gap-2">
            <button
              onClick={() => console.log("Info clicked:", delivery)}
              className="p-1 hover:text-primary transition-colors"
              title="Info"
            >
              <Info className="h-4 w-4" />
            </button>
            <button
              onClick={() => console.log("Power off clicked:", delivery)}
              className="p-1 hover:text-destructive transition-colors"
              title="Power Off"
            >
              <Power className="h-4 w-4" />
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
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    enableSorting: false,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    meta: {
      onLocationClick,
      showMap,
    },
  })

  return (
    <div className="w-full">
      <div className="flex items-center justify-end py-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Settings
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuCheckboxItem
              onSelect={() => setColumnDialogOpen(true)}
              className="text-center justify-center cursor-pointer"
            >
              Column Settings
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              onSelect={() => openRowDialog()}
              className="text-center justify-center cursor-pointer"
            >
              Row Settings
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="text-center">
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
              table.getRowModel().rows.map((row, rowIndex) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
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
              ))
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
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} row(s) total.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Column Settings Dialog */}
      <Dialog open={columnDialogOpen} onOpenChange={setColumnDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Column Settings</DialogTitle>
            <DialogDescription>
              Customize which columns to display and their order.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {columnSettings.map((col, index) => (
              <div key={col.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Checkbox 
                    id={col.id}
                    checked={col.visible}
                    onCheckedChange={() => toggleColumnVisibility(col.id)}
                  />
                  <Label htmlFor={col.id} className="cursor-pointer font-normal">
                    {col.label}
                  </Label>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveColumn(index, 'up')}
                    disabled={index === 0}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveColumn(index, 'down')}
                    disabled={index === columnSettings.length - 1}
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

      {/* Row Settings Dialog */}
      <Dialog open={rowDialogOpen} onOpenChange={setRowDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Row Settings</DialogTitle>
            <DialogDescription>
              Adjust the number of rows and reorder them.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
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
                <div className="px-6 py-2 text-2xl font-bold border-2 rounded-lg min-w-[100px] text-center">
                  {rowCount}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => adjustRowCount('up')}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex justify-center">
                <Input
                  type="number"
                  value={rowCount}
                  onChange={handleRowInputChange}
                  className="w-32 text-center"
                  min={1}
                  max={1000}
                />
              </div>
            </div>

            <div className="border-t" />

            {/* Row Reorder Preview */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Reorder Rows</Label>
              <p className="text-sm text-muted-foreground">
                Enter order number (1-{tempRowData.length}) to reorder rows. Changes will apply after clicking Apply button.
              </p>
              <div className="max-h-[400px] overflow-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center w-[90px]">Order</TableHead>
                      <TableHead className="text-center">Code</TableHead>
                      <TableHead className="text-center">Location</TableHead>
                      <TableHead className="text-center">Delivery</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tempRowData.map((row, index) => (
                      <TableRow key={row.id}>
                        <TableCell className="text-center">
                          <Input
                            type="number"
                            value={orderInputs[index] || ''}
                            onChange={(e) => handleOrderChange(index, e.target.value)}
                            onBlur={() => handleOrderBlur(index)}
                            placeholder={(index + 1).toString()}
                            className="w-[50px] text-center text-xs h-8"
                            min={1}
                            max={tempRowData.length}
                          />
                        </TableCell>
                        <TableCell className="text-center text-sm">{row.code}</TableCell>
                        <TableCell className="text-center text-sm">{row.location}</TableCell>
                        <TableCell className="text-center text-sm">{row.delivery}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
    </div>
  )
}

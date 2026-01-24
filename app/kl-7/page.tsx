"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { ModeToggle } from "@/components/mode-toggle"
import { usePageLoading } from "@/contexts/page-loading-context"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Eye, EyeOff } from "lucide-react"
import dynamic from "next/dynamic"
import { DataTable } from "@/components/data-table"
import { Delivery } from "@/app/data"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const MapComponent = dynamic(
  () => import("@/components/map-component").then((mod) => mod.MapComponent),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[500px] items-center justify-center rounded-lg border bg-muted">
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    ),
  }
)

export default function KL7Page() {
  const { showPageLoading } = usePageLoading()
  const [mounted, setMounted] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<Delivery | null>(null)
  const [showMap, setShowMap] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingRow, setEditingRow] = useState<Delivery | null>(null)
  const [codeError, setCodeError] = useState<string>('')
  const [deliveryData, setDeliveryData] = useState<Delivery[]>([])

  useEffect(() => {
    showPageLoading("Opening Route KL-7", 800)
    setTimeout(() => setMounted(true), 800)
  }, [showPageLoading])

  // Fetch data from database
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/routes/kl-7/locations')
        if (response.ok) {
          const data = await response.json()
          setDeliveryData(data.sort((a: Delivery, b: Delivery) => a.code - b.code))
        }
      } catch (error) {
        console.error('Error fetching locations:', error)
      }
    }
    fetchData()
  }, [])

  // Function to find location by name and fly to it
  const handleLocationClick = (locationName: string) => {
    const delivery = deliveryData.find((del) => 
      del.location.toLowerCase().includes(locationName.toLowerCase()) ||
      locationName.toLowerCase().includes(del.location.toLowerCase())
    )
    if (delivery) {
      setSelectedLocation(delivery)
    }
  }

  // Function to check for duplicate code
  const checkDuplicateCode = (code: number, currentId: number): boolean => {
    return deliveryData.some(del => del.code === code && del.id !== currentId)
  }

  // Function to handle edit row - receives the row id
  const handleEditRow = (rowId: number) => {
    const row = deliveryData.find((del) => del.id === rowId)
    if (row) {
      setEditingRow({ ...row })
      setCodeError('')
      setEditModalOpen(true)
    }
  }

  // Function to save edited row
  const handleSaveRow = async () => {
    if (editingRow) {
      // Check for duplicate code
      if (checkDuplicateCode(editingRow.code, editingRow.id)) {
        setCodeError(`Code ${editingRow.code} already exists. Please use a unique code.`)
        return
      }
      
      try {
        // Call API to update in database
        const response = await fetch(`/api/locations/${editingRow.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(editingRow),
        })

        if (!response.ok) {
          throw new Error('Failed to update location')
        }

        // Update local state after successful API call
        setDeliveryData((prev) =>
          prev.map((del) =>
            del.id === editingRow.id ? editingRow : del
          ).sort((a, b) => a.code - b.code)
        )
        setEditModalOpen(false)
        setEditingRow(null)
        setCodeError('')
      } catch (error) {
        console.error('Error updating location:', error)
        setCodeError('Failed to save changes. Please try again.')
      }
    }
  }

  // Function to delete row
  const handleDeleteRow = async (rowId: number) => {
    try {
      // Call API to delete from database
      const response = await fetch(`/api/locations/${rowId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete location')
      }

      // Update local state after successful API call
      setDeliveryData((prev) => prev.filter((del) => del.id !== rowId))
    } catch (error) {
      console.error('Error deleting location:', error)
      throw error // Re-throw to let DataTable handle the error
    }
  }

  if (!mounted) return null

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb className="flex-1">
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/">
                  Home
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>KL 7</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <ModeToggle />
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 relative z-0">
          {/* Map Section - Full Width */}
          <div className="rounded-lg border p-4 relative z-0">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold">Map View</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMap(!showMap)}
                className="flex items-center gap-2"
              >
                {showMap ? (
                  <>
                    <EyeOff className="h-4 w-4 text-red-600" />
                    <span className="text-red-600">Hide Map</span>
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 text-green-600" />
                    <span className="text-green-600">Show Map</span>
                  </>
                )}
              </Button>
            </div>
            <div 
              className={`overflow-hidden transition-all duration-700 ease-in-out ${
                showMap ? 'max-h-[500px] opacity-100 scale-100' : 'max-h-0 opacity-0 scale-95'
              }`}
              style={{ 
                transformOrigin: 'top center',
              }}
            >
              <div 
                style={{ height: "500px" }}
                className={`transition-transform duration-700 ease-out ${
                  showMap ? 'scale-100' : 'scale-90'
                }`}
              >
                {showMap && (
                  <MapComponent locations={deliveryData} selectedLocation={selectedLocation} />
                )}
              </div>
            </div>
          </div>

          {/* Data Table Section - Full Width */}
          <DataTable 
            data={deliveryData} 
            onLocationClick={handleLocationClick} 
            onEditRow={handleEditRow}
            onDeleteRow={handleDeleteRow}
            showMap={showMap} 
          />
        </div>

        {/* Edit Row Modal */}
        <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
          <DialogContent className="sm:max-w-[500px]" onOpenAutoFocus={(e) => e.preventDefault()}>
            <DialogHeader>
              <DialogTitle>Edit Delivery Row</DialogTitle>
              <DialogDescription>
                Update all fields including code, location, delivery type, coordinates, and marker color
              </DialogDescription>
            </DialogHeader>
            {editingRow && (
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="code" className={codeError ? 'text-destructive' : ''}>Code</Label>
                  <Input
                    id="code"
                    type="number"
                    value={editingRow.code}
                    onChange={(e) => {
                      const newCode = parseInt(e.target.value) || 0
                      setEditingRow({ ...editingRow, code: newCode })
                      // Check for duplicate as user types
                      if (checkDuplicateCode(newCode, editingRow.id)) {
                        setCodeError(`Code ${newCode} already exists. Please use a unique code.`)
                      } else {
                        setCodeError('')
                      }
                    }}
                    placeholder="Enter code"
                    className={codeError ? 'border-destructive focus-visible:ring-destructive' : ''}
                  />
                  {codeError && (
                    <p className="text-sm text-destructive font-medium flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                      {codeError}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location-name">Location Name</Label>
                  <Input
                    id="location-name"
                    value={editingRow.location}
                    onChange={(e) =>
                      setEditingRow({ ...editingRow, location: e.target.value })
                    }
                    placeholder="Enter location name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="delivery-type">Delivery Type</Label>
                  <select
                    id="delivery-type"
                    value={editingRow.delivery}
                    onChange={(e) =>
                      setEditingRow({ ...editingRow, delivery: e.target.value })
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="Daily">Daily</option>
                    <option value="Weekday">Weekday</option>
                    <option value="Alt 1">Alt 1</option>
                    <option value="Alt 2">Alt 2</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="0.0001"
                      value={editingRow.lat}
                      onChange={(e) =>
                        setEditingRow({
                          ...editingRow,
                          lat: parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder="Latitude"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="0.0001"
                      value={editingRow.lng}
                      onChange={(e) =>
                        setEditingRow({
                          ...editingRow,
                          lng: parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder="Longitude"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="marker-color">Marker Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="marker-color"
                      type="color"
                      value={editingRow.color || "#3b82f6"}
                      onChange={(e) =>
                        setEditingRow({
                          ...editingRow,
                          color: e.target.value,
                        })
                      }
                      className="w-20 h-10 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={editingRow.color || "#3b82f6"}
                      onChange={(e) =>
                        setEditingRow({
                          ...editingRow,
                          color: e.target.value,
                        })
                      }
                      placeholder="#3b82f6"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSaveRow}
                disabled={!!codeError}
                className={codeError ? 'opacity-50 cursor-not-allowed' : ''}
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  )
}

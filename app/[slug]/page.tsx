"use client"

import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { AppSidebar } from "@/components/app-sidebar"
import { ModeToggle } from "@/components/mode-toggle"
import { usePageLoading } from "@/contexts/page-loading-context"
import { useEditMode } from "@/contexts/edit-mode-context"
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
import { Map, MapPin } from "lucide-react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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

export default function RoutePage() {
  const params = useParams()
  const slug = params.slug as string
  const { showPageLoading } = usePageLoading()
  const { addPendingChange } = useEditMode()
  const [mounted, setMounted] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<Delivery | null>(null)
  const [showMap, setShowMap] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingRow, setEditingRow] = useState<Delivery | null>(null)
  const [codeError, setCodeError] = useState<string>('')
  const [deliveryData, setDeliveryData] = useState<Delivery[]>([])
  const [newRowIds, setNewRowIds] = useState<Set<number>>(new Set())
  const [routeId, setRouteId] = useState<number>(1)
  const [routeName, setRouteName] = useState<string>('')
  const [notFound, setNotFound] = useState(false)
  const [checkingDuplicate, setCheckingDuplicate] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const duplicateCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    showPageLoading(`Opening Route ${slug.toUpperCase()}`, 1000)
    setTimeout(() => setMounted(true), 1000)
  }, [showPageLoading, slug])

  // Fetch data from database
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // ✅ FIX: Fetch route first to get the correct routeId
        const routeResponse = await fetch(`/api/routes/${slug}`)
        if (routeResponse.ok) {
          const route = await routeResponse.json()
          setRouteName(route.name)
          setRouteId(route.id) // ✅ Set routeId from route, not from locations!
          
          // Now fetch locations for this route
          const locationsResponse = await fetch(`/api/routes/${slug}/locations`)
          if (locationsResponse.ok) {
            const data = await locationsResponse.json()
            setDeliveryData(data.sort((a: Delivery, b: Delivery) => a.code - b.code))
          }
          setNotFound(false)
        } else if (routeResponse.status === 404) {
          setNotFound(true)
        }
      } catch (error) {
        console.error('Error fetching route data:', error)
        setNotFound(true)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [slug])

  const handleLocationClick = (locationName: string) => {
    const delivery = deliveryData.find((del) => 
      del.location.toLowerCase().includes(locationName.toLowerCase()) ||
      locationName.toLowerCase().includes(del.location.toLowerCase())
    )
    if (delivery) {
      setSelectedLocation(delivery)
    }
  }

  const checkDuplicateCode = async (code: number, excludeId?: number): Promise<{hasDuplicate: boolean, duplicates: Array<{id: number, code: number, location: string, routeId: number, routeName: string, routeSlug: string}>}> => {
    try {
      const params = new URLSearchParams({
        code: code.toString(),
        ...(excludeId ? { excludeId: excludeId.toString() } : {})
      })
      
      const response = await fetch(`/api/locations/check-duplicate?${params}`)
      if (response.ok) {
        return await response.json()
      }
      return { hasDuplicate: false, duplicates: [] }
    } catch (error) {
      console.error('Error checking duplicate:', error)
      return { hasDuplicate: false, duplicates: [] }
    }
  }

  const handleEditRow = (rowId: number) => {
    const row = deliveryData.find((del) => del.id === rowId)
    if (row) {
      setEditingRow({ ...row })
      setCodeError('')
      setEditModalOpen(true)
    }
  }

  const handleSaveRow = async () => {
    if (editingRow) {
      setCheckingDuplicate(true)
      const duplicateCheck = await checkDuplicateCode(editingRow.code, editingRow.id)
      setCheckingDuplicate(false)
      
      if (duplicateCheck.hasDuplicate) {
        const duplicateInfo = duplicateCheck.duplicates.map(d => 
          `"${d.location}" in route ${d.routeName}`
        ).join(', ')
        setCodeError(`Code ${editingRow.code} already exists in: ${duplicateInfo}. Please use a unique code or resolve the duplicate.`)
        return
      }
      
      try {
        const isNewRow = newRowIds.has(editingRow.id)
        
        // ✅ FIX: Always ensure routeId is correct for both create and update
        addPendingChange({
          id: editingRow.id,
          type: isNewRow ? 'create' : 'update',
          data: { ...editingRow, routeId } // Always set routeId to current route
        })

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

  const handleDeleteRow = async (rowId: number) => {
    try {
      addPendingChange({
        id: rowId,
        type: 'delete'
      })

      setDeliveryData((prev) => prev.filter((del) => del.id !== rowId))
    } catch (error) {
      console.error('Error deleting location:', error)
      throw error
    }
  }

  const handleAddRow = (row: Delivery) => {
    setNewRowIds((prev) => new Set(prev).add(row.id))
    
    addPendingChange({
      id: row.id,
      type: 'create',
      data: { ...row, routeId }
    })
    
    setDeliveryData((prev) => [...prev, row].sort((a, b) => a.code - b.code))
  }

  const handlePowerModeChange = (rowId: number, powerMode: string | null) => {
    const row = deliveryData.find((del) => del.id === rowId)
    if (row) {
      const isNewRow = newRowIds.has(rowId)
      const updatedRow = { ...row, powerMode: powerMode as 'daily' | 'alt1' | 'alt2' | 'weekday' | 'weekend' | 'notset' | null }
      
      // ✅ FIX: Always ensure routeId is correct
      addPendingChange({
        id: rowId,
        type: isNewRow ? 'create' : 'update',
        data: { ...updatedRow, routeId } // Always set routeId to current route
      })
      
      setDeliveryData((prev) =>
        prev.map((del) => (del.id === rowId ? updatedRow : del))
      )
    }
  }

  const handleMoveComplete = async () => {
    try {
      const response = await fetch(`/api/routes/${slug}/locations`)
      if (response.ok) {
        const data = await response.json()
        setDeliveryData(data.sort((a: Delivery, b: Delivery) => a.code - b.code))
      }
    } catch (error) {
      console.error('Error refreshing locations:', error)
    }
  }

  if (!mounted) return null

  if (notFound) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="fixed top-0 left-0 right-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b bg-background backdrop-blur-xl shadow-sm px-4 md:left-64">
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
                  <BreadcrumbPage>Route Not Found</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <ModeToggle />
          </header>
          <div className="pt-16 flex flex-1 flex-col gap-4 p-4">
            <div className="flex flex-col items-center justify-center flex-1 gap-4">
              <h1 className="text-4xl font-bold text-destructive">Route Not Found</h1>
              <p className="text-muted-foreground">The route <strong>{slug}</strong> does not exist.</p>
              <Button asChild>
                <Link href="/">Go Home</Link>
              </Button>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="fixed top-0 left-0 right-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b bg-background backdrop-blur-xl shadow-sm px-4 md:left-64">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 h-4"
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
                <BreadcrumbPage>{routeName || slug.toUpperCase()}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowMap(!showMap)}
              className={`transition-colors ${
                showMap 
                  ? 'text-primary hover:text-primary/80 border-primary/30' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title={showMap ? 'Hide Map' : 'Show Map'}
            >
              {showMap ? (
                <MapPin className="h-4 w-4" />
              ) : (
                <Map className="h-4 w-4" />
              )}
            </Button>
          </div>
          <ModeToggle />
        </header>
        <div className="pt-16 flex flex-1 flex-col gap-4 p-4 overflow-y-auto">
          <div 
            className={`overflow-hidden transition-all duration-500 ease-in-out ${
              showMap 
                ? 'max-h-[520px] opacity-100 scale-100 mb-4' 
                : 'max-h-0 opacity-0 scale-95 mb-0'
            }`}
            style={{
              transformOrigin: 'top center',
            }}
          >
            <div 
              className={`rounded-lg border overflow-hidden shadow-md transition-all duration-500 ${
                showMap ? 'translate-y-0' : '-translate-y-4'
              }`}
              style={{ height: "500px" }}
            >
              {showMap && (
                <MapComponent locations={deliveryData} selectedLocation={selectedLocation} />
              )}
            </div>
          </div>

          <div>
            {isLoading ? (
              <div className="flex items-center justify-center h-[400px]">
                <p className="text-muted-foreground">Loading data...</p>
              </div>
            ) : (
              <DataTable 
                data={deliveryData} 
                onLocationClick={handleLocationClick} 
                onEditRow={handleEditRow}
                onDeleteRow={handleDeleteRow}
                onAddRow={handleAddRow}
                onPowerModeChange={handlePowerModeChange}
                onMoveComplete={handleMoveComplete}
                currentRouteSlug={slug}
                currentRouteId={routeId}
                showMap={showMap} 
              />
            )}
          </div>
        </div>

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
                      
                      // Clear previous timeout
                      if (duplicateCheckTimeoutRef.current) {
                        clearTimeout(duplicateCheckTimeoutRef.current)
                      }
                      
                      // Clear error immediately when typing
                      setCodeError('')
                      
                      // Debounce duplicate check - wait 500ms after user stops typing
                      duplicateCheckTimeoutRef.current = setTimeout(async () => {
                        setCheckingDuplicate(true)
                        const duplicateCheck = await checkDuplicateCode(newCode, editingRow.id)
                        setCheckingDuplicate(false)
                        
                        if (duplicateCheck.hasDuplicate) {
                          const duplicateInfo = duplicateCheck.duplicates.map(d => 
                            `"${d.location}" in ${d.routeName}`
                          ).join(', ')
                          setCodeError(`Code ${newCode} already exists in: ${duplicateInfo}`)
                        }
                      }, 500)
                    }}
                    placeholder="Enter code"
                    className={codeError ? 'border-destructive focus-visible:ring-destructive' : ''}
                  />
                  {checkingDuplicate && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Checking for duplicates...
                    </p>
                  )}
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
                  <Select
                    value={editingRow.delivery}
                    onValueChange={(value) =>
                      setEditingRow({ ...editingRow, delivery: value })
                    }
                  >
                    <SelectTrigger id="delivery-type">
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
                  <Label htmlFor="website-link">Website Link</Label>
                  <Input
                    id="website-link"
                    type="url"
                    value={editingRow.descriptionsObj?.websiteLink || ""}
                    onChange={(e) =>
                      setEditingRow({
                        ...editingRow,
                        descriptionsObj: {
                          ...editingRow.descriptionsObj,
                          websiteLink: e.target.value,
                        },
                      })
                    }
                    placeholder="https://example.com"
                  />
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

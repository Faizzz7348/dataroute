"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { ModeToggle } from "@/components/mode-toggle"
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
import { locations } from "./locations"
import { Eye, EyeOff } from "lucide-react"
import dynamic from "next/dynamic"
import { DataTable } from "@/components/data-table"
import { deliveries } from "@/app/data"
import { Button } from "@/components/ui/button"

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
  const [selectedLocation, setSelectedLocation] = useState<typeof locations[0] | null>(null)
  const [showMap, setShowMap] = useState(true)

  // Function to find location by name and fly to it
  const handleLocationClick = (locationName: string) => {
    const location = locations.find((loc) => 
      loc.name.toLowerCase().includes(locationName.toLowerCase()) ||
      locationName.toLowerCase().includes(loc.name.toLowerCase())
    )
    if (location) {
      setSelectedLocation(location)
    }
  }

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
              <h2 className="text-lg font-semibold">Map View</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMap(!showMap)}
                className="flex items-center gap-2"
              >
                {showMap ? (
                  <>
                    <EyeOff className="h-4 w-4" />
                    Hide Map
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" />
                    Show Map
                  </>
                )}
              </Button>
            </div>
            <div style={{ height: showMap ? "500px" : "0", overflow: "hidden" }}>
              <MapComponent locations={locations} selectedLocation={selectedLocation} />
            </div>
          </div>

          {/* Data Table Section - Full Width */}
          <div className="rounded-lg border p-4 relative z-0">
            <h2 className="mb-4 text-lg font-semibold">Delivery Locations</h2>
            <DataTable data={deliveries} onLocationClick={handleLocationClick} showMap={showMap} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

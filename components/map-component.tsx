"use client"

import { useState, useEffect } from "react"
import { Delivery } from "@/app/data"

interface MapComponentProps {
  locations: Delivery[]
  selectedLocation: Delivery | null
}

export function MapComponent({ locations, selectedLocation }: MapComponentProps) {
  // Calculate center from locations
  const calculateCenter = () => {
    const validLocations = locations.filter(loc => 
      loc.lat !== 0 && loc.lng !== 0 && 
      parseFloat(loc.lat.toString()) !== 0 && 
      parseFloat(loc.lng.toString()) !== 0
    )
    
    if (validLocations.length === 0) {
      return { lat: 3.1390, lng: 101.6869 } // Default to KL
    }
    
    const avgLat = validLocations.reduce((sum, loc) => sum + loc.lat, 0) / validLocations.length
    const avgLng = validLocations.reduce((sum, loc) => sum + loc.lng, 0) / validLocations.length
    return { lat: avgLat, lng: avgLng }
  }
  
  const [mapCenter, setMapCenter] = useState(calculateCenter())
  const [zoom, setZoom] = useState(10)

  // Update map when selectedLocation changes
  useEffect(() => {
    console.log('🗺️ MapComponent - selectedLocation changed:', selectedLocation)
    if (selectedLocation && selectedLocation.lat !== 0 && selectedLocation.lng !== 0) {
      console.log('✈️ Flying to:', { lat: selectedLocation.lat, lng: selectedLocation.lng })
      setMapCenter({ lat: selectedLocation.lat, lng: selectedLocation.lng })
      setZoom(16) // Closer zoom for selected location
    }
  }, [selectedLocation])

  // Update map when locations change
  useEffect(() => {
    if (!selectedLocation) {
      const newCenter = calculateCenter()
      setMapCenter(newCenter)
      setZoom(10) // Default zoom for overview
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locations])

  // Calculate bbox based on zoom level
  const getBbox = () => {
    const zoomFactors: Record<number, number> = {
      10: 0.1,
      13: 0.02,
      16: 0.005,
    }
    const factor = zoomFactors[zoom] || 0.1
    return {
      minLng: mapCenter.lng - factor,
      minLat: mapCenter.lat - factor * 0.5,
      maxLng: mapCenter.lng + factor,
      maxLat: mapCenter.lat + factor * 0.5,
    }
  }

  const bbox = getBbox()

  return (
    <div className="relative w-full h-full overflow-hidden rounded-lg">
      <iframe
        key={`${mapCenter.lat}-${mapCenter.lng}-${zoom}`}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
        src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox.minLng},${bbox.minLat},${bbox.maxLng},${bbox.maxLat}&layer=mapnik&marker=${mapCenter.lat},${mapCenter.lng}`}
        className="animate-in fade-in zoom-in-95 duration-700 ease-out"
      />
      {/* Hide OpenStreetMap footer completely */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-background"></div>
    </div>
  )
}

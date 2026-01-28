"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { Delivery } from "@/app/data"

interface MapComponentProps {
  locations: Delivery[]
  selectedLocation: Delivery | null
}

export function MapComponent({ locations, selectedLocation }: MapComponentProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  
  // Calculate center from locations - memoized
  const defaultCenter = useMemo(() => {
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
  }, [locations])
  
  const [mapCenter, setMapCenter] = useState(defaultCenter)
  const [zoom, setZoom] = useState(10)
  const updateTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Update map when selectedLocation changes
  useEffect(() => {
    if (updateTimerRef.current) {
      clearTimeout(updateTimerRef.current)
    }
    
    if (selectedLocation && selectedLocation.lat !== 0 && selectedLocation.lng !== 0) {
      updateTimerRef.current = setTimeout(() => {
        setMapCenter({ lat: selectedLocation.lat, lng: selectedLocation.lng })
        setZoom(16)
      }, 400)
    } else if (!selectedLocation) {
      // Reset to default when no selection
      updateTimerRef.current = setTimeout(() => {
        setMapCenter(defaultCenter)
        setZoom(10)
      }, 400)
    }
    
    return () => {
      if (updateTimerRef.current) {
        clearTimeout(updateTimerRef.current)
      }
    }
  }, [selectedLocation, defaultCenter])

  // Calculate bbox
  const bbox = useMemo(() => {
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
  }, [mapCenter, zoom])
  
  // Stable map URL with rounded coordinates
  const mapUrl = useMemo(() => {
    const roundedLat = Math.round(mapCenter.lat * 10000) / 10000
    const roundedLng = Math.round(mapCenter.lng * 10000) / 10000
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox.minLng},${bbox.minLat},${bbox.maxLng},${bbox.maxLat}&layer=mapnik&marker=${roundedLat},${roundedLng}`
  }, [mapCenter.lat, mapCenter.lng, bbox])

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden bg-muted/20">
      <iframe
        ref={iframeRef}
        key={mapUrl}
        width="100%"
        height="100%"
        style={{ 
          border: 0,
          display: 'block',
          marginBottom: '-50px'
        }}
        loading="lazy"
        allowFullScreen
        src={mapUrl}
      />
    </div>
  )
}

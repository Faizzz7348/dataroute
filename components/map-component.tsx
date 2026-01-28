"use client"

import { useEffect, useMemo, useRef } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import { Delivery } from "@/app/data"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

interface MapComponentProps {
  locations: Delivery[]
  selectedLocation: Delivery | null
}

// Fix default marker icon issue with webpack
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
})

// Component to handle map updates
function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap()
  
  useEffect(() => {
    map.setView(center, zoom, { animate: true })
  }, [map, center, zoom])
  
  return null
}

// Component to fit bounds when locations change
function FitBounds({ locations, selectedLocation }: { locations: Delivery[]; selectedLocation: Delivery | null }) {
  const map = useMap()
  
  useEffect(() => {
    if (selectedLocation) return // Don't auto-fit if there's a selected location
    
    const validLocations = locations.filter(loc => 
      loc.lat !== 0 && loc.lng !== 0 && 
      parseFloat(loc.lat.toString()) !== 0 && 
      parseFloat(loc.lng.toString()) !== 0
    )
    
    if (validLocations.length === 0) return
    
    if (validLocations.length === 1) {
      map.setView([validLocations[0].lat, validLocations[0].lng], 13)
    } else {
      const bounds = L.latLngBounds(validLocations.map(loc => [loc.lat, loc.lng]))
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 })
    }
  }, [locations, selectedLocation, map])
  
  return null
}

export function MapComponent({ locations, selectedLocation }: MapComponentProps) {
  const mapRef = useRef<L.Map | null>(null)
  
  // Filter valid locations (dengan koordinat yang valid)
  const validLocations = useMemo(() => {
    return locations.filter(loc => 
      loc.lat !== 0 && loc.lng !== 0 && 
      parseFloat(loc.lat.toString()) !== 0 && 
      parseFloat(loc.lng.toString()) !== 0
    )
  }, [locations])
  
  // Calculate center from locations
  const defaultCenter: [number, number] = useMemo(() => {
    if (validLocations.length === 0) {
      return [3.1390, 101.6869] // Default to KL
    }
    
    const avgLat = validLocations.reduce((sum, loc) => sum + loc.lat, 0) / validLocations.length
    const avgLng = validLocations.reduce((sum, loc) => sum + loc.lng, 0) / validLocations.length
    return [avgLat, avgLng]
  }, [validLocations])
  
  // Determine map center and zoom based on selected location
  const { center, zoom } = useMemo(() => {
    if (selectedLocation && selectedLocation.lat !== 0 && selectedLocation.lng !== 0) {
      return {
        center: [selectedLocation.lat, selectedLocation.lng] as [number, number],
        zoom: 16
      }
    }
    return {
      center: defaultCenter,
      zoom: 10
    }
  }, [selectedLocation, defaultCenter])
  
  // Create custom icons for markers
  const createCustomIcon = (color: string, isSelected: boolean) => {
    const size = isSelected ? 35 : 25
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          width: ${size}px;
          height: ${size}px;
          background: ${color};
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: white;
          font-size: ${isSelected ? '14px' : '10px'};
          ${isSelected ? 'animation: pulse 2s infinite;' : ''}
        ">
          ${isSelected ? '📍' : ''}
        </div>
        <style>
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
        </style>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      popupAnchor: [0, -(size / 2)]
    })
  }

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden bg-muted/20">
      <MapContainer
        ref={mapRef}
        center={defaultCenter}
        zoom={10}
        style={{ height: "100%", width: "100%" }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapUpdater center={center} zoom={zoom} />
        <FitBounds locations={validLocations} selectedLocation={selectedLocation} />
        
        {/* Render all markers from the datatable */}
        {validLocations.map((location) => {
          const isSelected = selectedLocation?.id === location.id
          const markerColor = location.color || "#3b82f6"
          
          return (
            <Marker
              key={location.id}
              position={[location.lat, location.lng]}
              icon={createCustomIcon(markerColor, isSelected)}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <h3 className="font-bold text-lg mb-2">{location.location}</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-semibold">Code:</span> {location.code}</p>
                    <p><span className="font-semibold">Delivery:</span> {location.delivery}</p>
                    <p><span className="font-semibold">Coordinates:</span><br/>
                      {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                    </p>
                    {location.descriptionsObj?.websiteLink && (
                      <p>
                        <a 
                          href={location.descriptionsObj.websiteLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Visit Website →
                        </a>
                      </p>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
      
      {/* Info badge showing number of markers */}
      <div className="absolute top-4 right-4 z-[1000] bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="text-sm font-semibold">
          📍 {validLocations.length} location{validLocations.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  )
}

"use client"

import { useEffect, useMemo, useRef, useState } from "react"
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
    map.setView(center, zoom, { 
      animate: true,
      duration: 1.2,
      easeLinearity: 0.05,
      noMoveStart: false
    })
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
      map.setView([validLocations[0].lat, validLocations[0].lng], 13, {
        animate: true,
        duration: 1.3,
        easeLinearity: 0.05
      })
    } else {
      const bounds = L.latLngBounds(validLocations.map(loc => [loc.lat, loc.lng]))
      map.fitBounds(bounds, { 
        padding: [50, 50], 
        maxZoom: 15,
        animate: true,
        duration: 1.3,
        easeLinearity: 0.05
      })
    }
  }, [locations, selectedLocation, map])
  
  return null
}

export function MapComponent({ locations, selectedLocation }: MapComponentProps) {
  const mapRef = useRef<L.Map | null>(null)
  const [isVisible] = useState(true)
  
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
  
  // Create standard Leaflet icons for markers (red for selected, blue for others)
  const createStandardIcon = (isSelected: boolean) => {
    if (isSelected) {
      return new L.Icon({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
        iconSize: [20, 32],
        iconAnchor: [10, 32],
        popupAnchor: [0, -28],
        shadowSize: [32, 32]
      })
    }
    return new L.Icon({
      iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
      iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      iconSize: [20, 32],
      iconAnchor: [10, 32],
      popupAnchor: [0, -28],
      shadowSize: [32, 32]
    })
  }

  return (
    <div className={`relative w-full h-full rounded-lg overflow-hidden bg-muted/20 transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] transform ${
      isVisible ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-full opacity-0 scale-95'
    }`}>
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
          
          return (
            <Marker
              key={location.id}
              position={[location.lat, location.lng]}
              icon={createStandardIcon(isSelected)}
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
      
      {/* Reset zoom button */}
      <button 
        onClick={() => {
          if (mapRef.current) {
            mapRef.current.setView(defaultCenter, 10, {
              animate: true,
              duration: 1.5,
              easeLinearity: 0.05
            })
          }
        }}
        className="absolute top-4 right-4 z-[1000] bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-500 ease-out hover:scale-110 hover:translate-x-[-4px] hover:shadow-2xl"
        title="Reset zoom"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
        </svg>
      </button>
    </div>
  )
}

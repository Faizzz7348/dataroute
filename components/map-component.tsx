"use client"

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect } from "react"
import L from "leaflet"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import { Delivery } from "@/app/data"

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
})

interface MapComponentProps {
  locations: Delivery[]
  selectedLocation: Delivery | null
}

function FlyToLocation({ location }: { location: Delivery | null }) {
  const map = useMap()

  useEffect(() => {
    if (location) {
      map.flyTo([location.lat, location.lng], 13, {
        duration: 3.5,
        easeLinearity: 0.15,
        animate: true,
      })
    }
  }, [location, map])

  return null
}

function MapResizeHandler() {
  const map = useMap()

  useEffect(() => {
    // Force map to recalculate size when component mounts or updates
    const timer = setTimeout(() => {
      map.invalidateSize()
    }, 100)

    // Listen for window resize and sidebar toggle events
    const handleResize = () => {
      map.invalidateSize()
    }

    window.addEventListener('resize', handleResize)
    
    // Also listen for transition end to catch sidebar animations
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize()
    })
    
    const container = map.getContainer().parentElement
    if (container) {
      resizeObserver.observe(container)
    }

    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', handleResize)
      resizeObserver.disconnect()
    }
  }, [map])

  return null
}

function FitBounds({ locations }: { locations: Delivery[] }) {
  const map = useMap()

  useEffect(() => {
    const validLocations = locations.filter(loc => loc.lat !== 0 && loc.lng !== 0)
    if (validLocations.length > 0) {
      const bounds = L.latLngBounds(
        validLocations.map((loc) => [loc.lat, loc.lng] as [number, number])
      )
      
      // Fit bounds with closer padding for tighter zoom
      map.fitBounds(bounds, {
        padding: [30, 30], // Reduced from default 50, 50
        maxZoom: 15, // Maximum zoom level when fitting bounds
        animate: true,
        duration: 1
      })
    }
  }, [locations, map])

  return null
}

export function MapComponent({ locations, selectedLocation }: MapComponentProps) {
  // Filter out locations with no coordinates (lat: 0, lng: 0)
  const validLocations = locations.filter(loc => loc.lat !== 0 && loc.lng !== 0)
  
  return (
    <MapContainer
      center={[3.1319, 101.5841]}
      zoom={7}
      className="leaflet-map"
      style={{ height: "100%", width: "100%" }}
      zoomAnimation={true}
      fadeAnimation={true}
      markerZoomAnimation={true}
      zoomControl={true}
      preferCanvas={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        className="map-tiles"
      />
      {validLocations.map((location) => (
        <Marker 
          key={location.id} 
          position={[location.lat, location.lng]}
          riseOnHover={true}
        >
          <Popup
            closeButton={true}
            autoClose={false}
            className="custom-popup"
          >
            <div className="map-popup">
              <h3 className="popup-title">{location.location}</h3>
              <div className="popup-details">
                <p className="popup-item">
                  <strong>Code:</strong> {location.code}
                </p>
                <p className="popup-item">
                  <strong>Delivery:</strong> {location.delivery}
                </p>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
      <FitBounds locations={validLocations} />
      <FlyToLocation location={selectedLocation} />
      <MapResizeHandler />
    </MapContainer>
  )
}

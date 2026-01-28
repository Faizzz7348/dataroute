export type Delivery = {
  id: number
  code: number
  location: string
  delivery: string
  lat: number
  lng: number
  routeId?: number
  color?: string
  powerMode?: 'daily' | 'alt1' | 'alt2' | 'weekday' | 'weekend' | 'notset' | null
  descriptionsObj?: Record<string, string>
}

// Mock data removed - Using database data only
export const deliveries: Delivery[] = []

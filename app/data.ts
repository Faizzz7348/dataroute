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

export const deliveries: Delivery[] = [
  {
    id: 1,
    code: 43,
    location: "KPJ Damansara",
    delivery: "Daily",
    lat: 3.1319,
    lng: 101.5841,
    color: "#3b82f6",
  },
  {
    id: 2,
    code: 87,
    location: "KPJ Seremban",
    delivery: "Weekly",
    lat: 2.7258,
    lng: 101.9424,
    color: "#ef4444",
  },
  {
    id: 3,
    code: 52,
    location: "KPJ Ipoh",
    delivery: "Daily",
    lat: 4.5975,
    lng: 101.0901,
    color: "#10b981",
  },
  {
    id: 4,
    code: 19,
    location: "KPJ Johor",
    delivery: "Monthly",
    lat: 1.4927,
    lng: 103.7414,
    color: "#f59e0b",
  },
  {
    id: 5,
    code: 64,
    location: "KPJ Penang",
    delivery: "Daily",
    lat: 5.4164,
    lng: 100.3327,
    color: "#8b5cf6",
  },
  {
    id: 6,
    code: 28,
    location: "KPJ Melaka",
    delivery: "Weekly",
    lat: 2.1896,
    lng: 102.2501,
    color: "#ec4899",
  },
  {
    id: 7,
    code: 91,
    location: "KPJ Kuantan",
    delivery: "Daily",
    lat: 3.8077,
    lng: 103.326,
    color: "#06b6d4",
  },
  {
    id: 8,
    code: 35,
    location: "KPJ Klang",
    delivery: "Monthly",
    lat: 3.0447,
    lng: 101.4458,
    color: "#84cc16",
  },
]

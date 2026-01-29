"use client"

import { Plus, MapPin, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function RoutesPage() {
  const routes = [
    { 
      id: 1,
      name: "KL 1", 
      locations: 8,
      area: "Kuala Lumpur",
      status: "active",
      color: "bg-blue-500"
    },
    { 
      id: 2,
      name: "KL 2", 
      locations: 6,
      area: "Kuala Lumpur",
      status: "active",
      color: "bg-green-500"
    },
    { 
      id: 3,
      name: "Selangor 1", 
      locations: 7,
      area: "Selangor",
      status: "active",
      color: "bg-purple-500"
    },
    { 
      id: 4,
      name: "Penang 1", 
      locations: 5,
      area: "Penang",
      status: "pending",
      color: "bg-orange-500"
    },
    { 
      id: 5,
      name: "Johor 1", 
      locations: 9,
      area: "Johor",
      status: "active",
      color: "bg-pink-500"
    },
  ]

  return (
    <div className="flex-1 p-4">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">All Routes</h2>
          <p className="text-sm text-muted-foreground">Manage your VM delivery routes</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Route
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {routes.map((route) => (
          <div 
            key={route.id}
            className="p-6 rounded-lg border bg-card hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${route.color}`} />
                <div>
                  <h3 className="font-semibold text-lg">{route.name}</h3>
                  <p className="text-sm text-muted-foreground">{route.area}</p>
                </div>
              </div>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                route.status === 'active' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
              }`}>
                {route.status}
              </span>
            </div>

            <div className="flex items-center gap-2 mb-4 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{route.locations} locations</span>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}

        {/* Add Route Card */}
        <div className="p-6 rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 bg-muted/50 flex items-center justify-center cursor-pointer transition-colors min-h-[200px]">
          <div className="text-center">
            <Plus className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground font-medium">Add New Route</p>
          </div>
        </div>
      </div>
    </div>
  )
}

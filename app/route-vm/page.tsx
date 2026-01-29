"use client"

import { MapPin, TrendingUp, Clock, AlertCircle } from "lucide-react"

export default function RouteVMOverviewPage() {
  const stats = [
    { 
      title: "Total Routes", 
      value: "24", 
      change: "+2 from last month",
      icon: MapPin,
      color: "text-blue-600 dark:text-blue-400"
    },
    { 
      title: "Active Locations", 
      value: "156", 
      change: "+12 this week",
      icon: TrendingUp,
      color: "text-green-600 dark:text-green-400"
    },
    { 
      title: "Avg. Locations/Route", 
      value: "6.5", 
      change: "Optimal range",
      icon: Clock,
      color: "text-purple-600 dark:text-purple-400"
    },
    { 
      title: "Pending Updates", 
      value: "3", 
      change: "Needs attention",
      icon: AlertCircle,
      color: "text-orange-600 dark:text-orange-400"
    },
  ]

  const recentRoutes = [
    { name: "KL 1", locations: 8, lastUpdate: "2 hours ago", status: "active" },
    { name: "KL 2", locations: 6, lastUpdate: "5 hours ago", status: "active" },
    { name: "Selangor 1", locations: 7, lastUpdate: "1 day ago", status: "active" },
    { name: "Penang 1", locations: 5, lastUpdate: "2 days ago", status: "pending" },
  ]

  return (
    <div className="flex-1 p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Overview</h2>
        <p className="text-sm text-muted-foreground">Monitor your VM routes and locations</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div 
              key={stat.title}
              className="p-6 rounded-lg border bg-card hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-3xl font-bold mb-1">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </div>
          )
        })}
      </div>

      {/* Recent Routes */}
      <div className="rounded-lg border bg-card">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Recent Routes</h3>
          <p className="text-sm text-muted-foreground">Latest route activities</p>
        </div>
        <div className="divide-y">
          {recentRoutes.map((route) => (
            <div 
              key={route.name}
              className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{route.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {route.locations} locations • Updated {route.lastUpdate}
                  </p>
                </div>
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                  route.status === 'active' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                }`}>
                  {route.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

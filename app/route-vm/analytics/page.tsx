"use client"

import { TrendingUp, TrendingDown, Activity } from "lucide-react"

export default function AnalyticsPage() {
  const metrics = [
    { 
      title: "Total Deliveries", 
      value: "1,248", 
      change: "+12.5%",
      trend: "up",
      period: "vs last month"
    },
    { 
      title: "Avg. Time per Route", 
      value: "2.4h", 
      change: "-8.2%",
      trend: "down",
      period: "vs last month"
    },
    { 
      title: "Route Efficiency", 
      value: "94.2%", 
      change: "+3.1%",
      trend: "up",
      period: "vs last month"
    },
  ]

  const topRoutes = [
    { name: "KL 1", deliveries: 156, efficiency: 96, revenue: "RM 12,400" },
    { name: "Selangor 1", deliveries: 142, efficiency: 94, revenue: "RM 11,200" },
    { name: "KL 2", deliveries: 128, efficiency: 92, revenue: "RM 10,100" },
    { name: "Johor 1", deliveries: 118, efficiency: 91, revenue: "RM 9,500" },
    { name: "Penang 1", deliveries: 98, efficiency: 88, revenue: "RM 7,800" },
  ]

  return (
    <div className="flex-1 p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Analytics</h2>
        <p className="text-sm text-muted-foreground">Track your route performance and metrics</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {metrics.map((metric) => (
          <div 
            key={metric.title}
            className="p-6 rounded-lg border bg-card"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">{metric.title}</p>
              <Activity className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-3xl font-bold mb-2">{metric.value}</p>
            <div className="flex items-center gap-1">
              {metric.trend === 'up' ? (
                <TrendingUp className="w-4 h-4 text-green-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600" />
              )}
              <span className={`text-sm font-medium ${
                metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {metric.change}
              </span>
              <span className="text-sm text-muted-foreground">{metric.period}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Top Performing Routes */}
      <div className="rounded-lg border bg-card">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Top Performing Routes</h3>
          <p className="text-sm text-muted-foreground">Routes ranked by deliveries and efficiency</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-4 font-medium text-sm">Rank</th>
                <th className="text-left p-4 font-medium text-sm">Route</th>
                <th className="text-left p-4 font-medium text-sm">Deliveries</th>
                <th className="text-left p-4 font-medium text-sm">Efficiency</th>
                <th className="text-left p-4 font-medium text-sm">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {topRoutes.map((route, index) => (
                <tr key={route.name} className="border-b hover:bg-muted/50 transition-colors">
                  <td className="p-4">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                      {index + 1}
                    </span>
                  </td>
                  <td className="p-4 font-medium">{route.name}</td>
                  <td className="p-4 text-muted-foreground">{route.deliveries}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-muted rounded-full h-2 max-w-[100px]">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${route.efficiency}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">{route.efficiency}%</span>
                    </div>
                  </td>
                  <td className="p-4 font-medium">{route.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

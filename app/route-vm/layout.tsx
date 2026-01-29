"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Plus, Map, List, BarChart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AppSidebar } from "@/components/app-sidebar"
import { ModeToggle } from "@/components/mode-toggle"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

const tabs = [
  { id: "overview", name: "Overview", href: "/route-vm", icon: Map },
  { id: "routes", name: "Routes", href: "/route-vm/routes", icon: List },
  { id: "analytics", name: "Analytics", href: "/route-vm/analytics", icon: BarChart },
]

export default function RouteVMLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Header */}
        <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b bg-background shadow-sm px-4 pt-[env(safe-area-inset-top)] before:absolute before:inset-x-0 before:top-0 before:-translate-y-full before:h-[200px] before:bg-background before:-z-10">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb className="flex-1">
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/">
                  Home
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Route VM</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Route
            </Button>
            <ModeToggle />
          </div>
        </header>

        <div className="flex flex-1 flex-col overflow-y-auto">
          {/* Page Tabs */}
          <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center gap-2 py-3 px-4">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <Link key={tab.id} href={tab.href}>
                    <Button
                      variant={pathname === tab.href ? "secondary" : "ghost"}
                      size="sm"
                      className="rounded-full px-6"
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {tab.name}
                    </Button>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Content */}
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

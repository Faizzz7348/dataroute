"use client"

import { useEffect, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { ModeToggle } from "@/components/mode-toggle"
import { usePageLoading } from "@/contexts/page-loading-context"
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

export default function Page() {
  const { showPageLoading } = usePageLoading()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    showPageLoading("Opening Dashboard", 1000)
    setTimeout(() => setMounted(true), 1000)
  }, [showPageLoading])

  if (!mounted) return null

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="fixed top-0 left-0 right-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b bg-background backdrop-blur-xl shadow-lg px-4 md:left-64 before:absolute before:inset-x-0 before:top-0 before:h-screen before:-z-10 before:bg-background">
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
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <ModeToggle />
        </header>
        <div className="pt-16 flex flex-1 flex-col gap-4 p-4">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="bg-muted aspect-video rounded-xl border shadow-md" />
            <div className="bg-muted aspect-video rounded-xl border shadow-md" />
            <div className="bg-muted aspect-video rounded-xl border shadow-md" />
          </div>
          <div className="bg-muted min-h-[100vh] flex-1 rounded-xl border shadow-lg md:min-h-min" />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

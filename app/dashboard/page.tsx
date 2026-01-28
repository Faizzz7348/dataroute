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
        <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b bg-background backdrop-blur-xl shadow-lg px-4 pt-safe before:absolute before:inset-x-0 before:bottom-0 before:h-[200px] before:bg-background before:-translate-y-full before:-z-10">
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
        <div className="flex flex-1 flex-col p-4 pb-safe overflow-y-auto">
          <div className="flex flex-1 flex-col gap-4 pt-2">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="bg-muted aspect-video rounded-xl border shadow-md" />
            <div className="bg-muted aspect-video rounded-xl border shadow-md" />
            <div className="bg-muted aspect-video rounded-xl border shadow-md" />
          </div>
          <div className="bg-muted min-h-[50vh] flex-1 rounded-xl border shadow-lg" />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

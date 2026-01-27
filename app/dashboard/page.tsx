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
    showPageLoading("Opening Dashboard", 800)
    setTimeout(() => setMounted(true), 800)
  }, [showPageLoading])

  if (!mounted) return null

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b border-sky-200/40 dark:border-blue-900/50 bg-gradient-to-r from-sky-50/95 via-blue-50/60 to-cyan-50/40 dark:from-slate-950/95 dark:via-blue-950/90 dark:to-indigo-950/80 backdrop-blur-md shadow-lg shadow-sky-500/10 dark:shadow-blue-900/30 px-4">
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
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="bg-gradient-to-br from-sky-50/60 via-blue-50/40 to-slate-50/50 dark:from-blue-950/60 dark:via-indigo-950/40 dark:to-slate-950/50 aspect-video rounded-xl border border-sky-200/30 dark:border-blue-800/30 shadow-md backdrop-blur-sm" />
            <div className="bg-gradient-to-br from-blue-50/60 via-sky-50/40 to-slate-50/50 dark:from-blue-950/60 dark:via-blue-900/40 dark:to-slate-950/50 aspect-video rounded-xl border border-blue-200/30 dark:border-blue-800/30 shadow-md backdrop-blur-sm" />
            <div className="bg-gradient-to-br from-slate-50/60 via-sky-50/40 to-blue-50/50 dark:from-slate-950/60 dark:via-blue-950/40 dark:to-indigo-950/50 aspect-video rounded-xl border border-slate-200/30 dark:border-blue-800/30 shadow-md backdrop-blur-sm" />
          </div>
          <div className="bg-gradient-to-br from-slate-50/60 via-sky-50/30 to-blue-50/30 dark:from-slate-950/70 dark:via-blue-950/50 dark:to-indigo-950/40 min-h-[100vh] flex-1 rounded-xl border border-sky-200/30 dark:border-blue-800/40 shadow-lg backdrop-blur-sm md:min-h-min" />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

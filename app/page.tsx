"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
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

export default function Home() {
  const { showPageLoading } = usePageLoading()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    showPageLoading("Welcome to Homepage", 1000)
    setTimeout(() => setMounted(true), 1000)
  }, [showPageLoading])

  if (!mounted) return null

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b bg-background backdrop-blur-xl shadow-sm px-4 pt-safe before:absolute before:inset-x-0 before:bottom-0 before:h-[200px] before:bg-background before:-translate-y-full before:-z-10">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb className="flex-1">
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">
                  Home
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Welcome</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <ModeToggle />
        </header>
        <div className="flex flex-1 flex-col p-4 pt-6 pb-safe overflow-y-auto">
          <div className="flex flex-1 flex-col gap-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-1 bg-primary rounded-full" />
                <div>
                  <h1 className="text-[calc(2.25rem-4px)] font-bold tracking-tight">
                    Welcome to VM Manager
                  </h1>
                  <p className="text-muted-foreground mt-1 font-medium">
                    Professional Vending Machine Management System
                  </p>
                </div>
              </div>
              
              <p className="text-lg text-muted-foreground max-w-3xl leading-relaxed">
                Get started by exploring the sidebar navigation. Manage your vending machine routes, 
                monitor locations, and configure settings with ease.
              </p>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
                <div className="relative overflow-hidden rounded-xl border bg-card p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
                  <div className="relative h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="relative font-semibold text-lg mb-2">Getting Started</h3>
                  <p className="relative text-sm text-muted-foreground leading-relaxed">
                    Learn the basics and set up your vending machine routes
                  </p>
                </div>
                
                <div className="relative overflow-hidden rounded-xl border bg-card p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
                  <div className="relative h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="relative font-semibold text-lg mb-2">Route Management</h3>
                  <p className="relative text-sm text-muted-foreground leading-relaxed">
                    Browse and manage your VM routes with comprehensive tools
                  </p>
                </div>
                
                <div className="relative overflow-hidden rounded-xl border bg-card p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
                  <div className="relative h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="relative font-semibold text-lg mb-2 text-slate-900 dark:text-slate-100">Analytics & Reports</h3>
                  <p className="relative text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Monitor performance and view detailed analytics
                  </p>
                </div>
              </div>

              <div className="relative mt-8 rounded-xl border bg-card p-6 shadow-sm">
                <h3 className="relative font-semibold text-lg mb-3">Quick Actions</h3>
                <div className="relative flex flex-wrap gap-2">
                  <Link href="/kl-7" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200 font-medium">
                    View KL Routes
                  </Link>
                  <Link href="/sl-1" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200 font-medium">
                    View SL Routes
                  </Link>
                  <button className="px-4 py-2 rounded-lg border bg-background hover:bg-accent transition-colors duration-200 font-medium">
                    Settings
                  </button>
                </div>
              </div>
            </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

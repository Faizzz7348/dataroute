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
    showPageLoading("Welcome to Homepage", 800)
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
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-1 bg-gradient-to-b from-sky-400 via-blue-500 to-blue-600 dark:from-blue-400 dark:via-blue-600 dark:to-indigo-800 rounded-full shadow-lg shadow-sky-500/50 dark:shadow-blue-600/40" />
                <div>
                  <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-sky-500 via-blue-600 to-blue-700 dark:from-blue-300 dark:via-blue-400 dark:to-indigo-500 bg-clip-text text-transparent drop-shadow-sm">
                    Welcome to VM Manager
                  </h1>
                  <p className="text-blue-700/70 dark:text-blue-300/80 mt-1 font-medium">
                    Professional Vending Machine Management System
                  </p>
                </div>
              </div>
              
              <p className="text-lg text-slate-700 dark:text-slate-300 max-w-3xl leading-relaxed">
                Get started by exploring the sidebar navigation. Manage your vending machine routes, 
                monitor locations, and configure settings with ease.
              </p>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
                <div className="relative overflow-hidden rounded-xl border-2 border-sky-400/30 dark:border-blue-700/40 bg-gradient-to-br from-white/90 via-sky-50/70 to-blue-50/50 dark:from-slate-900/90 dark:via-blue-950/80 dark:to-indigo-950/60 p-6 shadow-lg hover:shadow-2xl hover:shadow-sky-500/25 dark:hover:shadow-blue-800/30 hover:border-sky-500/50 dark:hover:border-blue-600/60 hover:-translate-y-1 transition-all duration-300 group backdrop-blur-sm">
                  <div className="absolute inset-0 bg-gradient-to-t from-sky-400/8 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative h-12 w-12 rounded-lg bg-gradient-to-br from-sky-400/25 to-blue-500/15 dark:from-blue-500/30 dark:to-indigo-600/20 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-md">
                    <svg className="h-6 w-6 text-sky-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="relative font-semibold text-lg mb-2 text-slate-900 dark:text-slate-100">Getting Started</h3>
                  <p className="relative text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Learn the basics and set up your vending machine routes
                  </p>
                </div>
                
                <div className="relative overflow-hidden rounded-xl border-2 border-blue-400/30 dark:border-blue-700/40 bg-gradient-to-br from-white/90 via-blue-50/70 to-sky-50/50 dark:from-slate-900/90 dark:via-blue-950/80 dark:to-blue-900/60 p-6 shadow-lg hover:shadow-2xl hover:shadow-blue-500/25 dark:hover:shadow-blue-800/30 hover:border-blue-500/50 dark:hover:border-blue-600/60 hover:-translate-y-1 transition-all duration-300 group backdrop-blur-sm">
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-400/8 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative h-12 w-12 rounded-lg bg-gradient-to-br from-blue-400/25 to-sky-500/15 dark:from-blue-500/30 dark:to-blue-700/20 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-md">
                    <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="relative font-semibold text-lg mb-2 text-slate-900 dark:text-slate-100">Route Management</h3>
                  <p className="relative text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Browse and manage your VM routes with comprehensive tools
                  </p>
                </div>
                
                <div className="relative overflow-hidden rounded-xl border-2 border-cyan-400/30 dark:border-blue-700/40 bg-gradient-to-br from-white/90 via-cyan-50/70 to-sky-50/50 dark:from-slate-900/90 dark:via-blue-950/80 dark:to-indigo-950/60 p-6 shadow-lg hover:shadow-2xl hover:shadow-cyan-500/25 dark:hover:shadow-blue-800/30 hover:border-cyan-500/50 dark:hover:border-blue-600/60 hover:-translate-y-1 transition-all duration-300 group backdrop-blur-sm">
                  <div className="absolute inset-0 bg-gradient-to-t from-cyan-400/8 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative h-12 w-12 rounded-lg bg-gradient-to-br from-cyan-400/25 to-sky-500/15 dark:from-blue-500/30 dark:to-indigo-600/20 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-md">
                    <svg className="h-6 w-6 text-cyan-600 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="relative font-semibold text-lg mb-2 text-slate-900 dark:text-slate-100">Analytics & Reports</h3>
                  <p className="relative text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Monitor performance and view detailed analytics
                  </p>
                </div>
              </div>

              <div className="relative mt-8 rounded-xl border-2 border-sky-400/40 dark:border-blue-700/50 bg-gradient-to-br from-white/90 via-sky-50/60 to-blue-50/40 dark:from-slate-900/90 dark:via-blue-950/80 dark:to-indigo-950/70 p-6 shadow-xl backdrop-blur-sm overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-sky-400/8 via-blue-500/8 to-transparent opacity-50" />
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-sky-400/8 dark:bg-blue-600/10 rounded-full blur-3xl" />
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-400/8 dark:bg-indigo-600/10 rounded-full blur-3xl" />
                <h3 className="relative font-semibold text-lg mb-3 text-slate-900 dark:text-slate-100">Quick Actions</h3>
                <div className="relative flex flex-wrap gap-2">
                  <Link href="/kl-7" className="px-4 py-2 rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 dark:from-blue-500 dark:to-indigo-600 text-white hover:from-sky-400 hover:to-blue-500 dark:hover:from-blue-400 dark:hover:to-indigo-500 hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg shadow-sky-500/30 dark:shadow-blue-700/40 hover:shadow-xl hover:shadow-sky-500/40 dark:hover:shadow-blue-700/50 font-medium">
                    View KL Routes
                  </Link>
                  <Link href="/sl-1" className="px-4 py-2 rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 dark:from-blue-500 dark:to-indigo-600 text-white hover:from-sky-400 hover:to-blue-500 dark:hover:from-blue-400 dark:hover:to-indigo-500 hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg shadow-sky-500/30 dark:shadow-blue-700/40 hover:shadow-xl hover:shadow-sky-500/40 dark:hover:shadow-blue-700/50 font-medium">
                    View SL Routes
                  </Link>
                  <button className="px-4 py-2 rounded-lg border-2 border-sky-400/50 dark:border-blue-600/50 bg-white/60 dark:bg-slate-900/60 hover:bg-sky-400/10 dark:hover:bg-blue-600/15 hover:border-sky-500/70 dark:hover:border-blue-500/70 hover:scale-105 active:scale-95 transition-all duration-300 font-medium text-slate-900 dark:text-slate-100 backdrop-blur-sm shadow-sm hover:shadow-md">
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

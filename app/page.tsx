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

export default function Home() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
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
          <div className="min-h-[100vh] flex-1 rounded-xl border bg-muted/50 p-8 shadow-sm">
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-1 bg-gradient-to-b from-primary to-primary/50 rounded-full" />
                <div>
                  <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    Welcome to VM Manager
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Professional Vending Machine Management System
                  </p>
                </div>
              </div>
              
              <p className="text-lg text-muted-foreground max-w-3xl">
                Get started by exploring the sidebar navigation. Manage your vending machine routes, 
                monitor locations, and configure settings with ease.
              </p>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
                <div className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-all duration-200 group">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Getting Started</h3>
                  <p className="text-sm text-muted-foreground">
                    Learn the basics and set up your vending machine routes
                  </p>
                </div>
                
                <div className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-all duration-200 group">
                  <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Route Management</h3>
                  <p className="text-sm text-muted-foreground">
                    Browse and manage your VM routes with comprehensive tools
                  </p>
                </div>
                
                <div className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-all duration-200 group">
                  <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Analytics & Reports</h3>
                  <p className="text-sm text-muted-foreground">
                    Monitor performance and view detailed analytics
                  </p>
                </div>
              </div>

              <div className="mt-8 rounded-xl border bg-gradient-to-br from-primary/5 to-primary/10 p-6">
                <h3 className="font-semibold text-lg mb-3">Quick Actions</h3>
                <div className="flex flex-wrap gap-2">
                  <a href="/kl-7" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 shadow-sm hover:shadow-md font-medium">
                    View KL Routes
                  </a>
                  <a href="/sl-1" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 shadow-sm hover:shadow-md font-medium">
                    View SL Routes
                  </a>
                  <button className="px-4 py-2 rounded-lg border bg-background hover:bg-muted transition-all duration-200 font-medium">
                    Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

"use client"

import * as React from "react"
import Link from "next/link"
import { GalleryVerticalEnd, Plus, Settings, Palette, Bell, User, Shield, HelpCircle, Moon, Sun, Check, Mail, MessageSquare, Calendar, Info, Lock, Key, Eye, Book, FileText, ExternalLink, Save, ChevronRight, Home, MapPin, Navigation } from "lucide-react"
import { useTheme } from "next-themes"

import { SearchForm } from "@/components/search-form"
import { useEditMode } from "@/contexts/edit-mode-context"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"

interface NavItem {
  title: string
  url: string
}

interface NavMain {
  title: string
  url: string
  icon?: React.ComponentType<{ className?: string }>
  items: NavItem[]
}

interface Route {
  id: number
  name: string
  slug: string
  description: string | null
  createdAt: string
  updatedAt: string
}

// This is sample data.
const data = {
  navMain: [
    {
      title: "Home",
      url: "/",
      icon: Home,
      items: [],
    },
    {
      title: "Route Vm KL",
      url: "#",
      icon: MapPin,
      items: [
        {
          title: "KL 7 - 3PVK04",
          url: "/kl-7",
        },
      ],
    },
    {
      title: "Route Vm SL",
      url: "#",
      icon: Navigation,
      items: [
        {
          title: "SL 1 - 3AVS01",
          url: "/sl-1",
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { isEditMode, setIsEditMode, isLoading, setIsLoading, hasUnsavedChanges, saveAllChanges, pendingChanges, savingMessage } = useEditMode()
  const { theme, setTheme } = useTheme()
  const [colorTheme, setColorTheme] = React.useState<string>("default")
  const [navData, setNavData] = React.useState<NavMain[]>(data.navMain)
  const [openMenu, setOpenMenu] = React.useState<string | null>(null)
  const [settingsOpen, setSettingsOpen] = React.useState(false)
  
  // Fetch routes from database
  React.useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const response = await fetch('/api/routes')
        if (!response.ok) throw new Error('Failed to fetch routes')
        
        const routes = await response.json()
        
        // Group routes by KL and SL
        const klRoutes = routes
          .filter((route: Route) => route.slug.startsWith('kl-'))
          .map((route: Route) => ({
            title: route.name,
            url: `/${route.slug}`,
          }))
        
        const slRoutes = routes
          .filter((route: Route) => route.slug.startsWith('sl-'))
          .map((route: Route) => ({
            title: route.name,
            url: `/${route.slug}`,
          }))
        
        // Update nav data with fetched routes - preserve icons from initial data
        setNavData(prevData => [
          {
            ...prevData[0],
            items: [],
          },
          {
            ...prevData[1],
            items: klRoutes,
          },
          {
            ...prevData[2],
            items: slRoutes,
          },
        ])
      } catch (error) {
        console.error('Error fetching routes:', error)
        // Keep default data if fetch fails
      }
    }
    
    fetchRoutes()
  }, [])
  
  // Debug log
  React.useEffect(() => {
    console.log('Sidebar - hasUnsavedChanges:', hasUnsavedChanges, 'pendingChanges:', pendingChanges)
  }, [hasUnsavedChanges, pendingChanges])
  
  // Modal states
  const [notificationsOpen, setNotificationsOpen] = React.useState(false)
  const [accountOpen, setAccountOpen] = React.useState(false)
  const [securityOpen, setSecurityOpen] = React.useState(false)
  const [helpOpen, setHelpOpen] = React.useState(false)
  const [saveConfirmOpen, setSaveConfirmOpen] = React.useState(false)
  const [editModeOffConfirm, setEditModeOffConfirm] = React.useState(false)
  const [addRouteOpen, setAddRouteOpen] = React.useState(false)
  const [selectedParentRoute, setSelectedParentRoute] = React.useState<string>("")
  
  // Notification settings
  const [emailNotifs, setEmailNotifs] = React.useState(true)
  const [pushNotifs, setPushNotifs] = React.useState(true)
  const [updateNotifs, setUpdateNotifs] = React.useState(false)
  
  // Add route form state
  const [routeName, setRouteName] = React.useState("")
  const [routeSlug, setRouteSlug] = React.useState("")
  const [routeDescription, setRouteDescription] = React.useState("")
  const [isAddingRoute, setIsAddingRoute] = React.useState(false)
  const [addRouteSlugError, setAddRouteSlugError] = React.useState("")

  // Apply color theme to document
  React.useEffect(() => {
    const root = document.documentElement
    const themeClasses = ['theme-zinc', 'theme-slate', 'theme-stone', 'theme-gray', 'theme-blue', 'theme-green', 'theme-orange', 'theme-rose', 'theme-red', 'theme-yellow', 'theme-violet']
    
    // Remove all theme classes
    themeClasses.forEach(className => root.classList.remove(className))
    
    // Add selected theme class
    if (colorTheme !== 'default') {
      root.classList.add(`theme-${colorTheme}`)
    }
    
    // Save to localStorage
    localStorage.setItem('colorTheme', colorTheme)
  }, [colorTheme])

  // Load color theme from localStorage
  React.useEffect(() => {
    const savedTheme = localStorage.getItem('colorTheme')
    if (savedTheme) {
      setColorTheme(savedTheme)
    }
  }, [])

  const handleEditModeChange = async (mode: boolean) => {
    // If turning OFF edit mode and has unsaved changes, show confirmation
    if (!mode && hasUnsavedChanges) {
      setEditModeOffConfirm(true)
      return
    }
    
    setIsLoading(true)
    
    // Simulate page reload effect
    await new Promise(resolve => setTimeout(resolve, 800))
    
    setIsEditMode(mode)
    
    // Keep loading state for a moment to show the transition
    await new Promise(resolve => setTimeout(resolve, 400))
    setIsLoading(false)
  }

  const handleConfirmEditModeOff = async () => {
    setEditModeOffConfirm(false)
    setIsLoading(true)
    
    // Clear all pending changes
    window.location.reload() // Reload to discard all changes
  }

  const handleSaveChanges = async () => {
    try {
      await saveAllChanges()
      setSaveConfirmOpen(false)
    } catch (error) {
      console.error('Failed to save changes:', error)
      // You can add toast notification here
    }
  }
  
  const handleAddRoute = async () => {
    if (!routeName.trim() || !routeSlug.trim()) {
      alert("Please fill in Route Name and Slug")
      return
    }
    
    // Validate slug format
    const slugRegex = /^[a-z0-9-]+$/
    if (!slugRegex.test(routeSlug)) {
      setAddRouteSlugError("Slug must contain only lowercase letters, numbers, and hyphens")
      return
    }
    
    // Validate slug prefix based on parent route
    const slugPrefix = selectedParentRoute.includes("KL") ? "kl-" : "sl-"
    if (!routeSlug.startsWith(slugPrefix)) {
      setAddRouteSlugError(`Slug must start with "${slugPrefix}" for ${selectedParentRoute}`)
      return
    }
    
    setIsAddingRoute(true)
    setAddRouteSlugError("")
    
    try {
      const response = await fetch('/api/routes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: routeName,
          slug: routeSlug,
          description: routeDescription,
        }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create route')
      }
      
      // Reset form
      setRouteName("")
      setRouteSlug("")
      setRouteDescription("")
      setAddRouteSlugError("")
      setAddRouteOpen(false)
      
      // Redirect to new route
      window.location.href = `/${routeSlug}`
    } catch (error: any) {
      console.error('Error creating route:', error)
      alert(error.message || 'Failed to create route. Please try again.')
    } finally {
      setIsAddingRoute(false)
    }
  }
  
  const openAddRouteDialog = (parentTitle: string) => {
    setSelectedParentRoute(parentTitle)
    setAddRouteOpen(true)
  }

  return (
    <Sidebar {...props}>
      <div className="flex flex-col h-full">
        <SidebarHeader className="shrink-0">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <a href="#" className="group">
                  <div className="bg-gradient-to-br from-primary to-primary/80 text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg shadow-md group-hover:shadow-lg transition-all duration-200">
                    <GalleryVerticalEnd className="size-4" />
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-bold text-foreground">VM Manager</span>
                    <span className="text-xs text-muted-foreground font-medium">v1.0.0</span>
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <SearchForm />
        </SidebarHeader>
        
        <SidebarContent className="flex-1 overflow-y-auto min-h-0">
          <SidebarGroup>
            <SidebarMenu>
              {navData.map((item) => {
                const Icon = item.icon
                return item.items?.length ? (
                  <Collapsible
                    key={item.title}
                    open={openMenu === item.title}
                    onOpenChange={(isOpen) => {
                      setOpenMenu(isOpen ? item.title : null)
                    }}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton className="font-bold">
                          {Icon && <Icon className="h-4 w-4" />}
                          <span className="flex-1">{item.title}</span>
                          <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-300 ease-in-out group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="transition-all duration-300 ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
                        <SidebarMenuSub>
                          {item.items.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton asChild>
                                <Link href={subItem.url} className="font-bold">{subItem.title}</Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                          {/* Add Route Button - Only show in edit mode for KL and SL routes */}
                          {isEditMode && (item.title === "Route Vm KL" || item.title === "Route Vm SL") && (
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton 
                                onClick={() => openAddRouteDialog(item.title)}
                                className="cursor-pointer text-green-600 dark:text-green-400 hover:bg-green-500/10 transition-all duration-200"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add New Route
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          )}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                ) : (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link href={item.url} className="font-bold">
                        {Icon && <Icon className="h-4 w-4" />}
                        {item.title}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        
        <SidebarFooter className="shrink-0 border-t p-2 pb-safe z-50">
          <SidebarMenu>
            {/* Save Button - Only show when there are unsaved changes */}
            {hasUnsavedChanges && (
              <SidebarMenuItem>
                <SidebarMenuButton 
                  size="lg" 
                  className="cursor-pointer bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400"
                  onClick={() => setSaveConfirmOpen(true)}
                >
                  <Save className="h-5 w-5" />
                  <span className="font-bold">Save Changes</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
            
            <SidebarMenuItem>
              <DropdownMenu open={settingsOpen} onOpenChange={setSettingsOpen}>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton 
                    size="lg" 
                    className="cursor-pointer bg-gradient-to-r from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 dark:from-blue-500/20 dark:to-purple-500/20 dark:hover:from-blue-500/30 dark:hover:to-purple-500/30 border border-blue-500/20 dark:border-blue-500/30"
                  >
                    <Settings className={`h-5 w-5 transition-transform duration-500 ease-in-out ${settingsOpen ? 'rotate-180' : 'rotate-0'}`} />
                    <span className="font-bold">Settings</span>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" align="end" className="w-[240px] z-[100]">
                  <div className="px-2 py-3 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">Edit Mode</span>
                        <span className="text-xs text-muted-foreground">
                          {isEditMode ? 'Modifications enabled' : 'View only'}
                        </span>
                      </div>
                      <button
                        onClick={() => handleEditModeChange(!isEditMode)}
                        disabled={isLoading}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                          isEditMode 
                            ? 'bg-green-500 hover:bg-green-600' 
                            : 'bg-red-500 hover:bg-red-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform ${
                            isEditMode ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="cursor-pointer">
                      <Palette className="mr-2 h-4 w-4" />
                      <span className="font-medium">Appearance</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="w-[200px]">
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Mode</div>
                      <DropdownMenuItem onClick={() => setTheme("light")} className="gap-2">
                        <Sun className="h-4 w-4" />
                        <span>Light</span>
                        {theme === "light" && <Check className="ml-auto h-4 w-4" />}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTheme("dark")} className="gap-2">
                        <Moon className="h-4 w-4" />
                        <span>Dark</span>
                        {theme === "dark" && <Check className="ml-auto h-4 w-4" />}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTheme("system")} className="gap-2">
                        <Settings className="h-4 w-4" />
                        <span>System</span>
                        {theme === "system" && <Check className="ml-auto h-4 w-4" />}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground sticky top-0 bg-popover z-10">Color Theme</div>
                      <div className="max-h-[250px] overflow-y-auto">
                        <DropdownMenuItem onClick={() => setColorTheme("default")} className="gap-2">
                          <div className="h-4 w-4 rounded-full bg-gradient-to-br from-blue-500 to-blue-600" />
                          <span>Default</span>
                          {colorTheme === "default" && <Check className="ml-auto h-4 w-4" />}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setColorTheme("zinc")} className="gap-2">
                          <div className="h-4 w-4 rounded-full bg-zinc-700" />
                          <span>Zinc</span>
                          {colorTheme === "zinc" && <Check className="ml-auto h-4 w-4" />}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setColorTheme("slate")} className="gap-2">
                          <div className="h-4 w-4 rounded-full bg-slate-700" />
                          <span>Slate</span>
                          {colorTheme === "slate" && <Check className="ml-auto h-4 w-4" />}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setColorTheme("stone")} className="gap-2">
                          <div className="h-4 w-4 rounded-full bg-stone-700" />
                          <span>Stone</span>
                          {colorTheme === "stone" && <Check className="ml-auto h-4 w-4" />}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setColorTheme("gray")} className="gap-2">
                          <div className="h-4 w-4 rounded-full bg-gray-700" />
                          <span>Gray</span>
                          {colorTheme === "gray" && <Check className="ml-auto h-4 w-4" />}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setColorTheme("blue")} className="gap-2">
                          <div className="h-4 w-4 rounded-full bg-blue-600" />
                          <span>Blue</span>
                          {colorTheme === "blue" && <Check className="ml-auto h-4 w-4" />}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setColorTheme("green")} className="gap-2">
                          <div className="h-4 w-4 rounded-full bg-green-600" />
                          <span>Green</span>
                          {colorTheme === "green" && <Check className="ml-auto h-4 w-4" />}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setColorTheme("orange")} className="gap-2">
                          <div className="h-4 w-4 rounded-full bg-orange-600" />
                          <span>Orange</span>
                          {colorTheme === "orange" && <Check className="ml-auto h-4 w-4" />}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setColorTheme("rose")} className="gap-2">
                          <div className="h-4 w-4 rounded-full bg-rose-600" />
                          <span>Rose</span>
                          {colorTheme === "rose" && <Check className="ml-auto h-4 w-4" />}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setColorTheme("red")} className="gap-2">
                          <div className="h-4 w-4 rounded-full bg-red-600" />
                          <span>Red</span>
                          {colorTheme === "red" && <Check className="ml-auto h-4 w-4" />}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setColorTheme("yellow")} className="gap-2">
                          <div className="h-4 w-4 rounded-full bg-yellow-600" />
                          <span>Yellow</span>
                          {colorTheme === "yellow" && <Check className="ml-auto h-4 w-4" />}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setColorTheme("violet")} className="gap-2">
                          <div className="h-4 w-4 rounded-full bg-violet-600" />
                          <span>Violet</span>
                          {colorTheme === "violet" && <Check className="ml-auto h-4 w-4" />}
                        </DropdownMenuItem>
                      </div>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuItem onClick={() => setNotificationsOpen(true)} className="cursor-pointer">
                    <Bell className="mr-2 h-4 w-4" />
                    <div className="flex flex-col">
                      <span className="font-medium">Notifications</span>
                      <span className="text-xs text-muted-foreground">Alerts & updates</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setAccountOpen(true)} className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <div className="flex flex-col">
                      <span className="font-medium">Account</span>
                      <span className="text-xs text-muted-foreground">Profile settings</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSecurityOpen(true)} className="cursor-pointer">
                    <Shield className="mr-2 h-4 w-4" />
                    <div className="flex flex-col">
                      <span className="font-medium">Security</span>
                      <span className="text-xs text-muted-foreground">Privacy & access</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setHelpOpen(true)} className="cursor-pointer">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    <div className="flex flex-col">
                      <span className="font-medium">Help & Support</span>
                      <span className="text-xs text-muted-foreground">Docs & assistance</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </div>
      <SidebarRail />

      {/* Notifications Dialog */}
      <Dialog open={notificationsOpen} onOpenChange={setNotificationsOpen}>
        <DialogContent className="sm:max-w-[500px] backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Settings
            </DialogTitle>
            <DialogDescription>
              Manage how you receive notifications and alerts
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive updates via email
                </p>
              </div>
              <Switch checked={emailNotifs} onCheckedChange={setEmailNotifs} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Push Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Get instant push alerts
                </p>
              </div>
              <Switch checked={pushNotifs} onCheckedChange={setPushNotifs} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Update Reminders
                </Label>
                <p className="text-sm text-muted-foreground">
                  Notify about app updates
                </p>
              </div>
              <Switch checked={updateNotifs} onCheckedChange={setUpdateNotifs} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setNotificationsOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Account Dialog */}
      <Dialog open={accountOpen} onOpenChange={setAccountOpen}>
        <DialogContent className="sm:max-w-[500px] backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account Settings
            </DialogTitle>
            <DialogDescription>
              Manage your profile and account information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="Enter your name" defaultValue="VM Admin" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="admin@vmmanager.com" defaultValue="admin@vmmanager.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input id="role" disabled defaultValue="Administrator" className="bg-muted" />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input id="company" placeholder="Your company" defaultValue="VM Manager Inc." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAccountOpen(false)}>Cancel</Button>
            <Button onClick={() => setAccountOpen(false)}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Security Dialog */}
      <Dialog open={securityOpen} onOpenChange={setSecurityOpen}>
        <DialogContent className="sm:max-w-[500px] backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Settings
            </DialogTitle>
            <DialogDescription>
              Manage your security and privacy preferences
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <Label className="text-base flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Change Password
              </Label>
              <div className="space-y-2">
                <Input type="password" placeholder="Current password" />
                <Input type="password" placeholder="New password" />
                <Input type="password" placeholder="Confirm new password" />
              </div>
            </div>
            <Separator />
            <div className="space-y-3">
              <Label className="text-base flex items-center gap-2">
                <Key className="h-4 w-4" />
                Two-Factor Authentication
              </Label>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security
                </p>
                <Button variant="outline" size="sm">Enable 2FA</Button>
              </div>
            </div>
            <Separator />
            <div className="space-y-3">
              <Label className="text-base flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Active Sessions
              </Label>
              <div className="rounded-lg border p-3 space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">Current Device</span>
                  <span className="text-green-600 text-xs">Active now</span>
                </div>
                <p className="text-xs text-muted-foreground">Chrome on Windows • Last activity: Just now</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSecurityOpen(false)}>Cancel</Button>
            <Button onClick={() => setSecurityOpen(false)}>Update Security</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Help & Support Dialog */}
      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent className="sm:max-w-[500px] backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Help & Support
            </DialogTitle>
            <DialogDescription>
              Get help and access documentation
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <Button variant="outline" className="w-full justify-start gap-2" asChild>
              <a href="https://docs.example.com" target="_blank" rel="noopener noreferrer">
                <Book className="h-4 w-4" />
                Documentation
                <ExternalLink className="h-3 w-3 ml-auto" />
              </a>
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2">
              <FileText className="h-4 w-4" />
              User Guide
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2">
              <MessageSquare className="h-4 w-4" />
              Contact Support
            </Button>
            <Separator />
            <div className="rounded-lg bg-muted p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm font-semibold">Application Info</Label>
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>Version: 1.0.0</p>
                <p>Build: 2026.01.24</p>
                <p>License: Commercial</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setHelpOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save Confirmation Dialog */}
      <Dialog open={saveConfirmOpen} onOpenChange={setSaveConfirmOpen}>
        <DialogContent className="backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle>Save Changes</DialogTitle>
            <DialogDescription>
              {isLoading ? savingMessage : `You have ${pendingChanges.length} pending ${pendingChanges.length === 1 ? 'change' : 'changes'}. Save all changes to the database?`}
            </DialogDescription>
          </DialogHeader>
          {!isLoading && (
            <div className="py-2">
              <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-3">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Note:</strong> The page will refresh after saving to load the updated data.
                </p>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setSaveConfirmOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveChanges}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span>
                  {savingMessage || "Saving..."}
                </span>
              ) : (
                "Save All Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Mode OFF Confirmation Dialog */}
      <Dialog open={editModeOffConfirm} onOpenChange={setEditModeOffConfirm}>
        <DialogContent className="backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="text-amber-600">Unsaved Changes Detected</DialogTitle>
            <DialogDescription>
              You have unsaved changes. Turning off edit mode will discard all pending changes. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-4">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <strong>Warning:</strong> All unsaved edits, additions, and deletions will be permanently lost.
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setEditModeOffConfirm(false)}
              disabled={isLoading}
            >
              Keep Edit Mode ON
            </Button>
            <Button 
              onClick={handleConfirmEditModeOff}
              disabled={isLoading}
              variant="destructive"
            >
              {isLoading ? "Discarding..." : "Discard Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Route Dialog */}
      <Dialog open={addRouteOpen} onOpenChange={setAddRouteOpen}>
        <DialogContent className="backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle>Add New Route to {selectedParentRoute}</DialogTitle>
            <DialogDescription>
              Create a new route that will appear in the {selectedParentRoute} menu
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-3">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Note:</strong> The new route will use the same page template and automatically load data from the database based on its slug.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="routeName">Route Name *</Label>
              <Input
                id="routeName"
                placeholder="e.g., KL 8 - 3PVK05 or SL 2 - 3AVS02"
                value={routeName}
                onChange={(e) => {
                  const name = e.target.value
                  setRouteName(name)
                  
                  // Auto-generate slug from name
                  if (name) {
                    // Extract route number from name (e.g., "KL 8" -> "kl-8")
                    const match = name.match(/(KL|SL)\s*(\d+)/i)
                    if (match) {
                      const prefix = match[1].toLowerCase()
                      const number = match[2]
                      setRouteSlug(`${prefix}-${number}`)
                    }
                  }
                }}
                disabled={isAddingRoute}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="routeSlug" className={addRouteSlugError ? 'text-destructive' : ''}>Route Slug (URL) *</Label>
              <Input
                id="routeSlug"
                placeholder="e.g., kl-8 or sl-2"
                value={routeSlug}
                onChange={(e) => {
                  const slug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')
                  setRouteSlug(slug)
                  setAddRouteSlugError('')
                }}
                disabled={isAddingRoute}
                className={addRouteSlugError ? 'border-destructive' : ''}
              />
              {addRouteSlugError ? (
                <p className="text-sm text-destructive font-medium">{addRouteSlugError}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  URL format: /{routeSlug || 'your-slug'}. Must start with {selectedParentRoute.includes("KL") ? '"kl-"' : '"sl-"'}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="routeDescription">Description (Optional)</Label>
              <Input
                id="routeDescription"
                placeholder="Route description"
                value={routeDescription}
                onChange={(e) => setRouteDescription(e.target.value)}
                disabled={isAddingRoute}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setAddRouteOpen(false)
                setAddRouteSlugError('')
              }}
              disabled={isAddingRoute}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddRoute}
              disabled={isAddingRoute || !routeName.trim() || !routeSlug.trim() || !!addRouteSlugError}
              className="bg-green-600 hover:bg-green-700"
            >
              {isAddingRoute ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Creating Route...
                </span>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Route
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sidebar>
  )
}

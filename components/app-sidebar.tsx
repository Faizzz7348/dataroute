"use client"

import * as React from "react"
import { GalleryVerticalEnd, Minus, Plus, Settings, Palette, Bell, User, Shield, HelpCircle, Moon, Sun, Check } from "lucide-react"
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

// This is sample data.
const data = {
  navMain: [
    {
      title: "Home",
      url: "/",
      items: [],
    },
    {
      title: "Route Vm KL",
      url: "#",
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
  const { isEditMode, setIsEditMode, isLoading, setIsLoading } = useEditMode()
  const { theme, setTheme } = useTheme()
  const [colorTheme, setColorTheme] = React.useState<string>("default")

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
    setIsLoading(true)
    
    // Simulate page reload effect
    await new Promise(resolve => setTimeout(resolve, 800))
    
    setIsEditMode(mode)
    
    // Keep loading state for a moment to show the transition
    await new Promise(resolve => setTimeout(resolve, 400))
    setIsLoading(false)
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
              {data.navMain.map((item, index) => (
                item.items?.length ? (
                  <Collapsible
                    key={item.title}
                    defaultOpen={index === 1}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton>
                          {item.title}{" "}
                          <Plus className="ml-auto group-data-[state=open]/collapsible:hidden" />
                          <Minus className="ml-auto group-data-[state=closed]/collapsible:hidden" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton asChild>
                                <a href={subItem.url}>{subItem.title}</a>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                ) : (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url}>{item.title}</a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        
        <SidebarFooter className="shrink-0 border-t p-2 pb-safe">
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton size="lg">
                    <Settings className="h-5 w-5" />
                    <div className="flex flex-col gap-0.5 leading-none flex-1">
                      <span className="font-semibold">Settings</span>
                      <span className="text-xs text-muted-foreground">Configure options</span>
                    </div>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" align="end" className="w-[240px]">
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
                    <DropdownMenuSubTrigger>
                      <Palette className="mr-2 h-4 w-4" />
                      <div className="flex flex-col">
                        <span className="font-medium">Appearance</span>
                        <span className="text-xs text-muted-foreground">Theme & display</span>
                      </div>
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
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Color Theme</div>
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
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuItem>
                    <Bell className="mr-2 h-4 w-4" />
                    <div className="flex flex-col">
                      <span className="font-medium">Notifications</span>
                      <span className="text-xs text-muted-foreground">Alerts & updates</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <div className="flex flex-col">
                      <span className="font-medium">Account</span>
                      <span className="text-xs text-muted-foreground">Profile settings</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Shield className="mr-2 h-4 w-4" />
                    <div className="flex flex-col">
                      <span className="font-medium">Security</span>
                      <span className="text-xs text-muted-foreground">Privacy & access</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
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
    </Sidebar>
  )
}

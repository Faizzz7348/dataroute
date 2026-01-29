"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function ProjectsPage() {
  const projects = [
    { 
      id: "proj-1", 
      title: "Project Alpha",
      description: "VM deployment project for North region",
      status: "In Progress",
      images: [
        { id: "img-1", url: "/placeholder.svg", title: "Site 1" },
        { id: "img-2", url: "/placeholder.svg", title: "Site 2" },
      ]
    },
    { 
      id: "proj-2", 
      title: "Project Beta",
      description: "VM maintenance project for Central region",
      status: "Planning",
      images: [
        { id: "img-3", url: "/placeholder.svg", title: "Location A" },
        { id: "img-4", url: "/placeholder.svg", title: "Location B" },
        { id: "img-5", url: "/placeholder.svg", title: "Location C" },
      ]
    },
  ]

  return (
    <div className="flex-1 p-4">
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Projects</h2>
            <p className="text-sm text-muted-foreground">Manage your VM deployment projects</p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {projects.map((project) => (
          <div key={project.id} className="border-b border-border pb-6">
            <div className="px-4 mb-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold">{project.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                </div>
                <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {project.status}
                </span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <div className="flex gap-4 px-4 pb-4">
                {project.images.map((image) => (
                  <div 
                    key={image.id}
                    className="flex-shrink-0 w-64 rounded-lg border bg-card overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="relative w-full h-48 bg-muted">
                      <Image
                        src={image.url}
                        alt={image.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h4 className="font-medium">{image.title}</h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function GalleryPage() {
  const rows = [
    { 
      id: "row-1", 
      title: "VM Collection 1",
      images: [
        { id: "img-1", url: "/placeholder.svg", title: "VM Image 1", subtitle: "Description 1" },
        { id: "img-2", url: "/placeholder.svg", title: "VM Image 2", subtitle: "Description 2" },
        { id: "img-3", url: "/placeholder.svg", title: "VM Image 3", subtitle: "Description 3" },
      ]
    },
    { 
      id: "row-2", 
      title: "VM Collection 2",
      images: [
        { id: "img-4", url: "/placeholder.svg", title: "VM Image 4", subtitle: "Description 4" },
        { id: "img-5", url: "/placeholder.svg", title: "VM Image 5", subtitle: "Description 5" },
      ]
    },
  ]

  return (
    <div className="flex-1 p-4">
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Gallery</h2>
            <p className="text-sm text-muted-foreground">Browse VM images and collections</p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Upload
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        {rows.map((row) => (
          <div key={row.id} className="border-b border-border pb-6">
            <div className="px-4 mb-4">
              <h3 className="text-xl font-semibold">{row.title}</h3>
            </div>
            <div className="overflow-x-auto">
              <div className="flex gap-4 px-4 pb-4">
                {row.images.map((image) => (
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
                      <h4 className="font-medium mb-1">{image.title}</h4>
                      <p className="text-sm text-muted-foreground">{image.subtitle}</p>
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

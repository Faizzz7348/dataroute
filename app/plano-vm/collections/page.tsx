"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function CollectionsPage() {
  const collections = [
    { 
      id: "col-1", 
      title: "VM Models 2024",
      count: 12,
      thumbnail: "/placeholder.svg"
    },
    { 
      id: "col-2", 
      title: "Installation Photos",
      count: 8,
      thumbnail: "/placeholder.svg"
    },
    { 
      id: "col-3", 
      title: "Maintenance Records",
      count: 15,
      thumbnail: "/placeholder.svg"
    },
    { 
      id: "col-4", 
      title: "Site Surveys",
      count: 6,
      thumbnail: "/placeholder.svg"
    },
  ]

  return (
    <div className="flex-1 p-4">
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Collections</h2>
            <p className="text-sm text-muted-foreground">Organize your images into collections</p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Collection
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 px-4">
        {collections.map((collection) => (
          <div 
            key={collection.id}
            className="rounded-lg border bg-card overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="relative w-full h-48 bg-muted">
              <Image
                src={collection.thumbnail}
                alt={collection.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold mb-1">{collection.title}</h3>
              <p className="text-sm text-muted-foreground">{collection.count} items</p>
            </div>
          </div>
        ))}

        {/* Add Collection Card */}
        <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 bg-muted/50 flex items-center justify-center cursor-pointer transition-colors min-h-[280px]">
          <div className="text-center">
            <Plus className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground font-medium">Create Collection</p>
          </div>
        </div>
      </div>
    </div>
  )
}

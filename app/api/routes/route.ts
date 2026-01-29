import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET all routes with their locations
export async function GET() {
  try {
    const routes = await prisma.route.findMany({
      include: {
        locations: {
          orderBy: {
            code: 'asc'
          }
        }
      }
    })
    return NextResponse.json(routes)
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to fetch routes' }, { status: 500 })
  }
}

// POST create new route
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, slug, description } = body

    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      )
    }

    // Validate slug format
    const slugRegex = /^[a-z0-9-]+$/
    if (!slugRegex.test(slug)) {
      return NextResponse.json(
        { error: 'Slug must contain only lowercase letters, numbers, and hyphens' },
        { status: 400 }
      )
    }

    // Check if route already exists
    const existing = await prisma.route.findFirst({
      where: {
        OR: [
          { slug },
          { name }
        ]
      }
    })

    if (existing) {
      if (existing.slug === slug) {
        return NextResponse.json(
          { error: `A route with slug "${slug}" already exists` },
          { status: 409 }
        )
      }
      if (existing.name === name) {
        return NextResponse.json(
          { error: `A route with name "${name}" already exists` },
          { status: 409 }
        )
      }
    }

    // Create the route
    const route = await prisma.route.create({
      data: {
        name: name.trim(),
        slug: slug.trim(),
        description: description?.trim() || null
      }
    })

    return NextResponse.json(route, { status: 201 })
  } catch (error: unknown) {
    // Handle unique constraint violation (backup check)
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      const meta = 'meta' in error && error.meta && typeof error.meta === 'object' && 'target' in error.meta ? error.meta.target : null
      const field = Array.isArray(meta) && meta.length > 0 ? meta[0] : 'field'
      return NextResponse.json(
        { error: `A route with this ${field} already exists` },
        { status: 409 }
      )
    }
    
    return NextResponse.json({ error: 'Failed to create route' }, { status: 500 })
  }
}

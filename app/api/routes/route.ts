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
  } catch (error) {
    console.error('Error fetching routes:', error)
    return NextResponse.json({ error: 'Failed to fetch routes' }, { status: 500 })
  }
}

// POST create new route
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, slug, description } = body

    const route = await prisma.route.create({
      data: {
        name,
        slug,
        description
      }
    })

    return NextResponse.json(route, { status: 201 })
  } catch (error: any) {
    console.error('Error creating route:', error)
    
    // Handle unique constraint violation
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0] || 'field'
      return NextResponse.json(
        { error: `A route with this ${field} already exists` },
        { status: 409 }
      )
    }
    
    return NextResponse.json({ error: 'Failed to create route' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET all locations for a specific route
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  
  try {
    const route = await prisma.route.findUnique({
      where: { slug },
      include: {
        locations: {
          orderBy: {
            code: 'asc'
          }
        }
      }
    })

    if (!route) {
      return NextResponse.json({ error: 'Route not found' }, { status: 404 })
    }

    return NextResponse.json(route.locations)
  } catch (error) {
    console.error('Error fetching locations:', error)
    return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST create new location
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { routeId, code, location, delivery, lat, lng, color, powerMode, descriptionsObj } = body

    const newLocation = await prisma.deliveryLocation.create({
      data: {
        routeId,
        code,
        location,
        delivery,
        lat,
        lng,
        color,
        powerMode,
        descriptionsObj
      }
    })

    return NextResponse.json(newLocation, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create location' }, { status: 500 })
  }
}

// GET all locations
export async function GET() {
  try {
    const locations = await prisma.deliveryLocation.findMany({
      orderBy: {
        code: 'asc'
      },
      include: {
        route: true
      }
    })
    return NextResponse.json(locations)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 })
  }
}

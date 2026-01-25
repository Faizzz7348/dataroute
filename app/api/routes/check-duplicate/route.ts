import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET check if route slug already exists
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')

    if (!slug) {
      return NextResponse.json({ error: 'Slug parameter is required' }, { status: 400 })
    }

    const existingRoute = await prisma.route.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true
      }
    })

    if (existingRoute) {
      return NextResponse.json({
        exists: true,
        existingRoute
      })
    }

    return NextResponse.json({
      exists: false,
      existingRoute: null
    })
  } catch (error) {
    console.error('Error checking duplicate route:', error)
    return NextResponse.json({ error: 'Failed to check duplicate' }, { status: 500 })
  }
}

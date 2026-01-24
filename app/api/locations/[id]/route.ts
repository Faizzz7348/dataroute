import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET single location
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params
    const location = await prisma.deliveryLocation.findUnique({
      where: { id: parseInt(id) }
    })

    if (!location) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 })
    }

    return NextResponse.json(location)
  } catch (error) {
    console.error('Error fetching location:', error)
    return NextResponse.json({ error: 'Failed to fetch location' }, { status: 500 })
  }
}

// PUT update location
export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params
    const body = await request.json()

    const location = await prisma.deliveryLocation.update({
      where: { id: parseInt(id) },
      data: body
    })

    return NextResponse.json(location)
  } catch (error) {
    console.error('Error updating location:', error)
    return NextResponse.json({ error: 'Failed to update location' }, { status: 500 })
  }
}

// DELETE location
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params
    await prisma.deliveryLocation.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({ message: 'Location deleted successfully' })
  } catch (error) {
    console.error('Error deleting location:', error)
    return NextResponse.json({ error: 'Failed to delete location' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const excludeId = searchParams.get('excludeId');

    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    const codeNumber = parseInt(code);
    if (isNaN(codeNumber)) {
      return NextResponse.json({ error: 'Invalid code format' }, { status: 400 });
    }

    // Find duplicates
    const duplicates = await prisma.deliveryLocation.findMany({
      where: {
        code: codeNumber,
        ...(excludeId ? { id: { not: parseInt(excludeId) } } : {})
      },
      include: {
        route: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });

    return NextResponse.json({
      hasDuplicate: duplicates.length > 0,
      duplicates: duplicates.map((d) => ({
        id: d.id,
        code: d.code,
        location: d.location,
        routeId: d.routeId,
        routeName: d.route.name,
        routeSlug: d.route.slug
      }))
    });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to check duplicate' },
      { status: 500 }
    );
  }
}

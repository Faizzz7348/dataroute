const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkRoutes() {
  try {
    console.log('Checking routes in database...\n')
    
    const routes = await prisma.route.findMany({
      include: {
        _count: {
          select: { locations: true }
        }
      }
    })
    
    console.log('Routes found:', routes.length)
    routes.forEach(route => {
      console.log(`- ${route.name} (${route.slug}) - ${route._count.locations} locations`)
    })
    
    console.log('\nChecking sl-1 route specifically...')
    const sl1 = await prisma.route.findUnique({
      where: { slug: 'sl-1' },
      include: {
        locations: true
      }
    })
    
    if (sl1) {
      console.log('✅ SL-1 route exists!')
      console.log('Locations:', sl1.locations.length)
    } else {
      console.log('❌ SL-1 route NOT found!')
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkRoutes()

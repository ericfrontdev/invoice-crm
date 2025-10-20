import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Test de connexion à la base de données
    await prisma.$queryRaw`SELECT 1`

    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected',
      environment: process.env.NODE_ENV,
    }

    return NextResponse.json(health, { status: 200 })
  } catch (error) {
    const health = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'disconnected',
      environment: process.env.NODE_ENV,
      error: error instanceof Error ? error.message : 'Unknown error',
    }

    return NextResponse.json(health, { status: 503 })
  }
}

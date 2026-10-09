import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'

export const dynamic = 'force-dynamic'

export async function GET() {
  const started = Date.now()

  try {
    const db = await connectDB()
    await db.connection.db?.command({ ping: 1 })

    return NextResponse.json(
      {
        ok: true,
        service: 'aura-institute-api',
        database: 'mongodb',
        latencyMs: Date.now() - started,
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    )
  } catch (error) {
    console.error('HEALTH CHECK MONGODB ERROR:', error)

    return NextResponse.json(
      {
        ok: false,
        service: 'aura-institute-api',
        database: 'unavailable',
        latencyMs: Date.now() - started,
        error: error instanceof Error ? error.message : String(error),
      },
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    )
  }
}
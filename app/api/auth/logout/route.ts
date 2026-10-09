import { NextRequest, NextResponse } from 'next/server'
import { clearSession, apiError } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try { await clearSession(request); return NextResponse.json({ ok: true }) } catch (e) { return apiError(e) }
}

import { NextRequest, NextResponse } from 'next/server'
import { requireSession, apiError } from '@/lib/auth'
export async function GET(request: NextRequest) { try { return NextResponse.json({ user: await requireSession(request) }) } catch (e) { return apiError(e) } }

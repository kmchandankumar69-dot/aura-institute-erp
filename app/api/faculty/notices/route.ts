import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Notice } from '@/models/Academic'
import { requireRole, apiError } from '@/lib/auth'
import { noticeSchema } from '@/lib/validation'
import { assertJsonSize } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(['FACULTY', 'ADMIN'], request)
    assertJsonSize(request)
    const parsed = noticeSchema.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ error: 'Invalid notice', details: parsed.error.flatten() }, { status: 400 })
    await connectDB()
    const notice = await Notice.create({ ...parsed.data, publishedBy: user.id })
    return NextResponse.json({ notice }, { status: 201 })
  } catch (e) { return apiError(e) }
}

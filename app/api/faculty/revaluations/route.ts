import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { connectDB } from '@/lib/mongodb'
import { Revaluation } from '@/models/Academic'
import { requireRole, apiError } from '@/lib/auth'
import { assertJsonSize } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  try {
    await requireRole(['FACULTY', 'ADMIN'], request)
    await connectDB()
    const requests = await Revaluation.find().populate('userId', 'name email studentId department').sort({ createdAt: -1 }).limit(100).lean()
    return NextResponse.json({ requests })
  } catch (e) { return apiError(e) }
}

export async function PATCH(request: NextRequest) {
  try {
    const reviewer = await requireRole(['FACULTY', 'ADMIN'], request)
    assertJsonSize(request)
    const body = await request.json()
    if (!mongoose.isValidObjectId(body.id) || !['PENDING', 'APPROVED', 'REJECTED'].includes(body.status)) return NextResponse.json({ error: 'Invalid revaluation update' }, { status: 400 })
    await connectDB()
    const item = await Revaluation.findByIdAndUpdate(body.id, { status: body.status, reviewedBy: reviewer.id, reviewedAt: new Date() }, { returnDocument: 'after', runValidators: true }).lean()
    if (!item) return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    return NextResponse.json({ request: item })
  } catch (e) { return apiError(e) }
}

import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { connectDB } from '@/lib/mongodb'
import { Event, EventRegistration } from '@/models/Event'
import { apiError, requireRole } from '@/lib/auth'
import { eventSchema } from '@/lib/validation'
import { assertJsonSize } from '@/lib/rate-limit'
import { writeAuditLog } from '@/lib/audit'

export async function GET() {
  try { await connectDB(); const events = await Event.find({ active: true }).sort({ date: 1 }).limit(100).lean(); return NextResponse.json({ events }) } catch (e) { return apiError(e) }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireRole(['ADMIN'], request)
    assertJsonSize(request)
    const parsed = eventSchema.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ error: 'Invalid event', details: parsed.error.flatten() }, { status: 400 })
    await connectDB()
    const event = await Event.create(parsed.data)
    await writeAuditLog(admin.id, 'Created event', 'Event', String(event._id), { title: event.title })
    return NextResponse.json({ event }, { status: 201 })
  } catch (e) { return apiError(e) }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await requireRole(['ADMIN'], request)
    assertJsonSize(request)
    const body = await request.json()
    if (!mongoose.isValidObjectId(body.id)) return NextResponse.json({ error: 'Invalid event id' }, { status: 400 })
    const parsed = eventSchema.partial().safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid event', details: parsed.error.flatten() }, { status: 400 })
    await connectDB()
    const event = await Event.findByIdAndUpdate(body.id, parsed.data, { returnDocument: 'after', runValidators: true }).lean()
    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    await writeAuditLog(admin.id, 'Updated event', 'Event', String(event._id), { title: event.title })
    return NextResponse.json({ event })
  } catch (e) { return apiError(e) }
}

export async function DELETE(request: NextRequest) {
  try {
    const admin = await requireRole(['ADMIN'], request)
    const id = request.nextUrl.searchParams.get('id')
    if (!id || !mongoose.isValidObjectId(id)) return NextResponse.json({ error: 'Invalid event id' }, { status: 400 })
    await connectDB()
    const event = await Event.findById(id).lean()
    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    await EventRegistration.deleteMany({ eventId: id })
    await Event.deleteOne({ _id: id })
    await writeAuditLog(admin.id, 'Deleted event', 'Event', id, { title: event.title })
    return NextResponse.json({ ok: true })
  } catch (e) { return apiError(e) }
}

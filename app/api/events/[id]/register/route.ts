import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { connectDB } from '@/lib/mongodb'
import { Event, EventRegistration } from '@/models/Event'
import { requireRole, apiError } from '@/lib/auth'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireRole(['STUDENT'], request)
    const { id } = await params
    if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: 'Invalid event id' }, { status: 400 })
    await connectDB()
    if (await EventRegistration.exists({ eventId: id, userId: user.id })) return NextResponse.json({ error: 'Already registered' }, { status: 409 })
    const event = await Event.findOneAndUpdate({ _id: id, active: true, $expr: { $lt: ['$registeredCount', '$capacity'] } }, { $inc: { registeredCount: 1 } }, { returnDocument: 'after' }).lean()
    if (!event) return NextResponse.json({ error: 'Event is full or unavailable' }, { status: 409 })
    try {
      const registration = await EventRegistration.create({ eventId: id, userId: user.id })
      return NextResponse.json({ registration }, { status: 201 })
    } catch (error: any) {
      await Event.updateOne({ _id: id, registeredCount: { $gt: 0 } }, { $inc: { registeredCount: -1 } })
      if (error?.code === 11000) return NextResponse.json({ error: 'Already registered' }, { status: 409 })
      throw error
    }
  } catch (e) { return apiError(e) }
}

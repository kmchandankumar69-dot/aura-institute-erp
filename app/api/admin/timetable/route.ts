import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { connectDB } from '@/lib/mongodb'
import { Timetable } from '@/models/Timetable'
import { requireRole, apiError } from '@/lib/auth'
import { timetableSchema } from '@/lib/validation'
import { writeAuditLog } from '@/lib/audit'

export async function GET(request: NextRequest) {
  try {
    await requireRole(['ADMIN'], request)
    await connectDB()
    const semester = Number(request.nextUrl.searchParams.get('semester') || 0)
    const filter = Number.isInteger(semester) && semester > 0 ? { semester } : {}
    const items = await Timetable.find(filter).sort({ semester: 1, examDate: 1, startTime: 1 }).limit(1000).lean()
    return NextResponse.json({ timetable: items })
  } catch (e) { return apiError(e) }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireRole(['ADMIN'], request)
    const parsed = timetableSchema.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ error: 'Invalid timetable entry', details: parsed.error.flatten() }, { status: 400 })
    await connectDB()
    const item = await Timetable.create(parsed.data)
    await writeAuditLog(admin.id, 'Created timetable entry', 'Timetable', String(item._id), { subject: item.subject, semester: item.semester })
    return NextResponse.json({ item }, { status: 201 })
  } catch (e) { return apiError(e) }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await requireRole(['ADMIN'], request)
    const body = await request.json()
    if (!mongoose.isValidObjectId(body.id)) return NextResponse.json({ error: 'Invalid timetable id' }, { status: 400 })
    const parsed = timetableSchema.partial().safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid timetable entry', details: parsed.error.flatten() }, { status: 400 })
    await connectDB()
    const item = await Timetable.findByIdAndUpdate(body.id, parsed.data, { returnDocument: 'after', runValidators: true }).lean()
    if (!item) return NextResponse.json({ error: 'Timetable entry not found' }, { status: 404 })
    await writeAuditLog(admin.id, 'Updated timetable entry', 'Timetable', String(item._id), { subject: item.subject, semester: item.semester })
    return NextResponse.json({ item })
  } catch (e) { return apiError(e) }
}

export async function DELETE(request: NextRequest) {
  try {
    const admin = await requireRole(['ADMIN'], request)
    const id = request.nextUrl.searchParams.get('id')
    if (!id || !mongoose.isValidObjectId(id)) return NextResponse.json({ error: 'Invalid timetable id' }, { status: 400 })
    await connectDB()
    const item = await Timetable.findById(id).lean()
    if (!item) return NextResponse.json({ error: 'Timetable entry not found' }, { status: 404 })
    await Timetable.deleteOne({ _id: id })
    await writeAuditLog(admin.id, 'Deleted timetable entry', 'Timetable', id, { subject: item.subject, semester: item.semester })
    return NextResponse.json({ ok: true })
  } catch (e) { return apiError(e) }
}

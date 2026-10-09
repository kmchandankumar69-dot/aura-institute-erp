import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { connectDB } from '@/lib/mongodb'
import { RevaluationSubject } from '@/models/RevaluationSubject'
import { requireRole, apiError } from '@/lib/auth'
import { revaluationSubjectSchema } from '@/lib/validation'
import { writeAuditLog } from '@/lib/audit'

export async function GET(request: NextRequest) {
  try {
    await requireRole(['ADMIN'], request)
    await connectDB()
    const subjects = await RevaluationSubject.find().sort({ semester: 1, name: 1 }).limit(500).lean()
    return NextResponse.json({ subjects })
  } catch (e) { return apiError(e) }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireRole(['ADMIN'], request)
    const parsed = revaluationSubjectSchema.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ error: 'Invalid subject', details: parsed.error.flatten() }, { status: 400 })
    await connectDB()
    try {
      const subject = await RevaluationSubject.create(parsed.data)
      await writeAuditLog(admin.id, 'Created revaluation subject', 'RevaluationSubject', String(subject._id), { code: subject.code, name: subject.name })
      return NextResponse.json({ subject }, { status: 201 })
    } catch (e: any) {
      if (e?.code === 11000) return NextResponse.json({ error: 'Subject code already exists.' }, { status: 409 })
      throw e
    }
  } catch (e) { return apiError(e) }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await requireRole(['ADMIN'], request)
    const body = await request.json()
    if (!mongoose.isValidObjectId(body.id)) return NextResponse.json({ error: 'Invalid subject id' }, { status: 400 })
    const parsed = revaluationSubjectSchema.partial().safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid subject', details: parsed.error.flatten() }, { status: 400 })
    await connectDB()
    try {
      const subject = await RevaluationSubject.findByIdAndUpdate(body.id, parsed.data, { returnDocument: 'after', runValidators: true }).lean()
      if (!subject) return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
      await writeAuditLog(admin.id, 'Updated revaluation subject', 'RevaluationSubject', String(subject._id), { code: subject.code, name: subject.name })
      return NextResponse.json({ subject })
    } catch (e: any) {
      if (e?.code === 11000) return NextResponse.json({ error: 'Subject code already exists.' }, { status: 409 })
      throw e
    }
  } catch (e) { return apiError(e) }
}

export async function DELETE(request: NextRequest) {
  try {
    const admin = await requireRole(['ADMIN'], request)
    const id = request.nextUrl.searchParams.get('id')
    if (!id || !mongoose.isValidObjectId(id)) return NextResponse.json({ error: 'Invalid subject id' }, { status: 400 })
    await connectDB()
    const subject = await RevaluationSubject.findById(id).lean()
    if (!subject) return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
    await RevaluationSubject.deleteOne({ _id: id })
    await writeAuditLog(admin.id, 'Deleted revaluation subject', 'RevaluationSubject', id, { code: subject.code, name: subject.name })
    return NextResponse.json({ ok: true })
  } catch (e) { return apiError(e) }
}

import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/models/User'
import { Grade, StudentCgpa } from '@/models/Academic'
import { requireRole, apiError } from '@/lib/auth'
import { syncEnrolledAdmissions } from '@/lib/student-profile'
import { assertJsonSize } from '@/lib/rate-limit'
import { writeAuditLog } from '@/lib/audit'

function round2(value: number) { return Math.round(value * 100) / 100 }

async function currentCgpaMap(userIds: any[]) {
  const [official, grades] = await Promise.all([
    StudentCgpa.find({ userId: { $in: userIds } }).sort({ semester: -1, updatedAt: -1 }).lean(),
    Grade.find({ userId: { $in: userIds } }).select('userId sgpa semester').lean(),
  ])
  const map = new Map<string, { cgpa: number | null; source: string; semester: number | null }>()
  for (const record of official) {
    const key = String(record.userId)
    if (!map.has(key)) map.set(key, { cgpa: record.cgpa, source: 'ADMIN', semester: record.semester })
  }
  const grouped = new Map<string, number[]>()
  for (const grade of grades) {
    const key = String(grade.userId)
    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key)!.push(grade.sgpa)
  }
  for (const [key, values] of grouped) {
    if (!map.has(key)) map.set(key, { cgpa: round2(values.reduce((a, b) => a + b, 0) / values.length), source: 'SGPA_AVERAGE', semester: null })
  }
  return map
}

export async function GET(request: NextRequest) {
  try {
    await requireRole(['ADMIN'], request)
    await connectDB()
    await syncEnrolledAdmissions()
    const students = await User.find({ role: 'STUDENT' }).select('name email studentId department phone active createdAt').sort({ name: 1 }).limit(1000).lean()
    const ids = students.map(student => student._id)
    const [records, cgpaMap] = await Promise.all([
      StudentCgpa.find({ userId: { $in: ids } }).sort({ semester: 1 }).lean(),
      currentCgpaMap(ids),
    ])
    const byUser = new Map<string, any[]>()
    for (const record of records) {
      const key = String(record.userId)
      if (!byUser.has(key)) byUser.set(key, [])
      byUser.get(key)!.push(record)
    }
    return NextResponse.json({ students: students.map(student => ({ ...student, currentCgpa: cgpaMap.get(String(student._id))?.cgpa ?? null, cgpaSource: cgpaMap.get(String(student._id))?.source ?? 'NONE', cgpaRecords: byUser.get(String(student._id)) || [] })) })
  } catch (e) { return apiError(e) }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await requireRole(['ADMIN'], request)
    assertJsonSize(request)
    const body = await request.json()
    if (!mongoose.isValidObjectId(body.userId)) return NextResponse.json({ error: 'Invalid student' }, { status: 400 })
    const semester = Number(body.semester)
    const cgpa = Number(body.cgpa)
    if (!Number.isInteger(semester) || semester < 1 || semester > 20 || !Number.isFinite(cgpa) || cgpa < 0 || cgpa > 10) return NextResponse.json({ error: 'Semester must be 1–20 and CGPA must be between 0 and 10.' }, { status: 400 })
    await connectDB()
    const student = await User.findOne({ _id: body.userId, role: 'STUDENT' }).select('_id').lean()
    if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    const record = await StudentCgpa.findOneAndUpdate({ userId: student._id, semester }, { userId: student._id, semester, cgpa, updatedBy: admin.id }, { upsert: true, returnDocument: 'after', runValidators: true, setDefaultsOnInsert: true }).lean()
    await writeAuditLog(admin.id, 'Updated student CGPA', 'StudentCgpa', String(record._id), { studentId: String(student._id), semester, cgpa })
    return NextResponse.json({ record })
  } catch (e) { return apiError(e) }
}

export async function DELETE(request: NextRequest) {
  try {
    const admin = await requireRole(['ADMIN'], request)
    const id = request.nextUrl.searchParams.get('id')
    if (!id || !mongoose.isValidObjectId(id)) return NextResponse.json({ error: 'Invalid CGPA record' }, { status: 400 })
    await connectDB()
    const deleted = await StudentCgpa.findByIdAndDelete(id).lean()
    if (!deleted) return NextResponse.json({ error: 'CGPA record not found' }, { status: 404 })
    await writeAuditLog(admin.id, 'Deleted student CGPA record', 'StudentCgpa', String(id), { semester: deleted.semester, cgpa: deleted.cgpa, studentId: String(deleted.userId) })
    return NextResponse.json({ ok: true })
  } catch (e) { return apiError(e) }
}

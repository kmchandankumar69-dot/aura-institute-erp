import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { connectDB } from '@/lib/mongodb'
import { Placement, PlacementApplication } from '@/models/Placement'
import { getCurrentCgpa } from '@/lib/student-profile'
import { requireRole, apiError } from '@/lib/auth'
import { assertJsonSize } from '@/lib/rate-limit'
import { Notification } from '@/models/Notification'
import { writeAuditLog } from '@/lib/audit'

export async function GET(request: NextRequest) {
  try {
    await requireRole(['ADMIN'], request)
    await connectDB()
    const placements = await Placement.find().sort({ createdAt: -1 }).limit(100).lean()
    const applications = await PlacementApplication.find().populate('userId', 'name email studentId department phone').populate('placementId', 'companyName jobRole salary minCgpa eligibleSemesters').sort({ createdAt: -1 }).limit(500).lean()
    const userIds = applications.map(item => (item.userId as any)?._id).filter(Boolean)
    const cgpas = await Promise.all(userIds.map(async id => [String(id), await getCurrentCgpa(id)] as const))
    const cgpaMap = new Map(cgpas)
    return NextResponse.json({ placements, applications: applications.map(item => { const key = String((item.userId as any)?._id || ''); return { ...item, currentCgpa: cgpaMap.get(key)?.cgpa ?? null } }) })
  } catch (e) { return apiError(e) }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await requireRole(['ADMIN'], request)
    assertJsonSize(request)
    const body = await request.json()
    if (!mongoose.isValidObjectId(body.id) || !['APPLIED', 'SHORTLISTED', 'SELECTED', 'REJECTED'].includes(body.status)) return NextResponse.json({ error: 'Invalid placement application update' }, { status: 400 })
    await connectDB()
    const application = await PlacementApplication.findByIdAndUpdate(body.id, { status: body.status, updatedBy: admin.id }, { returnDocument: 'after', runValidators: true }).populate('userId', 'name email studentId department phone').populate('placementId', 'companyName jobRole salary minCgpa').lean()
    if (!application) return NextResponse.json({ error: 'Placement application not found' }, { status: 404 })
    const studentId = (application.userId as any)?._id
    const placement = application.placementId as any
    if (studentId) await Notification.create({ userId: studentId, title: 'Placement application update', message: `${placement?.companyName || 'The recruiter'} updated your application to ${body.status}.`, type: 'PLACEMENT' })
    await writeAuditLog(admin.id, `Placement application ${body.status.toLowerCase()}`, 'PlacementApplication', String(application._id), { student: studentId ? String(studentId) : undefined, company: placement?.companyName })
    return NextResponse.json({ application })
  } catch (e) { return apiError(e) }
}

import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/models/User'
import { requireRole, apiError } from '@/lib/auth'
import { writeAuditLog } from '@/lib/audit'
import { Notification } from '@/models/Notification'

export async function GET(request: NextRequest) {
  try {
    await requireRole(['ADMIN'], request)
    await connectDB()
    const students = await User.find({ role: 'STUDENT', photoStatus: 'PENDING', pendingPhotoData: { $exists: true, $ne: null } })
      .select('name email studentId department pendingPhotoData photoUploadedAt')
      .sort({ photoUploadedAt: 1 })
      .limit(200)
      .lean()
    return NextResponse.json({ students })
  } catch (e) { return apiError(e) }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await requireRole(['ADMIN'], request)
    const body = await request.json()
    const action = String(body.action || '').toUpperCase()
    if (!['APPROVE', 'REJECT'].includes(action)) return NextResponse.json({ error: 'Action must be APPROVE or REJECT.' }, { status: 400 })
    await connectDB()
    const student = await User.findOne({ _id: body.userId, role: 'STUDENT' }).select('name studentId pendingPhotoData photoStatus').lean()
    if (!student) return NextResponse.json({ error: 'Student not found.' }, { status: 404 })
    if (action === 'APPROVE') {
      if (!student.pendingPhotoData) return NextResponse.json({ error: 'No pending photo found.' }, { status: 400 })
      await User.updateOne({ _id: student._id }, { $set: { photoData: student.pendingPhotoData, photoStatus: 'APPROVED', photoVerifiedAt: new Date(), photoVerifiedBy: admin.id }, $unset: { pendingPhotoData: '', photoRejectedReason: '' } })
      await writeAuditLog(admin.id, 'Approved student photo', 'StudentPhoto', String(student._id), { studentId: student.studentId })
      await Notification.create({ userId: student._id, title: 'Student photo approved', message: 'Your student photo has been verified. You can now use it on your digital Student ID.', type: 'SYSTEM' })
      return NextResponse.json({ ok: true, status: 'APPROVED' })
    }
    const reason = String(body.reason || 'Photo did not meet institute verification requirements.').trim().slice(0, 300)
    await User.updateOne({ _id: student._id }, { $set: { photoStatus: 'REJECTED', photoRejectedReason: reason }, $unset: { pendingPhotoData: '' } })
    await writeAuditLog(admin.id, 'Rejected student photo', 'StudentPhoto', String(student._id), { studentId: student.studentId, reason })
    await Notification.create({ userId: student._id, title: 'Student photo needs changes', message: `Your submitted Student ID photo was rejected. ${reason}`, type: 'SYSTEM' })
    return NextResponse.json({ ok: true, status: 'REJECTED', reason })
  } catch (e) { return apiError(e) }
}

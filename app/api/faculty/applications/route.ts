import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { connectDB } from '@/lib/mongodb'
import { Admission } from '@/models/Admission'
import { requireRole, apiError } from '@/lib/auth'
import { applicationUpdateSchema } from '@/lib/validation'
import { assertJsonSize } from '@/lib/rate-limit'
import { ensureStudentProfileFromAdmission } from '@/lib/student-profile'
import { Notification } from '@/models/Notification'
import { writeAuditLog } from '@/lib/audit'

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireRole(['FACULTY', 'ADMIN'], request)
    assertJsonSize(request)
    const parsed = applicationUpdateSchema.safeParse(await request.json())
    if (!parsed.success || !mongoose.isValidObjectId(parsed.data?.id)) return NextResponse.json({ error: 'Invalid application update' }, { status: 400 })
    await connectDB()
    const application = await Admission.findByIdAndUpdate(parsed.data.id, { status: parsed.data.status, notes: parsed.data.notes, updatedBy: user.id }, { returnDocument: 'after', runValidators: true }).lean()
    if (!application) return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    const student = parsed.data.status === 'ENROLLED' ? await ensureStudentProfileFromAdmission(application) : null
    if (student?._id) await Notification.create({ userId: student._id, title: 'Admission status updated', message: `Your admission application ${application.applicationNo} is now ${String(parsed.data.status).replaceAll('_',' ')}.`, type: 'ADMISSION' })
    await writeAuditLog(user.id, 'Updated admission status', 'Admission', String(application._id), { status: parsed.data.status, applicationNo: application.applicationNo })
    return NextResponse.json({ application, student })
  } catch (e) { return apiError(e) }
}

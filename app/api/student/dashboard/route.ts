import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Exam, Grade, Notice, Revaluation } from '@/models/Academic'
import { Admission } from '@/models/Admission'
import { User } from '@/models/User'
import { requireRole, apiError } from '@/lib/auth'
import { ensureStudentProfileFromAdmission, getCurrentCgpa, getCgpaHistory, getCurrentSemester } from '@/lib/student-profile'
import { Notification } from '@/models/Notification'

export async function GET(request: NextRequest) {
  try {
    const session = await requireRole(['STUDENT'], request)
    await connectDB()
    const user = await User.findById(session.id).select('name email studentId department phone photoData photoStatus photoRejectedReason').lean()
    const [exams, grades, revaluations, notices, admission] = await Promise.all([
      Exam.find({ userId: session.id }).sort({ date: 1 }).limit(10).lean(),
      Grade.find({ userId: session.id }).sort({ semester: 1 }).lean(),
      Revaluation.find({ userId: session.id }).sort({ createdAt: -1 }).limit(10).lean(),
      Notice.find({ audience: { $in: ['ALL', 'STUDENT'] } }).sort({ publishedAt: -1 }).limit(10).lean(),
      user?.email ? Admission.findOne({ email: user.email }).sort({ createdAt: -1 }).select('applicationNo applicantName email phone program intake residency admissionMode status notes createdAt updatedAt').lean() : null,
    ])
    if (admission?.status === 'ENROLLED') {
      await ensureStudentProfileFromAdmission(admission)
    }
    const [freshUser, currentCgpa, cgpaHistory, currentSemester, notifications] = await Promise.all([
      User.findById(session.id).select('name email studentId department phone photoData photoStatus photoRejectedReason').lean(),
      getCurrentCgpa(session.id),
      getCgpaHistory(session.id),
      getCurrentSemester(session.id),
      Notification.find({ userId: session.id }).sort({ createdAt: -1 }).limit(12).lean(),
    ])
    return NextResponse.json({ user: freshUser || user, exams, grades, revaluations, notices, admission, currentCgpa, cgpaHistory, currentSemester, notifications })
  } catch (e) { return apiError(e) }
}

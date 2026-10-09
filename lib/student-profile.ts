import { Admission } from '@/models/Admission'
import { Grade, StudentCgpa } from '@/models/Academic'
import { User } from '@/models/User'

const PROGRAM_CODE: Record<string, string> = {
  'B.Tech Computer Science': 'CS',
  'B.Des Product Design': 'PD',
  'BBA Innovation': 'BI',
}

export function departmentForProgram(program?: string) {
  if (!program) return undefined
  if (program === 'B.Tech Computer Science') return 'Computer Science'
  if (program === 'B.Des Product Design') return 'Product Design'
  if (program === 'BBA Innovation') return 'Business & Innovation'
  return undefined
}

export async function ensureStudentProfileFromAdmission(admission: any) {
  if (!admission?.email || admission.status !== 'ENROLLED') return null
  const user = await User.findOne({ email: String(admission.email).toLowerCase().trim(), role: 'STUDENT' })
  if (!user) return null

  const updates: Record<string, unknown> = {}
  const department = departmentForProgram(admission.program)
  if (admission.phone && user.phone !== admission.phone) updates.phone = admission.phone
  if (department && user.department !== department) updates.department = department

  if (!user.studentId) {
    const intake = String(admission.intake || new Date().getFullYear())
    const code = PROGRAM_CODE[admission.program] || 'GN'
    const pattern = new RegExp(`^AIT${intake}${code}\\d{3}$`)
    let sequence = await User.countDocuments({ studentId: pattern }) + 1
    let studentId = `AIT${intake}${code}${String(sequence).padStart(3, '0')}`
    while (await User.exists({ studentId })) {
      sequence += 1
      studentId = `AIT${intake}${code}${String(sequence).padStart(3, '0')}`
    }
    updates.studentId = studentId
  }

  if (Object.keys(updates).length) await User.updateOne({ _id: user._id }, { $set: updates })
  return User.findById(user._id).select('name email role studentId department phone').lean()
}

export async function getCurrentCgpa(userId: string | { toString(): string }) {
  const official = await StudentCgpa.find({ userId }).sort({ semester: -1, updatedAt: -1 }).limit(1).lean()
  if (official.length) return { cgpa: official[0].cgpa, source: 'ADMIN', semester: official[0].semester }
  const grades = await Grade.find({ userId }).select('sgpa semester').sort({ semester: 1 }).lean()
  if (!grades.length) return { cgpa: null, source: 'NONE', semester: null }
  const cgpa = Math.round((grades.reduce((sum, item) => sum + item.sgpa, 0) / grades.length) * 100) / 100
  return { cgpa, source: 'SGPA_AVERAGE', semester: grades.at(-1)?.semester ?? null }
}

export async function getCurrentSemester(userId: string | { toString(): string }) {
  const grades = await Grade.find({ userId }).select('semester').sort({ semester: -1 }).limit(1).lean()
  if (grades.length && Number.isInteger(grades[0].semester)) return grades[0].semester
  const official = await StudentCgpa.find({ userId }).select('semester').sort({ semester: -1 }).limit(1).lean()
  return official.length ? official[0].semester : null
}

export async function getCgpaHistory(userId: string | { toString(): string }) {
  return StudentCgpa.find({ userId }).sort({ semester: 1 }).lean()
}

export async function syncEnrolledAdmissions() {
  const admissions = await Admission.find({ status: 'ENROLLED' }).select('email applicantName phone program intake status').limit(500).lean()
  for (const admission of admissions) await ensureStudentProfileFromAdmission(admission)
}

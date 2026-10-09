import { z } from 'zod'

export const registerSchema = z.object({ name: z.string().trim().min(2).max(80), email: z.email(), password: z.string().min(12).max(128) })
export const loginSchema = z.object({ email: z.email(), password: z.string().min(1).max(128) })
export const admissionSchema = z.object({
  applicantName: z.string().trim().min(2).max(120), email: z.email(), phone: z.string().trim().min(7).max(20).optional().or(z.literal('')),
  program: z.enum(['B.Tech Computer Science', 'B.Des Product Design', 'BBA Innovation']),
  intake: z.enum(['2026', '2027']), residency: z.enum(['HOSTEL', 'DAY_SCHOLAR']),
  admissionMode: z.enum(['CET', 'COMEDK', 'MANAGEMENT_QUOTA']),
  academicDetails: z.record(z.string(), z.unknown()).optional(),
})
export const revaluationSchema = z.object({ course: z.string().trim().min(2).max(120), subjectId: z.string().optional(), reason: z.string().trim().min(10).max(1000) })
export const noticeSchema = z.object({ title: z.string().trim().min(3).max(160), body: z.string().trim().min(3).max(5000), audience: z.enum(['ALL', 'STUDENT', 'FACULTY']).default('ALL') })
export const applicationUpdateSchema = z.object({ id: z.string().min(1), status: z.enum(['SUBMITTED', 'UNDER_REVIEW', 'ASSESSMENT', 'INTERVIEW', 'OFFERED', 'ENROLLED', 'REJECTED']), notes: z.string().max(5000).optional() })
export const eventSchema = z.object({ title: z.string().trim().min(2).max(160), date: z.coerce.date(), time: z.string().trim().max(40).optional(), venue: z.string().trim().max(160).optional(), capacity: z.number().int().min(1).max(100000).default(100), description: z.string().trim().max(5000).optional(), active: z.boolean().default(true) })
export const revaluationSubjectSchema = z.object({ name: z.string().trim().min(2).max(160), code: z.string().trim().min(2).max(40), semester: z.number().int().min(1).max(20), active: z.boolean().default(true) })
export const timetableSchema = z.object({
  subject: z.string().trim().min(2).max(160),
  subjectCode: z.string().trim().min(2).max(40),
  semester: z.number().int().min(1).max(20),
  examDate: z.coerce.date(),
  startTime: z.string().trim().min(1).max(20),
  endTime: z.string().trim().min(1).max(20),
  examType: z.enum(['THEORY', 'PRACTICAL']),
  assessment: z.enum(['1ST_INTERNAL', '2ND_INTERNAL', '3RD_INTERNAL', 'MAIN_EXAM']),
  venue: z.string().trim().max(160).optional(),
})

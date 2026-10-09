import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'node:crypto'
import { connectDB } from '@/lib/mongodb'
import { Admission } from '@/models/Admission'
import { User } from '@/models/User'
import { admissionSchema } from '@/lib/validation'
import { requireRole, apiError } from '@/lib/auth'
import { clientAddress, rateLimit, assertJsonSize } from '@/lib/rate-limit'
import { ensureStudentProfileFromAdmission } from '@/lib/student-profile'

async function applicationNo() {
  await connectDB()
  for (let attempt = 0; attempt < 5; attempt++) {
    const value = `AIT-${new Date().getFullYear()}-${randomBytes(4).toString('hex').toUpperCase()}`
    if (!(await Admission.exists({ applicationNo: value }))) return value
  }
  throw new Error('Could not allocate an application number')
}

export async function POST(request: NextRequest) {
  try {
    assertJsonSize(request)
    const limiter = await rateLimit(`admission:${clientAddress(request)}`, 5, 60 * 60_000)
    if (!limiter.allowed) return NextResponse.json({ error: 'Too many applications from this network. Please try again later.' }, { status: 429, headers: { 'Retry-After': String(limiter.retryAfter) } })
    const parsed = admissionSchema.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ error: 'Invalid application', details: parsed.error.flatten() }, { status: 400 })
    await connectDB()
    const admission = await Admission.create({ ...parsed.data, applicationNo: await applicationNo() })
    return NextResponse.json({ application: admission }, { status: 201 })
  } catch (e) { return apiError(e) }
}

export async function GET(request: NextRequest) {
  try {
    await requireRole(['FACULTY', 'ADMIN'], request)
    await connectDB()
    const status = request.nextUrl.searchParams.get('status')
    const allowed = ['SUBMITTED', 'UNDER_REVIEW', 'ASSESSMENT', 'INTERVIEW', 'OFFERED', 'ENROLLED', 'REJECTED']
    if (status && !allowed.includes(status)) return NextResponse.json({ error: 'Invalid status filter' }, { status: 400 })
    const page = Math.max(1, Number(request.nextUrl.searchParams.get('page') || 1))
    const limit = Math.min(100, Math.max(1, Number(request.nextUrl.searchParams.get('limit') || 50)))
    const filter = status ? { status } : {}
    const applications = await Admission.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean()
    await Promise.all(applications.filter(item => item.status === 'ENROLLED').map(item => ensureStudentProfileFromAdmission(item)))
    const emails = applications.map(item => item.email).filter(Boolean).map(email => String(email).toLowerCase())
    const users = emails.length ? await User.find({ email: { $in: emails }, role: 'STUDENT' }).select('email studentId department phone').lean() : []
    const byEmail = new Map(users.map(user => [String(user.email).toLowerCase(), user]))
    const enriched = applications.map(item => ({ ...item, studentProfile: byEmail.get(String(item.email || '').toLowerCase()) || null }))
    return NextResponse.json({ applications: enriched })
  } catch (e) { return apiError(e) }
}

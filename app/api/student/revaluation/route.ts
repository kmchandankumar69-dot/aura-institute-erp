import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Revaluation } from '@/models/Academic'
import { RevaluationSubject } from '@/models/RevaluationSubject'
import mongoose from 'mongoose'
import { requireRole, apiError } from '@/lib/auth'
import { revaluationSchema } from '@/lib/validation'
import { assertJsonSize, rateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(['STUDENT'], request)
    assertJsonSize(request)
    const limiter = await rateLimit(`revaluation:${user.id}`, 5, 24 * 60 * 60_000)
    if (!limiter.allowed) return NextResponse.json({ error: 'Daily revaluation request limit reached.' }, { status: 429, headers: { 'Retry-After': String(limiter.retryAfter) } })
    const parsed = revaluationSchema.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 })
    await connectDB()
    let subjectId: string | undefined
    if (parsed.data.subjectId) {
      if (!mongoose.isValidObjectId(parsed.data.subjectId)) return NextResponse.json({ error: 'Invalid subject.' }, { status: 400 })
      const subject = await RevaluationSubject.findOne({ _id: parsed.data.subjectId, active: true }).lean()
      if (!subject) return NextResponse.json({ error: 'Selected subject is not available for revaluation.' }, { status: 400 })
      subjectId = String(subject._id)
      parsed.data.course = `${subject.name} (${subject.code})`
    }
    try {
      const requestDoc = await Revaluation.create({ ...parsed.data, ...(subjectId ? { subjectId } : {}), userId: user.id })
      return NextResponse.json({ request: requestDoc }, { status: 201 })
    } catch (error: any) {
      if (error?.code === 11000) return NextResponse.json({ error: 'A pending request already exists for this course.' }, { status: 409 })
      throw error
    }
  } catch (e) { return apiError(e) }
}

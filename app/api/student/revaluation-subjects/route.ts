import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { RevaluationSubject } from '@/models/RevaluationSubject'
import { requireRole, apiError } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    await requireRole(['STUDENT'], request)
    await connectDB()
    const subjects = await RevaluationSubject.find({ active: true }).sort({ semester: 1, name: 1 }).limit(500).lean()
    return NextResponse.json({ subjects })
  } catch (e) { return apiError(e) }
}

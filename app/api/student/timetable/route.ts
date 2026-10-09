import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Timetable } from '@/models/Timetable'
import { requireRole, apiError } from '@/lib/auth'
import { getCurrentSemester } from '@/lib/student-profile'

export async function GET(request: NextRequest) {
  try {
    const user = await requireRole(['STUDENT'], request)
    await connectDB()
    const requested = Number(request.nextUrl.searchParams.get('semester') || 0)
    const current = await getCurrentSemester(user.id)
    const semester = Number.isInteger(requested) && requested >= 1 && requested <= 20 ? requested : current
    const timetable = semester ? await Timetable.find({ semester }).sort({ examDate: 1, startTime: 1 }).limit(500).lean() : []
    return NextResponse.json({ timetable, semester })
  } catch (e) { return apiError(e) }
}

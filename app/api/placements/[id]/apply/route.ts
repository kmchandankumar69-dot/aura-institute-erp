import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { connectDB } from '@/lib/mongodb'
import { Placement, PlacementApplication } from '@/models/Placement'
import { getCurrentCgpa, getCurrentSemester } from '@/lib/student-profile'
import { requireRole, apiError } from '@/lib/auth'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireRole(['STUDENT'], request)
    const { id } = await params
    if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: 'Invalid placement id' }, { status: 400 })
    await connectDB()
    const placement = await Placement.findOne({ _id: id, active: true }).lean()
    if (!placement) return NextResponse.json({ error: 'Placement opportunity not found' }, { status: 404 })
    if (placement.applicationDeadline && new Date(placement.applicationDeadline) < new Date()) return NextResponse.json({ error: 'Applications for this role are closed' }, { status: 409 })
    const current = await getCurrentCgpa(user.id)
    const currentSemester = await getCurrentSemester(user.id)
    const cgpa = current.cgpa
    if (cgpa === null) return NextResponse.json({ error: 'Your CGPA is not available yet. Please contact the academic office.' }, { status: 409 })
    if (cgpa < placement.minCgpa) return NextResponse.json({ error: `CGPA ${placement.minCgpa} or above is required. Your current CGPA is ${cgpa}.` }, { status: 403 })
    const eligibleSemesters = Array.isArray((placement as any).eligibleSemesters) ? (placement as any).eligibleSemesters.map((x: unknown) => Number(x)) : []
    if (eligibleSemesters.length && (currentSemester === null || !eligibleSemesters.includes(currentSemester))) return NextResponse.json({ error: `This placement is open only to semesters ${eligibleSemesters.join(', ')}. Your current semester is ${currentSemester ?? 'not available'}.` }, { status: 403 })
    if (await PlacementApplication.exists({ placementId: id, userId: user.id })) return NextResponse.json({ error: 'You have already applied for this placement.' }, { status: 409 })
    const application = await PlacementApplication.create({ placementId: id, userId: user.id })
    return NextResponse.json({ application }, { status: 201 })
  } catch (e: any) {
    if (e?.code === 11000) return NextResponse.json({ error: 'You have already applied for this placement.' }, { status: 409 })
    return apiError(e)
  }
}

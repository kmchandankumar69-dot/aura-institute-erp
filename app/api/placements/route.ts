import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Placement, PlacementApplication } from '@/models/Placement'
import { getCurrentCgpa, getCurrentSemester } from '@/lib/student-profile'
import mongoose from 'mongoose'
import { requireRole, apiError } from '@/lib/auth'
import { assertJsonSize } from '@/lib/rate-limit'
import { writeAuditLog } from '@/lib/audit'

function round2(value: number) {
  return Math.round(value * 100) / 100
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireRole(['STUDENT'], request)
    await connectDB()

    const [placements, applications, current, currentSemester] = await Promise.all([
      Placement.find({ active: true })
        .sort({ applicationDeadline: 1, createdAt: -1 })
        .limit(100)
        .lean(),
      PlacementApplication.find({ userId: user.id }).lean(),
      getCurrentCgpa(user.id),
      getCurrentSemester(user.id),
    ])

    const cgpa = current.cgpa

    const byPlacement = new Map(
      applications.map(item => [String(item.placementId), item])
    )

    return NextResponse.json({
      placements: placements.map(item => ({
        ...item,
        application: byPlacement.get(String(item._id)) || null,
        currentCgpa: cgpa,
        eligibleByCgpa:
          cgpa === null ? null : cgpa >= item.minCgpa,
        eligibleSemesters:
          (item as any).eligibleSemesters || [],
        currentSemester,
        eligibleBySemester:
          (item as any).eligibleSemesters?.length
            ? currentSemester !== null &&
              (item as any).eligibleSemesters.includes(currentSemester)
            : true,
      })),
    })
  } catch (e) {
    return apiError(e)
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireRole(['ADMIN'], request)

    assertJsonSize(request)

    const body = await request.json()

    const companyName = String(body.companyName || '').trim()
    const jobRole = String(body.jobRole || '').trim()
    const salary = String(body.salary || '').trim()

    const skillsRequired = Array.isArray(body.skillsRequired)
      ? body.skillsRequired
          .map((x: unknown) => String(x).trim())
          .filter(Boolean)
          .slice(0, 30)
      : String(body.skillsRequired || '')
          .split(',')
          .map(x => x.trim())
          .filter(Boolean)
          .slice(0, 30)

    const minCgpa = Number(body.minCgpa)

    if (
      !companyName ||
      !jobRole ||
      !salary ||
      !Number.isFinite(minCgpa) ||
      minCgpa < 0 ||
      minCgpa > 10
    ) {
      return NextResponse.json(
        {
          error:
            'Company, role, salary and a CGPA criterion are required.',
        },
        { status: 400 }
      )
    }

    await connectDB()

    // FIXED: explicitly typed as number[] so TypeScript
    // knows that a and b are numbers in .sort()
    const eligibleSemesters: number[] =
      Array.isArray(body.eligibleSemesters)
        ? body.eligibleSemesters
            .map((x: unknown) => Number(x))
            .filter(
              (x: number) =>
                Number.isInteger(x) &&
                x >= 1 &&
                x <= 20
            )
            .filter(
              (
                x: number,
                index: number,
                array: number[]
              ) => array.indexOf(x) === index
            )
            .sort(
              (a: number, b: number) =>
                a - b
            )
        : []

    const now = new Date()

    const placementDoc = {
      _id: new mongoose.Types.ObjectId(),
      companyName,
      jobRole,
      salary,
      skillsRequired,
      minCgpa,
      eligiblePrograms: Array.isArray(body.eligiblePrograms)
        ? body.eligiblePrograms
        : [],
      eligibleSemesters,
      description: String(body.description || '').trim(),
      applicationDeadline: body.applicationDeadline
        ? new Date(body.applicationDeadline)
        : undefined,
      active: body.active !== false,
      createdAt: now,
      updatedAt: now,
    }

    await Placement.collection.insertOne(
      placementDoc as any
    )

    await writeAuditLog(
      admin.id,
      'Created placement opportunity',
      'Placement',
      String(placementDoc._id),
      {
        companyName,
        jobRole,
        minCgpa,
        eligibleSemesters,
      }
    )

    const placement = await Placement.findById(
      placementDoc._id
    ).lean()

    return NextResponse.json(
      { placement },
      { status: 201 }
    )
  } catch (e) {
    return apiError(e)
  }
}
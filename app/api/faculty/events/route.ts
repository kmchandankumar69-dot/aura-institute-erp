import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Event, EventRegistration } from '@/models/Event'
import { Admission } from '@/models/Admission'
import { requireRole, apiError } from '@/lib/auth'
import { ensureStudentProfileFromAdmission } from '@/lib/student-profile'

export async function GET(request: NextRequest) {
  try {
    await requireRole(['FACULTY', 'ADMIN'], request)
    await connectDB()
    const eventId = request.nextUrl.searchParams.get('eventId')
    const events = await Event.find(eventId ? { _id: eventId } : {}).sort({ date: 1 }).limit(100).lean()
    const registrations = await EventRegistration.find(eventId ? { eventId } : {}).populate('userId', 'name email studentId department phone').sort({ createdAt: -1 }).limit(1000).lean()
    const emails = registrations.map(item => (item.userId as any)?.email).filter(Boolean).map(email => String(email).toLowerCase())
    const admissions = emails.length ? await Admission.find({ email: { $in: emails } }).sort({ createdAt: -1 }).select('email applicantName phone program status').lean() : []
    const admissionByEmail = new Map<string, any>()
    for (const admission of admissions) {
      const key = String(admission.email).toLowerCase()
      if (!admissionByEmail.has(key)) admissionByEmail.set(key, admission)
    }
    const enrolledProfiles = new Map<string, any>()
    await Promise.all(admissions.map(async admission => {
      if (admission.status === 'ENROLLED') {
        const profile = await ensureStudentProfileFromAdmission(admission)
        if (profile?.email) enrolledProfiles.set(String(profile.email).toLowerCase(), profile)
      }
    }))
    const byEvent = new Map<string, any[]>()
    for (const registration of registrations) {
      const user = registration.userId as any
      const emailKey = String(user?.email || '').toLowerCase()
      const admission = admissionByEmail.get(emailKey)
      const profile = enrolledProfiles.get(emailKey)
      const row = {
        ...registration,
        userId: {
          ...user,
          name: profile?.name || user?.name || admission?.applicantName || 'Student',
          studentId: profile?.studentId || user?.studentId || 'Not enrolled',
          email: profile?.email || user?.email || 'Not provided',
          phone: profile?.phone || user?.phone || admission?.phone || 'Not provided',
          department: profile?.department || user?.department || admission?.program || 'Not provided',
        },
      }
      const key = String(registration.eventId)
      if (!byEvent.has(key)) byEvent.set(key, [])
      byEvent.get(key)!.push(row)
    }
    return NextResponse.json({ events: events.map(event => ({ ...event, registrations: byEvent.get(String(event._id)) || [] })) })
  } catch (e) { return apiError(e) }
}

import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/models/User'
import { requireRole, apiError } from '@/lib/auth'
import { writeAuditLog } from '@/lib/audit'

const MAX_BYTES = 700 * 1024
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp'])

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(['STUDENT'], request)
    const length = Number(request.headers.get('content-length') || 0)
    if (length > MAX_BYTES + 10_000) return NextResponse.json({ error: 'Photo is too large. Please upload a smaller image.' }, { status: 413 })
    const form = await request.formData()
    const file = form.get('photo')
    if (!(file instanceof File)) return NextResponse.json({ error: 'Please choose a photo.' }, { status: 400 })
    if (!ALLOWED.has(file.type)) return NextResponse.json({ error: 'Only JPG, PNG or WebP images are allowed.' }, { status: 400 })
    if (file.size > MAX_BYTES) return NextResponse.json({ error: 'Photo must be 700 KB or smaller.' }, { status: 400 })
    const bytes = Buffer.from(await file.arrayBuffer())
    const photoData = `data:${file.type};base64,${bytes.toString('base64')}`
    await connectDB()
    await User.updateOne({ _id: user.id, role: 'STUDENT' }, { $set: { pendingPhotoData: photoData, photoStatus: 'PENDING', photoUploadedAt: new Date() }, $unset: { photoRejectedReason: '' } })
    await writeAuditLog(user.id, 'Uploaded student photo for verification', 'StudentPhoto', user.id, {})
    return NextResponse.json({ ok: true, status: 'PENDING' })
  } catch (e) { return apiError(e) }
}

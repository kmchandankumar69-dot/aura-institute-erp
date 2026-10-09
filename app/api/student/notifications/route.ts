import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Notification } from '@/models/Notification'
import { requireRole, apiError } from '@/lib/auth'
export async function PATCH(request: NextRequest) { try { const user = await requireRole(['STUDENT'], request); await connectDB(); await Notification.updateMany({ userId: user.id }, { $set: { read: true } }); return NextResponse.json({ ok: true }) } catch (e) { return apiError(e) } }

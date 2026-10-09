import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { AuditLog } from '@/models/AuditLog'
import { requireRole, apiError } from '@/lib/auth'
export async function GET(request: NextRequest) { try { await requireRole(['ADMIN'], request); await connectDB(); const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(50).populate('actorId','name email').lean(); return NextResponse.json({ logs }) } catch (e) { return apiError(e) } }

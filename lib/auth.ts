import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { randomBytes, createHash } from 'node:crypto'
import { connectDB } from './mongodb'
import { User } from '@/models/User'
import { Session } from '@/models/Session'

export type Role = 'STUDENT' | 'FACULTY' | 'ADMIN'
export type SessionUser = { id: string; email: string; name: string; role: Role; studentId?: string }

const COOKIE = 'aura_session'
const SESSION_DAYS = 7

function cookieOptions(maxAge: number) {
  return { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, path: '/', maxAge }
}

function hashToken(token: string) { return createHash('sha256').update(token).digest('hex') }

export async function hashPassword(password: string) { return bcrypt.hash(password, 12) }
export async function verifyPassword(password: string, hash: string) { return bcrypt.compare(password, hash) }

export async function createSession(user: SessionUser) {
  await connectDB()
  const token = randomBytes(32).toString('base64url')
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000)
  await Session.create({ tokenHash: hashToken(token), userId: user.id, expiresAt })
  const jar = await cookies()
  jar.set(COOKIE, token, cookieOptions(SESSION_DAYS * 24 * 60 * 60))
}

export async function getSession(request?: NextRequest): Promise<SessionUser | null> {
  const token = request?.cookies.get(COOKIE)?.value ?? (await cookies()).get(COOKIE)?.value
  if (!token) return null
  await connectDB()
  const session = await Session.findOne({ tokenHash: hashToken(token), expiresAt: { $gt: new Date() } }).lean()
  if (!session) return null
  const user = await User.findOne({ _id: session.userId, active: true }).select('email name role studentId').lean()
  if (!user) return null
  void Session.updateOne({ _id: session._id }, { $set: { lastUsedAt: new Date() } }).catch(() => undefined)
  return { id: String(user._id), email: user.email, name: user.name, role: user.role as Role, studentId: user.studentId }
}

export async function clearSession(request?: NextRequest) {
  const token = request?.cookies.get(COOKIE)?.value ?? (await cookies()).get(COOKIE)?.value
  if (token) {
    await connectDB()
    await Session.deleteOne({ tokenHash: hashToken(token) })
  }
  const jar = await cookies()
  jar.set(COOKIE, '', cookieOptions(0))
}

export async function requireSession(request?: NextRequest) {
  const session = await getSession(request)
  if (!session) throw new AuthError('Authentication required', 401)
  return session
}

export async function requireRole(roles: Role[], request?: NextRequest) {
  const session = await requireSession(request)
  if (!roles.includes(session.role)) throw new AuthError('Insufficient permissions', 403)
  return session
}

export async function getUserByEmail(email: string) {
  await connectDB()
  return User.findOne({ email: email.toLowerCase().trim() }).lean()
}

export class AuthError extends Error {
  status: number
  constructor(message: string, status: number) { super(message); this.status = status }
}

export function apiError(error: unknown) {
  if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: error.status })
  if (error instanceof Error && error.message === 'Request body is too large') return NextResponse.json({ error: error.message }, { status: 413 })
  console.error(error)
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
}

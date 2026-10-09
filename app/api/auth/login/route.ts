import { NextRequest, NextResponse } from 'next/server'
import { createSession, getUserByEmail, verifyPassword, apiError } from '@/lib/auth'
import { loginSchema } from '@/lib/validation'
import { clientAddress, rateLimit, assertJsonSize } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    assertJsonSize(request, 10_000)
    const parsed = loginSchema.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ error: 'Invalid email or password format' }, { status: 400 })
    const email = parsed.data.email.toLowerCase().trim()
    const limiter = await rateLimit(`login:${clientAddress(request)}:${email}`, 8, 15 * 60_000)
    if (!limiter.allowed) return NextResponse.json({ error: 'Too many login attempts. Try again later.' }, { status: 429, headers: { 'Retry-After': String(limiter.retryAfter) } })
    const user = await getUserByEmail(email)
    if (!user || !user.active || !(await verifyPassword(parsed.data.password, user.passwordHash))) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    await createSession({ id: String(user._id), email: user.email, name: user.name, role: user.role, studentId: user.studentId })
    return NextResponse.json({ user: { id: String(user._id), email: user.email, name: user.name, role: user.role, studentId: user.studentId } })
  } catch (e) { return apiError(e) }
}

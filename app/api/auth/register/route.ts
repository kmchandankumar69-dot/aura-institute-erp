import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/models/User'
import { createSession, hashPassword, apiError } from '@/lib/auth'
import { registerSchema } from '@/lib/validation'
import { clientAddress, rateLimit, assertJsonSize } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    assertJsonSize(request, 10_000)
    const parsed = registerSchema.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ error: 'Password must be at least 12 characters and registration details must be valid' }, { status: 400 })
    const email = parsed.data.email.toLowerCase().trim()
    const limiter = await rateLimit(`register:${clientAddress(request)}:${email}`, 3, 60 * 60_000)
    if (!limiter.allowed) return NextResponse.json({ error: 'Too many registration attempts. Try again later.' }, { status: 429, headers: { 'Retry-After': String(limiter.retryAfter) } })
    await connectDB()
    if (await User.exists({ email })) return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })
    const user = await User.create({ email, passwordHash: await hashPassword(parsed.data.password), name: parsed.data.name, role: 'STUDENT' })
    await createSession({ id: String(user._id), email: user.email, name: user.name, role: user.role })
    return NextResponse.json({ user: { id: String(user._id), email: user.email, name: user.name, role: user.role } }, { status: 201 })
  } catch (e) { return apiError(e) }
}

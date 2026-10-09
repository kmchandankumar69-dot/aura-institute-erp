import { connectDB } from './mongodb'
import { RateLimit } from '@/models/RateLimit'

export async function rateLimit(key: string, limit: number, windowMs: number) {
  await connectDB()
  const bucket = Math.floor(Date.now() / windowMs)
  const expiresAt = new Date((bucket + 1) * windowMs + 5_000)
  const bucketKey = `${key}:${bucket}`
  try {
    const doc = await RateLimit.findOneAndUpdate(
      { key: bucketKey },
      { $inc: { count: 1 }, $setOnInsert: { expiresAt } },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
    ).lean()
    return { allowed: Number(doc?.count || 0) <= limit, remaining: Math.max(0, limit - Number(doc?.count || 0)), retryAfter: Math.max(1, Math.ceil((expiresAt.getTime() - Date.now()) / 1000)) }
  } catch (error: any) {
    if (error?.code === 11000) return rateLimit(key, limit, windowMs)
    throw error
  }
}

export function clientAddress(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for')
  return (forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown').slice(0, 100)
}

export function assertJsonSize(request: Request, maxBytes = 100_000) {
  const length = Number(request.headers.get('content-length') || 0)
  if (length > maxBytes) throw new Error('Request body is too large')
}

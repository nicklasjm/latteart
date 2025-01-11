import { NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

const UPLOAD_LIMIT = 5
const RESET_PERIOD = 24 * 60 * 60 // 24 hours in seconds

export async function GET(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  const key = `upload_count:${ip}`

  const count = await redis.get(key) as number | null
  
  if (count === null) {
    await redis.set(key, 0, { ex: RESET_PERIOD })
    return NextResponse.json({ remainingUploads: UPLOAD_LIMIT })
  }

  const remainingUploads = Math.max(0, UPLOAD_LIMIT - count)
  return NextResponse.json({ remainingUploads })
}

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  const key = `upload_count:${ip}`

  const count = await redis.incr(key) as number

  if (count === 1) {
    await redis.expire(key, RESET_PERIOD)
  }

  if (count > UPLOAD_LIMIT) {
    return NextResponse.json({ error: 'Daily upload limit reached' }, { status: 429 })
  }

  const remainingUploads = Math.max(0, UPLOAD_LIMIT - count)
  return NextResponse.json({ remainingUploads })
}


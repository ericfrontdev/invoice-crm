import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { validateBody, validationError, waitlistSchema } from '@/lib/validations'
import { joinWaitlist } from '@/lib/waitlist'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'

// POST /api/waitlist - Inscription depuis la page /waitlist de l'application
export async function POST(req: Request) {
  // Rate limiting: 5 inscriptions par heure par IP
  const clientIp = getClientIp(req)
  const rateLimitResult = rateLimit(`waitlist:${clientIp}`, {
    limit: 5,
    windowMs: 60 * 60 * 1000,
    message: 'Trop de tentatives. Veuillez réessayer plus tard.',
  })

  if (rateLimitResult) {
    return rateLimitResult
  }

  try {
    const input = await validateBody(req, waitlistSchema)
    const result = await joinWaitlist(input, 'app')

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    return NextResponse.json({ message: 'waitlist.successfullyAdded' }, { status: 201 })
  } catch (error) {
    if (error instanceof ZodError) {
      return validationError(error)
    }
    logger.error('[waitlist] Erreur inscription:', error)
    return NextResponse.json({ error: 'waitlist.errorAdding' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { validateBody, validationError, waitlistSchema } from '@/lib/validations'
import { joinWaitlist } from '@/lib/waitlist'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'

// Endpoint appelé depuis le site vitrine (getsolopack.com), d'où le CORS.
// La logique est partagée avec /api/waitlist (lib/waitlist.ts).
const ALLOWED_ORIGIN = process.env.WAITLIST_ALLOWED_ORIGIN || 'https://getsolopack.com'

// Le site vitrine n'a pas accès aux traductions de l'app: on renvoie des
// messages lisibles plutôt que des clés i18n.
const ERROR_MESSAGES: Record<string, string> = {
  'waitlist.alreadyRegistered': 'Un compte existe déjà avec cet email.',
  'waitlist.alreadyOnWaitlist': "Cet email est déjà sur la liste d'attente.",
  'waitlist.errorAdding': "Erreur lors de l'inscription. Veuillez réessayer.",
}

const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  Vary: 'Origin',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders })
}

export async function POST(req: Request) {
  // Rate limiting: 5 inscriptions par heure par IP
  const clientIp = getClientIp(req)
  const rateLimitResult = rateLimit(`waitlist:${clientIp}`, {
    limit: 5,
    windowMs: 60 * 60 * 1000,
    message: 'Trop de tentatives. Veuillez réessayer plus tard.',
  })

  if (rateLimitResult) {
    rateLimitResult.headers.set('Access-Control-Allow-Origin', ALLOWED_ORIGIN)
    return rateLimitResult
  }

  try {
    const input = await validateBody(req, waitlistSchema)
    const result = await joinWaitlist(input, 'site')

    if (!result.ok) {
      return NextResponse.json(
        { error: ERROR_MESSAGES[result.error] || ERROR_MESSAGES['waitlist.errorAdding'] },
        { status: result.status, headers: corsHeaders }
      )
    }

    return NextResponse.json(
      { success: true, message: 'Inscription réussie!' },
      { status: 201, headers: corsHeaders }
    )
  } catch (error) {
    if (error instanceof ZodError) {
      const response = validationError(error)
      response.headers.set('Access-Control-Allow-Origin', ALLOWED_ORIGIN)
      return response
    }
    logger.error('[waitlist:public] Erreur inscription:', error)
    return NextResponse.json(
      { error: ERROR_MESSAGES['waitlist.errorAdding'] },
      { status: 500, headers: corsHeaders }
    )
  }
}

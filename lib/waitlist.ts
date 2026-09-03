import { render } from '@react-email/render'
import { prisma } from '@/lib/prisma'
import { resend } from '@/lib/resend'
import { logger } from '@/lib/logger'
import WaitlistConfirmationEmail from '@/emails/waitlist-confirmation-email'
import WaitlistAdminNotification from '@/emails/waitlist-admin-notification'
import type { WaitlistInput } from '@/lib/validations/waitlist'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
const WAITLIST_FROM_EMAIL =
  process.env.WAITLIST_FROM_EMAIL || process.env.EMAIL_FROM || 'beta@solopack.app'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.EMAIL_FROM

export type WaitlistSource = 'app' | 'site'

export type JoinWaitlistResult =
  | { ok: true }
  | { ok: false; status: number; error: string }

/**
 * Inscription à la waitlist beta.
 *
 * Source de vérité: la table `Waitlist`. C'est elle que `/api/auth/register`
 * consulte pour autoriser la création d'un compte (champ `approved`).
 * Brevo n'est qu'une synchronisation marketing best-effort.
 *
 * Les messages d'erreur sont des clés de traduction (voir locales/*.json).
 */
export async function joinWaitlist(
  { name, email, company }: WaitlistInput,
  source: WaitlistSource
): Promise<JoinWaitlistResult> {
  const normalizedEmail = email.trim().toLowerCase()

  // Un compte existe déjà pour cet email
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  })

  if (existingUser) {
    return { ok: false, status: 400, error: 'waitlist.alreadyRegistered' }
  }

  // Déjà sur la liste d'attente
  const existingEntry = await prisma.waitlist.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  })

  if (existingEntry) {
    return { ok: false, status: 400, error: 'waitlist.alreadyOnWaitlist' }
  }

  await prisma.waitlist.create({
    data: {
      email: normalizedEmail,
      name: name.trim(),
      company: company?.trim() || null,
      approved: false, // Approbation manuelle avant de pouvoir créer un compte
    },
  })

  logger.info('[waitlist] Nouvelle inscription', { email: normalizedEmail, source })

  // Notifications et synchronisation: best-effort, ne bloquent jamais l'inscription
  await Promise.allSettled([
    sendWaitlistEmails({ name: name.trim(), email: normalizedEmail, company, source }),
    syncToBrevo({ name: name.trim(), email: normalizedEmail }),
  ])

  return { ok: true }
}

async function sendWaitlistEmails({
  name,
  email,
  company,
  source,
}: {
  name: string
  email: string
  company?: string | null
  source: WaitlistSource
}) {
  if (!process.env.RESEND_API_KEY) {
    logger.warn('[waitlist] RESEND_API_KEY absent, emails non envoyés')
    return
  }

  try {
    const confirmationHtml = await render(
      WaitlistConfirmationEmail({ userName: name, appUrl: APP_URL })
    )

    await resend.emails.send({
      from: WAITLIST_FROM_EMAIL,
      to: email,
      subject: 'Bienvenue dans la beta SoloPack',
      html: confirmationHtml,
    })

    if (ADMIN_EMAIL) {
      const adminHtml = await render(
        WaitlistAdminNotification({
          name,
          email,
          company,
          source: source === 'site' ? 'Site public' : 'Application',
          date: new Date().toLocaleString('fr-CA'),
        })
      )

      await resend.emails.send({
        from: WAITLIST_FROM_EMAIL,
        to: ADMIN_EMAIL,
        subject: `Nouvelle inscription beta: ${email}`,
        html: adminHtml,
      })
    } else {
      logger.warn('[waitlist] ADMIN_EMAIL absent, notification admin non envoyée')
    }
  } catch (error) {
    logger.error('[waitlist] Erreur envoi email:', error)
  }
}

/**
 * Synchronisation optionnelle vers la liste Brevo (marketing).
 * Ne fait rien si BREVO_API_KEY n'est pas configuré.
 */
async function syncToBrevo({ name, email }: { name: string; email: string }) {
  const brevoApiKey = process.env.BREVO_API_KEY

  if (!brevoApiKey) {
    return
  }

  const brevoListId = Number(process.env.BREVO_WAITLIST_ID || '3')
  const [firstName, ...rest] = name.split(' ')

  try {
    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-key': brevoApiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        email,
        attributes: {
          FIRSTNAME: firstName,
          LASTNAME: rest.join(' '),
        },
        listIds: [brevoListId],
        updateEnabled: true,
      }),
    })

    if (!response.ok) {
      const data = await response.json().catch(() => null)
      logger.error('[waitlist] Brevo sync failed', {
        status: response.status,
        code: data?.code,
      })
    }
  } catch (error) {
    logger.error('[waitlist] Brevo sync error:', error)
  }
}

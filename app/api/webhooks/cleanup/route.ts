import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

/**
 * GET|POST /api/webhooks/cleanup
 *
 * Nettoie les logs de webhooks anciens pour éviter la croissance infinie de la table.
 * Appelé quotidiennement par .github/workflows/webhook-cleanup.yml (POST), le site
 * étant hébergé sur Netlify qui ne permet pas de déclarer un cron dans le dépôt.
 * GET est également accepté: c'est la seule méthode qu'utilise Vercel Cron, et le
 * garder évite une panne silencieuse si l'hébergement change un jour.
 *
 * Configuration requise:
 * - Ajouter CRON_SECRET dans les variables d'environnement (même token que /api/reminders/check)
 *
 * Politique de rétention:
 * - Logs de succès (200-399): 30 jours
 * - Logs d'erreur (400+): 90 jours (gardés plus longtemps pour le debugging)
 */

const SUCCESS_RETENTION_DAYS = 30
const ERROR_RETENTION_DAYS = 90

async function handleCleanup(req: Request) {
  try {
    // Vérification du token de sécurité pour le cron
    const authHeader = req.headers.get('authorization')
    if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const now = new Date()

    // Nettoyer les logs de succès plus vieux que 30 jours
    const successCutoff = new Date(now)
    successCutoff.setDate(successCutoff.getDate() - SUCCESS_RETENTION_DAYS)

    const deletedSuccess = await prisma.webhookLog.deleteMany({
      where: {
        processedAt: {
          lt: successCutoff,
        },
        status: {
          gte: 200,
          lt: 400,
        },
      },
    })

    logger.info(`[webhooks:cleanup] Deleted ${deletedSuccess.count} success logs older than ${SUCCESS_RETENTION_DAYS} days`)

    // Nettoyer les logs d'erreur plus vieux que 90 jours
    const errorCutoff = new Date(now)
    errorCutoff.setDate(errorCutoff.getDate() - ERROR_RETENTION_DAYS)

    const deletedErrors = await prisma.webhookLog.deleteMany({
      where: {
        processedAt: {
          lt: errorCutoff,
        },
        status: {
          gte: 400,
        },
      },
    })

    logger.info(`[webhooks:cleanup] Deleted ${deletedErrors.count} error logs older than ${ERROR_RETENTION_DAYS} days`)

    // Statistiques après cleanup
    const remainingLogs = await prisma.webhookLog.count()
    const oldestLog = await prisma.webhookLog.findFirst({
      orderBy: { processedAt: 'asc' },
      select: { processedAt: true },
    })

    return NextResponse.json({
      success: true,
      deleted: {
        successLogs: deletedSuccess.count,
        errorLogs: deletedErrors.count,
        total: deletedSuccess.count + deletedErrors.count,
      },
      remaining: remainingLogs,
      oldestLogDate: oldestLog?.processedAt || null,
      policy: {
        successRetention: `${SUCCESS_RETENTION_DAYS} days`,
        errorRetention: `${ERROR_RETENTION_DAYS} days`,
      },
    })
  } catch (error) {
    logger.error('[webhooks:cleanup] Error:', error)
    return NextResponse.json(
      { error: 'Erreur lors du nettoyage des logs' },
      { status: 500 }
    )
  }
}

// Vercel Cron appelle le endpoint en GET
export async function GET(req: Request) {
  return handleCleanup(req)
}

// Cron externe / déclenchement manuel
export async function POST(req: Request) {
  return handleCleanup(req)
}

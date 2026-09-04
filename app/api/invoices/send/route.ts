import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { resend } from '@/lib/resend'
import { render } from '@react-email/render'
import InvoiceEmail from '@/emails/invoice-email'
import { auth } from '@/auth'
import { logger } from '@/lib/logger'

const INVOICE_FROM_EMAIL = process.env.INVOICE_FROM_EMAIL || process.env.EMAIL_FROM || 'invoices@solopack.app'

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: 'Comptant',
  interac: 'Interac',
  card: 'Carte',
  transfer: 'Virement bancaire',
  cheque: 'Chèque',
  other: 'Autre',
}

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })
    }

    const body = await req.json()
    const invoiceId: string | undefined = body?.invoiceId
    if (!invoiceId) {
      return NextResponse.json({ error: 'invoiceId requis' }, { status: 400 })
    }

    // Récupérer la facture avec tous les détails
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        client: {
          select: {
            name: true,
            email: true,
            userId: true,
            user: {
              select: {
                name: true,
                company: true,
                paymentProvider: true,
              }
            }
          }
        },
        items: {
          select: { description: true, amount: true, date: true },
          orderBy: { date: 'asc' }
        }
      }
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Facture introuvable' }, { status: 404 })
    }

    if (!invoice.client) {
      return NextResponse.json({ error: 'Client introuvable' }, { status: 404 })
    }

    // Verify ownership
    if (invoice.client.userId !== session.user.id) {
      return NextResponse.json({ error: 'Non autorisé.' }, { status: 403 })
    }

    // Vérifier que le client a un email
    if (!invoice.client.email) {
      return NextResponse.json({ error: 'Le client n\'a pas d\'adresse email' }, { status: 400 })
    }

    // Préparer les données pour l'email
    const isReceipt = invoice.type === 'receipt'
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    // Un reçu atteste d'un paiement déjà encaissé: pas de lien de paiement
    const paymentUrl = !isReceipt && invoice.client.user.paymentProvider
      ? `${baseUrl}/invoices/${invoice.id}/pay`
      : undefined

    const emailData = {
      invoiceNumber: invoice.number,
      clientName: invoice.client.name,
      senderName: invoice.client.user.name,
      senderCompany: invoice.client.user.company || undefined,
      items: invoice.items.map(item => ({
        description: item.description,
        amount: item.amount,
        date: item.date.toISOString()
      })),
      subtotal: invoice.subtotal,
      tps: invoice.tps,
      tvq: invoice.tvq,
      total: invoice.total,
      invoiceId: invoice.id,
      paymentUrl,
      documentType: isReceipt ? ('receipt' as const) : ('invoice' as const),
      paidAt: invoice.paidAt
        ? new Date(invoice.paidAt).toLocaleDateString('fr-CA', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })
        : undefined,
      paymentMethodLabel: invoice.paymentMethod
        ? PAYMENT_METHOD_LABELS[invoice.paymentMethod] || invoice.paymentMethod
        : undefined,
    }

    // Générer le HTML de l'email
    const emailHtml = await render(InvoiceEmail(emailData))

    // Envoyer l'email via Resend
    try {
      // Utiliser le nom de l'entreprise si disponible, sinon le nom de l'utilisateur
      const senderName = invoice.client.user.company || invoice.client.user.name || 'SoloPack'

      const { data, error } = await resend.emails.send({
        from: `${senderName} <${INVOICE_FROM_EMAIL}>`,
        to: invoice.client.email,
        subject: `${isReceipt ? 'Reçu' : 'Facture'} ${invoice.number}`,
        html: emailHtml,
      })

      if (error) {
        logger.error('[invoices:send] Resend error:', error)
        return NextResponse.json({ error: 'Erreur lors de l\'envoi de l\'email', details: error }, { status: 500 })
      }

      logger.debug('[invoices:send] Email sent successfully:', data)
    } catch (emailError) {
      logger.error('[invoices:send] Failed to send email:', emailError)
      // Continue quand même pour mettre à jour le statut
    }

    // sentAt trace l'envoi pour les deux types de document. Le statut ne peut
    // pas en tenir lieu: un reçu reste "paid" et seul l'envoi d'une facture la
    // fait passer à 'sent'.
    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        sentAt: new Date(),
        ...(isReceipt ? {} : { status: 'sent' }),
      },
    })

    return NextResponse.json({ ok: true, invoice: updatedInvoice }, { status: 200 })
  } catch (e) {
    logger.error('[invoices:send] Error:', e)
    return NextResponse.json({ error: "Impossible d'envoyer le document" }, { status: 500 })
  }
}


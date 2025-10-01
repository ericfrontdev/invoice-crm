import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { resend } from '@/lib/resend'
import { render } from '@react-email/render'
import InvoiceEmail from '@/emails/invoice-email'

export async function POST(req: Request) {
  try {
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
          select: { name: true, email: true }
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

    // Préparer les données pour l'email
    const emailData = {
      invoiceNumber: invoice.number,
      clientName: invoice.client.name,
      items: invoice.items.map(item => ({
        description: item.description,
        amount: item.amount,
        date: item.date.toISOString()
      })),
      total: invoice.total
    }

    // Générer le HTML de l'email
    const emailHtml = await render(InvoiceEmail(emailData))

    // Envoyer l'email via Resend
    try {
      const { data, error } = await resend.emails.send({
        from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
        to: invoice.client.email,
        subject: `Facture ${invoice.number}`,
        html: emailHtml,
      })

      if (error) {
        console.error('[invoices:send] Resend error:', error)
        return NextResponse.json({ error: 'Erreur lors de l\'envoi de l\'email', details: error }, { status: 500 })
      }

      console.log('[invoices:send] Email sent successfully:', data)
    } catch (emailError) {
      console.error('[invoices:send] Failed to send email:', emailError)
      // Continue quand même pour mettre à jour le statut
    }

    // Mettre à jour le statut à 'sent'
    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: 'sent' },
    })

    return NextResponse.json({ ok: true, invoice: updatedInvoice }, { status: 200 })
  } catch (e) {
    console.error('[invoices:send] Error:', e)
    return NextResponse.json({ error: "Impossible d'envoyer la facture" }, { status: 500 })
  }
}


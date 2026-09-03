import { z } from 'zod'

/**
 * Schema for an invoice item
 */
export const invoiceItemSchema = z.object({
  description: z.string().min(1, 'La description est requise').max(500, 'La description ne peut pas dépasser 500 caractères'),
  amount: z.number().positive('Le montant doit être positif').max(999999999, 'Le montant est trop élevé'),
})

/**
 * Modes de paiement acceptés sur un reçu
 */
export const paymentMethodSchema = z.enum(['cash', 'interac', 'card', 'transfer', 'cheque', 'other'])

/**
 * Schema for creating a new invoice or receipt
 *
 * Un reçu (`type: 'receipt'`) documente un service déjà payé: il est créé
 * directement au statut "paid", avec une date et un mode de paiement, et sans
 * date d'échéance.
 */
export const createInvoiceSchema = z.object({
  clientId: z.string().cuid('ID client invalide'),
  projectId: z.string().cuid('ID projet invalide').optional().nullable(),
  type: z.enum(['invoice', 'receipt']).optional().default('invoice'),
  dueDate: z.string().datetime('Date d\'échéance invalide').optional().nullable(),
  paidAt: z.string().datetime('Date de paiement invalide').optional().nullable(),
  paymentMethod: paymentMethodSchema.optional().nullable(),
  items: z.array(invoiceItemSchema).min(1, 'Au moins un item est requis').optional(),
  unpaidAmountIds: z.array(z.string().cuid()).min(1, 'Au moins un montant non payé est requis').optional(),
}).refine(
  (data) => data.items !== undefined || data.unpaidAmountIds !== undefined,
  {
    message: 'Soit items, soit unpaidAmountIds doit être fourni',
    path: ['items'],
  }
).refine(
  (data) => data.type !== 'receipt' || (!!data.paidAt && !!data.paymentMethod),
  {
    message: 'Un reçu exige une date et un mode de paiement',
    path: ['paidAt'],
  }
).refine(
  // Un reçu documente un service déjà payé: il ne peut pas être construit à
  // partir de montants encore impayés.
  (data) => data.type !== 'receipt' || data.unpaidAmountIds === undefined,
  {
    message: 'Un reçu ne peut pas être créé à partir de montants impayés',
    path: ['unpaidAmountIds'],
  }
)

/**
 * Schema for updating an invoice
 */
export const updateInvoiceSchema = z.object({
  status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']).optional(),
  paymentMethod: paymentMethodSchema.optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
  paidAt: z.string().datetime().optional().nullable(),
  paymentProvider: z.string().max(50).optional().nullable(),
  paymentTransactionId: z.string().max(255).optional().nullable(),
})

/**
 * Schema for sending an invoice
 */
export const sendInvoiceSchema = z.object({
  invoiceId: z.string().cuid('ID facture invalide'),
})

/**
 * Schema for marking invoice as paid
 */
export const markInvoiceAsPaidSchema = z.object({
  invoiceId: z.string().cuid('ID facture invalide'),
})

/**
 * Schema for invoice ID parameter
 */
export const invoiceIdSchema = z.object({
  id: z.string().cuid('ID facture invalide'),
})

export type PaymentMethod = z.infer<typeof paymentMethodSchema>
export type InvoiceItem = z.infer<typeof invoiceItemSchema>
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>
export type SendInvoiceInput = z.infer<typeof sendInvoiceSchema>
export type MarkInvoiceAsPaidInput = z.infer<typeof markInvoiceAsPaidSchema>
export type InvoiceIdInput = z.infer<typeof invoiceIdSchema>

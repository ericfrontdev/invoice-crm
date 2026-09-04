import { z } from 'zod'
import { emptyToNull } from './utils'

/**
 * Format produit par lib/crypto.ts: iv(16o):authTag(16o):données, en hexadécimal.
 */
const ENCRYPTED_VALUE = /^[0-9a-f]{32}:[0-9a-f]{32}:[0-9a-f]+$/i

/**
 * Schema for updating user profile
 */
export const updateProfileSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  email: z.string().email('Email invalide'),
  company: z.string().max(100, 'Le nom de la compagnie ne peut pas dépasser 100 caractères').optional().nullable(),
  phone: emptyToNull(z.string().regex(/^\+?[\d\s\-()]+$/, 'Numéro de téléphone invalide').max(20).optional().nullable()),
  address: z.string().max(500, 'L\'adresse ne peut pas dépasser 500 caractères').optional().nullable(),
  neq: z.string().max(20, 'Le NEQ ne peut pas dépasser 20 caractères').optional().nullable(),
  tpsNumber: z.string().max(20, 'Le numéro TPS ne peut pas dépasser 20 caractères').optional().nullable(),
  tvqNumber: z.string().max(20, 'Le numéro TVQ ne peut pas dépasser 20 caractères').optional().nullable(),
  chargesTaxes: z.boolean().optional(),
  paymentProvider: emptyToNull(z.enum(['stripe', 'paypal', 'helcim']).nullable().optional()),
  paypalEmail: emptyToNull(z.string().email('Email PayPal invalide').optional().nullable()),
  // Une valeur vide ou déjà chiffrée signifie "ne pas modifier la clé existante":
  // le formulaire renvoie la valeur telle qu'il l'a reçue quand l'utilisateur n'y touche pas.
  stripeSecretKey: z.preprocess(
    (value) =>
      typeof value === 'string' && (value.trim() === '' || ENCRYPTED_VALUE.test(value.trim()))
        ? undefined
        : value,
    z.string().regex(/^sk_(test|live)_[a-zA-Z0-9]+$/, 'Clé Stripe invalide').optional().nullable()
  ),
  autoRemindersEnabled: z.boolean().optional(),
  reminderMiseEnDemeureTemplate: z.string().max(5000, 'Le template ne peut pas dépasser 5000 caractères').optional().nullable(),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>

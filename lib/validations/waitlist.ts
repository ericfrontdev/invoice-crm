import { z } from 'zod'

/**
 * Schema for joining the beta waitlist
 */
export const waitlistSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  email: z.string().email('Email invalide'),
  company: z.string().max(100).optional().nullable(),
})

export type WaitlistInput = z.infer<typeof waitlistSchema>

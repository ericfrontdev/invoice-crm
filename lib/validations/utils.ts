import { z } from 'zod'

/**
 * Les formulaires HTML envoient une chaîne vide pour tout champ laissé vide.
 * Sans ce prétraitement, un champ optionnel au format contraint (téléphone,
 * URL, email) rejette '' et fait échouer toute la requête avec une 400, y
 * compris pour les champs correctement remplis.
 *
 * Usage: emptyToNull(z.string().url().optional().nullable())
 */
export const emptyToNull = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? null : value),
    schema
  )

-- AlterTable User: Ajouter champs québécois
ALTER TABLE "User" ADD COLUMN "neq" TEXT;
ALTER TABLE "User" ADD COLUMN "tpsNumber" TEXT;
ALTER TABLE "User" ADD COLUMN "tvqNumber" TEXT;

-- AlterTable Invoice: Ajouter champs de taxes
-- Étape 1: Ajouter les colonnes comme nullable temporairement
ALTER TABLE "Invoice" ADD COLUMN "subtotal" DOUBLE PRECISION;
ALTER TABLE "Invoice" ADD COLUMN "tps" DOUBLE PRECISION DEFAULT 0;
ALTER TABLE "Invoice" ADD COLUMN "tvq" DOUBLE PRECISION DEFAULT 0;

-- Étape 2: Calculer les valeurs pour les factures existantes
-- On suppose que le "total" actuel n'incluait pas les taxes
-- On calcule subtotal, tps et tvq rétrospectivement
UPDATE "Invoice" SET
  "subtotal" = "total" / 1.14975,  -- Diviser par (1 + 0.05 + 0.09975) pour obtenir le montant HT
  "tps" = ("total" / 1.14975) * 0.05,  -- TPS 5%
  "tvq" = ("total" / 1.14975) * 0.09975;  -- TVQ 9.975%

-- Étape 3: Rendre subtotal NOT NULL maintenant qu'il a des valeurs
ALTER TABLE "Invoice" ALTER COLUMN "subtotal" SET DEFAULT 0;
ALTER TABLE "Invoice" ALTER COLUMN "subtotal" SET NOT NULL;

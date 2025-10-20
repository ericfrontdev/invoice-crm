-- AlterTable User: Ajouter champ chargesTaxes
ALTER TABLE "User" ADD COLUMN "chargesTaxes" BOOLEAN NOT NULL DEFAULT false;

-- Mettre à jour le commentaire explicatif
COMMENT ON COLUMN "User"."chargesTaxes" IS 'Indique si l''utilisateur charge les taxes TPS/TVQ (obligatoire si CA > 30 000$)';

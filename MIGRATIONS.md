# Migrations de base de données

## Contexte

Entre octobre 2025 et septembre 2026, les changements de schéma ont été appliqués
directement avec `prisma db push`, sans créer de migration. L'historique
`prisma/migrations/` s'arrêtait donc au `20251020_add_quebec_taxes`, alors que la
base contenait déjà une dizaine de tables supplémentaires (`Feedback`,
`Notification`, `WebhookLog`, `PaymentAgreement`, `InvitationCode`, etc.).

Conséquence: un déploiement sur une base neuve (ou une restauration) produisait un
schéma incomplet, et `prisma migrate status` ne détectait rien d'anormal.

## Ce qui a été fait

Deux migrations ont été ajoutées:

| Migration | Contenu | À appliquer sur la base existante? |
|---|---|---|
| `20260903000000_sync_pushed_schema` | Tout ce qui avait été poussé avec `db push` | **Non** — déjà présent, à marquer comme appliquée |
| `20260903000100_add_waitlist` | Table `Waitlist` (programme beta) | **Oui** |

L'historique complet reproduit désormais exactement `schema.prisma`, vérifié avec:

```bash
npx prisma migrate diff \
  --from-migrations prisma/migrations \
  --to-schema-datamodel prisma/schema.prisma \
  --shadow-database-url "postgresql://user@localhost:5432/shadow_db" \
  --exit-code
# → No difference detected.
```

## Procédure à exécuter une seule fois sur la base existante

```bash
# 1. Marquer le rattrapage comme déjà appliqué (n'exécute AUCUN SQL,
#    insère seulement une ligne dans _prisma_migrations)
npx prisma migrate resolve --applied 20260903000000_sync_pushed_schema

# 2. Appliquer réellement la migration Waitlist
npx prisma migrate deploy

# 3. Vérifier
npx prisma migrate status
```

⚠️ Ne **pas** lancer `prisma migrate deploy` avant l'étape 1: la migration de
rattrapage échouerait puisque les colonnes et tables existent déjà.

## Ensuite: ne plus utiliser `db push`

Pour tout changement de schéma:

```bash
# Développement — crée le fichier de migration et l'applique
npx prisma migrate dev --name description_du_changement

# Production / CI
npx prisma migrate deploy
```

Une fois l'étape de rattrapage faite, on peut ajouter `prisma migrate deploy` au
script de build pour que les déploiements Vercel appliquent les migrations
automatiquement:

```json
"build": "prisma generate && prisma migrate deploy && next build"
```

## Note: base de développement = base de production

`.env` et `.env.production` pointent actuellement sur **la même base Neon**.
Toute migration testée en local touche donc les données de production. Créer une
branche Neon dédiée au développement est fortement recommandé avant la beta.

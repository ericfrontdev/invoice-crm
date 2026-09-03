# Nettoyage automatique des logs de webhooks

## Problème

La table `WebhookLog` enregistre tous les webhooks reçus (Stripe, Helcim, PayPal, etc.) avec leurs headers, body, et résultats de traitement. Sans nettoyage, cette table va grandir indéfiniment et ralentir la base de données.

## Solution

Une route API `/api/webhooks/cleanup` qui supprime les logs anciens selon une politique de rétention.

### Politique de rétention

- **Logs de succès** (status 200-399) : **30 jours**
- **Logs d'erreur** (status 400+) : **90 jours** (gardés plus longtemps pour debugging)

Pourquoi cette différence? Les erreurs sont importantes pour le debugging et l'audit de sécurité, donc on les garde plus longtemps.

## Configuration

### 1. Variable d'environnement

Le endpoint utilise le même token que `/api/reminders/check`:

```env
CRON_SECRET=your-secret-token-here
```

Générer un token sécurisé:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Configuration du cron job

Plusieurs options selon votre plateforme:

#### Option A: GitHub Actions (configuré par défaut)

Le site est hébergé sur **Netlify**, qui n'a pas d'équivalent de `vercel.json`
pour déclarer un cron. Le déclenchement se fait donc depuis GitHub Actions, via
`.github/workflows/webhook-cleanup.yml` (tous les jours à 2h UTC, avec
déclenchement manuel possible depuis l'onglet Actions).

Configuration requise dans le dépôt GitHub:

1. **Settings → Secrets and variables → Actions → Secrets** : ajouter
   `CRON_SECRET` avec la même valeur que dans les variables d'environnement
   Netlify.
2. *(optionnel)* **Variables** : `APP_URL` si le domaine change. Par défaut le
   workflow appelle `https://solopack.app`.

Le job échoue explicitement si le secret est absent ou si l'endpoint ne répond
pas 200, ce qui déclenche la notification d'échec habituelle de GitHub.

#### Option B: Netlify Scheduled Function

Alternative native à l'hébergeur, si on préfère garder le déclenchement chez
Netlify plutôt que chez GitHub. Nécessite un `netlify.toml` et une fonction
planifiée dans `netlify/functions/`.

#### Option C: Cron-job.org (Service externe gratuit)

1. Créer un compte sur https://cron-job.org
2. Créer un nouveau cron job:
   - URL: `https://your-app-domain.com/api/webhooks/cleanup`
   - Method: POST
   - Headers: `Authorization: Bearer YOUR_CRON_SECRET`
   - Schedule: `0 2 * * *` (tous les jours à 2h)

#### Option D: Exécution manuelle

Tester manuellement avec curl:
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://your-app-domain.com/api/webhooks/cleanup
```

## Réponse du endpoint

Exemple de réponse réussie:
```json
{
  "success": true,
  "deleted": {
    "successLogs": 245,
    "errorLogs": 12,
    "total": 257
  },
  "remaining": 89,
  "oldestLogDate": "2026-01-15T14:32:10.000Z",
  "policy": {
    "successRetention": "30 days",
    "errorRetention": "90 days"
  }
}
```

## Monitoring

Pour surveiller l'efficacité du nettoyage, vous pouvez:

1. **Logs de l'application** - Vérifier les logs après chaque exécution
2. **Métriques de base de données** - Surveiller la taille de la table `WebhookLog`
3. **Alertes** - Configurer des alertes si la table dépasse un certain seuil

### Query pour vérifier manuellement

```sql
-- Nombre total de logs
SELECT COUNT(*) FROM "WebhookLog";

-- Logs par status
SELECT status, COUNT(*)
FROM "WebhookLog"
GROUP BY status
ORDER BY status;

-- Plus vieux log
SELECT "processedAt"
FROM "WebhookLog"
ORDER BY "processedAt" ASC
LIMIT 1;

-- Taille approximative de la table
SELECT
  pg_size_pretty(pg_total_relation_size('"WebhookLog"')) as size;
```

## Fréquence recommandée

- **Petite application** (<100 webhooks/jour) : 1x par semaine
- **Moyenne application** (100-1000/jour) : 1x par jour (recommandé)
- **Grosse application** (>1000/jour) : 2x par jour

## Ajustement de la politique

Si vous voulez modifier les périodes de rétention, éditer `/app/api/webhooks/cleanup/route.ts`:

```typescript
// Changer 30 jours → 60 jours pour les succès
successCutoff.setDate(successCutoff.getDate() - 60)

// Changer 90 jours → 180 jours pour les erreurs
errorCutoff.setDate(errorCutoff.getDate() - 180)
```

## Sécurité

⚠️ **Important:** Ne jamais exposer ce endpoint publiquement sans authentification. Le token `CRON_SECRET` doit être:
- Sécurisé (32+ caractères aléatoires)
- Stocké uniquement dans les variables d'environnement
- Jamais commité dans le code
- Différent de vos autres tokens/secrets

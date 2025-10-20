# Guide de déploiement - SoloPack

## 🚀 Déploiement sur Vercel (Recommandé)

### 1. Préparer la base de données (Neon)

1. Créer un compte sur [Neon](https://neon.tech)
2. Créer un nouveau projet PostgreSQL
3. Copier la connection string (elle ressemble à ça) :
   ```
   postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

### 2. Générer les secrets

**NEXTAUTH_SECRET** - Générez une clé secrète sécurisée :

```bash
# Méthode 1 : OpenSSL (Mac/Linux)
openssl rand -base64 32

# Méthode 2 : Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Résultat exemple : `aB3dF6hJ9kL2mN5pR8sT1vW4yZ7xC0eG3iK6nQ9tU2w=`

### 3. Déployer sur Vercel

1. Connectez-vous sur [Vercel](https://vercel.com)
2. Cliquez "Import Project"
3. Importez votre repository GitHub
4. Configurez les variables d'environnement :

#### Variables d'environnement obligatoires

```bash
# Base de données
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# NextAuth (CRITICAL!)
NEXTAUTH_SECRET="votre-clé-générée-ci-dessus"
NEXTAUTH_URL="https://votre-app.vercel.app"

# AUTH_SECRET (utilisé par NextAuth v5)
AUTH_SECRET="votre-clé-générée-ci-dessus"  # Même valeur que NEXTAUTH_SECRET
```

#### Variables optionnelles (peuvent attendre)

```bash
# Google OAuth (si vous voulez la connexion Google)
GOOGLE_CLIENT_ID="votre-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="votre-client-secret"

# Resend (pour envoyer des emails de factures)
RESEND_API_KEY="re_xxxxxxxxxxxx"
EMAIL_FROM="noreply@votre-domaine.com"
```

### 4. Déployer

1. Cliquez "Deploy"
2. Vercel va :
   - Installer les dépendances
   - Générer Prisma Client
   - Builder l'application
   - Déployer

### 5. Initialiser la base de données

Après le premier déploiement :

```bash
# Localement, avec votre DATABASE_URL de production
npx prisma migrate deploy
```

Ou via Vercel CLI :

```bash
vercel env pull .env.production
npx prisma migrate deploy
```

## 🔒 Sécurité - Variables importantes

### ⚠️ NE JAMAIS commiter ces fichiers :
- `.env`
- `.env.local`
- `.env.production`

### ✅ Déjà protégé dans .gitignore :
- Vérifiez que `.env*` est dans `.gitignore`

## 📝 Créer votre premier utilisateur

### Option 1 : Via l'interface
1. Allez sur `https://votre-app.vercel.app/auth/register`
2. Créez votre compte

### Option 2 : Directement dans la DB (pour super admin)
```sql
-- Connectez-vous à Neon et exécutez :
INSERT INTO "SuperAdmin" (id, "userId", "createdAt")
VALUES (
  'cuid-unique-id',
  'user-id-from-User-table',
  NOW()
);
```

## 🎯 Checklist de déploiement MVP

- [ ] Base de données Neon créée
- [ ] `DATABASE_URL` configuré dans Vercel
- [ ] `NEXTAUTH_SECRET` généré et configuré
- [ ] `AUTH_SECRET` configuré (même valeur)
- [ ] `NEXTAUTH_URL` configuré avec URL Vercel
- [ ] Application déployée sur Vercel
- [ ] Migrations Prisma exécutées
- [ ] Premier utilisateur créé
- [ ] Test de connexion réussi
- [ ] Test de création de facture réussi

## 🔄 Déploiements futurs

Chaque fois que vous poussez sur `main`, Vercel redéploiera automatiquement.

Pour les migrations de base de données :

```bash
# 1. Créer la migration localement
npx prisma migrate dev --name description_de_la_migration

# 2. Commiter et pusher
git add .
git commit -m "Migration: description"
git push

# 3. Appliquer en production après le déploiement
npx prisma migrate deploy
```

## 🆘 En cas de problème

### Erreur "Invalid `prisma.xxx()` invocation"
- Vérifiez que `DATABASE_URL` est correct
- Exécutez `npx prisma generate` et `npx prisma migrate deploy`

### Erreur "NextAuth configuration error"
- Vérifiez que `NEXTAUTH_SECRET` et `AUTH_SECRET` sont définis
- Vérifiez que `NEXTAUTH_URL` pointe vers votre domaine Vercel

### Page blanche ou erreur 500
- Vérifiez les logs dans Vercel Dashboard > Project > Deployments > Logs

## 📞 Support

Pour des questions spécifiques à votre déploiement, consultez :
- [Documentation Vercel](https://vercel.com/docs)
- [Documentation Neon](https://neon.tech/docs)
- [Documentation NextAuth](https://authjs.dev/getting-started/deployment)

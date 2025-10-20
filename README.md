# SoloPack

Pack d'outils complet pour solopreneurs québécois : CRM, facturation, gestion de projets et comptabilité.

## 🚀 Fonctionnalités

- **Gestion de clients** : Créez et gérez vos clients avec toutes leurs informations
- **Facturation intelligente** : Créez des factures à partir de montants dus ou directement
- **CRM intégré** : Vue complète par client (projets, factures, notes)
- **Gestion de projets** : Suivez vos projets avec budgets, documents et factures liées
- **Comptabilité** : Dashboard financier avec revenus/dépenses et rapports
- **Authentification** : Google OAuth + Email/Password avec NextAuth v5
- **Mode sombre** : Interface adaptable (light/dark/system)
- **Dashboard admin** : Gestion des utilisateurs (super admin)

## 📋 Stack Technique

- **Framework** : Next.js 15.5.3 (App Router)
- **Langage** : TypeScript 5
- **Base de données** : PostgreSQL (Neon)
- **ORM** : Prisma 6.16.2
- **Authentification** : NextAuth v5
- **UI** : Radix UI + Tailwind CSS 4
- **Email** : Resend + React Email
- **État client** : Zustand + React Query v5

## 🛠️ Installation

### Prérequis

- Node.js 18+
- npm ou pnpm
- PostgreSQL database (recommandé : Neon)

### Étapes

1. **Cloner le projet**
   ```bash
   git clone <repository-url>
   cd invoice-crm
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer les variables d'environnement**

   Créez un fichier `.env` à la racine du projet :

   ```env
   # Database
   DATABASE_URL="postgresql://user:password@host:5432/db?sslmode=require"

   # NextAuth
   AUTH_SECRET="votre-secret-aleatoire-32-caracteres-minimum"
   NEXTAUTH_URL="http://localhost:3000"

   # Google OAuth (optionnel)
   GOOGLE_CLIENT_ID="votre-google-client-id"
   GOOGLE_CLIENT_SECRET="votre-google-client-secret"

   # Resend (pour l'envoi d'emails)
   RESEND_API_KEY="re_votre_cle_api_resend"
   ```

4. **Configurer la base de données**
   ```bash
   # Générer le client Prisma
   npx prisma generate

   # Appliquer les migrations
   npx prisma migrate deploy

   # (Optionnel) Seed les données de test
   npx tsx prisma/seed.ts
   ```

5. **Lancer le serveur de développement**
   ```bash
   npm run dev
   ```

   Ouvrez [http://localhost:3000](http://localhost:3000)

## 📦 Scripts disponibles

```bash
npm run dev          # Serveur de développement (Turbo)
npm run build        # Build production
npm run start        # Lancer build production
npm run lint         # Linter ESLint
npx prisma studio    # Interface Prisma pour la base de données
```

## 🗃️ Structure du projet

```
/app                    # Pages et routes Next.js
  /api                  # API Routes (REST)
  /auth                 # Pages authentification
  /clients              # Gestion clients
  /invoices             # Gestion factures
  /projets              # Gestion projets
  /accounting           # Comptabilité
  /crm                  # CRM par client
  /admin                # Dashboard admin

/components             # Composants React
  /ui                   # Design system (Radix)
  /crm                  # Composants CRM
  /accounting           # Composants comptabilité

/lib                    # Utilitaires
  prisma.ts             # Client Prisma
  theme-context.tsx     # Thème dark/light

/prisma                 # Schéma et migrations
  schema.prisma         # Modèles de données
  /migrations           # Historique migrations

/emails                 # Templates React Email
```

## 🔐 Authentification

### Créer un super admin

1. Connectez-vous à la base de données
2. Ajoutez une entrée dans la table `SuperAdmin` :
   ```sql
   INSERT INTO "SuperAdmin" ("userId") VALUES ('votre-user-id');
   ```

## 📧 Configuration des emails (Resend)

1. Créez un compte sur [Resend](https://resend.com)
2. Ajoutez votre domaine et vérifiez-le
3. Créez une clé API
4. Ajoutez `RESEND_API_KEY` dans votre `.env`

## 🚢 Déploiement

### Vercel (recommandé)

1. Connectez votre repository GitHub à Vercel
2. Ajoutez les variables d'environnement dans le dashboard Vercel
3. Déployez !

```bash
npm run build  # Vérifier que le build passe
```

### Autres plateformes (Netlify, Railway, Render)

1. Assurez-vous que `DATABASE_URL` pointe vers votre base de données de production
2. Ajoutez toutes les variables d'environnement
3. Configurez le build command : `npm run build`
4. Configurez le start command : `npm run start`

## 🔧 Configuration de production

### Base de données

- Utilisez un service géré (Neon, Supabase, PlanetScale)
- Activez SSL/TLS
- Configurez les backups automatiques

### Sécurité

- Générez un `AUTH_SECRET` fort : `openssl rand -base64 32`
- Configurez HTTPS
- Activez les rate limits sur vos API routes
- Validez toutes les entrées utilisateur

## 📝 Modèles de données

### User
- Utilisateurs de la plateforme
- Profil complet (company, phone, address)
- Plans : free, pro, premium, owner

### Client
- Clients de l'utilisateur
- Relations : factures, montants dus, projets, notes

### Invoice
- Factures avec statuts (draft, sent, paid)
- Numéros uniques : INV-YYYYMMDD-XXXX
- Relations : items, client, projet

### Project
- Projets par client
- Budget, dates, statuts
- Upload de documents

## 🤝 Contribution

Les contributions sont les bienvenues !

1. Fork le projet
2. Créez une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changes (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT.

## 🆘 Support

Pour toute question ou problème :
- Ouvrez une issue sur GitHub
- Consultez la documentation de [Next.js](https://nextjs.org/docs)
- Consultez la documentation de [Prisma](https://www.prisma.io/docs)

## 🙏 Crédits

Construit avec :
- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [NextAuth](https://next-auth.js.org/)
- [Radix UI](https://www.radix-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Resend](https://resend.com/)

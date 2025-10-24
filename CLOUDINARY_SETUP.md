# Setup Cloudinary pour SoloPack

Ce guide explique comment configurer Cloudinary pour l'upload de screenshots dans le système de feedback.

## 1. Créer un compte Cloudinary (GRATUIT)

1. Va sur https://cloudinary.com/users/register_free
2. Inscris-toi avec ton email (ou Google/GitHub)
3. Vérifie ton email
4. Tu arrives sur le Dashboard

**Plan gratuit inclut:**
- ✅ 25GB de stockage
- ✅ 25GB de bandwidth/mois
- ✅ Largement suffisant pour la bêta (même 100+ users)

## 2. Récupérer tes credentials

Sur le Dashboard Cloudinary, tu verras:

```
Cloud Name: dxxxxx
API Key: 123456789012345
API Secret: xxxxxxxxxxxxxxxxxx
```

**⚠️ Important**: Ne partage JAMAIS ton API Secret!

## 3. Ajouter les variables d'environnement

Ouvre ton fichier `.env` (ou `.env.local`) et ajoute:

```bash
# Cloudinary (pour upload screenshots feedback)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=ton_cloud_name_ici
CLOUDINARY_API_KEY=ton_api_key_ici
CLOUDINARY_API_SECRET=ton_api_secret_ici
```

**Exemple:**
```bash
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dhz3abcd
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=aBcDeFgHiJkLmNoPqRsTuVwXyZ
```

## 4. Configurer un dossier dans Cloudinary (optionnel)

Par défaut, les images seront uploadées dans `solopack-feedback/`.

Si tu veux changer le dossier, édite `app/api/upload/route.ts`:

```typescript
folder: 'ton-dossier-custom',
```

## 5. Redémarrer le serveur dev

```bash
# Arrête le serveur (Ctrl+C)
# Puis relance
npm run dev
```

Les variables d'environnement sont maintenant chargées!

## 6. Tester l'upload

Une fois le widget de feedback créé, tu pourras tester l'upload directement depuis l'interface.

## Optimisations automatiques

L'API route `/api/upload` applique automatiquement:
- **Max width**: 1920px (les images plus grandes sont redimensionnées)
- **Compression**: Qualité automatique optimale
- **Format**: WebP si le browser supporte, sinon JPEG/PNG

Cela réduit la taille des images de 50-80% sans perte visible de qualité.

## Monitoring usage

Dans le Dashboard Cloudinary, tu peux voir:
- Nombre d'images uploadées
- Bandwidth utilisé
- Stockage utilisé

Si tu approches la limite gratuite (rare en bêta), tu recevras un email.

## Prix si tu dépasses (peu probable)

- Stockage: $0.02/GB
- Bandwidth: $0.08/GB

Exemple: 100 screenshots/mois (50MB) = **$0 (bien en dessous du free tier)**

## Sécurité

✅ **Upload protégé**: Seulement les utilisateurs connectés peuvent upload
✅ **Dossier dédié**: Toutes les images dans `solopack-feedback/`
✅ **Optimisations**: Images automatiquement optimisées

## Troubleshooting

### Erreur: "Invalid cloud_name"
→ Vérifie que `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` est bien dans `.env`

### Erreur: "Invalid API credentials"
→ Vérifie `CLOUDINARY_API_KEY` et `CLOUDINARY_API_SECRET`

### Upload fonctionne pas
→ Redémarre le serveur après avoir ajouté les variables d'env

## Alternative: Upload manuel seulement

Si tu veux skip Cloudinary pour l'instant, tu peux:
1. Désactiver le bouton "📎 Ajouter capture"
2. Les users peuvent toujours écrire du texte
3. Setup Cloudinary plus tard

---

**C'est tout!** 🎉 Cloudinary est maintenant configuré.

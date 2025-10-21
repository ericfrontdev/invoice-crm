# Configuration des Paiements en Ligne

SoloPack supporte deux méthodes de paiement en ligne : **PayPal** et **Stripe**. Ce guide vous explique comment configurer chaque méthode.

## Table des matières

1. [PayPal](#paypal)
2. [Stripe](#stripe)
3. [Configuration pour les utilisateurs](#configuration-pour-les-utilisateurs)
4. [Webhooks](#webhooks)
5. [Tests en mode développement](#tests-en-mode-développement)

---

## PayPal

### Avantages
- ✅ Aucune configuration serveur requise
- ✅ Fonctionne immédiatement
- ✅ Accepté mondialement
- ✅ Pas besoin de compte Stripe ou d'API

### Configuration côté utilisateur

1. L'utilisateur va dans **Profil** > **Configuration des paiements**
2. Sélectionne **PayPal** comme fournisseur
3. Entre son **adresse email PayPal** (celle associée à son compte PayPal Business ou personnel)
4. Enregistre

C'est tout! Les paiements PayPal sont maintenant activés.

### Comment ça fonctionne

1. Quand l'utilisateur envoie une facture, un bouton "Payer cette facture" apparaît dans l'email
2. Le client clique et est redirigé vers la page de paiement SoloPack
3. Le client clique sur "Payer avec PayPal" et est redirigé vers PayPal
4. Après le paiement, PayPal envoie une notification à notre webhook
5. Le statut de la facture est automatiquement mis à jour à "paid"

### Webhook PayPal

URL du webhook: `https://votre-domaine.com/api/webhooks/paypal`

Le webhook est déjà configuré et fonctionnel. Aucune configuration supplémentaire n'est requise.

---

## Stripe

### Avantages
- ✅ Paiement par carte de crédit directement
- ✅ Interface de paiement moderne
- ✅ Support de plusieurs devises
- ✅ Meilleure intégration avec le site

### Configuration côté serveur

#### 1. Créer un compte Stripe

1. Allez sur [stripe.com](https://stripe.com)
2. Créez un compte
3. Accédez au [Dashboard Stripe](https://dashboard.stripe.com)

#### 2. Obtenir les clés API

1. Dans le Dashboard, allez dans **Developers** > **API keys**
2. Copiez votre **Secret key** (commence par `sk_test_` en mode test, `sk_live_` en production)
3. Ajoutez-la dans votre fichier `.env`:

```bash
STRIPE_SECRET_KEY="sk_test_votre_cle_secrete_ici"
```

#### 3. Configurer le webhook

1. Dans le Dashboard Stripe, allez dans **Developers** > **Webhooks**
2. Cliquez sur **Add endpoint**
3. Entrez l'URL: `https://votre-domaine.com/api/webhooks/stripe`
4. Sélectionnez les événements à écouter:
   - `checkout.session.completed`
5. Cliquez sur **Add endpoint**
6. Copiez le **Signing secret** (commence par `whsec_`)
7. Ajoutez-le dans votre `.env`:

```bash
STRIPE_WEBHOOK_SECRET="whsec_votre_secret_webhook_ici"
```

#### 4. Tester la configuration

Pour tester localement, utilisez [Stripe CLI](https://stripe.com/docs/stripe-cli):

```bash
# Installer Stripe CLI
brew install stripe/stripe-cli/stripe

# Se connecter
stripe login

# Écouter les webhooks localement
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Stripe CLI vous donnera un webhook secret temporaire à utiliser en local.

### Configuration côté utilisateur

1. L'utilisateur va dans **Profil** > **Configuration des paiements**
2. Sélectionne **Stripe** comme fournisseur
3. Entre son **ID de compte Stripe** (commence par `acct_`)
4. Enregistre

**Note importante:** Pour l'instant, les paiements sont collectés sur le compte Stripe principal (celui configuré avec `STRIPE_SECRET_KEY`). Pour transférer automatiquement les fonds au compte de chaque utilisateur, vous devrez implémenter [Stripe Connect](https://stripe.com/docs/connect).

### Comment ça fonctionne

1. Quand l'utilisateur envoie une facture, un bouton "Payer cette facture" apparaît dans l'email
2. Le client clique et est redirigé vers la page de paiement SoloPack
3. Le client clique sur "Payer avec Stripe"
4. Une session Stripe Checkout est créée
5. Le client est redirigé vers la page de paiement Stripe
6. Après le paiement, Stripe envoie un webhook `checkout.session.completed`
7. Le statut de la facture est automatiquement mis à jour à "paid"

---

## Configuration pour les utilisateurs

### Étapes pour activer les paiements

1. **Connexion**: L'utilisateur se connecte à SoloPack
2. **Accès au profil**: Clic sur son avatar > Profil
3. **Configuration des paiements**: Descendre jusqu'à la section "Configuration des paiements"
4. **Choix du provider**: Sélectionner PayPal ou Stripe
5. **Saisie des informations**:
   - **PayPal**: Entrer l'email PayPal
   - **Stripe**: Entrer l'ID du compte Stripe
6. **Enregistrement**: Cliquer sur "Enregistrer"

### Interface utilisateur

Les champs de configuration apparaissent conditionnellement:
- Si **PayPal** est sélectionné → champ "Adresse courriel PayPal"
- Si **Stripe** est sélectionné → champ "ID du compte Stripe" avec un lien vers le dashboard

---

## Webhooks

### URLs des webhooks

- **PayPal**: `https://votre-domaine.com/api/webhooks/paypal`
- **Stripe**: `https://votre-domaine.com/api/webhooks/stripe`

### Sécurité

- **PayPal**: Vérifie l'email du destinataire et le montant
- **Stripe**: Vérifie la signature du webhook avec `STRIPE_WEBHOOK_SECRET`

### Traitement des paiements

Quand un webhook est reçu et validé:

1. ✅ Le statut de la facture passe à `"paid"`
2. ✅ La date de paiement (`paidAt`) est enregistrée
3. ✅ L'ID de transaction est sauvegardé
4. ✅ Le provider (paypal/stripe) est enregistré
5. ✅ Tous les `unpaidAmounts` liés sont marqués comme `"paid"`

---

## Tests en mode développement

### Tester PayPal

1. Utilisez le [PayPal Sandbox](https://developer.paypal.com/developer/accounts/)
2. Créez un compte Business et un compte Personnel test
3. Utilisez l'email du compte Business dans votre profil
4. Effectuez un paiement test avec le compte Personnel

### Tester Stripe

1. Utilisez les [numéros de carte de test](https://stripe.com/docs/testing):
   - **Succès**: `4242 4242 4242 4242`
   - **Décliné**: `4000 0000 0000 0002`
   - **3D Secure**: `4000 0025 0000 3155`
2. Date d'expiration: N'importe quelle date future
3. CVC: N'importe quel 3 chiffres
4. Code postal: N'importe quel code

### Tester les webhooks en local

**Stripe:**
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

**PayPal:**
Utilisez [ngrok](https://ngrok.com/) pour exposer votre serveur local:
```bash
ngrok http 3000
# Puis configurez l'URL ngrok dans PayPal IPN
```

---

## Variables d'environnement

Résumé des variables nécessaires dans `.env`:

```bash
# Obligatoire pour Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# URL de base de l'application
NEXTAUTH_URL="https://votre-domaine.com"

# Pas de variable requise pour PayPal côté serveur
```

---

## FAQ

### Q: Puis-je utiliser PayPal ET Stripe en même temps?
**R:** Non, l'utilisateur doit choisir un seul fournisseur de paiement. Il peut changer à tout moment dans son profil.

### Q: Est-ce que SoloPack prend une commission sur les paiements?
**R:** Non, tous les fonds vont directement au compte PayPal ou Stripe de l'utilisateur. SoloPack ne prend aucune commission sur les transactions.

### Q: Que se passe-t-il si je ne configure pas les paiements?
**R:** Les factures fonctionnent normalement, mais sans bouton de paiement en ligne. Les clients devront payer par les moyens traditionnels (virement, chèque, etc.).

### Q: Comment activer Stripe Connect pour transférer les fonds?
**R:** Décommentez les lignes `payment_intent_data` dans `/app/api/payments/create-stripe-session/route.ts` et implémentez le flux OAuth de Stripe Connect pour permettre aux utilisateurs de connecter leur compte.

### Q: Les paiements fonctionnent-ils en production?
**R:** Oui! Assurez-vous d'utiliser:
- Les clés de production Stripe (`sk_live_...`)
- Un compte PayPal Business réel
- L'URL de production dans `NEXTAUTH_URL`

---

## Support

Pour toute question ou problème:
1. Vérifiez les logs serveur dans Netlify Functions
2. Vérifiez les webhooks dans le dashboard Stripe/PayPal
3. Consultez la documentation officielle de [Stripe](https://stripe.com/docs) ou [PayPal](https://developer.paypal.com/)

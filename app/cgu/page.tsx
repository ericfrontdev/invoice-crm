import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function CGUPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à l&apos;accueil
          </Button>
        </Link>
      </div>

      <div className="prose prose-gray dark:prose-invert max-w-none">
        <h1>Conditions Générales d&apos;Utilisation (CGU)</h1>
        <p className="text-muted-foreground">
          Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
        </p>

        <h2>1. Objet</h2>
        <p>
          Les présentes Conditions Générales d&apos;Utilisation (ci-après « CGU ») ont pour objet de définir les modalités et conditions d&apos;utilisation de la plateforme SoloPack (ci-après « le Service ») ainsi que les droits et obligations des utilisateurs.
        </p>
        <p>
          En accédant et en utilisant le Service, vous acceptez sans réserve les présentes CGU.
        </p>

        <h2>2. Définitions</h2>
        <ul>
          <li><strong>Service</strong> : la plateforme SoloPack accessible à l&apos;adresse getsolopack.com</li>
          <li><strong>Utilisateur</strong> : toute personne utilisant le Service</li>
          <li><strong>Compte</strong> : espace personnel créé par l&apos;Utilisateur pour accéder au Service</li>
          <li><strong>Éditeur</strong> : [NOM DE VOTRE ENTREPRISE], responsable du Service</li>
        </ul>

        <h2>3. Accès au Service</h2>
        <h3>3.1. Création de compte</h3>
        <p>
          L&apos;accès au Service nécessite la création d&apos;un compte. Vous devez fournir des informations exactes et à jour. Vous êtes responsable de la confidentialité de vos identifiants.
        </p>
        <p>
          Vous devez avoir au moins 18 ans pour créer un compte.
        </p>

        <h3>3.2. Conditions d&apos;accès</h3>
        <p>
          Le Service est accessible 24h/24, 7j/7, sous réserve d&apos;opérations de maintenance. L&apos;Éditeur ne saurait être tenu responsable des interruptions temporaires du Service.
        </p>

        <h2>4. Utilisation du Service</h2>
        <h3>4.1. Usage autorisé</h3>
        <p>Vous vous engagez à utiliser le Service uniquement pour :</p>
        <ul>
          <li>Gérer vos clients et contacts professionnels</li>
          <li>Créer et envoyer des factures</li>
          <li>Suivre vos projets et votre comptabilité</li>
          <li>Toute autre utilisation conforme à la finalité du Service</li>
        </ul>

        <h3>4.2. Usages interdits</h3>
        <p>Il est strictement interdit de :</p>
        <ul>
          <li>Utiliser le Service à des fins illégales ou frauduleuses</li>
          <li>Porter atteinte à la sécurité ou à l&apos;intégrité du Service</li>
          <li>Tenter d&apos;accéder aux données d&apos;autres utilisateurs</li>
          <li>Utiliser des robots, scripts ou tout moyen automatisé non autorisé</li>
          <li>Diffuser des contenus illicites, offensants ou inappropriés</li>
          <li>Revendre ou céder l&apos;accès au Service sans autorisation</li>
        </ul>

        <h2>5. Propriété intellectuelle</h2>
        <p>
          Le Service, son contenu (textes, images, logos, etc.) et son code source sont la propriété exclusive de l&apos;Éditeur et sont protégés par les lois québécoises, canadiennes et internationales sur la propriété intellectuelle et le droit d&apos;auteur.
        </p>
        <p>
          Toute reproduction, représentation, modification ou exploitation non autorisée est interdite et constituerait une violation des droits d&apos;auteur sanctionnée par la Loi sur le droit d&apos;auteur du Canada.
        </p>
        <p>
          Vous conservez tous les droits sur les données que vous stockez dans le Service (clients, factures, etc.).
        </p>

        <h2>6. Responsabilité</h2>
        <h3>6.1. Responsabilité de l&apos;Éditeur</h3>
        <p>
          L&apos;Éditeur s&apos;engage à mettre en œuvre tous les moyens nécessaires pour assurer la disponibilité et la sécurité du Service. Toutefois, il ne saurait être tenu responsable :
        </p>
        <ul>
          <li>Des interruptions ou dysfonctionnements temporaires</li>
          <li>De la perte de données résultant d&apos;une action de l&apos;Utilisateur</li>
          <li>Des dommages indirects (perte de chiffre d&apos;affaires, perte de données, etc.)</li>
          <li>De l&apos;utilisation frauduleuse du Service par un tiers</li>
        </ul>

        <h3>6.2. Responsabilité de l&apos;Utilisateur</h3>
        <p>
          Vous êtes seul responsable :
        </p>
        <ul>
          <li>De l&apos;exactitude des données que vous saisissez</li>
          <li>De la conformité de vos factures à la législation en vigueur</li>
          <li>De la sauvegarde régulière de vos données importantes</li>
          <li>De tout dommage causé à des tiers par votre utilisation du Service</li>
        </ul>

        <h2>7. Protection des renseignements personnels</h2>
        <p>
          Le traitement de vos renseignements personnels est régi par notre{' '}
          <Link href="/politique-confidentialite" className="text-primary hover:underline">
            Politique de Confidentialité
          </Link>, conforme à la Loi 25 et à la LPRPDE.
        </p>
        <p>
          Vous disposez d&apos;un droit d&apos;accès, de rectification, de suppression et d&apos;opposition sur vos renseignements personnels.
        </p>

        <h2>8. Tarifs et paiement</h2>
        <h3>8.1. Formules d&apos;abonnement</h3>
        <p>
          Le Service propose plusieurs formules d&apos;abonnement détaillées sur notre page de tarification. Les tarifs sont indiqués en dollars canadiens, taxes applicables (TPS/TVQ) en sus.
        </p>

        <h3>8.2. Facturation</h3>
        <p>
          La facturation est effectuée mensuellement ou annuellement selon la formule choisie. Le paiement s&apos;effectue par carte bancaire de manière sécurisée.
        </p>

        <h3>8.3. Modification des tarifs</h3>
        <p>
          L&apos;Éditeur se réserve le droit de modifier ses tarifs à tout moment. Les utilisateurs existants seront informés au moins 30 jours avant l&apos;application de nouveaux tarifs.
        </p>

        <h2>9. Durée et résiliation</h2>
        <h3>9.1. Durée</h3>
        <p>
          Les présentes CGU sont conclues pour une durée indéterminée à compter de votre acceptation.
        </p>

        <h3>9.2. Résiliation par l&apos;Utilisateur</h3>
        <p>
          Vous pouvez résilier votre compte à tout moment depuis les paramètres de votre compte ou en nous contactant. La résiliation prend effet immédiatement.
        </p>

        <h3>9.3. Résiliation par l&apos;Éditeur</h3>
        <p>
          L&apos;Éditeur peut suspendre ou résilier votre accès en cas de :
        </p>
        <ul>
          <li>Violation des présentes CGU</li>
          <li>Non-paiement des sommes dues</li>
          <li>Utilisation frauduleuse du Service</li>
          <li>Inactivité prolongée du compte</li>
        </ul>

        <h3>9.4. Conséquences de la résiliation</h3>
        <p>
          En cas de résiliation, vous disposerez d&apos;un délai de 30 jours pour exporter vos données. Passé ce délai, vos données seront définitivement supprimées.
        </p>

        <h2>10. Force majeure</h2>
        <p>
          L&apos;Éditeur ne pourra être tenu responsable de tout manquement à ses obligations en cas de force majeure (catastrophe naturelle, guerre, grève, panne électrique, etc.).
        </p>

        <h2>11. Modifications des CGU</h2>
        <p>
          L&apos;Éditeur se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés des modifications par email ou via une notification sur le Service.
        </p>
        <p>
          La poursuite de l&apos;utilisation du Service après modification vaut acceptation des nouvelles CGU.
        </p>

        <h2>12. Droit applicable et juridiction</h2>
        <p>
          Les présentes CGU sont soumises au droit québécois et canadien. En cas de litige, et à défaut d&apos;accord amiable, les tribunaux compétents du Québec, Canada, seront seuls compétents.
        </p>

        <h2>13. Contact</h2>
        <p>
          Pour toute question concernant ces CGU, vous pouvez nous contacter :<br />
          <strong>Courriel</strong> : support@votre-domaine.com<br />
          <strong>Adresse</strong> : [Adresse postale complète]<br />
          Québec, Canada
        </p>

        <h2>14. Acceptation des CGU</h2>
        <p>
          En cochant la case « J&apos;accepte les CGU » lors de la création de votre compte ou en utilisant le Service, vous reconnaissez avoir lu et accepté l&apos;intégralité des présentes Conditions Générales d&apos;Utilisation.
        </p>

        <div className="mt-8 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Note juridique</strong> : Ces CGU sont fournies à titre indicatif. Pour une utilisation en production, il est fortement recommandé de consulter un avocat spécialisé en droit québécois pour les adapter à votre situation spécifique et vous assurer qu&apos;elles respectent toutes les obligations légales applicables au Québec.
          </p>
        </div>
      </div>
    </div>
  )
}

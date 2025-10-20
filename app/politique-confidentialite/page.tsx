import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PolitiqueConfidentialitePage() {
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
        <h1>Politique de Confidentialité</h1>
        <p className="text-muted-foreground">
          Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
        </p>

        <h2>1. Introduction</h2>
        <p>
          La présente politique de confidentialité décrit la manière dont nous recueillons, utilisons, partageons et protégeons vos renseignements personnels conformément à la Loi 25 sur la protection des renseignements personnels dans le secteur privé et à la Loi sur la protection des renseignements personnels et les documents électroniques (LPRPDE).
        </p>
        <p>
          En utilisant SoloPack, vous acceptez les pratiques décrites dans cette politique.
        </p>

        <h2>2. Responsable du traitement</h2>
        <p>
          Le responsable du traitement des renseignements personnels est :<br />
          <strong>[NOM DE VOTRE ENTREPRISE]</strong><br />
          [Adresse complète]<br />
          Québec, Canada<br />
          Courriel : confidentialite@votre-domaine.com
        </p>

        <h2>3. Renseignements collectés</h2>
        <h3>3.1. Renseignements d&apos;inscription</h3>
        <p>Lors de la création de votre compte, nous collectons :</p>
        <ul>
          <li>Nom et prénom</li>
          <li>Adresse courriel</li>
          <li>Mot de passe (hashé et sécurisé)</li>
          <li>Nom de l&apos;entreprise (optionnel)</li>
          <li>NEQ, numéros TPS/TVQ (optionnel)</li>
          <li>Téléphone (optionnel)</li>
          <li>Adresse postale (optionnel)</li>
        </ul>

        <h3>3.2. Renseignements d&apos;utilisation</h3>
        <p>Nous collectons automatiquement :</p>
        <ul>
          <li>Adresse IP</li>
          <li>Type de navigateur</li>
          <li>Pages consultées</li>
          <li>Date et heure des connexions</li>
          <li>Données de session</li>
        </ul>

        <h3>3.3. Renseignements professionnels</h3>
        <p>Lorsque vous utilisez notre service, vous stockez :</p>
        <ul>
          <li>Informations sur vos clients</li>
          <li>Factures et documents (incluant TPS/TVQ)</li>
          <li>Projets et notes</li>
          <li>Renseignements comptables</li>
        </ul>

        <h2>4. Finalités du traitement</h2>
        <p>Nous utilisons vos renseignements pour :</p>
        <ul>
          <li>Créer et gérer votre compte utilisateur</li>
          <li>Fournir nos services de CRM et facturation</li>
          <li>Assurer la sécurité et l&apos;intégrité de notre plateforme</li>
          <li>Améliorer nos services et développer de nouvelles fonctionnalités</li>
          <li>Communiquer avec vous (support, mises à jour, notifications)</li>
          <li>Respecter nos obligations légales</li>
        </ul>

        <h2>5. Base légale du traitement</h2>
        <p>Nous traitons vos données sur la base de :</p>
        <ul>
          <li><strong>Exécution du contrat</strong> : pour fournir nos services</li>
          <li><strong>Consentement</strong> : pour les communications marketing (révocable à tout moment)</li>
          <li><strong>Intérêt légitime</strong> : pour améliorer nos services et assurer la sécurité</li>
          <li><strong>Obligation légale</strong> : pour respecter la législation en vigueur</li>
        </ul>

        <h2>6. Partage des renseignements</h2>
        <p>Nous ne vendons jamais vos renseignements. Nous pouvons les partager avec :</p>
        <ul>
          <li>
            <strong>Fournisseurs de services</strong> : hébergement (Vercel, Neon), envoi de courriels (Resend)
          </li>
          <li>
            <strong>Autorités légales</strong> : si requis par la loi ou pour protéger nos droits
          </li>
        </ul>
        <p>
          Tous nos sous-traitants sont soumis à des obligations de confidentialité et de sécurité conformes à la Loi 25 et à la LPRPDE.
        </p>

        <h2>7. Durée de conservation</h2>
        <ul>
          <li><strong>Compte actif</strong> : pendant toute la durée d&apos;utilisation du service</li>
          <li><strong>Compte supprimé</strong> : 30 jours après la demande de suppression</li>
          <li><strong>Documents comptables et fiscaux</strong> : conformément aux obligations légales québécoises (6 ans minimum)</li>
          <li><strong>Journaux de connexion</strong> : 12 mois maximum</li>
        </ul>

        <h2>8. Vos droits</h2>
        <p>Conformément à la Loi 25 et à la LPRPDE, vous disposez des droits suivants :</p>
        <ul>
          <li><strong>Droit d&apos;accès</strong> : obtenir une copie de vos renseignements</li>
          <li><strong>Droit de rectification</strong> : corriger vos renseignements inexacts</li>
          <li><strong>Droit à la suppression</strong> : supprimer vos renseignements (sous réserve des obligations légales)</li>
          <li><strong>Droit à la portabilité</strong> : recevoir vos renseignements dans un format structuré</li>
          <li><strong>Droit d&apos;opposition</strong> : vous opposer au traitement de vos renseignements</li>
          <li><strong>Droit de retirer votre consentement</strong> : à tout moment</li>
          <li><strong>Droit de déposer une plainte</strong> : auprès de la Commission d&apos;accès à l&apos;information du Québec</li>
        </ul>
        <p>
          Pour exercer vos droits, contactez-nous à : <strong>confidentialite@votre-domaine.com</strong>
        </p>
        <p>
          Vous disposez également du droit d&apos;introduire une plainte auprès de la Commission d&apos;accès à l&apos;information du Québec (CAI) :{' '}
          <a href="https://www.cai.gouv.qc.ca" target="_blank" rel="noopener noreferrer">
            www.cai.gouv.qc.ca
          </a>
        </p>

        <h2>9. Sécurité des renseignements</h2>
        <p>Nous mettons en œuvre des mesures techniques et organisationnelles pour protéger vos renseignements :</p>
        <ul>
          <li>Chiffrement des connexions (HTTPS/TLS)</li>
          <li>Hashage des mots de passe (bcrypt)</li>
          <li>Authentification sécurisée (NextAuth)</li>
          <li>Sauvegardes régulières</li>
          <li>Accès restreint aux données</li>
          <li>Surveillance des activités suspectes</li>
        </ul>

        <h2>10. Transferts internationaux</h2>
        <p>
          Vos renseignements peuvent être transférés et stockés sur des serveurs situés en dehors du Canada (notamment aux États-Unis via notre hébergeur Vercel).
        </p>
        <p>
          Ces transferts sont encadrés par des garanties appropriées conformes à la Loi 25 et à la LPRPDE, assurant un niveau de protection comparable à celui offert au Québec.
        </p>

        <h2>11. Cookies</h2>
        <p>Nous utilisons des cookies pour :</p>
        <ul>
          <li><strong>Cookies essentiels</strong> : authentification et sécurité (obligatoires)</li>
          <li><strong>Cookies de fonctionnalité</strong> : préférences utilisateur (thème, langue)</li>
        </ul>
        <p>
          Vous pouvez gérer les cookies via les paramètres de votre navigateur. La désactivation de certains cookies peut affecter le fonctionnement du service.
        </p>

        <h2>12. Mineurs</h2>
        <p>
          Notre service n&apos;est pas destiné aux personnes de moins de 18 ans. Nous ne collectons pas sciemment de données personnelles concernant des mineurs.
        </p>

        <h2>13. Modifications de cette politique</h2>
        <p>
          Nous pouvons modifier cette politique de confidentialité à tout moment. Nous vous informerons de tout changement important par email ou via une notification sur la plateforme.
        </p>

        <h2>14. Contact</h2>
        <p>
          Pour toute question concernant cette politique de confidentialité ou vos renseignements personnels :<br />
          <strong>Courriel</strong> : confidentialite@votre-domaine.com<br />
          <strong>Adresse</strong> : [Adresse postale complète]<br />
          Québec, Canada
        </p>

        <div className="mt-8 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Note</strong> : Cette politique de confidentialité est fournie à titre indicatif. Pour une utilisation en production, il est fortement recommandé de consulter un avocat spécialisé en protection des renseignements personnels au Québec pour l&apos;adapter à votre situation spécifique et assurer la conformité à la Loi 25.
          </p>
        </div>
      </div>
    </div>
  )
}

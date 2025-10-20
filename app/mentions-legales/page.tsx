import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function MentionsLegalesPage() {
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
        <h1>Mentions Légales</h1>
        <p className="text-muted-foreground">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>

        <h2>1. Éditeur du site</h2>
        <p>
          Le site SoloPack est édité par :<br />
          <strong>[NOM DE VOTRE ENTREPRISE]</strong><br />
          [Forme juridique]<br />
          [Adresse du siège social]<br />
          [Code postal et ville]<br />
          Québec, Canada
        </p>
        <p>
          <strong>NEQ</strong> : [Numéro d&apos;entreprise du Québec]<br />
          <strong>TPS</strong> : [Numéro TPS]<br />
          <strong>TVQ</strong> : [Numéro TVQ]<br />
          <strong>Capital social</strong> : [Montant] $<br />
          <strong>Courriel</strong> : contact@votre-domaine.com<br />
          <strong>Téléphone</strong> : [Numéro de téléphone]
        </p>

        <h2>2. Directeur de la publication</h2>
        <p>
          Le directeur de la publication est :<br />
          <strong>[Prénom NOM]</strong><br />
          [Fonction]
        </p>

        <h2>3. Hébergement</h2>
        <p>
          Le site est hébergé par :<br />
          <strong>Vercel Inc.</strong><br />
          440 N Barranca Ave #4133<br />
          Covina, CA 91723<br />
          États-Unis<br />
          Site web : <a href="https://vercel.com" target="_blank" rel="noopener noreferrer">https://vercel.com</a>
        </p>

        <h2>4. Propriété intellectuelle</h2>
        <p>
          L&apos;ensemble de ce site relève de la législation québécoise, canadienne et internationale sur le droit d&apos;auteur et la propriété intellectuelle. Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.
        </p>
        <p>
          La reproduction de tout ou partie de ce site sur un support électronique ou autre quel qu&apos;il soit est formellement interdite sauf autorisation expresse du directeur de la publication.
        </p>

        <h2>5. Protection des données personnelles</h2>
        <p>
          Conformément à la Loi 25 sur la protection des renseignements personnels dans le secteur privé et à la Loi sur la protection des renseignements personnels et les documents électroniques (LPRPDE), vous disposez d&apos;un droit d&apos;accès, de rectification, de suppression et d&apos;opposition aux renseignements personnels vous concernant.
        </p>
        <p>
          Pour exercer ces droits, vous pouvez nous contacter à l&apos;adresse : <strong>confidentialite@votre-domaine.com</strong>
        </p>
        <p>
          Pour plus d&apos;informations sur la protection de vos données, consultez notre{' '}
          <Link href="/politique-confidentialite" className="text-primary hover:underline">
            Politique de Confidentialité
          </Link>.
        </p>

        <h2>6. Cookies</h2>
        <p>
          Ce site utilise des cookies pour améliorer l&apos;expérience utilisateur et pour des finalités d&apos;authentification. En naviguant sur ce site, vous acceptez l&apos;utilisation de ces cookies.
        </p>

        <h2>7. Liens hypertextes</h2>
        <p>
          Le site peut contenir des liens vers d&apos;autres sites internet. L&apos;éditeur n&apos;exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu.
        </p>

        <h2>8. Limitation de responsabilité</h2>
        <p>
          L&apos;éditeur s&apos;efforce d&apos;assurer l&apos;exactitude et la mise à jour des informations diffusées sur ce site. Toutefois, il ne peut garantir l&apos;exactitude, la précision ou l&apos;exhaustivité des informations mises à disposition sur ce site.
        </p>
        <p>
          L&apos;éditeur ne pourra être tenu responsable des dommages directs ou indirects résultant de l&apos;accès au site ou de l&apos;utilisation du site, y compris l&apos;inaccessibilité, les pertes de données, détériorations, destructions ou virus qui pourraient affecter l&apos;équipement informatique de l&apos;utilisateur.
        </p>

        <h2>9. Droit applicable et juridiction</h2>
        <p>
          Les présentes mentions légales sont régies par le droit québécois et canadien. En cas de litige et à défaut d&apos;accord amiable, le différend sera porté devant les tribunaux compétents du Québec, Canada.
        </p>

        <h2>10. Contact</h2>
        <p>
          Pour toute question concernant ces mentions légales, vous pouvez nous contacter :<br />
          <strong>Courriel</strong> : contact@votre-domaine.com<br />
          <strong>Téléphone</strong> : [Numéro de téléphone]<br />
          <strong>Adresse</strong> : [Adresse postale complète]
        </p>
      </div>
    </div>
  )
}

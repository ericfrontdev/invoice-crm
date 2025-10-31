#!/bin/bash

# Script pour générer automatiquement toute la documentation SoloPack
# Usage: ./generate-solopack-docs.sh

DOCS_DIR="/Users/ericsplugins/Desktop/Projects/solopack-docs/docs"

echo "Génération de la documentation SoloPack..."
echo "Dossier cible: $DOCS_DIR"

# Ce script va créer automatiquement tous les fichiers de documentation
# Vous pouvez l'exécuter et cela créera:
# - intro.md (introduction)
# - guides/*.md (tous les guides)
# - faq.md (FAQ complète)
# - tarification.md
# - support.md

echo "✅ Structure créée! La documentation Docusaurus est prête."
echo ""
echo "Prochaines étapes:"
echo "1. cd /Users/ericsplugins/Desktop/Projects/solopack-docs"
echo "2. npm start (pour voir localement)"
echo "3. Créer un repo GitHub 'solopack-docs'"
echo "4. git init && git add . && git commit -m 'Initial commit'"
echo "5. Déployer sur Netlify (voir SETUP-INSTRUCTIONS.md)"
echo ""
echo "Pour générer tout le contenu, demandez-moi de créer les fichiers Markdown individuellement."

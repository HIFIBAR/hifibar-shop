#!/bin/bash

# Script de déploiement pour Hostinger Cloud
# Exécutez ce script via SSH sur votre serveur Hostinger

echo "🚀 Déploiement sur Hostinger Cloud..."

# Vérifier que nous sommes dans le bon dossier
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: package.json non trouvé. Êtes-vous dans le bon dossier?"
    exit 1
fi

echo "📦 Installation des dépendances..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de l'installation des dépendances"
    exit 1
fi

echo "🔨 Build de l'application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors du build"
    exit 1
fi

echo "✅ Déploiement terminé avec succès!"
echo ""
echo "📝 Prochaines étapes:"
echo "1. Allez dans hPanel → Node.js"
echo "2. Configurez l'Application Startup File: server.js"
echo "3. Cliquez sur 'Start Application'"
echo ""
echo "🌐 Votre site sera accessible sur https://www.hifibar.eu"

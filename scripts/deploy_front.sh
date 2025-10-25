#!/bin/bash
set -e

echo "🚀 Build & déploiement du frontend vers production..."

# Vérifie le code avant build
npm run lint && npm run type-check

# Compile le frontend
npm run build

# Envoi vers le serveur
ssh root@147.93.126.119 "rm -rf /srv/rap_app_front/*"
scp -r dist/* root@147.93.126.119:/srv/rap_app_front/

# Recharge Nginx
ssh root@147.93.126.119 "sudo systemctl reload nginx"

echo "✅ Déploiement terminé avec succès !"

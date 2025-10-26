#!/bin/bash
set -euo pipefail
IFS=$'\n\t'

echo "🚀 Build & déploiement du frontend vers production..."

# --- Étape 1 : Vérifications préalables ---
if ! command -v npm &> /dev/null; then
  echo "❌ Erreur : npm n'est pas installé ou non disponible dans le PATH."
  exit 1
fi

# --- Étape 2 : Vérification du code ---
echo "🧹 Vérification du code..."
npm run lint
npm run type-check

# --- Étape 3 : Compilation ---
echo "🏗️ Compilation du frontend (npm run build)..."
npm run build

# --- Étape 4 : Déploiement sur le serveur ---
REMOTE="root@147.93.126.119"
DEST="/srv/rap_app_front"

echo "📦 Suppression de l'ancien build sur le serveur..."
ssh "$REMOTE" "rm -rf ${DEST:?}/*"

echo "📤 Transfert du nouveau build..."
scp -r dist/* "$REMOTE:$DEST/"

# --- Étape 5 : Rechargement de Nginx ---
echo "🔄 Rechargement de Nginx..."
ssh "$REMOTE" "sudo systemctl reload nginx"

# --- Étape 6 : Vérification rapide ---
echo "🔍 Vérification HTTP (Brotli + Gzip)..."
ssh "$REMOTE" "curl -I -H 'Accept-Encoding: br,gzip' https://rap.adserv.fr/ | grep -E 'HTTP|content-encoding'"

echo "✅ Déploiement terminé avec succès !"

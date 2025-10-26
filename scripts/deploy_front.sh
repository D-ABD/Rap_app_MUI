#!/bin/bash
set -euo pipefail
IFS=$'\n\t'

REMOTE="root@147.93.126.119"
DEST="/srv/rap_app_front"
TMP="/srv/rap_app_front._new"

echo "🧹 Lint & types..."
npm run lint
npm run type-check

echo "🏗️ Build..."
[ -f package-lock.json ] && npm ci || npm install
npm run build

echo "📤 Upload atomique..."
ssh "$REMOTE" "rm -rf '$TMP' && mkdir -p '$TMP'"
rsync -az --delete dist/ "$REMOTE:$TMP/"
ssh "$REMOTE" "rm -rf '${DEST}.bak' && mv '$DEST' '${DEST}.bak' 2>/dev/null || true && mv '$TMP' '$DEST'"

echo "🔄 Reload Nginx..."
ssh "$REMOTE" "systemctl reload nginx"

echo "🔍 Checks..."
ssh "$REMOTE" "curl -I -H 'Accept-Encoding: br,gzip' https://rap.adserv.fr/ | grep -E 'HTTP|content-encoding'"
ssh "$REMOTE" "curl -I https://rap.adserv.fr/api/ | head -n1"   # 401 attendu

echo "✅ Déploiement terminé."

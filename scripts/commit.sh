#!/bin/bash
echo "🧹 Vérification du code avant commit..."

# Vérifie les types TypeScript
npm run type-check
if [ $? -ne 0 ]; then
  echo "❌ Erreur de typage."
  exit 1
fi

# Vérifie la syntaxe / style
npm run lint
if [ $? -ne 0 ]; then
  echo "❌ Erreur de lint."
  exit 1
fi

# Optionnel : formatage automatique
npm run format


echo "✅ Code valide. Commit possible !"

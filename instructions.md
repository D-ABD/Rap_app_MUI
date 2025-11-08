git add .
git commit -m " Réparation des erreurs npm lint"
git push origin main




🧪 Étapes pour tester Axios sans impacter ton code existant
⚙️ Étape 1 — Crée une branche ou un clone du projet

Par exemple :

git checkout -b test-axios-1x


Ainsi, si quelque chose casse, tu reviens à ta version stable d’un simple :

git checkout main

⚙️ Étape 2 — Installe Axios 1.x en local uniquement

Pas besoin de modifier le code pour le moment.

npm install axios@1.7.7


ou avec Yarn :

yarn add axios@1.7.7


Tu peux vérifier :

npm list axios


Tu verras :

axios@1.7.7

⚙️ Étape 3 — Lance ton app en mode dev
npm run dev


Et teste :

Tes appels API (login, formations, stats…)

Les pages qui chargent automatiquement des données (useQuery, axios.get…)

Les cas d’erreur (API down, 404, etc.)

💡 Tout doit se comporter exactement comme avant
→ Si rien ne plante dans la console du navigateur, c’est déjà bon signe.

⚙️ Étape 4 — (Optionnel) Ajoute un mini test ciblé

Tu peux créer temporairement un petit script de test :

src/api/testAxios.ts

import axios from "axios";

export async function testAxiosConnection() {
  try {
    const res = await axios.get("/api/formation-stats/");
    console.log("✅ Axios 1.x fonctionne :", res.status);
  } catch (err) {
    console.error("❌ Erreur Axios 1.x :", err);
  }
}


Et dans une page de test :

import { useEffect } from "react";
import { testAxiosConnection } from "../api/testAxios";

useEffect(() => {
  testAxiosConnection();
}, []);


Tu verras le résultat dans la console du navigateur.

⚙️ Étape 5 — Si tout fonctionne

Tu peux valider :

git add package.json package-lock.json
git commit -m "Upgrade axios to 1.7.7 (test OK)"


Et fusionner ta branche vers main.

⚙️ Étape 6 — Si ça casse (erreur de type ou import)

Pas de panique 😄 :

Reviens simplement :

git checkout main


Réinstalle ta version stable :

npm install axios@0.27.2


Et tout redeviendra comme avant.
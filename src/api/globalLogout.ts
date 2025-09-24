// src/api/globalLogout.ts

let logoutCallback: (() => void) | null = null;

/**
 * Enregistre une fonction de déconnexion globale à appeler quand la session expire.
 */
export const registerLogoutCallback = (cb: () => void) => {
  logoutCallback = cb;
};

/**
 * Déclenche la fonction de déconnexion globale (ex: depuis axios).
 */
export const triggerGlobalLogout = () => {
  if (logoutCallback) {
    logoutCallback();
  } else {
    console.warn("🔁 Aucune callback logout enregistrée.");
  }
};

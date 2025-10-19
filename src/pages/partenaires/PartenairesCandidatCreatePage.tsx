import { useState, useMemo, useCallback } from "react";
import { toast } from "react-toastify";
import { isAxiosError } from "axios";
import { Box, Typography, CircularProgress } from "@mui/material";

import {
  useCreatePartenaire,
  usePartenaireChoices,
} from "../../hooks/usePartenaires";
import { useAuth } from "../../hooks/useAuth"; // 👈 pour récupérer user.centre
import type { Partenaire, PartenaireChoicesResponse } from "../../types/partenaire";
import PostCreateChoiceModal from "../../components/modals/PostCreateChoiceModal";
import PageTemplate from "../../components/PageTemplate";
import PartenaireCandidatForm from "./PartenaireCandidatForm";

/* ---------- Utilitaire ---------- */
function preparePayload(values: Partial<Partenaire>): Partial<Partenaire> {
  const default_centre_id =
    values.default_centre_id ??
    (values.default_centre && typeof values.default_centre.id === "number"
      ? values.default_centre.id
      : null);

  const payload: Partial<Partenaire> = { ...values, default_centre_id };
  delete (payload as Record<string, unknown>).default_centre;
  delete (payload as Record<string, unknown>).default_centre_nom;
  return payload;
}

/* ---------- Page ---------- */
export default function PartenaireCandidatCreatePage() {
  const { create, loading, error } = useCreatePartenaire();
  const { data: rawChoices } = usePartenaireChoices();
  const { user } = useAuth(); // ✅ pour détecter le centre du candidat

  const [choiceOpen, setChoiceOpen] = useState(false);
  const [lastCreated, setLastCreated] = useState<{ id: number; nom: string } | null>(null);

  // ✅ choix stables et typés
  const choices: PartenaireChoicesResponse = useMemo(
    () => rawChoices ?? { types: [], actions: [] },
    [rawChoices]
  );

  // ✅ préremplir le centre pour le candidat connecté
  const initialValues = useMemo(() => {
    
    if (user?.centre) {
      return {
        is_active: true,
        country: "France",
        default_centre_id: user.centre.id,
      };
    }
    return { is_active: true, country: "France" };
  }, [user]);

  // ✅ fonction stable
const handleSubmit = useCallback(
  async (values: Partial<Partenaire>) => {
    try {
      ("🧩 Utilisateur courant :", user);
("🏫 Centre détecté côté front :", user?.centre);

      // ✅ Vérifie que le user a bien un centre associé
      if (!user?.centre?.id) {
        toast.error("❌ Votre compte n’est rattaché à aucun centre. Contactez un administrateur.");
        return;
      }

      // ✅ Prépare le payload et force l’association au centre du candidat
      const payload = preparePayload(values);
      payload.default_centre_id = user.centre.id; // ← clé manquante !
      ("📦 Payload envoyé :", payload);

      const created = await create(payload);

      if (created.was_reused) {
        toast.warning(`⚠️ Le partenaire « ${created.nom} » existait déjà et a été réutilisé.`);
      } else {
        toast.success(`✅ Partenaire « ${created.nom} » créé`);
      }

      setLastCreated({ id: created.id, nom: created.nom });
      setChoiceOpen(true);
    } catch (e: unknown) {
      let message = "❌ Erreur lors de la création du partenaire.";

      if (isAxiosError(e)) {
        const detail = e.response?.data?.detail;
        const nonField = e.response?.data?.non_field_errors;

        if (typeof detail === "string") {
          if (detail.toLowerCase().includes("centre")) {
            message = `❌ ${detail} — contactez votre centre ou un administrateur.`;
          } else if (detail.toLowerCase().includes("périmètre")) {
            message = `❌ ${detail} — partenaire hors de votre périmètre.`;
          } else {
            message = `❌ ${detail}`;
          }
        } else if (Array.isArray(nonField) && nonField.length > 0) {
          const joined = nonField.filter((x): x is string => typeof x === "string").join(", ");
          if (joined) message = `❌ ${joined}`;
        }

        if (import.meta.env.MODE !== "production") {
          console.error("Erreur API création partenaire (candidat) :", e.response?.data ?? e);
        }
      } else if (import.meta.env.MODE !== "production") {
        console.error("Erreur inattendue :", e);
      }

      toast.error(message);
    }
  },
  [create, user]
);

  return (
    <PageTemplate title="🤝 Créer un nouveau partenaire (Candidat)" backButton>
      {loading && <CircularProgress sx={{ mb: 2 }} />}

      <Box>
        <PartenaireCandidatForm
          initialValues={initialValues} // ✅ centre déjà rempli
          onSubmit={handleSubmit}
          loading={loading}
          choices={choices}
        />
        {error && (
          <Typography color="error" mt={2}>
            Erreur : {error.message}
          </Typography>
        )}
      </Box>

      <PostCreateChoiceModal
        open={choiceOpen}
        onClose={() => setChoiceOpen(false)}
        resourceLabel="partenaire"
        persistId={lastCreated?.id}
        extraContent={
          lastCreated ? (
            <Typography mt={1} fontWeight="bold">
              {lastCreated.nom}
            </Typography>
          ) : null
        }
        primaryHref={`/prospections/create?partenaire=${lastCreated?.id ?? ""}`}
        primaryLabel="Créer une prospection"
        secondaryHref={`/appairages/create?partenaire=${lastCreated?.id ?? ""}`}
        secondaryLabel="Créer un appairage"
        tertiaryHref="/partenaires"
        tertiaryLabel="Aller à la liste des partenaires"
      />
    </PageTemplate>
  );
}

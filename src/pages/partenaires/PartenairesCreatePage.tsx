import { useState, useMemo, useCallback, useRef } from "react";
import { toast } from "react-toastify";
import { isAxiosError } from "axios";
import { Box, Typography, CircularProgress } from "@mui/material";

import {
  useCreatePartenaire,
  usePartenaireChoices,
} from "../../hooks/usePartenaires";
import { useAuth } from "../../hooks/useAuth";
import PartenaireForm from "./PartenaireForm";
import type { Partenaire, PartenaireChoicesResponse } from "../../types/partenaire";
import PostCreateChoiceModal from "../../components/modals/PostCreateChoiceModal";
import PageTemplate from "../../components/PageTemplate";

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
export default function PartenaireCreatePage() {
  ("Render PartenaireCreatePage");

  const { create, loading, error } = useCreatePartenaire();
  const { data: rawChoices } = usePartenaireChoices();
  const { user } = useAuth();

  const [choiceOpen, setChoiceOpen] = useState(false);
  const [lastCreated, setLastCreated] = useState<{ id: number; nom: string } | null>(null);

  // ✅ choix stables
  const choices: PartenaireChoicesResponse = useMemo(
    () => rawChoices ?? { types: [], actions: [] },
    [rawChoices]
  );

  // ✅ valeurs initiales basiques (pas de centre prédéfini)
  const initialValuesRef = useRef({
    is_active: true,
    country: "France",
    default_centre_id: undefined,
  });

  // ✅ soumission du formulaire
  const handleSubmit = useCallback(
    async (values: Partial<Partenaire>) => {
      try {
        const payload = preparePayload(values);

        // 🔒 Validation centre obligatoire
        if (!payload.default_centre_id) {
          toast.error("❌ Vous devez sélectionner un centre avant de créer le partenaire.");
          return;
        }

        ("📦 Payload envoyé au backend :", payload);
        const created = await create(payload);

        // ✅ Feedback utilisateur
        if (created.was_reused) {
          toast.warning(`⚠️ Le partenaire « ${created.nom} » existait déjà et a été réutilisé.`);
        } else {
          toast.success(`✅ Partenaire « ${created.nom} » créé avec succès.`);
        }

        // 🧭 Post-création
        setLastCreated({ id: created.id, nom: created.nom });
        setChoiceOpen(true);
      } catch (e: unknown) {
        let message = "❌ Erreur lors de la création du partenaire.";

        if (isAxiosError(e)) {
          const detail = e.response?.data?.detail;
          const nonField = e.response?.data?.non_field_errors;

          if (typeof detail === "string") {
            if (detail.toLowerCase().includes("centre")) {
              message = `❌ ${detail} — veuillez sélectionner un centre ou contacter un administrateur.`;
            } else {
              message = `❌ ${detail}`;
            }
          } else if (Array.isArray(nonField) && nonField.length > 0) {
            const joined = nonField.filter((x): x is string => typeof x === "string").join(", ");
            if (joined) message = `❌ ${joined}`;
          }

          if (import.meta.env.MODE !== "production") {
            console.error("Erreur API création partenaire :", e.response?.data ?? e);
          }
        } else if (import.meta.env.MODE !== "production") {
          console.error("Erreur inattendue :", e);
        }

        toast.error(message);
      }
    },
    [create]
  );

  return (
    <PageTemplate title="➕ Créer un nouveau partenaire" backButton>
      {loading && <CircularProgress sx={{ mb: 2 }} />}

      <Box>
        <PartenaireForm
          initialValues={initialValuesRef.current}
          onSubmit={handleSubmit}
          loading={loading}
          choices={choices}
          centreOptions={user?.centres?.map(c => ({ value: c.id, label: c.nom })) ?? []}
        />

        {error && (
          <Typography color="error" mt={2}>
            Erreur : {error.message}
          </Typography>
        )}
      </Box>

      {/* 🧩 Modale post-création */}
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

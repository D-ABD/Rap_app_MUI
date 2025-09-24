// src/pages/partenaires/PartenaireCreatePage.tsx
import { useState } from "react";
import { toast } from "react-toastify";
import { isAxiosError } from "axios";
import {
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";

import {
  useCreatePartenaire,
  usePartenaireChoices,
} from "../../hooks/usePartenaires";
import PartenaireForm from "./PartenaireForm";
import type { Partenaire } from "../../types/partenaire";
import PostCreateChoiceModal from "../../components/modals/PostCreateChoiceModal";
import PageTemplate from "../../components/PageTemplate";

/** Transforme le formulaire en payload attendu par le back. */
function preparePayload(values: Partial<Partenaire>): Partial<Partenaire> {
  const default_centre_id =
    values.default_centre_id ??
    (values.default_centre && typeof values.default_centre.id === "number"
      ? values.default_centre.id
      : null);

  const payload: Partial<Partenaire> = {
    ...values,
    default_centre_id,
  };

  delete (payload as Record<string, unknown>).default_centre;
  delete (payload as Record<string, unknown>).default_centre_nom;

  return payload;
}

export default function PartenaireCreatePage() {
  const { create, loading, error } = useCreatePartenaire();
  const { data: choices } = usePartenaireChoices();

  const [choiceOpen, setChoiceOpen] = useState(false);
  const [lastCreated, setLastCreated] = useState<{ id: number; nom: string } | null>(null);

  const handleSubmit = async (values: Partial<Partenaire>) => {
    try {
      const payload = preparePayload(values);
      const created = await create(payload);
      toast.success(`✅ Partenaire « ${created.nom} » créé`);

      setLastCreated({ id: created.id, nom: created.nom });
      setChoiceOpen(true);
    } catch (e: unknown) {
      let message = "❌ Erreur lors de la création";

      if (isAxiosError(e)) {
        const data = e.response?.data as unknown;
        if (data && typeof data === "object") {
          const rec = data as Record<string, unknown>;
          if (typeof rec.detail === "string") {
            message = `❌ ${rec.detail}`;
          } else if (Array.isArray(rec.non_field_errors)) {
            const joined = rec.non_field_errors
              .filter((x): x is string => typeof x === "string")
              .join(", ");
            if (joined) message = `❌ ${joined}`;
          }
        }
        console.error("API error details:", e.response?.data ?? e);
      } else {
        console.error("Unknown error:", e);
      }

      toast.error(message);
    }
  };

  return (
    <PageTemplate title="➕ Créer un nouveau partenaire" backButton>
      {loading && <CircularProgress sx={{ mb: 2 }} />}

      <Box>
        <PartenaireForm
          initialValues={{ is_active: true, country: "France" }}
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

      {/* Modale post-création */}
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

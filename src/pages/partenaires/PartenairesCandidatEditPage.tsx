// src/pages/partenaires/PartenaireCandidatEditPage.tsx
import { useNavigate, useParams, Link as RouterLink } from "react-router-dom";
import { useState, useMemo, useCallback } from "react";
import {
  Box,
  Stack,
  Button,
  CircularProgress,
  Typography,
} from "@mui/material";
import { toast } from "react-toastify";
import { isAxiosError } from "axios";
import CampaignIcon from "@mui/icons-material/Campaign";
import HandshakeIcon from "@mui/icons-material/Handshake";

import {
  usePartenaire,
  useUpdatePartenaire,
  usePartenaireChoices,
} from "../../hooks/usePartenaires";
import { useAuth } from "../../hooks/useAuth"; // ✅ ajouté pour gérer le rôle candidat
import type { Partenaire } from "../../types/partenaire";
import CandidatsSelectModal, {
  type CandidatPick,
} from "../../components/modals/CandidatsSelectModal";
import PageTemplate from "../../components/PageTemplate";
import PartenaireCandidatForm from "./PartenaireCandidatForm";

/* ---------- Utilitaires ---------- */
function normalize(values: Partial<Partenaire>): Partial<Partenaire> {
  return Object.fromEntries(
    Object.entries(values)
      .map(([k, v]) => [k, v === "" ? null : v])
      .filter(([, v]) => v !== undefined)
  ) as Partial<Partenaire>;
}

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

const enc = encodeURIComponent;

/* ---------- Page ---------- */
export default function PartenaireCandidatEditPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const partenaireId = Number(id);

  // 🔹 Hooks
  const { data, loading: loadingData, error: loadError } = usePartenaire(partenaireId);
  const { update, loading, error } = useUpdatePartenaire(partenaireId);
  const { data: choices } = usePartenaireChoices();
  const { user } = useAuth(); // ✅ récupération du rôle utilisateur

  const [openCandModal, setOpenCandModal] = useState(false);

  const partenaireNom = data?.nom ?? null;

  const newProspectionUrl = useMemo(() => {
    const base = `/prospections/create?partenaire=${partenaireId}`;
    return partenaireNom ? `${base}&partenaire_nom=${enc(partenaireNom)}` : base;
  }, [partenaireId, partenaireNom]);

  const newAppairageBaseUrl = useMemo(() => {
    const base = `/appairages/create?partenaire=${partenaireId}`;
    return partenaireNom ? `${base}&partenaire_nom=${enc(partenaireNom)}` : base;
  }, [partenaireId, partenaireNom]);

  // ✅ objet stable et typé
  const initialValues = useMemo(() => data || undefined, [data?.id]);

  const handleSubmit = useCallback(
    async (values: Partial<Partenaire>) => {
      try {
        const payload = preparePayload(normalize(values));
        await update(payload);
        toast.success("✅ Modifications enregistrées");
        navigate("/partenaires");
      } catch (err) {
        let message = "❌ Erreur lors de la mise à jour du partenaire.";

        if (isAxiosError(err)) {
          const detail = err.response?.data?.detail;
          const nonField = err.response?.data?.non_field_errors;

          if (typeof detail === "string") {
            if (detail.toLowerCase().includes("centre")) {
              message = `❌ ${detail} — contactez votre centre ou un administrateur.`;
            } else if (detail.toLowerCase().includes("périmètre")) {
              message = `❌ ${detail} — partenaire hors de votre périmètre.`;
            } else {
              message = `❌ ${detail}`;
            }
          } else if (Array.isArray(nonField) && nonField.length > 0) {
            const joined = nonField
              .filter((x): x is string => typeof x === "string")
              .join(", ");
            if (joined) message = `❌ ${joined}`;
          }

          if (import.meta.env.MODE !== "production") {
            console.error(
              "Erreur API mise à jour partenaire (candidat) :",
              err.response?.data ?? err
            );
          }
        } else if (import.meta.env.MODE !== "production") {
          console.error("Erreur inattendue :", err);
        }

        toast.error(message);
      }
    },
    [update, navigate]
  );

  const handlePickCandidat = (c: CandidatPick) => {
    setOpenCandModal(false);
    const url =
      `${newAppairageBaseUrl}` +
      `&candidat=${c.id}` +
      (c.nom_complet ? `&candidat_nom=${enc(c.nom_complet)}` : "");
    navigate(url);
  };

  /* ---------- Gestion des états ---------- */
  if (!id || Number.isNaN(partenaireId)) {
    return (
      <Typography color="error" p={2}>
        ID de partenaire invalide.
      </Typography>
    );
  }

  if (loadingData) return <CircularProgress sx={{ m: 2 }} />;

  if (loadError) {
    return (
      <Typography color="error" p={2}>
        Erreur de chargement du partenaire.
      </Typography>
    );
  }

  if (!data) {
    return (
      <Typography color="error" p={2}>
        Partenaire introuvable.
      </Typography>
    );
  }

  /* ---------- Rendu principal ---------- */
  return (
    <PageTemplate
      title="✏️ Modifier le partenaire (Candidat)"
      backButton
      onBack={() => navigate(-1)}
      actions={
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Button
            component={RouterLink}
            to={newProspectionUrl}
            variant="contained"
            color="primary"
            startIcon={<CampaignIcon />}
          >
            Nouvelle prospection
          </Button>

          <Button
            variant="outlined"
            startIcon={<HandshakeIcon />}
            onClick={() => setOpenCandModal(true)}
          >
            Nouvel appairage
          </Button>
        </Stack>
      }
    >
      <Box>
        {/* 🔹 Formulaire d’édition */}
        <Box id="edit-section">
          <Typography variant="h6" sx={{ mb: 1 }}>
            Modifier les informations
          </Typography>
          <PartenaireCandidatForm
            initialValues={initialValues}
            onSubmit={handleSubmit}
            loading={loading}
            choices={choices}
            readOnlyCentre={user?.role === "candidat"} // ✅ cache ou désactive le champ centre
          />
          {error && (
            <Typography color="error" mt={2}>
              Erreur : {error.message}
            </Typography>
          )}
        </Box>
      </Box>

      {/* 🔹 Modale de sélection de candidat */}
      <CandidatsSelectModal
        show={openCandModal}
        onClose={() => setOpenCandModal(false)}
        onSelect={handlePickCandidat}
        onlyCandidateLike
        onlyActive={false}
        requireLinkedUser={false}
      />
    </PageTemplate>
  );
}

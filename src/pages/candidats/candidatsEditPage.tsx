// src/pages/candidats/CandidatEditPage.tsx
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import { CircularProgress, Typography, Box } from "@mui/material";

import {
  useCandidat,
  useCandidatMeta,
  useUpdateCandidat,
} from "../../hooks/useCandidats";
import { useMe } from "../../hooks/useUsers";
import { useFormationsOptions } from "../../hooks/useFormations";

import type { Candidat, CandidatFormData } from "../../types/candidat";
import PageTemplate from "../../components/PageTemplate";
import CandidatForm from "./CandidatForm";
import CandidatDetail, { CandidatDetailDTO } from "./CandidatDetailPage";

export default function CandidatEditPage() {
  const { id } = useParams();
  const candidatId = Number(id);
  const navigate = useNavigate();

  const { data: meta, loading: loadingMeta } = useCandidatMeta();
  const { options: formationOptions } = useFormationsOptions();
  const { user: me } = useMe();
  const { data, loading: loadingItem } = useCandidat(candidatId);
  const { update, loading: saving } = useUpdateCandidat(candidatId);

  const canEditFormation =
    !!me && ["admin", "superadmin", "staff"].includes(me.role);

  const handleSubmit = async (values: CandidatFormData) => {
    try {
      await update(values);
      toast.success("✅ Candidat mis à jour");
      navigate("/candidats");
    } catch (error) {
      const axiosErr = error as AxiosError<{
        message?: string;
        errors?: Record<string, string | string[]>;
      }>;
      const fromErrors = axiosErr.response?.data?.errors
        ? Object.values(axiosErr.response.data.errors).flat().join(" · ")
        : undefined;
      const msg =
        axiosErr.response?.data?.message ??
        fromErrors ??
        axiosErr.message ??
        "Erreur lors de la mise à jour";
      toast.error(msg);
      console.error("Update candidat failed:", error);
    }
  };

  // ── Loading / Erreurs ────────────────────────────────
  if (loadingMeta || loadingItem) {
    return (
      <PageTemplate title="Modifier le candidat" backButton onBack={() => navigate(-1)} centered>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>⏳ Chargement…</Typography>
      </PageTemplate>
    );
  }

  if (!data) {
    return (
      <PageTemplate title="Modifier le candidat" backButton onBack={() => navigate(-1)}>
        <Typography color="error">❌ Candidat introuvable.</Typography>
      </PageTemplate>
    );
  }

  // ── Page principale ────────────────────────────────
  return (
    <PageTemplate
      title={`👤 Candidat #${candidatId} — édition`}
      backButton
      onBack={() => navigate(-1)}
    >
      {/* Résumé en lecture seule */}
      <Box mb={3}>
        <CandidatDetail candidat={data as CandidatDetailDTO} />
      </Box>

      {/* Formulaire d’édition */}
      <CandidatForm
        initialValues={data as Candidat}
        meta={meta}
        formationOptions={formationOptions}
        currentUser={me}
        canEditFormation={canEditFormation}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/candidats")}
        submitting={saving}
      />
    </PageTemplate>
  );
}

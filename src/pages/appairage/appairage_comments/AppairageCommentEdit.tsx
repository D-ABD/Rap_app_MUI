// src/pages/appairages/appairage_comments/AppairageCommentEditPage.tsx
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Box, Button, CircularProgress, Typography } from "@mui/material";

import AppairageCommentForm from "./AppairageCommentForm";
import {
  useAppairageComment,
  useUpdateAppairageComment,
} from "../../../hooks/useAppairageComments";
import type {
  AppairageCommentDTO,
  AppairageCommentUpdateInput,
} from "../../../types/appairageComment";
import PageTemplate from "../../../components/PageTemplate";

export default function AppairageCommentEditPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();

  const { data: initial, loading, error } = useAppairageComment(id ?? null);
  const { update, error: updateError } = useUpdateAppairageComment(id ?? "");

  const numericId = id ? Number(id) : NaN;
  const hasValidId = !!id && Number.isFinite(numericId);

  const handleSubmit = async (data: AppairageCommentUpdateInput) => {
    try {
      await update(data);
      toast.success(`💬 Commentaire #${numericId} mis à jour`);
      navigate("/appairage-commentaires");
    } catch {
      toast.error("Erreur lors de la mise à jour du commentaire");
    }
  };

  // Cas ID invalide
  if (!hasValidId) {
    return (
      <PageTemplate title="Modifier commentaire d’appairage" backButton onBack={() => navigate(-1)}>
        <Typography color="error" sx={{ mb: 2 }}>
          ❌ Paramètre invalide.
        </Typography>
        <Button variant="outlined" onClick={() => navigate("/appairage-commentaires")}>
          ← Retour à la liste
        </Button>
      </PageTemplate>
    );
  }

  // Cas chargement
  if (loading) {
    return (
      <PageTemplate title={`Modifier commentaire #${numericId}`} centered>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>⏳ Chargement…</Typography>
      </PageTemplate>
    );
  }

  // Cas erreur
  if (error || !initial) {
    return (
      <PageTemplate title={`Modifier commentaire #${numericId}`} backButton onBack={() => navigate(-1)}>
        <Typography color="error" sx={{ mb: 2 }}>
          ❌ Erreur de chargement.
        </Typography>
        <Button variant="outlined" onClick={() => navigate("/appairage-commentaires")}>
          ← Retour à la liste
        </Button>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title={`Modifier commentaire #${numericId}`}
      backButton
      onBack={() => navigate(-1)}
      actions={
        <Button variant="outlined" onClick={() => navigate("/appairage-commentaires")}>
          Liste
        </Button>
      }
    >
      {updateError && (
        <Typography color="error" sx={{ mb: 2 }}>
          ❌ Impossible de mettre à jour le commentaire.
        </Typography>
      )}

      <Box mt={2}>
        <AppairageCommentForm
          initial={initial as AppairageCommentDTO}
          appairageId={initial.appairage}
          onSubmit={handleSubmit}
        />
      </Box>
    </PageTemplate>
  );
}

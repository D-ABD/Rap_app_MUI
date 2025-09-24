// src/pages/prospection/ProspectionComment/ProspectionCommentEdit.tsx
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";

import PageTemplate from "../../../components/PageTemplate";
import ProspectionCommentForm from "./ProspectionCommentForm";
import {
  useProspectionComment,
  useUpdateProspectionComment,
} from "../../../hooks/useProspectionComments";
import { useAuth } from "../../../hooks/useAuth";

export default function ProspectionCommentEditPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();

  const { data: initial, loading, error } = useProspectionComment(id ?? null);
  const { update, error: updateError } = useUpdateProspectionComment(id ?? "");

  const numericId = id ? Number(id) : NaN;
  const hasValidId = !!id && Number.isFinite(numericId);

  const { user } = useAuth();
  const canSetInternal = ["staff", "admin", "superadmin"].includes(
    user?.role ?? ""
  );

  const handleSubmit = async (data: { body: string; is_internal?: boolean }) => {
    try {
      await update({ body: data.body, is_internal: data.is_internal });
      toast.success(`💬 Commentaire #${numericId} mis à jour`);
      navigate("/prospection-commentaires");
    } catch {
      toast.error("Erreur lors de la mise à jour du commentaire");
    }
  };

  if (!hasValidId) {
    return (
      <PageTemplate
        title="Modifier commentaire"
        backButton
        onBack={() => navigate("/prospection-commentaires")}
        centered
      >
        <Typography color="error">❌ Paramètre invalide.</Typography>
      </PageTemplate>
    );
  }

  if (loading) {
    return (
      <PageTemplate
        title={`Modifier commentaire #${numericId}`}
        backButton
        onBack={() => navigate("/prospection-commentaires")}
        centered
      >
        <CircularProgress />
      </PageTemplate>
    );
  }

  if (error || !initial) {
    return (
      <PageTemplate
        title={`Modifier commentaire #${numericId}`}
        backButton
        onBack={() => navigate("/prospection-commentaires")}
        centered
      >
        <Typography color="error">❌ Erreur de chargement.</Typography>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title={`Modifier commentaire #${numericId}`}
      backButton
      onBack={() => navigate(-1)}
      actions={
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={() => navigate(-1)}>
            ← Retour
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate("/prospection-commentaires")}
          >
            Liste
          </Button>
        </Stack>
      }
    >
      {updateError && (
        <Box mb={2}>
          <Typography color="error">
            ❌ Impossible de mettre à jour le commentaire.
          </Typography>
        </Box>
      )}

      <ProspectionCommentForm
        initial={initial}
        prospectionId={initial.prospection}
        canSetInternal={canSetInternal}
        onSubmit={async (payload) => {
          await handleSubmit({
            body: payload.body,
            is_internal: payload.is_internal,
          });
        }}
      />
    </PageTemplate>
  );
}

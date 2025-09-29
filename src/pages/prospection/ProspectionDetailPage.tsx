// src/pages/prospection/ProspectionDetailPage.tsx
import { useParams, useNavigate } from "react-router-dom";
import { CircularProgress, Typography, Button, Stack } from "@mui/material";
import PageTemplate from "../../components/PageTemplate";
import { useProspection } from "../../hooks/useProspection";
import ProspectionDetail from "./ProspectionDetail";

export default function ProspectionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: prospection, loading, error } = useProspection(id ?? null);

  if (loading) {
    return (
      <PageTemplate
        title={`Prospection #${id}`}
        backButton
        onBack={() => navigate(-1)}
        centered
      >
        <CircularProgress />
      </PageTemplate>
    );
  }

  if (error || !prospection) {
    return (
      <PageTemplate
        title={`Prospection #${id}`}
        backButton
        onBack={() => navigate(-1)}
        centered
      >
        <Typography color="error">
          ❌ Impossible de charger la prospection.
        </Typography>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title={`Prospection #${id}`}
      backButton
      onBack={() => navigate("/prospection")}
      actions={
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            onClick={() => navigate(`/prospections/${id}/edit`)}
          >
            Modifier
          </Button>
        </Stack>
      }
    >
      <ProspectionDetail prospection={prospection} />
    </PageTemplate>
  );
}

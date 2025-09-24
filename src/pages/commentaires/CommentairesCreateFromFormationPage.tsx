// src/pages/commentaires/CommentairesCreateFromFormationPage.tsx
import { useParams } from "react-router-dom";
import { Typography } from "@mui/material";
import PageTemplate from "../../components/PageTemplate";
import CommentaireForm from "./CommentaireForm";

export default function CommentairesCreateFromFormationPage() {
  const { formationId } = useParams();

  if (!formationId) {
    return (
      <Typography color="error" sx={{ p: 2 }}>
        Formation non spécifiée.
      </Typography>
    );
  }

  return (
    <PageTemplate
      title="➕ Créer un commentaire"
      backButton
      onBack={() => window.history.back()}
    >
      <CommentaireForm formationId={formationId} readonlyFormation />
    </PageTemplate>
  );
}

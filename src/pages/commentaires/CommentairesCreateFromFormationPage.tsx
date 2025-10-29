// ======================================================
// src/pages/commentaires/CommentairesCreateFromFormationPage.tsx
// Création d’un commentaire depuis une formation avec aperçu du rendu
// ======================================================

import { useParams } from "react-router-dom";
import { Box, Paper, Typography, Divider } from "@mui/material";
import PageTemplate from "../../components/PageTemplate";
import CommentaireForm from "./CommentaireForm";
import { useState } from "react";

export default function CommentairesCreateFromFormationPage() {
  const { formationId } = useParams();
  const [previewHTML, setPreviewHTML] = useState<string>("");

  if (!formationId) {
    return (
      <Typography color="error" sx={{ p: 2 }}>
        Formation non spécifiée.
      </Typography>
    );
  }

  return (
    <PageTemplate title="➕ Créer un commentaire" backButton onBack={() => window.history.back()}>
      {/* 🧱 Mise en page deux colonnes (formulaire + aperçu) */}
      <Box display="flex" flexDirection={{ xs: "column", md: "row" }} gap={3}>
        {/* 📝 Formulaire */}
        <Box flex={1}>
          <CommentaireForm
            formationId={formationId}
            readonlyFormation
            onSubmit={(payload) => {
              // Met à jour l’aperçu à chaque soumission
              setPreviewHTML(payload.contenu);
            }}
          />
        </Box>

        {/* 👁️ Aperçu du rendu en temps réel */}
        <Paper
          variant="outlined"
          sx={{
            flex: 1,
            p: 2,
            maxHeight: "calc(100vh - 200px)",
            overflowY: "auto",
            bgcolor: "grey.50",
          }}
        >
          <Typography variant="subtitle1" gutterBottom>
            Aperçu du rendu :
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {previewHTML ? (
            <div
              dangerouslySetInnerHTML={{ __html: previewHTML }}
              style={{
                all: "revert", // ✅ neutralise les styles MUI
                fontSize: "0.95rem",
                lineHeight: 1.5,
                wordBreak: "break-word",
              }}
            />
          ) : (
            <Typography variant="body2" color="text.secondary">
              Aucun contenu pour le moment.
            </Typography>
          )}
        </Paper>
      </Box>
    </PageTemplate>
  );
}

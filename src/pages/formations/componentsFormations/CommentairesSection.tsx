// src/pages/formations/componentsFormations/CommentairesSection.tsx
import { Link, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import {
  Box,
  Stack,
  Typography,
  Button as MuiButton,
  Divider,
} from "@mui/material";
import FormationSection from "./FormationSection";
import type { Commentaire } from "../../../types/commentaire";
import CommentaireContent from "../../commentaires/CommentaireContent";

interface Props {
  commentaires: Commentaire[];
  formationId: number;
  limit?: number;
}

export default function CommentairesSection({
  commentaires,
  formationId,
  limit = 3,
}: Props) {
  const navigate = useNavigate();
  const [displayLimit, setDisplayLimit] = useState(limit);

  const commentairesAffiches = useMemo(
    () => commentaires.slice(0, displayLimit),
    [commentaires, displayLimit]
  );

  const handleAjouterCommentaire = () => {
    navigate(`/commentaires/create/${formationId}`);
  };

  const handleVoirPlus = () => setDisplayLimit((prev) => prev + limit);
  const handleVoirMoins = () => setDisplayLimit(limit);

  return (
    <FormationSection
      title={`📄 Commentaires (${commentaires.length})`}
      defaultExpanded
    >
      {commentaires.length === 0 && (
        <Typography color="text.secondary">
          ⚠️ Aucun commentaire pour cette formation.
        </Typography>
      )}

      {commentairesAffiches.map((commentaire, idx) => (
        <Box key={commentaire.id} sx={{ py: 2 }}>
          <CommentaireContent html={commentaire.contenu || "<em>—</em>"} />
          <Stack
            direction="row"
            justifyContent="space-between"
            flexWrap="wrap"
            alignItems="center"
            spacing={2}
            sx={{ mt: 1 }}
          >
            <Typography variant="body2" color="text.secondary">
              ✍ {commentaire.auteur} — 📅 {commentaire.date}
              {commentaire.heure && ` à ${commentaire.heure}`}
              {commentaire.saturation_formation !== undefined &&
                ` — 🌡️ ${commentaire.saturation_formation}%`}
              {commentaire.is_edited && " — ✏️ modifié"}
            </Typography>
            <Link to={`/commentaires/edit/${commentaire.id}`}>
              <MuiButton variant="outlined" size="small">
                🛠 Modifier
              </MuiButton>
            </Link>
          </Stack>
          {idx < commentairesAffiches.length - 1 && <Divider sx={{ mt: 2 }} />}
        </Box>
      ))}

      <Stack
        direction="row"
        justifyContent="center"
        spacing={2}
        sx={{ mt: 3, flexWrap: "wrap" }}
      >
        {displayLimit < commentaires.length ? (
          <MuiButton variant="outlined" onClick={handleVoirPlus}>
            🔽 Voir plus de commentaires
          </MuiButton>
        ) : (
          commentaires.length > limit && (
            <MuiButton variant="outlined" onClick={handleVoirMoins}>
              🔼 Voir moins de commentaires
            </MuiButton>
          )
        )}

        <Link to={`/formations/${formationId}/commentaires`}>
          <MuiButton variant="contained" color="primary">
            🔎 Tous les commentaires
          </MuiButton>
        </Link>

        <MuiButton
          variant="contained"
          color="success"
          onClick={handleAjouterCommentaire}
        >
          ➕ Ajouter un commentaire
        </MuiButton>
      </Stack>
    </FormationSection>
  );
}

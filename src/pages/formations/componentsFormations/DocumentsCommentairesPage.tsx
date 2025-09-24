// src/pages/formations/componentsFormations/FormationsCommentairesPage.tsx
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Stack,
  Typography,
  Button as MuiButton,
  Divider,
  CircularProgress,
  Alert,
} from "@mui/material";
import PageTemplate from "../../../components/PageTemplate";
import FormationSection from "./FormationSection";
import { useCommentaires } from "../../../hooks/useCommentaires";
import api from "../../../api/axios";
import type { Formation } from "../../../types/formation";
import CommentaireContent from "../../commentaires/CommentaireContent";

export default function FormationsCommentairesPage() {
  const { formationId } = useParams();
  const id = formationId ? parseInt(formationId, 10) : undefined;
  const navigate = useNavigate();

  const [displayLimit, setDisplayLimit] = useState(5);
  const [formation, setFormation] = useState<Formation | null>(null);
  const [loadingFormation, setLoadingFormation] = useState(true);
  const [errorFormation, setErrorFormation] = useState(false);

  const {
    commentaires,
    loading: loadingCommentaires,
    error: errorCommentaires,
  } = useCommentaires(id);

  useEffect(() => {
    if (!id) return;
    setLoadingFormation(true);
    setErrorFormation(false);

    api
      .get(`/formations/${id}/`)
      .then((res) => setFormation(res.data.data))
      .catch(() => {
        setFormation(null);
        setErrorFormation(true);
      })
      .finally(() => setLoadingFormation(false));
  }, [id]);

  const commentairesAffiches = useMemo(
    () => commentaires.slice(0, displayLimit),
    [commentaires, displayLimit]
  );

  const handleVoirPlus = () => setDisplayLimit((prev) => prev + 5);
  const handleVoirMoins = () => setDisplayLimit(5);
  const handleAjouterCommentaire = () => {
    if (id) navigate(`/commentaires/create/${id}`);
  };

  if (!id) {
    return <Alert severity="error">❌ Formation non spécifiée.</Alert>;
  }
  if (loadingFormation || loadingCommentaires) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (errorFormation || errorCommentaires || !formation) {
    return (
      <Alert severity="error">❌ Erreur lors du chargement des données.</Alert>
    );
  }

  const infos = `📝 ${formation.nom}
📄 ${formation.num_offre || "N° inconnu"}
🎯 ${formation.type_offre?.libelle || "Type inconnu"}
🏢 ${formation.centre?.nom || "Centre inconnu"}`;

  return (
    <PageTemplate
      title="Commentaires de la formation"
      backButton
      onBack={() => navigate(-1)}
    >
      <Typography sx={{ whiteSpace: "pre-line", mb: 4 }}>{infos}</Typography>

      <FormationSection
        title={`📄 Commentaires (${commentaires.length})`}
        defaultExpanded
      >
        {commentairesAffiches.length === 0 && (
          <Typography color="text.secondary">
            ⚠️ Aucun commentaire pour cette formation.
          </Typography>
        )}

        {commentairesAffiches.map((commentaire, idx) => (
          <Box key={commentaire.id} sx={{ py: 2 }}>
            <CommentaireContent
              html={commentaire.contenu || "<em>—</em>"}
            />
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
            commentaires.length > 5 && (
              <MuiButton variant="outlined" onClick={handleVoirMoins}>
                🔼 Voir moins de commentaires
              </MuiButton>
            )
          )}
          <MuiButton
            variant="contained"
            color="success"
            onClick={handleAjouterCommentaire}
          >
            ➕ Ajouter un commentaire
          </MuiButton>
        </Stack>
      </FormationSection>
    </PageTemplate>
  );
}

// src/pages/commentaires/CommentairesEditPage.tsx
import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
} from "@mui/material";

import api from "../../api/axios";
import useForm from "../../hooks/useForm";
import type { CommentaireFormData } from "../../types/commentaire";
import PageTemplate from "../../components/PageTemplate";
import CommentaireContent from "./CommentaireContent";

interface MetaData {
  centre_nom?: string;
  statut?: string;
  type_offre?: string;
  num_offre?: string;
  formation_nom?: string;
  formation_id?: number;
  saturation_formation?: number;
}

export default function CommentairesEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<MetaData>({});
  const [showNavigationModal, setShowNavigationModal] = useState(false);

  const { values, errors, setValues, setErrors } = useForm<{
    contenu: string;
    formation: number | null;
  }>({
    contenu: "",
    formation: null,
  });

  useEffect(() => {
    if (!id) {
      toast.error("ID du commentaire manquant");
      navigate("/commentaires");
      return;
    }
    api
      .get(`/commentaires/${id}/`)
      .then((res) => {
        const data = res.data?.data ?? res.data;
        setValues({
          contenu: data.contenu ?? "",
          formation: data.formation_id ?? null,
        });
        setMeta({
          centre_nom: data.centre_nom,
          statut: data.statut,
          type_offre: data.type_offre,
          num_offre: data.num_offre,
          formation_nom: data.formation_nom,
          formation_id: data.formation,
          saturation_formation: data.saturation_formation,
        });
      })
      .catch(() => {
        toast.error("Erreur lors du chargement du commentaire");
        navigate("/commentaires");
      })
      .finally(() => setLoading(false));
  }, [id, navigate, setValues]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const contenu = values.contenu.trim();
    if (!contenu) {
      setErrors({ contenu: "Le contenu ne peut pas être vide." });
      return;
    }
    if (values.formation == null) {
      toast.error("Formation manquante");
      return;
    }
    try {
      await api.put(`/commentaires/${id}/`, {
        contenu,
        formation: values.formation,
      });
      toast.success("✅ Commentaire mis à jour");
      setShowNavigationModal(true);
    } catch {
      toast.error("Erreur lors de la modification");
    }
  };

  return (
    <PageTemplate
      title="✏️ Modifier un commentaire"
      backButton
      onBack={() => navigate(-1)}
    >
      {loading ? (
        <CircularProgress />
      ) : (
        <Paper sx={{ p: 3 }}>
          <Stack spacing={2} component="form" onSubmit={handleSubmit}>
            {/* Infos meta */}
            <Box sx={{ bgcolor: "grey.100", p: 2, borderRadius: 1 }}>
              <Typography variant="body2">
                📚 Formation : <strong>{meta.formation_nom || "—"}</strong>
              </Typography>
              <Typography variant="body2">
                📍 Centre : <strong>{meta.centre_nom || "—"}</strong>
              </Typography>
              <Typography variant="body2">
                📌 Statut : <strong>{meta.statut || "—"}</strong>
              </Typography>
              <Typography variant="body2">
                🧩 Type d’offre : <strong>{meta.type_offre || "—"}</strong>
              </Typography>
              <Typography variant="body2">
                🔢 Numéro d’offre : <strong>{meta.num_offre || "—"}</strong>
              </Typography>
              <Typography variant="body2">
                🧪 Saturation : <strong>{meta.saturation_formation ?? "—"}%</strong>
              </Typography>
            </Box>

            {/* Contenu actuel */}
            <Typography variant="subtitle1">Contenu actuel</Typography>
            <CommentaireContent html={values.contenu || "<em>—</em>"} />

            {/* Éditeur simple MUI */}
            <TextField
              id="contenu"
              label="Modifier le contenu *"
              value={values.contenu}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, contenu: e.target.value }))
              }
              error={Boolean(errors.contenu)}
              helperText={errors.contenu}
              fullWidth
              multiline
              minRows={4}
            />

            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button type="submit" variant="contained">
                💾 Enregistrer
              </Button>
              <Button
                variant="outlined"
                onClick={() =>
                  values.formation
                    ? navigate(`/formations/${values.formation}`)
                    : navigate("/commentaires")
                }
              >
                Annuler
              </Button>
            </Stack>
          </Stack>
        </Paper>
      )}

      {/* Confirmation après sauvegarde */}
      <Dialog
        open={showNavigationModal}
        onClose={() => setShowNavigationModal(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>✅ Votre commentaire a bien été mis à jour</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Que souhaitez-vous faire ensuite ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => navigate(`/formations/${values.formation}`)}
            variant="outlined"
          >
            ← Retour à la formation
          </Button>
          <Button
            onClick={() =>
              navigate(`/formations/${values.formation}/commentaires`)
            }
            variant="contained"
          >
            💬 Voir commentaires
          </Button>
        </DialogActions>
      </Dialog>
    </PageTemplate>
  );
}

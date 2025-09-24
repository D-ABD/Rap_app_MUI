// src/components/ui/CommentaireForm.tsx
import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  Stack,
  TextField,
  Typography,
  Paper,
} from "@mui/material";

import FormationSelectModal from "../../components/modals/FormationSelectModal";
import useForm from "../../hooks/useForm";
import api from "../../api/axios";

type Props = {
  formationId?: string;
  readonlyFormation?: boolean;
};

interface CommentaireFormData {
  formation: string;
  contenu: string;
  [key: string]: unknown;  // ✅ permet à useForm de l'accepter
}


export default function CommentaireForm({
  formationId,
  readonlyFormation,
}: Props) {
  const navigate = useNavigate();

  const [formationNom, setFormationNom] = useState<string | null>(null);
  const [loading, setLoading] = useState(!!formationId);
  const [showModal, setShowModal] = useState(false);

  const { values, errors, setErrors, setValues } =
    useForm<CommentaireFormData>({
      formation: formationId || "",
      contenu: "",
    });

  useEffect(() => {
    if (formationId) {
      api
        .get(`/formations/${formationId}/`)
        .then((res) => setFormationNom(res.data.nom))
        .catch(() => toast.error("Formation introuvable"))
        .finally(() => setLoading(false));
    }
  }, [formationId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!values.formation || !values.contenu.trim()) {
      toast.error("Tous les champs sont requis.");
      return;
    }

    try {
      await api.post("/commentaires/", values);
      toast.success("✅ Commentaire créé");
      navigate(`/formations/${values.formation}`);
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: Record<string, string[]> };
      };
      if (axiosError.response?.data) {
        const formattedErrors: Partial<
          Record<keyof CommentaireFormData, string>
        > = {};
        for (const key in axiosError.response.data) {
          const val = axiosError.response.data[key];
          if (Array.isArray(val)) {
            formattedErrors[key as keyof CommentaireFormData] = val.join(" ");
          }
        }
        setErrors(formattedErrors);
        toast.error("Erreur lors de la création");
      }
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      {loading ? (
        <CircularProgress />
      ) : (
        <Box component="form" onSubmit={handleSubmit}>
          {formationNom && (
            <Box
              sx={{
                mb: 2,
                p: 2,
                bgcolor: "grey.100",
                borderRadius: 1,
              }}
            >
              <Typography variant="body2">
                📚 Formation sélectionnée : <strong>{formationNom}</strong>
              </Typography>
            </Box>
          )}

          {!readonlyFormation && (
            <>
              <Button
                variant="outlined"
                onClick={() => setShowModal(true)}
                sx={{ mb: 2 }}
              >
                🔍 {formationNom ? "Changer de formation" : "Rechercher une formation"}
              </Button>

              <FormationSelectModal
                show={showModal}
                onClose={() => setShowModal(false)}
                onSelect={(pick) => {
                  setValues((prev) => ({ ...prev, formation: String(pick.id) }));
                  setFormationNom(pick.nom ?? "");
                  setShowModal(false);
                }}
              />
            </>
          )}

          <TextField
            label="Contenu"
            value={values.contenu}
            onChange={(e) =>
              setValues((prev) => ({ ...prev, contenu: e.target.value }))
            }
            multiline
            rows={6}
            fullWidth
            error={!!errors.contenu}
            helperText={errors.contenu}
          />

          <Stack direction="row" spacing={2} justifyContent="flex-end" mt={2}>
            <Button type="submit" variant="contained" color="success">
              💾 Enregistrer
            </Button>
            <Button
              type="button"
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
        </Box>
      )}
    </Paper>
  );
}

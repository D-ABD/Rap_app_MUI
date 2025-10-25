// src/components/ui/CommentaireForm.tsx
import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Box, Button, CircularProgress, Stack, TextField, Typography, Paper } from "@mui/material";

import FormationSelectModal from "../../components/modals/FormationSelectModal";
import useForm from "../../hooks/useForm";
import api from "../../api/axios";

/* ---------- Props ---------- */
type Props = {
  formationId?: string;
  readonlyFormation?: boolean;
  /** 🔹 Si fourni, le parent gère la création du commentaire */
  onSubmit?: (payload: { contenu: string }) => Promise<void> | void;
};

interface CommentaireFormData {
  formation: string;
  contenu: string;
  [key: string]: unknown;
}

/* ---------- Composant ---------- */
export default function CommentaireForm({
  formationId,
  readonlyFormation = false,
  onSubmit,
}: Props) {
  const navigate = useNavigate();

  const [formationNom, setFormationNom] = useState<string | null>(null);
  const [loading, setLoading] = useState(!!formationId);
  const [showModal, setShowModal] = useState(false);

  const { values, errors, setErrors, setValues } = useForm<CommentaireFormData>({
    formation: formationId || "",
    contenu: "",
  });

  /* ---------- Chargement auto du nom formation ---------- */
  useEffect(() => {
    if (!formationId) return;
    api
      .get(`/formations/${formationId}/`)
      .then((res) => setFormationNom(res.data.nom))
      .catch(() => toast.error("Formation introuvable"))
      .finally(() => setLoading(false));
  }, [formationId]);

  /* ---------- Soumission ---------- */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!values.contenu.trim()) {
      toast.error("Le contenu du commentaire est requis.");
      return;
    }

    // ✅ Injection automatique du formation_id
    const payload = {
      contenu: values.contenu.trim(),
      formation: formationId ?? values.formation,
    };

    // ✅ Cas 1 : utilisé dans une modale → délégué au parent
    if (onSubmit) {
      await onSubmit({ contenu: payload.contenu });
      setValues((prev) => ({ ...prev, contenu: "" }));
      return;
    }

    // ✅ Cas 2 : utilisation autonome
    if (!payload.formation) {
      toast.error("Veuillez sélectionner une formation.");
      return;
    }

    try {
      await api.post("/commentaires/", payload);
      toast.success("✅ Commentaire créé avec succès");
      navigate(`/formations/${payload.formation}`);
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: Record<string, string[]> };
      };
      if (axiosError.response?.data) {
        const formattedErrors: Partial<Record<keyof CommentaireFormData, string>> = {};
        for (const key in axiosError.response.data) {
          const val = axiosError.response.data[key];
          if (Array.isArray(val)) {
            formattedErrors[key as keyof CommentaireFormData] = val.join(" ");
          }
        }
        setErrors(formattedErrors);
        toast.error("Erreur lors de la création du commentaire");
      }
    }
  };

  /* ---------- Rendu ---------- */
  return (
    <Paper sx={{ p: 3 }}>
      {loading ? (
        <CircularProgress />
      ) : (
        <Box component="form" onSubmit={handleSubmit}>
          {/* ✅ Affiche la formation si readonly */}
          {readonlyFormation && formationNom && (
            <Box
              sx={{
                mb: 2,
                p: 2,
                bgcolor: "grey.100",
                borderRadius: 1,
              }}
            >
              <Typography variant="body2">
                📚 Commentaire pour la formation : <strong>{formationNom}</strong>
              </Typography>
            </Box>
          )}

          {/* 🔍 Sélection manuelle uniquement si non readonly */}
          {!readonlyFormation && (
            <>
              <Button variant="outlined" onClick={() => setShowModal(true)} sx={{ mb: 2 }}>
                🔍 {formationNom ? "Changer de formation" : "Rechercher une formation"}
              </Button>

              <FormationSelectModal
                show={showModal}
                onClose={() => setShowModal(false)}
                onSelect={(pick) => {
                  setValues((prev) => ({
                    ...prev,
                    formation: String(pick.id),
                  }));
                  setFormationNom(pick.nom ?? "");
                  setShowModal(false);
                }}
              />
            </>
          )}

          {/* 📝 Contenu du commentaire */}
          <TextField
            label="Contenu"
            value={values.contenu}
            onChange={(e) => setValues((prev) => ({ ...prev, contenu: e.target.value }))}
            multiline
            rows={5}
            fullWidth
            error={!!errors.contenu}
            helperText={errors.contenu}
          />

          {/* 🔘 Boutons */}
          <Stack direction="row" spacing={2} justifyContent="flex-end" mt={2}>
            <Button type="submit" variant="contained" color="success">
              💾 Enregistrer
            </Button>
            {!onSubmit && (
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
            )}
          </Stack>
        </Box>
      )}
    </Paper>
  );
}

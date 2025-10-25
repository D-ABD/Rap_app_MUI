// src/components/ui/CommentaireForm.tsx
import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Box, Button, CircularProgress, Stack, Typography, Paper } from "@mui/material";
import { useQuill } from "react-quilljs";
import "quill/dist/quill.snow.css";

import FormationSelectModal from "../../components/modals/FormationSelectModal";
import useForm from "../../hooks/useForm";
import api from "../../api/axios";

/* ---------- Props ---------- */
type Props = {
  formationId?: string;
  readonlyFormation?: boolean;
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

  // ✅ Initialise Quill (react-quilljs)
  const { quill, quillRef } = useQuill({
    theme: "snow",
    modules: {
      toolbar: [
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ color: [] }, { background: [] }],
        ["clean"],
      ],
    },
  });

  /* ---------- Gestion du contenu ---------- */
  useEffect(() => {
    if (quill) {
      quill.on("text-change", () => {
        setValues((prev) => ({
          ...prev,
          contenu: quill.root.innerHTML,
        }));
      });
    }
  }, [quill, setValues]); // ✅ ajouté setValues ici

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

    const contenuTexte = quill?.root.innerHTML.trim() || values.contenu.trim();
    if (!contenuTexte || contenuTexte === "<p><br></p>") {
      toast.error("Le contenu du commentaire est requis.");
      return;
    }

    const payload = {
      contenu: contenuTexte,
      formation: formationId ?? values.formation,
    };

    if (onSubmit) {
      await onSubmit({ contenu: payload.contenu });
      setValues((prev) => ({ ...prev, contenu: "" }));
      if (quill) quill.setText("");
      return;
    }

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

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Contenu
            </Typography>
            <div ref={quillRef} style={{ height: 200, marginBottom: "1rem" }} />
            {errors.contenu && (
              <Typography variant="caption" color="error">
                {errors.contenu}
              </Typography>
            )}
          </Box>

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

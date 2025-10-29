// ======================================================
// src/components/ui/CommentaireForm.tsx
// Formulaire de création / lecture de commentaire
// (corrigé : conserve les couleurs et surlignages Quill)
// ======================================================

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
  Paper,
} from "@mui/material";
import { useQuill } from "react-quilljs";
import Quill from "quill"; // ✅ nécessaire pour le patch
import "quill/dist/quill.snow.css";

import FormationSelectModal from "../../components/modals/FormationSelectModal";
import useForm from "../../hooks/useForm";
import api from "../../api/axios";

/* ---------- Types ---------- */
type Props = {
  formationId?: string;
  readonlyFormation?: boolean;
  contenuInitial?: string;
  onSubmit?: (payload: { contenu: string }) => Promise<void> | void;
};

interface CommentaireFormData {
  formation: string;
  contenu: string;
  [key: string]: unknown;
}

/* ---------- 🩹 Patch Quill : autorise color et background inline ---------- */
const Inline = (Quill as any).import("blots/inline");

class SpanStyle extends Inline {
  static create(value: any) {
    const node = super.create() as HTMLElement;
    if (value) node.setAttribute("style", value);
    return node;
  }

  static formats(node: HTMLElement) {
    return node.getAttribute("style");
  }
}

(SpanStyle as any).blotName = "span";
(SpanStyle as any).tagName = "span";
(Quill as any).register(SpanStyle, true);

/* ---------- Config Quill ---------- */
const modules = {
  toolbar: [
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ color: [] }, { background: [] }],
    ["clean"],
  ],
};

const formats = [
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "bullet",
  "color",
  "background",
];

/* ---------- Composant ---------- */
export default function CommentaireForm({
  formationId,
  readonlyFormation = false,
  contenuInitial = "",
  onSubmit,
}: Props) {
  const navigate = useNavigate();

  const [formationNom, setFormationNom] = useState<string | null>(null);
  const [loading, setLoading] = useState(!!formationId);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { values, errors, setErrors, setValues } = useForm<CommentaireFormData>({
    formation: formationId || "",
    contenu: contenuInitial || "",
  });

  const { quill, quillRef } = useQuill({
    theme: "snow",
    modules,
    formats,
  });

  /* ---------- Synchronisation contenu ---------- */
  useEffect(() => {
    if (!quill || readonlyFormation) return;

    const handler = () => {
      setValues((prev) => ({
        ...prev,
        contenu: quill.root.innerHTML,
      }));
    };
    quill.on("text-change", handler);
    return () => {
      quill.off("text-change", handler);
    };
  }, [quill, setValues, readonlyFormation]);

  /* ---------- Lecture seule ---------- */
  useEffect(() => {
    if (quill && readonlyFormation) {
      quill.disable();
      if (contenuInitial) {
        quill.root.innerHTML = contenuInitial;
      }
    }
  }, [readonlyFormation, quill, contenuInitial]);

  /* ---------- Chargement nom formation ---------- */
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
    if (submitting) return;

    const contenuTexte = quill?.root.innerHTML.trim() || values.contenu.trim();
    if (!contenuTexte || contenuTexte === "<p><br></p>") {
      toast.error("Le contenu du commentaire est requis.");
      return;
    }

    const payload = {
      contenu: contenuTexte,
      formation: formationId ?? values.formation,
    };

    setSubmitting(true);

    try {
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

      await api.post("/commentaires/", payload);
      toast.success("✅ Commentaire créé avec succès");
      navigate(`/formations/${payload.formation}`);
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

        const firstError = Object.values(axiosError.response.data)[0];
        if (Array.isArray(firstError)) toast.error(firstError[0]);
        else toast.error("Erreur lors de la création du commentaire");
      }
    } finally {
      setSubmitting(false);
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
                📚 Commentaire pour la formation :{" "}
                <strong>{formationNom}</strong>
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
                🔍{" "}
                {formationNom
                  ? "Changer de formation"
                  : "Rechercher une formation"}
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

          {/* --- Zone contenu --- */}
          <Box sx={{ mb: 2 }}>
            <Typography id="commentaire-label" variant="subtitle2" gutterBottom>
              Contenu
            </Typography>

            {readonlyFormation ? (
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  minHeight: 150,
                  bgcolor: "grey.50",
                  overflowX: "auto",
                }}
              >
                {values.contenu ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: values.contenu }}
                    style={{
                      all: "revert",
                      fontSize: "0.95rem",
                      lineHeight: 1.5,
                      wordBreak: "break-word",
                    }}
                  />
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Aucun contenu disponible.
                  </Typography>
                )}
              </Paper>
            ) : (
              <>
                <div
                  ref={quillRef}
                  aria-labelledby="commentaire-label"
                  style={{
                    height: 200,
                    marginBottom: "1rem",
                    backgroundColor: "#fff",
                    borderRadius: 8,
                  }}
                />
                {errors.contenu && (
                  <Typography variant="caption" color="error">
                    {errors.contenu}
                  </Typography>
                )}
              </>
            )}
          </Box>

          {/* --- Actions --- */}
          {!readonlyFormation && (
            <Stack direction="row" spacing={2} justifyContent="flex-end" mt={2}>
              <Button
                type="submit"
                variant="contained"
                color="success"
                disabled={submitting}
              >
                {submitting ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  "💾 Enregistrer"
                )}
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
          )}
        </Box>
      )}
    </Paper>
  );
}

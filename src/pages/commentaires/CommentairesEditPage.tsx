// ======================================================
// src/pages/commentaires/CommentairesEditPage.tsx
// Édition d’un commentaire avec archivage/désarchivage
// (corrigé : couleurs Quill préservées dans l’aperçu)
// ======================================================

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
} from "@mui/material";
import { useQuill } from "react-quilljs";
import "quill/dist/quill.snow.css";

import api from "../../api/axios";
import useForm from "../../hooks/useForm";
import PageTemplate from "../../components/PageTemplate";
import type { Commentaire } from "../../types/commentaire";

export default function CommentairesEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<Commentaire | null>(null);
  const [showNavigationModal, setShowNavigationModal] = useState(false);
  const [isArchived, setIsArchived] = useState(false);
  const [busyArchive, setBusyArchive] = useState(false);

  const { values, errors, setValues, setErrors } = useForm<{
    contenu: string;
    formation: number | null;
  }>({
    contenu: "",
    formation: null,
  });

  // ✅ Initialise l’éditeur Quill
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

  // ────────────────────────────── Synchronisation Quill → state ──────────────────────────────
  useEffect(() => {
    if (!quill) return;

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
  }, [quill, setValues]);

  // ────────────────────────────── Chargement du commentaire ──────────────────────────────
  useEffect(() => {
    if (!id) {
      toast.error("ID du commentaire manquant");
      navigate("/commentaires");
      return;
    }

    const fetchData = async () => {
      try {
        const res = await api.get(`/commentaires/${id}/`);
        const data = res.data?.data && typeof res.data.data === "object" ? res.data.data : res.data;

        if (!data || typeof data !== "object" || !data.id)
          throw new Error("Réponse invalide du serveur");

        setValues({
          contenu: data.contenu ?? "",
          formation: data.formation_id ?? data.formation ?? null,
        });
        setMeta(data);
        setIsArchived(data.statut_commentaire === "archive");

        // 🪄 Pré-remplir Quill avec le HTML enrichi
        if (quill) {
          quill.clipboard.dangerouslyPasteHTML(data.contenu || "");
        }
      } catch (_err) {
        toast.error("Erreur lors du chargement du commentaire");
        navigate("/commentaires");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate, setValues, quill]);

  // ────────────────────────────── Soumission du formulaire ──────────────────────────────
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const contenuHtml = quill?.root.innerHTML?.trim() || "";
    const cleanHtml = contenuHtml.replace(/\s+/g, " ").trim();

    if (!cleanHtml || cleanHtml === "<p><br></p>") {
      setErrors({ contenu: "Le contenu ne peut pas être vide." });
      return;
    }

    if (values.formation == null) {
      toast.error("Formation manquante");
      return;
    }

    try {
      await api.put(`/commentaires/${id}/`, {
        contenu: cleanHtml,
        formation: values.formation,
      });

      toast.success("✅ Commentaire mis à jour avec succès");
      setShowNavigationModal(true);
    } catch (_err) {
      toast.error("Erreur lors de la modification");
    }
  };

  // ────────────────────────────── Archivage / Désarchivage ──────────────────────────────
  const handleArchiveToggle = async () => {
    if (!id) return;
    setBusyArchive(true);

    try {
      const endpoint = isArchived
        ? `/commentaires/${id}/desarchiver/`
        : `/commentaires/${id}/archiver/`;

      const res = await api.post(endpoint);
      const updated = res.data?.data ?? res.data;
      setMeta(updated);
      setIsArchived(updated?.statut_commentaire === "archive");

      toast.success(
        isArchived ? "💬 Commentaire désarchivé avec succès" : "📦 Commentaire archivé avec succès"
      );
    } catch (_err) {
      toast.error("Erreur lors du changement de statut");
    } finally {
      setBusyArchive(false);
    }
  };

  // ────────────────────────────── Rendu ──────────────────────────────
  return (
    <PageTemplate
      title="✏️ Modifier un commentaire"
      backButton
      onBack={() => navigate("/commentaires")}
      actionsRight={
        !loading && (
          <Button
            variant="contained"
            color="warning"
            disabled={busyArchive}
            onClick={handleArchiveToggle}
          >
            {busyArchive ? "⏳" : isArchived ? "♻️ Désarchiver" : "📦 Archiver"}
          </Button>
        )
      }
    >
      {loading ? (
        <CircularProgress />
      ) : (
        <Paper sx={{ p: 3 }}>
          <Stack spacing={2} component="form" onSubmit={handleSubmit}>
            {/* ───────────── Infos meta ───────────── */}
            <Box sx={{ bgcolor: "grey.100", p: 2, borderRadius: 1 }}>
              <Typography variant="body2">
                📚 Formation : <strong>{meta?.formation_nom || "—"}</strong>
              </Typography>
              <Typography variant="body2">
                📍 Centre : <strong>{meta?.centre_nom || "—"}</strong>
              </Typography>
              <Typography variant="body2">
                📌 Statut : <strong>{isArchived ? "Archivé" : meta?.statut_nom || "—"}</strong>
              </Typography>
              <Typography variant="body2">
                🧩 Type d’offre : <strong>{meta?.type_offre_nom || "—"}</strong>
              </Typography>
              <Typography variant="body2">
                🔢 Numéro d’offre : <strong>{meta?.num_offre || "—"}</strong>
              </Typography>
              <Typography variant="body2" mt={1}>
                🧪 Saturation au moment du commentaire :{" "}
                <strong>{meta?.saturation_formation ?? "—"}%</strong>
              </Typography>
              <Typography variant="body2">
                📈 Saturation actuelle : <strong>{meta?.taux_saturation ?? "—"}%</strong>
              </Typography>
            </Box>

            {/* 🧮 Éditeur HTML Quill */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Modifier le contenu *
              </Typography>
              <div
                ref={quillRef}
                style={{
                  height: 220,
                  backgroundColor: "white",
                  marginBottom: "1rem",
                  borderRadius: 2,
                  border: "1px solid #ddd",
                }}
              />
              {errors.contenu && (
                <Typography variant="caption" color="error">
                  {errors.contenu}
                </Typography>
              )}
            </Box>

            {/* 📝 Aperçu rendu (corrigé : respecte les styles Quill) */}
            <Typography variant="subtitle1" gutterBottom>
              Aperçu du rendu :
            </Typography>
            <Box
              sx={{
                border: "1px solid #e0e0e0",
                borderRadius: 1,
                p: 2,
                bgcolor: "grey.50",
                maxHeight: 300,
                overflowY: "auto",
              }}
            >
              <div
                dangerouslySetInnerHTML={{
                  __html: values.contenu || "<em>—</em>",
                }}
                style={{
                  all: "revert", // ✅ neutralise les styles MUI
                  fontSize: "0.95rem",
                  lineHeight: 1.5,
                  wordBreak: "break-word",
                }}
              />
            </Box>

            {/* 🧭 Actions */}
            <Stack direction="row" spacing={2} justifyContent="flex-end" mt={2}>
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

      {/* ───────────── Confirmation après sauvegarde ───────────── */}
      <Dialog
        open={showNavigationModal}
        onClose={() => setShowNavigationModal(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>✅ Votre commentaire a bien été mis à jour</DialogTitle>
        <DialogContent>
          <DialogContentText>Que souhaitez-vous faire ensuite ?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => navigate(`/formations/${values.formation}`)} variant="outlined">
            ← Retour à la formation
          </Button>
          <Button onClick={() => navigate("/commentaires")} variant="contained">
            💬 Voir commentaires
          </Button>
        </DialogActions>
      </Dialog>
    </PageTemplate>
  );
}

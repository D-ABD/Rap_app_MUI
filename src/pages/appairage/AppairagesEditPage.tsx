// src/pages/appairages/AppairagesEditPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Box, Button, CircularProgress, Typography } from "@mui/material";

import {
  useAppairage,
  useUpdateAppairage,
  useDeleteAppairage,
  useAppairageMeta,
} from "../../hooks/useAppairage";

import type {
  Appairage,
  AppairageFormData,
  AppairageUpdatePayload,
} from "../../types/appairage";
import type { AppairageCommentDTO } from "../../types/appairageComment";
import AppairageForm from "./AppairageForm";
import AppairageDetails from "./AppairageDetails";
import AppairageLastCommentRow from "./appairage_comments/AppairageLastCommentRow";
import AppairageCommentsModal from "../../components/modals/AppairageCommentsModal";
import PageTemplate from "../../components/PageTemplate";

export default function AppairagesEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [openComments, setOpenComments] = useState(false);
  const [localLastComment, setLocalLastComment] = useState<AppairageCommentDTO | null>(null);
  const [localCount, setLocalCount] = useState<number>(0);

  const appairageId = useMemo(() => {
    const n = Number(id);
    return Number.isFinite(n) ? n : null;
  }, [id]);

  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    if (sp.get("openComments") === "1") setOpenComments(true);
  }, [location.search]);

  const { data: detail, loading, error } = useAppairage(appairageId ?? 0);
  const { update, loading: saving } = useUpdateAppairage(appairageId ?? 0);
  const { remove, loading: removing } = useDeleteAppairage(appairageId ?? 0);
  const { data: meta, loading: metaLoading, error: metaError } = useAppairageMeta();

  const handleUpdate = async (data: AppairageUpdatePayload) => {
    if (!appairageId) return;
    try {
      await update(data);
      toast.success("✅ Appairage mis à jour");
      navigate("/appairages");
    } catch {
      toast.error("❌ Échec de la mise à jour");
    }
  };

  const handleDelete = async () => {
    if (!appairageId) return;
    if (!window.confirm(`Supprimer définitivement l’appairage #${appairageId} ?`)) return;
    try {
      await remove();
      toast.success("🗑️ Appairage supprimé");
      navigate("/appairages");
    } catch {
      toast.error("❌ Échec de la suppression");
    }
  };

  // cas id invalide
  if (!appairageId) {
    return (
      <PageTemplate title="Appairage — détail">
        <Typography color="error">❌ Identifiant invalide.</Typography>
      </PageTemplate>
    );
  }

  // cas chargement
  if (loading || metaLoading) {
    return (
      <PageTemplate title={`Appairage #${appairageId}`}>
        <CircularProgress />
      </PageTemplate>
    );
  }

  // cas erreur
  if (error || metaError || !detail || !meta) {
    return (
      <PageTemplate title={`Appairage #${appairageId}`}>
        <Typography color="error">❌ Impossible de charger l’appairage.</Typography>
      </PageTemplate>
    );
  }

  const appairageDetail = detail as Appairage;

  const formInitialValues: Partial<AppairageFormData> = {
    partenaire: appairageDetail.partenaire,
    partenaire_nom: appairageDetail.partenaire_nom ?? null,
    formation: appairageDetail.formation,
    formation_nom: appairageDetail.formation_nom ?? null,
    candidat: appairageDetail.candidat,
    candidat_nom: appairageDetail.candidat_nom ?? null,
    candidat_prenom: null,
    statut: appairageDetail.statut,
    commentaire: appairageDetail.commentaire ?? "",
    last_commentaire: null,
    commentaires:
      appairageDetail.commentaires?.map((c) => ({
        id: c.id,
        body: c.body,
        created_at: c.created_at ?? "",
        auteur_nom: c.auteur_nom ?? null,
      })) ?? [],
  };

  const handleCommentAdded = (c: AppairageCommentDTO) => {
    setLocalLastComment(c);
    setLocalCount((prev) => prev + 1);
  };

  const comments = appairageDetail.commentaires ?? [];
  const lastRealComment: AppairageCommentDTO | null =
    comments.length > 0 ? (comments[comments.length - 1] as AppairageCommentDTO) : null;

  const effectiveLastComment: AppairageCommentDTO | null =
    localLastComment ?? lastRealComment;

  const effectiveCount = localCount || comments.length;

  return (
    <PageTemplate
      title={`Appairage #${appairageId} — détail`}
      backButton
      onBack={() => navigate(-1)}
      actions={
        <Button
          variant="outlined"
          color="error"
          onClick={handleDelete}
          disabled={removing}
        >
          {removing ? "Suppression…" : "Supprimer"}
        </Button>
      }
    >
      {/* Détails */}
      <AppairageDetails appairage={appairageDetail} />

      {/* Commentaires */}
      <AppairageLastCommentRow
        appairageId={appairageId}
        lastComment={effectiveLastComment}
        commentsCount={effectiveCount}
        onOpenModal={() => setOpenComments(true)}
      />
      <AppairageCommentsModal
        show={openComments}
        onClose={() => setOpenComments(false)}
        appairageId={appairageId}
        onCommentAdded={handleCommentAdded}
      />

      {/* Formulaire */}
      <Box mt={3}>
        <AppairageForm
          mode="edit"
          initialValues={formInitialValues}
          onSubmit={handleUpdate}
          loading={saving}
          meta={meta}
        />
      </Box>
    </PageTemplate>
  );
}

// src/pages/prospections/ProspectionEditPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

import PageTemplate from "../../components/PageTemplate";
import ProspectionForm from "./ProspectionForm";
import type { ProspectionFormData } from "../../types/prospection";

import api from "../../api/axios";
import {
  useProspection,
  useUpdateProspection,
  useDeleteProspection,
} from "../../hooks/useProspection";

import ProspectionLastCommentRow from "./prospectioncomments/ProspectionLastCommentRow";
import ProspectionCommentsModal from "../../components/modals/ProspectionCommentsModal";
import ProspectionDetail from "./ProspectionDetail";
import CreatePartenaireButton from "./CreatePartenaireButton";

type ProspectionDetailDTO = ProspectionFormData & {
  partenaire_nom?: string | null;
  formation_nom?: string | null;
  centre_nom?: string | null;
  num_offre?: string | null;
  moyen_contact?: string | null;
  created_by?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  user_role?: string | null;
  last_comment?: string | null;
  last_comment_at?: string | null;
  last_comment_id?: number | null;
  comments_count?: number | null;
};

type FormationLight = {
  id: number;
  nom: string;
  num_offre?: string | null;
};

export default function ProspectionEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [openComments, setOpenComments] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const prospectionId = useMemo(() => {
    const n = Number(id);
    return Number.isFinite(n) ? n : null;
  }, [id]);

  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    if (sp.get("openComments") === "1") setOpenComments(true);
  }, [location.search]);

  const { data: hookDetail, loading, error } = useProspection(prospectionId);
  const { update, loading: saving } = useUpdateProspection(prospectionId ?? 0);
  const { remove, loading: removing } = useDeleteProspection(prospectionId ?? 0);

  const [detail, setDetail] = useState<ProspectionDetailDTO | null>(null);
  const [formationFallback, setFormationFallback] = useState<FormationLight | null>(null);

  useEffect(() => {
    if (hookDetail) setDetail(hookDetail as ProspectionDetailDTO);
  }, [hookDetail]);

  // fallback formation si pas de nom
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!detail?.formation) return;
      if (detail.formation_nom && detail.formation_nom.trim() !== "") return;
      try {
        const res = await api.get(`/formations/${detail.formation}/`);
        const raw = res.data as any;
        const data = raw?.data ?? raw;
        if (data?.nom && alive) {
          setFormationFallback({
            id: data.id,
            nom: data.nom,
            num_offre: data.num_offre ?? null,
          });
        }
      } catch {
        /* silencieux */
      }
    })();
    return () => {
      alive = false;
    };
  }, [detail?.formation, detail?.formation_nom]);

  const handleUpdate = async (data: ProspectionFormData) => {
    if (!prospectionId) return;
    try {
      const updated = await update(data);
      setDetail(updated as ProspectionDetailDTO);
      toast.success("✅ Prospection mise à jour");
      navigate("/prospection");
    } catch {
      toast.error("❌ Échec de la mise à jour");
    }
  };

  const handleDelete = async () => {
    if (!prospectionId) return;
    try {
      await remove();
      toast.success("🗑️ Prospection supprimée");
      navigate("/prospection");
    } catch {
      toast.error("❌ Échec de la suppression");
    }
  };

  // --- états de rendu ---
  if (!prospectionId) {
    return (
      <PageTemplate title="Prospection — détail" backButton onBack={() => navigate(-1)} centered>
        <Box>❌ Identifiant invalide.</Box>
      </PageTemplate>
    );
  }

  if (loading || (!detail && !error)) {
    return (
      <PageTemplate title={`Prospection #${prospectionId}`} backButton onBack={() => navigate(-1)} centered>
        <CircularProgress />
      </PageTemplate>
    );
  }

  if (error) {
    return (
      <PageTemplate title={`Prospection #${prospectionId}`} backButton onBack={() => navigate(-1)} centered>
        <Box>❌ Impossible de charger la prospection.</Box>
      </PageTemplate>
    );
  }

  if (!detail) {
    return (
      <PageTemplate title={`Prospection #${prospectionId}`} backButton onBack={() => navigate(-1)} centered>
        <Box>❌ Données indisponibles.</Box>
      </PageTemplate>
    );
  }

  const initialValues: ProspectionFormData = {
    partenaire: detail.partenaire ?? null,
    partenaire_nom: detail.partenaire_nom ?? null,
    formation: detail.formation ?? null,
    date_prospection: detail.date_prospection,
    type_prospection: detail.type_prospection,
    motif: detail.motif,
    statut: detail.statut,
    objectif: detail.objectif,
    relance_prevue: detail.relance_prevue ?? null,
    owner: detail.owner ?? null,
    owner_username: detail.owner_username ?? null,
    formation_nom: detail.formation_nom ?? formationFallback?.nom ?? null,
    centre_nom: detail.centre_nom ?? null,
    num_offre: detail.num_offre ?? formationFallback?.num_offre ?? null,
    moyen_contact: detail.moyen_contact ?? null,
  };

  const isStaff = ["admin", "staff", "superuser"].includes(
    String(detail?.user_role ?? "").toLowerCase()
  );

  return (
    <PageTemplate
      title={`Prospection #${prospectionId} — détail (éditable)`}
      backButton
      onBack={() => navigate(-1)}
      actions={
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            onClick={() => navigate("/prospection")}
            disabled={saving || removing}
          >
            Retour à la liste
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => setOpenDeleteDialog(true)}
            disabled={removing}
          >
            {removing ? "Suppression…" : "Supprimer"}
          </Button>
        </Box>
      }
    >
      <CreatePartenaireButton />

      <ProspectionCommentsModal
        open={openComments}
        onClose={() => setOpenComments(false)}
        prospectionId={prospectionId}
        isStaff={isStaff}
      />

      <ProspectionDetail prospection={detail} formationFallback={formationFallback} />

      <Box my={2}>
        <ProspectionLastCommentRow
          prospectionId={prospectionId}
          onOpenModal={() => setOpenComments(true)}
        />
      </Box>

      <ProspectionForm
        mode="edit"
        initialValues={initialValues}
        onSubmit={handleUpdate}
        loading={saving}
      />

      {/* Dialog suppression */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">Supprimer la prospection</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Voulez-vous vraiment supprimer la prospection #{prospectionId} ? Cette action est
            irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Annuler</Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={removing}>
            {removing ? "Suppression…" : "Confirmer"}
          </Button>
        </DialogActions>
      </Dialog>
    </PageTemplate>
  );
}

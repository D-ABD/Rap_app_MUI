import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import api from "../../api/axios";

import {
  useFormation,
  useFormationChoices,
  useUpdateFormation,
  useDeleteFormation,
} from "../../hooks/useFormations";

import type { Formation, FormationFormData } from "../../types/formation";
import PageTemplate from "../../components/PageTemplate";
import FormationForm from "./FormationForm";
import AddDocumentButton from "./componentsFormations/AddDocumentButton";

export default function FormationsEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const formationId = useMemo(() => {
    const n = Number(id);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [id]);

  const { data: detail, loading, error } = useFormation(formationId ?? 0);
  const { updateFormation, loading: saving } = useUpdateFormation(formationId ?? 0);
  const { deleteFormation, loading: removing } = useDeleteFormation(formationId ?? 0);
  const {
    centres = [],
    statuts = [],
    typeOffres = [],
    loading: loadingChoices,
  } = useFormationChoices();

  const [localDetail, setLocalDetail] = useState<Formation | null>(null);

  // ------------------------------------------------------------------
  // 🔹 Archiver / Désarchiver
  // ------------------------------------------------------------------
  const handleArchiveToggle = async () => {
    if (!formationId || !detail) return;

    const formation = localDetail ?? detail;
    const isArchived = !!formation.est_archivee;

    try {
      if (isArchived) {
        await api.post(`/formations/${formationId}/desarchiver/`);
        toast.success("♻️ Formation désarchivée");
        setLocalDetail({
          ...formation,
          est_archivee: false,
          activite: "active",
        });
      } else {
        await api.post(`/formations/${formationId}/archiver/`);
        toast.info("📦 Formation archivée");
        setLocalDetail({
          ...formation,
          est_archivee: true,
          activite: "archivee",
        });
      }
    } catch {
      toast.error("❌ Échec de l’opération d’archivage");
    }
  };

  // ------------------------------------------------------------------
  // 🔹 Suppression
  // ------------------------------------------------------------------
  const handleDelete = async () => {
    if (!formationId) return;
    if (!window.confirm(`Supprimer définitivement la formation #${formationId} ?`)) return;

    try {
      await deleteFormation();
      toast.success("🗑️ Formation supprimée");
      navigate("/formations");
    } catch {
      toast.error("❌ Échec de la suppression");
    }
  };

  // ------------------------------------------------------------------
  // 🔹 Mise à jour du formulaire
  // ------------------------------------------------------------------
  const handleUpdate = async (values: FormationFormData) => {
    if (!formationId) return;
    try {
      const updated = await updateFormation(values);
      setLocalDetail(updated);
      toast.success("✅ Formation mise à jour");
    } catch {
      toast.error("❌ Échec de la mise à jour");
    }
  };

  // ------------------------------------------------------------------
  // 🔹 Rendu conditionnel
  // ------------------------------------------------------------------
  if (!formationId) {
    return (
      <PageTemplate title="Formation — détail">
        <Typography color="error">❌ Identifiant invalide.</Typography>
      </PageTemplate>
    );
  }

  if (loading || loadingChoices) {
    return (
      <PageTemplate title={`Formation #${formationId}`}>
        <CircularProgress />
      </PageTemplate>
    );
  }

  if (error || !detail) {
    return (
      <PageTemplate title={`Formation #${formationId}`}>
        <Typography color="error">❌ Impossible de charger la formation.</Typography>
      </PageTemplate>
    );
  }

  // ------------------------------------------------------------------
  // 🔹 Données prêtes
  // ------------------------------------------------------------------
  const formation = localDetail ?? detail;
  const archived = !!formation.est_archivee;

  const formInitialValues: FormationFormData = {
    nom: formation.nom,
    centre_id: formation.centre?.id ?? null,
    type_offre_id: formation.type_offre?.id ?? null,
    statut_id: formation.statut?.id ?? null,
    start_date: formation.start_date ?? "",
    end_date: formation.end_date ?? "",
    num_kairos: formation.num_kairos ?? "",
    num_offre: formation.num_offre ?? "",
    num_produit: formation.num_produit ?? "",
    prevus_crif: formation.prevus_crif ?? undefined,
    prevus_mp: formation.prevus_mp ?? undefined,
    inscrits_crif: formation.inscrits_crif ?? undefined,
    inscrits_mp: formation.inscrits_mp ?? undefined,
    intitule_diplome: formation.intitule_diplome ?? "",
    code_diplome: formation.code_diplome ?? "",
    code_rncp: formation.code_rncp ?? "",
    total_heures: formation.total_heures ?? undefined,
    heures_distanciel: formation.heures_distanciel ?? undefined,
    assistante: formation.assistante ?? "",
    cap: formation.cap ?? undefined,
    convocation_envoie: formation.convocation_envoie ?? false,
    entree_formation: formation.entree_formation ?? 0,
    nombre_candidats: formation.nombre_candidats ?? 0,
    nombre_entretiens: formation.nombre_entretiens ?? 0,
    nombre_evenements: formation.nombre_evenements ?? 0,
    dernier_commentaire: formation.dernier_commentaire ?? "",
  };

  // ------------------------------------------------------------------
  // 🔹 Rendu principal
  // ------------------------------------------------------------------
  return (
    <PageTemplate
      title={`Formation #${formationId} — ${archived ? "Archivée" : "Active"}`}
      backButton
      onBack={() => navigate(-1)}
      actions={
        <Box display="flex" gap={1}>
          <AddDocumentButton formationId={formationId ?? 0} />
          <Button
            variant="contained"
            color={archived ? "success" : "warning"}
            onClick={handleArchiveToggle}
            disabled={saving || removing}
          >
            {archived ? "♻️ Désarchiver" : "📦 Archiver"}
          </Button>

          <Button variant="outlined" color="error" onClick={handleDelete} disabled={removing}>
            {removing ? "Suppression…" : "Supprimer"}
          </Button>
        </Box>
      }
    >
      <Box
        sx={{
          backgroundColor: archived ? "rgba(245,245,245,0.9)" : "inherit",
          p: 2,
          borderRadius: 2,
        }}
      >
        {/* Formulaire */}
        <FormationForm
          initialValues={formInitialValues}
          centres={centres}
          statuts={statuts}
          typeOffres={typeOffres}
          loading={saving}
          loadingChoices={loadingChoices}
          onSubmit={handleUpdate}
          onCancel={() => navigate("/formations")}
          submitLabel="💾 Mettre à jour"
        />

        {/* Footer : dates */}
        <Box
          mt={4}
          sx={{
            color: "text.secondary",
            fontSize: "0.85rem",
            lineHeight: 1.6,
          }}
        >
          <div>
            <strong>📌 Créée le :</strong>{" "}
            {formation.created_at
              ? new Date(formation.created_at).toLocaleDateString("fr-FR", {
                  weekday: "long",
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "—"}
          </div>
          {formation.updated_at && (
            <div>
              <strong>✏️ Dernière mise à jour :</strong>{" "}
              {new Date(formation.updated_at).toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          )}
        </Box>
      </Box>
    </PageTemplate>
  );
}

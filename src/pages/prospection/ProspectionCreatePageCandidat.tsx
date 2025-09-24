// src/pages/prospections/ProspectionCreatePageCandidat.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Typography } from "@mui/material";

import PageTemplate from "../../components/PageTemplate";
import ProspectionFormCandidat from "./ProspectionFormCandidat";

import api from "../../api/axios";
import { useCreateProspection } from "../../hooks/useProspection";
import { usePartenaire } from "../../hooks/usePartenaires";

import type {
  ProspectionFormData,
  ProspectionMotif,
  ProspectionObjectif,
  ProspectionStatut,
  ProspectionTypeProspection,
} from "../../types/prospection";

function toNum(v: string | null): number | null {
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}
function extractCreatedId(x: unknown): number | null {
  if (!isRecord(x)) return null;
  if (typeof x.id === "number") return x.id;
  const data = x.data;
  if (isRecord(data) && typeof data.id === "number") return data.id;
  return null;
}

export default function ProspectionCreatePageCandidat() {
  const navigate = useNavigate();
  const { create, loading: creating, error: createError } = useCreateProspection();

  const [searchParams] = useSearchParams();
  const presetPartenaire = useMemo(
    () => toNum(searchParams.get("partenaire")),
    [searchParams]
  );
  const presetFormation = useMemo(
    () => toNum(searchParams.get("formation")),
    [searchParams]
  );

  // 🔎 nom du partenaire si ?partenaire=.. présent
  const { data: partenaireData } = usePartenaire(presetPartenaire ?? undefined);
  const partenaireNom = partenaireData?.nom ?? null;

  // 🔎 nom (léger) de la formation si ?formation=.. présent
  const [formationNom, setFormationNom] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!presetFormation) {
        setFormationNom(null);
        return;
      }
      try {
        const res = await api.get<unknown>(`/formations/${presetFormation}/`);
        const raw = res.data as unknown;
        const node = isRecord(raw) && isRecord(raw.data) ? raw.data : raw;
        const nom = isRecord(node) && typeof node.nom === "string" ? node.nom : null;
        if (!cancelled) setFormationNom(nom);
      } catch {
        if (!cancelled) setFormationNom(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [presetFormation]);

  // ✅ valeurs par défaut (côté candidat, owner forcé à null)
  const initialValues: ProspectionFormData = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const defaultStatut: ProspectionStatut = "a_faire";
    const defaultType: ProspectionTypeProspection = "premier_contact";
    const defaultMotif: ProspectionMotif = "autre";
    const defaultObjectif: ProspectionObjectif = "prise_contact";

    return {
      partenaire: presetPartenaire ?? null,
      partenaire_nom: partenaireNom,

      formation: presetFormation ?? null,
      date_prospection: today,
      type_prospection: defaultType,
      motif: defaultMotif,
      statut: defaultStatut,
      objectif: defaultObjectif,
      commentaire: "",
      relance_prevue: null,

      owner: null,
      owner_username: null,

      formation_nom: formationNom,
      centre_nom: null,
      num_offre: null,

      partenaire_ville: null,
      partenaire_tel: null,
      partenaire_email: null,

      formation_date_debut: null,
      formation_date_fin: null,
      type_offre_display: null,
      formation_statut_display: null,
      places_disponibles: null,

      moyen_contact: null,

      last_comment: null,
      last_comment_at: null,
      last_comment_id: null,
      comments_count: undefined,
    };
  }, [presetPartenaire, partenaireNom, presetFormation, formationNom]);

  const handleSubmit = async (formData: ProspectionFormData) => {
    try {
      const payload: ProspectionFormData = { ...formData, owner: null };
      const created = await create(payload);
      toast.success("✅ Prospection créée avec succès");

      const wantsComment = window.confirm(
        "Souhaitez-vous ajouter un commentaire maintenant ?"
      );
      const createdId = extractCreatedId(created);

      if (wantsComment && createdId) {
        navigate(`/prospection-commentaires/create/${createdId}`);
      } else {
        navigate("/prospection");
      }
    } catch {
      toast.error("❌ Erreur lors de la création");
    }
  };

  return (
    <PageTemplate title="➕ Nouvelle prospection" backButton onBack={() => navigate(-1)}>
      {createError ? (
        <Typography color="error">
          ❌ Impossible d’initialiser le formulaire.
        </Typography>
      ) : (
        <ProspectionFormCandidat
          key={`create-cand-${presetPartenaire ?? "none"}-${partenaireNom ?? ""}-${presetFormation ?? "none"}-${formationNom ?? ""}`}
          mode="create"
          initialValues={initialValues}
          onSubmit={handleSubmit}
          loading={creating}
          fixedFormationId={presetFormation ?? undefined}
        />
      )}
    </PageTemplate>
  );
}

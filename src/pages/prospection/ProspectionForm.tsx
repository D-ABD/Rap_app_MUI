import { useEffect, useMemo, useState, useCallback, FormEvent } from "react";
import { toast } from "react-toastify";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";

import api from "../../api/axios";
import { useProspectionChoices } from "../../hooks/useProspection";
import type {
  ProspectionFormData,
  ProspectionMoyenContact,
  ProspectionMotif,
  ProspectionObjectif,
  ProspectionStatut,
  ProspectionTypeProspection,
} from "../../types/prospection";

import FormationSelectModal from "../../components/modals/FormationSelectModal";
import CandidatsSelectModal, {
  type CandidatPick,
} from "../../components/modals/CandidatsSelectModal";
import type { Partenaire } from "../../types/partenaire";
import PartenaireSelectModal from "../../components/modals/PartenairesSelectModal";

// ───────── constantes ─────────
const TERMINAUX: ProspectionStatut[] = ["acceptee", "refusee", "annulee"];

// ───────── types ─────────
type Mode = "create" | "edit";

interface Props {
  mode?: Mode;
  initialValues: ProspectionFormData | null;
  onSubmit: (data: ProspectionFormData) => Promise<void>;
  loading: boolean;
  fixedFormationId?: number;
}

/** Brouillon strict pour construire le payload */
type ProspectionFormDraft = {
  partenaire: number | null;
  formation?: number | null;
  date_prospection: string;
  type_prospection: ProspectionTypeProspection;
  motif: ProspectionMotif;
  statut: ProspectionStatut;
  objectif: ProspectionObjectif;
  moyen_contact?: ProspectionMoyenContact | null;
  relance_prevue?: string | null;
  owner: number | null;
  owner_username?: string | null;
  partenaire_nom?: string | null;
  formation_nom?: string | null;
  centre_nom?: string | null;
  num_offre?: string | null;
};

// ───────── helpers ─────────
function extractOwnerUserId(candidate: CandidatPick): number | null {
  if (typeof candidate.compte_utilisateur_id === "number")
    return candidate.compte_utilisateur_id;
  const cu = candidate.compte_utilisateur;
  return cu && typeof cu.id === "number" ? cu.id : null;
}

function extractCandidateDisplayName(candidate: CandidatPick): string {
  return (
    candidate.nom_complet ||
    `${candidate.prenom ?? ""} ${candidate.nom ?? ""}`.trim() ||
    `Candidat #${candidate.id}`
  );
}

export default function ProspectionForm({
  mode = "create",
  initialValues,
  onSubmit,
  loading,
  fixedFormationId,
}: Props) {
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [form, setForm] = useState<ProspectionFormDraft>({
    partenaire: initialValues?.partenaire ?? null,
    formation: fixedFormationId ?? initialValues?.formation ?? undefined,
    date_prospection: initialValues?.date_prospection
      ? initialValues.date_prospection.slice(0, 10)
      : todayStr,
    type_prospection: initialValues?.type_prospection ?? "nouveau_prospect",
    motif: initialValues?.motif ?? "autre",
    statut: initialValues?.statut ?? "a_faire",
    objectif: initialValues?.objectif ?? "prise_contact",
    moyen_contact: initialValues?.moyen_contact ?? null,
    relance_prevue: initialValues?.relance_prevue ?? undefined,
    owner: initialValues?.owner ?? null,
    owner_username: initialValues?.owner_username ?? null,
    partenaire_nom: initialValues?.partenaire_nom ?? null,
    formation_nom: initialValues?.formation_nom ?? null,
    centre_nom: initialValues?.centre_nom ?? null,
    num_offre: initialValues?.num_offre ?? null,
  });

  const { choices, loading: loadingChoices, error } = useProspectionChoices();
  const [showPartenaireModal, setShowPartenaireModal] = useState(false);
  const [showFormationModal, setShowFormationModal] = useState(false);
  const [showOwnerModal, setShowOwnerModal] = useState(false);

  // ✅ handler pour TextField
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value } as ProspectionFormDraft;
      if (name === "relance_prevue") {
        if (value) {
          if (!TERMINAUX.includes(prev.statut)) next.statut = "a_relancer";
        } else if (prev.statut === "a_relancer") {
          next.statut = "en_cours";
        }
      }
      return next;
    });
  };

  // ✅ handler pour Select
  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value } as ProspectionFormDraft;
      if (name === "moyen_contact") {
        next.moyen_contact =
          value === "" ? null : (value as ProspectionMoyenContact);
      }
      return next;
    });
  };

  const handleSubmit = async (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    if (!form.partenaire) {
      toast.warning("Veuillez sélectionner un partenaire.");
      return;
    }
    if (
      !form.date_prospection ||
      !form.type_prospection ||
      !form.motif ||
      !form.statut ||
      !form.objectif
    ) {
      toast.warning("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    if (form.statut === "a_relancer" && !form.relance_prevue) {
      toast.warning("Merci de saisir une date de relance prévue.");
      return;
    }

    const payload: ProspectionFormData = {
      partenaire: form.partenaire,
      formation: fixedFormationId ?? form.formation ?? null,
      date_prospection: form.date_prospection,
      type_prospection: form.type_prospection,
      motif: form.motif,
      statut: form.statut,
      objectif: form.objectif,
      owner: form.owner ?? null,
      moyen_contact: form.moyen_contact ?? null,
      ...(form.relance_prevue ? { relance_prevue: form.relance_prevue } : {}),
    };

    try {
      await onSubmit(payload);
    } catch {
      toast.error("Erreur lors de la soumission.");
    }
  };

  if (loadingChoices) return <CircularProgress />;
  if (error) return <p>❌ Erreur lors du chargement des choix.</p>;

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      display="flex"
      flexDirection="column"
      gap={2}
    >
      <TextField
        type="date"
        name="date_prospection"
        label="Date de prospection*"
        value={form.date_prospection}
        onChange={handleInputChange}
        InputLabelProps={{ shrink: true }}
        required
      />

      <FormControl required>
        <InputLabel>Type de prospection</InputLabel>
        <Select
          name="type_prospection"
          value={form.type_prospection}
          onChange={handleSelectChange}
        >
          {choices!.type_prospection.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
        <FormHelperText>Obligatoire</FormHelperText>
      </FormControl>

      {/* Idem pour Motif, Statut, Objectif, Moyen de contact... */}

      <Button type="submit" variant="contained" disabled={loading}>
        {loading
          ? mode === "create"
            ? "⏳ Création…"
            : "⏳ Mise à jour…"
          : "✅ Enregistrer"}
      </Button>
    </Box>
  );
}

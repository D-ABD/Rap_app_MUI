import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  Box,
  Stack,
  TextField,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";

import { useProspectionChoices } from "../../hooks/useProspection";
import type {
  ProspectionFormData,
  ProspectionMoyenContact,
  ProspectionStatut,
} from "../../types/prospection";
import PartenaireSelectModal from "../../components/modals/PartenairesSelectModal";

type Mode = "create" | "edit";

interface Props {
  mode?: Mode;
  initialValues: ProspectionFormData | null;
  onSubmit: (data: ProspectionFormData) => Promise<void>;
  loading: boolean;
  fixedFormationId?: number;
}

const TERMINAUX: ProspectionStatut[] = ["acceptee", "refusee", "annulee"];

type ProspectionFormDraft = Partial<ProspectionFormData> & {
  partenaire: number | null;
  partenaire_nom?: string | null;
  relance_prevue?: string | undefined;
  moyen_contact?: ProspectionMoyenContact | null;
};

export default function ProspectionFormCandidat({
  mode = "create",
  initialValues,
  onSubmit,
  loading,
  fixedFormationId,
}: Props) {
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [form, setForm] = useState<ProspectionFormDraft>({
    partenaire: initialValues?.partenaire ?? null,
    partenaire_nom: initialValues?.partenaire_nom ?? null,
    formation: fixedFormationId ?? initialValues?.formation ?? null,
    date_prospection:
      initialValues?.date_prospection?.slice(0, 10) ?? todayStr,
    type_prospection: initialValues?.type_prospection ?? "nouveau_prospect",
    motif: initialValues?.motif ?? "autre",
    statut: initialValues?.statut ?? "a_faire",
    objectif: initialValues?.objectif ?? "prise_contact",
    relance_prevue: initialValues?.relance_prevue ?? undefined,
    owner: initialValues?.owner ?? null,
    formation_nom: initialValues?.formation_nom ?? null,
    centre_nom: initialValues?.centre_nom ?? null,
    num_offre: initialValues?.num_offre ?? null,
    moyen_contact: initialValues?.moyen_contact ?? null,
  });

  useEffect(() => {
    if (fixedFormationId != null) {
      setForm((prev) => ({ ...prev, formation: fixedFormationId }));
    }
  }, [fixedFormationId]);

  const { choices, loading: loadingChoices, error } = useProspectionChoices();
  const [showPartenaireModal, setShowPartenaireModal] = useState(false);

  // ✅ handler pour TextField (input/date)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => {
      const nextVal =
        value === ""
          ? undefined
          : type === "number"
          ? Number(value)
          : value;
      const next = { ...prev, [name]: nextVal } as ProspectionFormDraft;

      if (name === "relance_prevue") {
        if (nextVal) {
          if (!TERMINAUX.includes(prev.statut as ProspectionStatut)) {
            next.statut = "a_relancer";
          }
        } else if (prev.statut === "a_relancer") {
          next.statut = "en_cours";
        }
      }
      return next;
    });
  };

  // ✅ handler pour Select MUI
  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value } as ProspectionFormDraft;
      if (name === "moyen_contact") {
        next.moyen_contact = value === "" ? null : (value as ProspectionMoyenContact);
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      date_prospection: form.date_prospection!,
      type_prospection: form.type_prospection!,
      motif: form.motif!,
      statut: form.statut!,
      objectif: form.objectif!,
      owner: form.owner ?? null,
      ...(form.moyen_contact !== undefined
        ? { moyen_contact: form.moyen_contact ?? null }
        : {}),
      ...(form.relance_prevue ? { relance_prevue: form.relance_prevue } : {}),
    };

    try {
      await onSubmit(payload);
    } catch {
      toast.error("Erreur lors de la soumission.");
    }
  };

  if (loadingChoices) return <CircularProgress />;
  if (error) return <p>Erreur lors du chargement des choix.</p>;

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      display="flex"
      flexDirection="column"
      gap={2}
    >
      {/* Exemple champ input */}
      <TextField
        type="date"
        name="date_prospection"
        label="Date de prospection*"
        value={form.date_prospection || ""}
        onChange={handleInputChange}
        InputLabelProps={{ shrink: true }}
        required
      />

      {/* Exemple champ Select */}
      <FormControl required>
        <InputLabel>Type de prospection</InputLabel>
        <Select
          name="type_prospection"
          value={form.type_prospection || ""}
          onChange={handleSelectChange}
        >
          {choices!.type_prospection.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
        <FormHelperText>Champ obligatoire</FormHelperText>
      </FormControl>

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

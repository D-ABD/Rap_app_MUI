// src/pages/prospections/ProspectionForm.tsx
import {
  useEffect,
  useMemo,
  useState,
  useCallback,
  FormEvent,
} from "react";
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
  Typography,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import { toast } from "react-toastify";

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
function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

async function fetchNameById(
  url: string,
  field: "nom" | "name" = "nom"
): Promise<string | null> {
  try {
    const res = await api.get<unknown>(url);
    const raw = res.data as unknown;
    const node =
      isRecord(raw) && isRecord(raw.data)
        ? (raw.data as Record<string, unknown>)
        : (raw as Record<string, unknown>);
    const v = node?.[field];
    return typeof v === "string" ? v : null;
  } catch {
    return null;
  }
}

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

  // noms affichés
  const [partenaireNom, setPartenaireNom] = useState<string | null>(
    initialValues?.partenaire_nom ?? null
  );
  const [formationNom, setFormationNom] = useState<string | null>(
    initialValues?.formation_nom ?? null
  );
  const [ownerUsername, setOwnerUsername] = useState<string | null>(
    initialValues?.owner_username ?? null
  );

  // synchro douce si initialValues change
  useEffect(() => {
    if (!initialValues) return;
    setForm((prev) => ({
      ...prev,
      partenaire: initialValues.partenaire ?? prev.partenaire ?? null,
      formation: fixedFormationId ?? initialValues.formation ?? prev.formation,
      date_prospection:
        (initialValues.date_prospection
          ? initialValues.date_prospection.slice(0, 10)
          : prev.date_prospection) ?? todayStr,
      type_prospection:
        initialValues.type_prospection ?? prev.type_prospection,
      motif: initialValues.motif ?? prev.motif,
      statut: initialValues.statut ?? prev.statut,
      objectif: initialValues.objectif ?? prev.objectif,
      moyen_contact: initialValues.moyen_contact ?? null,
      relance_prevue: initialValues.relance_prevue ?? prev.relance_prevue,
      owner: initialValues.owner ?? prev.owner ?? null,
      owner_username:
        initialValues.owner_username ?? prev.owner_username ?? null,
      partenaire_nom:
        initialValues.partenaire_nom ?? prev.partenaire_nom ?? null,
      formation_nom:
        initialValues.formation_nom ?? prev.formation_nom ?? null,
      centre_nom: initialValues.centre_nom ?? prev.centre_nom ?? null,
      num_offre: initialValues.num_offre ?? prev.num_offre ?? null,
    }));
  }, [initialValues, fixedFormationId, todayStr]);

  // fallback nom partenaire
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (form.partenaire && !partenaireNom) {
        const name = await fetchNameById(`/partenaires/${form.partenaire}/`);
        if (!cancelled && name) setPartenaireNom(name);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [form.partenaire, partenaireNom]);

  // fallback nom formation
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const wantedFormation =
        (typeof fixedFormationId === "number"
          ? fixedFormationId
          : form.formation) ?? null;
      if (wantedFormation && !formationNom) {
        const name = await fetchNameById(`/formations/${wantedFormation}/`);
        if (!cancelled && name) setFormationNom(name);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [form.formation, fixedFormationId, formationNom]);

  const [showPartenaireModal, setShowPartenaireModal] = useState(false);
  const [showFormationModal, setShowFormationModal] = useState(false);
  const [showOwnerModal, setShowOwnerModal] = useState(false);

  const { choices, loading: loadingChoices, error } = useProspectionChoices();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
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
      ...(partenaireNom ? { partenaire_nom: partenaireNom } : {}),
      ...(formationNom ? { formation_nom: formationNom } : {}),
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
      gap={3}
    >
      {/* Partenaire */}
      <Box>
        {(partenaireNom || form.partenaire) && (
          <Typography variant="body2" gutterBottom>
            🏢 Partenaire :{" "}
            <strong>{partenaireNom ?? `ID #${form.partenaire}`}</strong>
          </Typography>
        )}
        <Button
          type="button"
          onClick={() => setShowPartenaireModal(true)}
          variant="outlined"
        >
          {form.partenaire ? "Modifier le partenaire" : "Sélectionner un partenaire"}
        </Button>
        <PartenaireSelectModal
          show={showPartenaireModal}
          onClose={() => setShowPartenaireModal(false)}
          onSelect={(p: Partenaire) => {
            setForm((fm) => ({ ...fm, partenaire: p.id }));
            setPartenaireNom(p.nom ?? null);
            setShowPartenaireModal(false);
          }}
        />
      </Box>

      {/* Formation */}
      {!fixedFormationId && (
        <Box>
          {(formationNom || form.formation) && (
            <Typography variant="body2" gutterBottom>
              📚 Formation :{" "}
              <strong>
                {formationNom ?? (form.formation ? `ID #${form.formation}` : "—")}
              </strong>
            </Typography>
          )}
          <Button
            type="button"
            onClick={() => setShowFormationModal(true)}
            variant="outlined"
          >
            {form.formation ? "Modifier la formation" : "Sélectionner une formation"}
          </Button>
          <FormationSelectModal
            show={showFormationModal}
            onClose={() => setShowFormationModal(false)}
            onSelect={(f) => {
              setForm((fm) => ({ ...fm, formation: f.id }));
              setFormationNom(f.nom);
              setShowFormationModal(false);
            }}
          />
        </Box>
      )}

      {/* Responsable */}
      <Box>
        {ownerUsername && (
          <Typography variant="body2" gutterBottom>
            👤 Responsable : <strong>{ownerUsername}</strong>
          </Typography>
        )}
        <Button
          type="button"
          onClick={() => setShowOwnerModal(true)}
          variant="outlined"
        >
          {form.owner ? "Modifier le responsable" : "Sélectionner un responsable"}
        </Button>
        <CandidatsSelectModal
          show={showOwnerModal}
          onClose={() => setShowOwnerModal(false)}
          onSelect={(cand) => {
            const ownerId = extractOwnerUserId(cand);
            if (!ownerId) {
              toast.warning("Ce candidat n'a pas de compte utilisateur lié.");
              return;
            }
            const name = extractCandidateDisplayName(cand);
            setForm((fm) => ({ ...fm, owner: ownerId }));
            setOwnerUsername(name);
            setShowOwnerModal(false);
          }}
        />
      </Box>

      {/* Date de prospection */}
      <TextField
        type="date"
        name="date_prospection"
        label="Date de prospection*"
        value={form.date_prospection}
        onChange={handleInputChange}
        InputLabelProps={{ shrink: true }}
        required
      />

      {/* Type */}
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

      {/* Motif */}
      <FormControl required>
        <InputLabel>Motif</InputLabel>
        <Select
          name="motif"
          value={form.motif}
          onChange={handleSelectChange}
        >
          {choices!.motif.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Moyen de contact */}
      <FormControl>
        <InputLabel>Moyen de contact</InputLabel>
        <Select
          name="moyen_contact"
          value={form.moyen_contact ?? ""}
          onChange={handleSelectChange}
        >
          <MenuItem value="">—</MenuItem>
          {choices!.moyen_contact.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Statut */}
      <FormControl required>
        <InputLabel>Statut</InputLabel>
        <Select
          name="statut"
          value={form.statut}
          onChange={handleSelectChange}
        >
          {choices!.statut.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Relance prévue */}
      <TextField
        type="date"
        name="relance_prevue"
        label="Date de relance prévue"
        value={form.relance_prevue ?? ""}
        onChange={handleInputChange}
        InputLabelProps={{ shrink: true }}
        inputProps={{ min: todayStr }}
        helperText="Saisir une date bascule automatiquement le statut en 'À relancer' (sauf si statut terminal)."
      />

      {/* Objectif */}
      <FormControl required>
        <InputLabel>Objectif</InputLabel>
        <Select
          name="objectif"
          value={form.objectif}
          onChange={handleSelectChange}
        >
          {choices!.objectif.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Submit */}
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

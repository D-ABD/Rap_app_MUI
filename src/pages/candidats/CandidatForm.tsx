// src/components/candidats/CandidatForm.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";

import type {
  CandidatFormData,
  CandidatMeta,
  Candidat,
  CVStatutValue,
  Choice,
} from "../../types/candidat";
import { User } from "../../types/User";

import UsersSelectModal, { UserPick } from "../../components/modals/UsersSelectModal";
import FormationSelectModal, { FormationPick } from "../../components/modals/FormationSelectModal";

/* ---------- Types ---------- */
export type FormationOption = { value: number; label: string };
export type Option = { value: number; label: string };

type Props = {
  initialValues?: CandidatFormData;
  meta?: CandidatMeta | null;
  formationOptions?: FormationOption[];
  userOptions?: Option[];
  partenaireOptions?: Option[];
  currentUser?: User | null;
  canEditFormation?: boolean;
  submitting?: boolean;
  onSubmit: (values: CandidatFormData) => void | Promise<void>;
  onCancel?: () => void;
  initialFormationInfo?: Candidat["formation_info"] | null;
};

/* ---------- Fallback ---------- */
const CV_STATUT_FALLBACK: Choice[] = [
  { value: "oui", label: "Oui" },
  { value: "en_cours", label: "En cours" },
  { value: "a_modifier", label: "À modifier" },
];

/* ---------- Helpers ---------- */
function field<T extends keyof CandidatFormData>(
  key: T,
  value: CandidatFormData[T] | undefined,
  setForm: React.Dispatch<React.SetStateAction<CandidatFormData>>
) {
  return {
    value: (value as unknown as string) ?? "",
    onChange: (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const v =
        e.target.type === "number"
          ? e.target.value === ""
            ? undefined
            : Number(e.target.value)
          : e.target.value === ""
          ? undefined
          : e.target.value;
      setForm((f) => ({ ...f, [key]: v as CandidatFormData[T] }));
    },
  };
}

const setSelectNumber =
  (
    setForm: React.Dispatch<React.SetStateAction<CandidatFormData>>,
    key: keyof CandidatFormData
  ) =>
  (e: React.ChangeEvent<{ value: unknown }>) => {
    const raw = e.target.value as string;
    const v = raw === "" ? undefined : Number(raw);
    setForm((f) => ({ ...f, [key]: v as any }));
  };

const mapFormationInfo = (
  fi?: Candidat["formation_info"] | null
): FormationPick | null => {
  if (!fi) return null;
  return {
    id: fi.id,
    nom: fi.nom ?? null,
    centre: fi.centre
      ? { id: fi.centre.id, nom: fi.centre.nom }
      : null,
    type_offre: fi.type_offre
      ? {
          id: fi.type_offre.id,
          nom: fi.type_offre.nom ?? null,
          libelle: fi.type_offre.libelle ?? null,
          couleur: fi.type_offre.couleur ?? null,
        }
      : null,
    num_offre: fi.num_offre ?? null,
  };
};

const formatFormation = (p: FormationPick) =>
  `${p.nom ?? "—"} — ${p.centre?.nom ?? "—"} · ${p.num_offre ?? "—"}`;

/* ---------- Component ---------- */
export default function CandidatForm({
  initialValues,
  initialFormationInfo,
  meta,
  formationOptions = [],
  userOptions = [],
  currentUser,
  canEditFormation = true,
  submitting = false,
  onSubmit,
  onCancel,
}: Props) {
  const [form, setForm] = useState<CandidatFormData>({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    ville: "",
    code_postal: "",
    statut: undefined,
    cv_statut: undefined,
    rqth: false,
    permis_b: false,
    entretien_done: false,
    test_is_ok: false,
    courrier_rentree: false,
    admissible: false,
    inscrit_gespers: false,
    date_naissance: undefined,
    date_rentree: undefined,
    date_placement: undefined,
    numero_osia: null,
    formation: undefined,
    type_contrat: undefined,
    disponibilite: undefined,
    communication: undefined,
    experience: undefined,
    csp: undefined,
    responsable_placement: undefined,
    entreprise_placement: undefined,
    entreprise_validee: undefined,
    resultat_placement: undefined,
    contrat_signe: undefined,
    vu_par: undefined,
    origine_sourcing: undefined,
    ...initialValues,
  });

  const [showFormationModal, setShowFormationModal] = useState(false);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [formationInfo, setFormationInfo] = useState<FormationPick | null>(
    mapFormationInfo(initialFormationInfo)
  );
  const [formationLabel, setFormationLabel] = useState("");
  const [vuParLabel, setVuParLabel] = useState("");

  const cvStatutChoices: Choice[] = useMemo(() => {
    const server = meta?.cv_statut_choices ?? [];
    return server.length ? server : CV_STATUT_FALLBACK;
  }, [meta?.cv_statut_choices]);

  useEffect(() => {
    const pick = mapFormationInfo(initialFormationInfo);
    if (pick) {
      setFormationInfo(pick);
      if (!form.formation || form.formation === pick.id) {
        setForm((f) => ({ ...f, formation: f.formation ?? pick.id }));
        setFormationLabel(formatFormation(pick));
      }
    }
  }, [initialFormationInfo]);

  useEffect(() => {
    if (!form.formation) {
      setFormationLabel("");
      return;
    }
    if (formationInfo && formationInfo.id === form.formation) {
      setFormationLabel(formatFormation(formationInfo));
      return;
    }
    const opt = formationOptions.find((o) => o.value === form.formation);
    if (opt?.label) setFormationLabel(opt.label);
  }, [form.formation, formationOptions, formationInfo]);

  useEffect(() => {
    if (!form.formation && currentUser?.formation_info?.id) {
      setForm((f) => ({ ...f, formation: currentUser.formation_info!.id }));
    }
  }, [currentUser?.formation_info?.id]);

  useEffect(() => {
    if (form.vu_par && userOptions.length) {
      const opt = userOptions.find((u) => u.value === form.vu_par);
      if (opt?.label) setVuParLabel(opt.label);
    }
  }, [form.vu_par, userOptions]);

  const effectiveCanEditFormation = useMemo(() => {
    if (!canEditFormation) return false;
    const role = currentUser?.role;
    return !["candidat", "stagiaire"].includes(role ?? "");
  }, [canEditFormation, currentUser?.role]);

  const handleCheckbox =
    (key: keyof CandidatFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((f) => ({ ...f, [key]: e.target.checked as any }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
  };

  return (
    <>
      <Box
        component="form"
        onSubmit={handleSubmit}
        aria-busy={!!submitting}
        sx={{ display: "grid", gap: 2 }}
      >
        {/* Identité */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Identité & contact</Typography>
          <Grid container spacing={2} mt={1}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Nom *"
                required
                fullWidth
                {...field("nom", form.nom, setForm)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Prénom *"
                required
                fullWidth
                {...field("prenom", form.prenom, setForm)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Email"
                type="email"
                fullWidth
                {...field("email", form.email, setForm)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Téléphone"
                fullWidth
                {...field("telephone", form.telephone, setForm)}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Situation */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Situation & dates</Typography>
          <Grid container spacing={2} mt={1}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <Typography variant="body2">Statut</Typography>
                <Select
                  value={form.statut ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      statut: e.target.value || undefined,
                    }))
                  }
                >
                  <MenuItem value="">— Choisir —</MenuItem>
                  {(meta?.statut_choices ?? []).map((c) => (
                    <MenuItem key={String(c.value)} value={String(c.value)}>
                      {c.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <Typography variant="body2">CV</Typography>
                <Select
                  value={form.cv_statut ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      cv_statut: (e.target.value ||
                        undefined) as CVStatutValue | undefined,
                    }))
                  }
                >
                  <MenuItem value="">— Choisir —</MenuItem>
                  {cvStatutChoices.map((c) => (
                    <MenuItem key={String(c.value)} value={String(c.value)}>
                      {c.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* Checkboxes */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Indicateurs</Typography>
          <Box display="flex" flexWrap="wrap" gap={2} mt={1}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={!!form.rqth}
                  onChange={handleCheckbox("rqth")}
                />
              }
              label="RQTH"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={!!form.permis_b}
                  onChange={handleCheckbox("permis_b")}
                />
              }
              label="Permis B"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={!!form.inscrit_gespers}
                  onChange={handleCheckbox("inscrit_gespers")}
                />
              }
              label="Inscrit GESPERS"
            />
          </Box>
        </Paper>

        {/* Notes */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Notes</Typography>
          <TextField
            fullWidth
            multiline
            minRows={4}
            placeholder="Saisir une note…"
            {...field("notes", form.notes, setForm)}
          />
        </Paper>

        {/* Actions */}
        <Box display="flex" justifyContent="flex-end" gap={2}>
          {onCancel && (
            <Button onClick={onCancel} variant="outlined">
              Annuler
            </Button>
          )}
          <Button
            type="submit"
            variant="contained"
            disabled={submitting}
          >
            {submitting ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </Box>
      </Box>

      {/* Modals */}
      <FormationSelectModal
        show={showFormationModal}
        onClose={() => setShowFormationModal(false)}
        onSelect={(pick: FormationPick) => {
          setForm((f) => ({ ...f, formation: pick.id }));
          setFormationInfo(pick);
          setFormationLabel(formatFormation(pick));
          setShowFormationModal(false);
        }}
      />
      <UsersSelectModal
        show={showUsersModal}
        onClose={() => setShowUsersModal(false)}
        allowedRoles={["staff", "admin", "superadmin"]}
        onlyActive
        onSelect={(pick: UserPick) => {
          setForm((f) => ({ ...f, vu_par: pick.id }));
          setVuParLabel(
            pick.full_name || pick.email || `Utilisateur #${pick.id}`
          );
          setShowUsersModal(false);
        }}
      />
    </>
  );
}

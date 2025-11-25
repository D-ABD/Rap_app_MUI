import React, { useCallback, useMemo } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Grid,
  Select,
  MenuItem,
  FormControl,
  FormLabel,
  Checkbox,
  FormControlLabel,
  Divider,
} from "@mui/material";
import type {
  CandidatFormData,
  CandidatMeta,

} from "../../../types/candidat";

interface Props {
  form: CandidatFormData;
  setForm: React.Dispatch<React.SetStateAction<CandidatFormData>>;
  meta?: CandidatMeta | null;
}

function SectionIndicateurs({ form, setForm, meta }: Props) {
  // -------------------------
  // Handlers optimisés
  // -------------------------

  const updateSelect = useCallback(
    (key: keyof CandidatFormData) =>
      (e: any) =>
        setForm((f) => ({ ...f, [key]: e.target.value || undefined })),
    [setForm]
  );

  const updateSelectTyped = useCallback(
    (key: keyof CandidatFormData) =>
      (e: any) =>
        setForm((f) => ({
          ...f,
          [key]: (e.target.value || undefined) as any,
        })),
    [setForm]
  );

  const updateSelectNumber = useCallback(
    (key: keyof CandidatFormData) =>
      (e: any) =>
        setForm((f) => ({
          ...f,
          [key]: e.target.value ? Number(e.target.value) : undefined,
        })),
    [setForm]
  );

  const updateCheckbox = useCallback(
    (key: keyof CandidatFormData) =>
      (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm((f) => ({ ...f, [key]: e.target.checked })),
    [setForm]
  );

  // -------------------------
  // Mémo — évite recalculs
  // -------------------------

  const niveauKeys = useMemo(() => ["communication", "experience", "csp"] as const, []);

  const checkboxItems = useMemo(
    () => [
      ["entretien_done", "Entretien réalisé"],
      ["test_is_ok", "Test validé"],
      ["admissible", "Admissible"],
      ["inscrit_gespers", "Inscrit GESPERS"],
      ["courrier_rentree", "Courrier de rentrée envoyé"],
    ] as const,
    []
  );

  return (
    <Card variant="outlined">
      <CardHeader
        title="Suivi & situation"
        subheader="Suivi administratif et niveau du candidat"
      />
      <CardContent>
        {/* ---------------------- */}
        {/* Statuts administratifs */}
        {/* ---------------------- */}
        <Grid container spacing={2}>
          {/* Statut */}
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <FormLabel>Statut</FormLabel>
              <Select
                value={form.statut ?? ""}
                onChange={updateSelect("statut")}
                displayEmpty
              >
                <MenuItem value="">—</MenuItem>
                {(meta?.statut_choices ?? []).map((opt) => (
                  <MenuItem key={String(opt.value)} value={String(opt.value)}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* CV statut */}
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <FormLabel>CV statut</FormLabel>
              <Select
                value={form.cv_statut ?? ""}
                onChange={updateSelectTyped("cv_statut")}
                displayEmpty
              >
                <MenuItem value="">—</MenuItem>
                {(meta?.cv_statut_choices ?? []).map((opt) => (
                  <MenuItem key={String(opt.value)} value={String(opt.value)}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Type de contrat */}
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <FormLabel>Type de contrat</FormLabel>
              <Select
                value={form.type_contrat ?? ""}
                onChange={updateSelect("type_contrat")}
                displayEmpty
              >
                <MenuItem value="">—</MenuItem>
                {(meta?.type_contrat_choices ?? []).map((opt) => (
                  <MenuItem key={String(opt.value)} value={String(opt.value)}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Contrat signé */}
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <FormLabel>Contrat signé</FormLabel>
              <Select
                value={form.contrat_signe ?? ""}
                onChange={updateSelectTyped("contrat_signe")}
                displayEmpty
              >
                <MenuItem value="">—</MenuItem>
                {(meta?.contrat_signe_choices ?? []).map((opt) => (
                  <MenuItem key={String(opt.value)} value={String(opt.value)}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Disponibilité */}
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <FormLabel>Disponibilité</FormLabel>
              <Select
                value={form.disponibilite ?? ""}
                onChange={updateSelect("disponibilite")}
                displayEmpty
              >
                <MenuItem value="">—</MenuItem>
                {(meta?.disponibilite_choices ?? []).map((opt) => (
                  <MenuItem key={String(opt.value)} value={String(opt.value)}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* ---------------------- */}
        {/* Communication / Exp / CSP */}
        {/* ---------------------- */}
        <Grid container spacing={2}>
          {niveauKeys.map((key) => (
            <Grid item xs={12} md={4} key={key}>
              <FormControl fullWidth>
                <FormLabel>
                  {key === "communication"
                    ? "Communication"
                    : key === "experience"
                    ? "Expérience"
                    : "CSP"}
                </FormLabel>
                <Select
                  value={(form[key] as number | undefined) ?? ""}
                  onChange={updateSelectNumber(key)}
                  displayEmpty
                >
                  <MenuItem value="">—</MenuItem>
                  {(meta?.niveau_choices ?? []).map((opt) => (
                    <MenuItem key={String(opt.value)} value={String(opt.value)}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* ---------------------- */}
        {/* Cases à cocher */}
        {/* ---------------------- */}
        <Grid container spacing={2}>
          {checkboxItems.map(([key, label]) => (
            <Grid item xs={12} md={3} key={key}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!!(form as any)[key]}
                    onChange={updateCheckbox(key as keyof CandidatFormData)}
                  />
                }
                label={label}
              />
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}

export default React.memo(SectionIndicateurs);

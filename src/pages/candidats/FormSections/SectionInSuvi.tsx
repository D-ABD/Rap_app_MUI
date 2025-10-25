import React from "react";
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
import type { CandidatFormData, CandidatMeta, CVStatutValue } from "../../../types/candidat";

interface Props {
  form: CandidatFormData;
  setForm: React.Dispatch<React.SetStateAction<CandidatFormData>>;
  meta?: CandidatMeta | null;
}

export default function SectionIndicateurs({ form, setForm, meta }: Props) {
  const handleCheckbox =
    (key: keyof CandidatFormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.checked }));

  return (
    <Card variant="outlined">
      <CardHeader title="Suivi & situation" subheader="Suivi administratif et niveau du candidat" />
      <CardContent>
        <Grid container spacing={2}>
          {/* Statut */}
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <FormLabel>Statut</FormLabel>
              <Select
                value={form.statut ?? ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    statut: e.target.value || undefined,
                  }))
                }
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
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    cv_statut: (e.target.value || undefined) as CVStatutValue | undefined,
                  }))
                }
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
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    type_contrat: e.target.value || undefined,
                  }))
                }
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

          {/* Disponibilité */}
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <FormLabel>Disponibilité</FormLabel>
              <Select
                value={form.disponibilite ?? ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    disponibilite: e.target.value || undefined,
                  }))
                }
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

        {/* Communication / expérience / CSP */}
        <Grid container spacing={2}>
          {(["communication", "experience", "csp"] as const).map((key) => (
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
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      [key]: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
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

        {/* Cases à cocher */}
        <Grid container spacing={2}>
          {[
            ["entretien_done", "Entretien réalisé"],
            ["test_is_ok", "Test validé"],
            ["admissible", "Admissible"],
            ["inscrit_gespers", "Inscrit GESPERS"],
            ["courrier_rentree", "Courrier de rentrée envoyé"],
          ].map(([key, label]) => (
            <Grid item xs={12} md={3} key={key}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!!(form as any)[key]}
                    onChange={handleCheckbox(key as keyof CandidatFormData)}
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

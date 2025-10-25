import React from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Grid,
  TextField,
  FormControl,
  FormLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import type { CandidatFormData, CandidatMeta } from "../../../types/candidat";

interface Props {
  form: CandidatFormData;
  setForm: React.Dispatch<React.SetStateAction<CandidatFormData>>;
  meta?: CandidatMeta | null;
}

export default function SectionIdentite({ form, setForm }: Props) {
  const handleCheckbox =
    (key: keyof CandidatFormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.checked }));

  return (
    <Card variant="outlined">
      <CardHeader
        title="Identité du candidat"
        subheader="Informations personnelles et coordonnées"
      />
      <CardContent>
        <Grid container spacing={2}>
          {/* Nom et prénom */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              label="Nom"
              value={form.nom ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              label="Prénom"
              value={form.prenom ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, prenom: e.target.value }))}
            />
          </Grid>

          {/* Nom de naissance */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Nom de naissance"
              value={form.nom_naissance ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, nom_naissance: e.target.value }))}
            />
          </Grid>

          {/* Sexe (Select) */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <FormLabel>Sexe</FormLabel>
              <Select
                value={form.sexe ?? ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    sexe: e.target.value === "" ? undefined : (e.target.value as "M" | "F" | null),
                  }))
                }
                displayEmpty
              >
                <MenuItem value="">
                  <em>— Non précisé —</em>
                </MenuItem>
                <MenuItem value="M">Masculin</MenuItem>
                <MenuItem value="F">Féminin</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Email / Téléphone */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="email"
              label="Email"
              value={form.email ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Téléphone"
              value={form.telephone ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, telephone: e.target.value }))}
            />
          </Grid>

          {/* Date et lieu de naissance */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="date"
              label="Date de naissance"
              InputLabelProps={{ shrink: true }}
              value={form.date_naissance ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, date_naissance: e.target.value }))}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Département de naissance"
              value={form.departement_naissance ?? ""}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  departement_naissance: e.target.value,
                }))
              }
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Commune de naissance"
              value={form.commune_naissance ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, commune_naissance: e.target.value }))}
            />
          </Grid>

          {/* Pays & nationalité */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Pays de naissance"
              placeholder="Saisie libre"
              value={form.pays_naissance ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, pays_naissance: e.target.value }))}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Nationalité"
              value={form.nationalite ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, nationalite: e.target.value }))}
            />
          </Grid>

          {/* Numéro de sécurité sociale */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Numéro de sécurité sociale (NIR)"
              value={form.nir ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, nir: e.target.value }))}
              inputProps={{ maxLength: 15 }}
            />
          </Grid>

          {/* Checkboxes */}
          <Grid item xs={12} md={3}>
            <FormControlLabel
              control={<Checkbox checked={!!form.rqth} onChange={handleCheckbox("rqth")} />}
              label="Reconnaissance RQTH"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControlLabel
              control={<Checkbox checked={!!form.permis_b} onChange={handleCheckbox("permis_b")} />}
              label="Permis B"
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

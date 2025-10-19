import React from 'react';
import { Card, CardHeader, CardContent, Grid, TextField } from '@mui/material';
import type { CandidatFormData } from '../../../types/candidat';

interface Props {
  form: CandidatFormData;
  setForm: React.Dispatch<React.SetStateAction<CandidatFormData>>;
}

export default function SectionRepresentant({ form, setForm }: Props) {
  return (
    <Card variant="outlined">
      <CardHeader title="Représentant légal (si mineur)" />
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Lien avec le candidat"
              value={form.representant_lien ?? ''}
              onChange={e => setForm(f => ({ ...f, representant_lien: e.target.value }))}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Nom de naissance"
              value={form.representant_nom_naissance ?? ''}
              onChange={e => setForm(f => ({ ...f, representant_nom_naissance: e.target.value }))}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Prénom"
              value={form.representant_prenom ?? ''}
              onChange={e => setForm(f => ({ ...f, representant_prenom: e.target.value }))}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={form.representant_email ?? ''}
              onChange={e => setForm(f => ({ ...f, representant_email: e.target.value }))}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Rue"
              value={form.representant_street_name ?? ''}
              onChange={e => setForm(f => ({ ...f, representant_street_name: e.target.value }))}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Code postal"
              value={form.representant_zip_code ?? ''}
              onChange={e => setForm(f => ({ ...f, representant_zip_code: e.target.value }))}
            />
          </Grid>

          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              label="Ville"
              value={form.representant_city ?? ''}
              onChange={e => setForm(f => ({ ...f, representant_city: e.target.value }))}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

import React from 'react';
import { Card, CardHeader, CardContent, Grid, TextField } from '@mui/material';
import type { CandidatFormData } from '../../../types/candidat';

interface Props {
  form: CandidatFormData;
  setForm: React.Dispatch<React.SetStateAction<CandidatFormData>>;
}

export default function SectionAdresse({ form, setForm }: Props) {
  return (
    <Card variant="outlined">
      <CardHeader title="Adresse" />
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12} md={2}>
            <TextField fullWidth label="N°" value={form.street_number ?? ''} onChange={e => setForm(f => ({ ...f, street_number: e.target.value }))} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Rue" value={form.street_name ?? ''} onChange={e => setForm(f => ({ ...f, street_name: e.target.value }))} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Complément" value={form.street_complement ?? ''} onChange={e => setForm(f => ({ ...f, street_complement: e.target.value }))} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Code postal" value={form.code_postal ?? ''} onChange={e => setForm(f => ({ ...f, code_postal: e.target.value }))} />
          </Grid>
          <Grid item xs={12} md={8}>
            <TextField fullWidth label="Ville" value={form.ville ?? ''} onChange={e => setForm(f => ({ ...f, ville: e.target.value }))} />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

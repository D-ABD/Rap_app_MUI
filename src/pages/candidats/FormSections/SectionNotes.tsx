import React from 'react';
import { Card, CardHeader, CardContent, TextField } from '@mui/material';
import type { CandidatFormData } from '../../../types/candidat';

interface Props {
  form: CandidatFormData;
  setForm: React.Dispatch<React.SetStateAction<CandidatFormData>>;
}

export default function SectionNotes({ form, setForm }: Props) {
  return (
    <Card variant="outlined">
      <CardHeader title="Notes / Observations" subheader="Ajoutez tout contexte utile (entretien, contraintes, remarques…)" />
      <CardContent>
        <TextField
          fullWidth
          multiline
          minRows={4}
          placeholder="Saisir une note…"
          value={form.notes ?? ''}
          onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
        />
      </CardContent>
    </Card>
  );
}

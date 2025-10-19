import React from 'react';
import { Box, Button } from '@mui/material';

type Props = {
  onCancel?: () => void;
  submitting?: boolean;
};

export default function ActionsBar({ onCancel, submitting }: Props) {
  return (
    <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
      {onCancel && <Button variant="outlined" onClick={onCancel}>Annuler</Button>}
      <Button type="submit" variant="contained" disabled={submitting}>
        {submitting ? 'Enregistrement…' : 'Enregistrer'}
      </Button>
    </Box>
  );
}

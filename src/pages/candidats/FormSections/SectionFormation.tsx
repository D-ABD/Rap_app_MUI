import React from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Grid,
  Box,
  Button,
  TextField,
} from '@mui/material';
import type { CandidatFormData } from '../../../types/candidat';
import { formatFormation } from './utils';
import { FormationPick } from '../../../components/modals/FormationSelectModal';

interface Props {
  form: CandidatFormData;
  setForm: React.Dispatch<React.SetStateAction<CandidatFormData>>;
  canEditFormation: boolean;
  showFormationModal: boolean;
  setShowFormationModal: (b: boolean) => void;
  formationInfo: FormationPick | null;
}

export default function SectionFormation({
  form,
  setForm,
  canEditFormation,
  setShowFormationModal,
  formationInfo,
}: Props) {
  const formationLabel = formationInfo
    ? formatFormation(formationInfo)
    : form.formation
    ? `#${form.formation}`
    : '';

  return (
    <Card variant="outlined">
      <CardHeader
        title="Formation"
        subheader={
          !canEditFormation
            ? "La formation n’est pas modifiable pour votre rôle."
            : undefined
        }
      />
      <CardContent>
        <Grid container spacing={2}>
          {/* Sélection formation */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Formation sélectionnée"
              value={formationLabel}
              InputProps={{ readOnly: true }}
              placeholder={canEditFormation ? '— Aucune sélection —' : 'Non modifiable'}
            />
            {canEditFormation && (
              <Box display="flex" gap={1} mt={1}>
                <Button variant="outlined" onClick={() => setShowFormationModal(true)}>
                  🔍 Sélectionner
                </Button>
                {form.formation && (
                  <Button
                    color="error"
                    variant="outlined"
                    onClick={() => setForm(f => ({ ...f, formation: undefined }))}
                  >
                    ✖ Effacer
                  </Button>
                )}
              </Box>
            )}
          </Grid>

          {/* Champs individuels une fois la formation sélectionnée */}
          {formationInfo && (
            <>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nom de la formation"
                  value={formationInfo.nom ?? ''}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Centre"
                  value={formationInfo.centre?.nom ?? ''}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Type d’offre"
                  value={formationInfo.type_offre?.nom ?? ''}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="N° d’offre"
                  value={formationInfo.num_offre ?? ''}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
            </>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
}

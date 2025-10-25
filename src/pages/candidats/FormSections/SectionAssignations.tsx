import React from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Box,
  TextField,
  Button,
  FormHelperText,
} from "@mui/material";
import type { CandidatFormData } from "../../../types/candidat";

interface Props {
  form: CandidatFormData;
  setForm: React.Dispatch<React.SetStateAction<CandidatFormData>>;
  showUsersModal: boolean;
  setShowUsersModal: (v: boolean) => void;
}

/**
 * Section Assignations & visibilité du candidat
 * Gère le champ "vu_par" et ouvre la modale de sélection d’utilisateur.
 */
export default function SectionAssignations({ form, setForm, setShowUsersModal }: Props) {
  // ✅ Label dynamique simple basé sur form.vu_par
  const vuParLabel =
    typeof form.vu_par === "number"
      ? `Utilisateur #${form.vu_par}`
      : form.vu_par
        ? String(form.vu_par)
        : "";

  return (
    <Card variant="outlined">
      <CardHeader title="Assignations & visibilité" />
      <CardContent>
        <TextField
          fullWidth
          label="Vu par"
          value={vuParLabel}
          InputProps={{ readOnly: true }}
          placeholder="— Aucune sélection —"
        />

        <Box display="flex" gap={1} mt={1}>
          <Button variant="outlined" onClick={() => setShowUsersModal(true)}>
            🔍 Choisir un utilisateur
          </Button>
          {form.vu_par && (
            <Button
              color="error"
              variant="outlined"
              onClick={() =>
                setForm((f) => ({
                  ...f,
                  vu_par: undefined,
                }))
              }
            >
              ✖ Effacer
            </Button>
          )}
        </Box>

        <FormHelperText>
          Recherche sur nom et email. Rôles proposés : staff, admin, superadmin.
        </FormHelperText>
      </CardContent>
    </Card>
  );
}

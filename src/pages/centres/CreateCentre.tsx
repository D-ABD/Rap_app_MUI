import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Paper,
  Stack,
  Button,
  TextField,
  Typography,
} from "@mui/material";

import api from "../../api/axios";
import useForm from "../../hooks/useForm";
import PageTemplate from "../../components/PageTemplate";

export default function CentresCreatePage() {
  const navigate = useNavigate();

  const { values, handleChange, resetForm } = useForm({
    nom: "",
    code_postal: "",
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!values.nom.trim() || !values.code_postal.trim()) {
      toast.error("Tous les champs sont obligatoires.");
      return;
    }

    try {
      await api.post("/centres/", values);
      toast.success("Centre créé avec succès");
      navigate("/centres");
    } catch {
      toast.error("Erreur lors de la création du centre");
    }
  };

  return (
    <PageTemplate
      title="Créer un centre"
      backButton
      onBack={() => navigate(-1)}
      refreshButton
      onRefresh={() => {
        resetForm();
        toast.info("Formulaire réinitialisé");
      }}
    >
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight="bold">
          Informations du centre
        </Typography>

        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              id="nom"
              name="nom"
              label="Nom"
              value={values.nom}
              onChange={handleChange}
              required
              fullWidth
            />

            <TextField
              id="code_postal"
              name="code_postal"
              label="Code postal"
              value={values.code_postal}
              onChange={handleChange}
              required
              fullWidth
            />

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              justifyContent="flex-end"
            >
              <Button type="submit" variant="contained" color="success">
                💾 Créer
              </Button>
              <Button
                type="button"
                variant="outlined"
                onClick={() => navigate("/centres")}
              >
                Annuler
              </Button>
            </Stack>
          </Stack>
        </form>
      </Paper>
    </PageTemplate>
  );
}

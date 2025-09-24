import { useEffect, useState, useCallback, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Box,
  Paper,
  Stack,
  Button,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";

import api from "../../api/axios";
import useForm from "../../hooks/useForm";
import PageTemplate from "../../components/PageTemplate";

export default function CentresEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const { values, handleChange, setValues } = useForm({
    nom: "",
    code_postal: "",
  });

  const fetchCentre = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/centres/${id}/`);
      setValues({
        nom: res.data.nom,
        code_postal: res.data.code_postal,
      });
    } catch {
      toast.error("Erreur lors du chargement du centre");
      navigate("/centres");
    } finally {
      setLoading(false);
    }
  }, [id, navigate, setValues]);

  useEffect(() => {
    fetchCentre();
  }, [fetchCentre]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const { nom, code_postal } = values;
    if (!nom.trim() || !code_postal.trim()) {
      toast.error("Tous les champs sont obligatoires.");
      return;
    }

    try {
      await api.put(`/centres/${id}/`, values);
      toast.success("Centre mis à jour");
      navigate("/centres");
    } catch {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  return (
    <PageTemplate
      title="Modifier un centre"
      backButton
      onBack={() => navigate(-1)}
      refreshButton
      onRefresh={fetchCentre}
    >
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="30vh">
          <CircularProgress />
        </Box>
      ) : (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Modifier les informations
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
                  💾 Enregistrer
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
      )}
    </PageTemplate>
  );
}

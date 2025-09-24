import { useEffect, useState, useCallback, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Box,
  Stack,
  Button,
  TextField,
  MenuItem,
  Paper,
  Typography,
  CircularProgress,
} from "@mui/material";

import api from "../../api/axios";
import useForm from "../../hooks/useForm";
import PageTemplate from "../../components/PageTemplate";

type Choice = {
  value: string;
  label: string;
  default_color: string;
};

export default function TypeOffresEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [choices, setChoices] = useState<Choice[]>([]);
  const [previewColor, setPreviewColor] = useState("#6c757d");
  const [loading, setLoading] = useState(true);
  const [libelle, setLibelle] = useState("");
  const [initialColor, setInitialColor] = useState("#6c757d");

  const { values, handleChange, setValues, resetForm } = useForm({
    nom: "",
    autre: "",
    couleur: "",
  });

  const fetchTypeOffre = useCallback(async () => {
    try {
      const [res, choicesRes] = await Promise.all([
        api.get(`/typeoffres/${id}/`),
        api.get("/typeoffres/choices/"),
      ]);

      const offre = res.data;
      setValues({
        nom: offre.nom || "",
        autre: offre.autre || "",
        couleur: offre.couleur || "",
      });

      setLibelle(offre.libelle || "");
      setInitialColor(offre.couleur || "#6c757d");

      const rawChoices = choicesRes.data?.data;
      if (Array.isArray(rawChoices)) {
        setChoices(rawChoices);
      }
    } catch {
      toast.error("Erreur lors du chargement");
      navigate("/typeoffres");
    } finally {
      setLoading(false);
    }
  }, [id, navigate, setValues]);

  useEffect(() => {
    fetchTypeOffre();
  }, [fetchTypeOffre]);

  useEffect(() => {
    const selected = choices.find((c) => c.value === values.nom);
    if (values.couleur) {
      setPreviewColor(values.couleur);
    } else if (selected) {
      setPreviewColor(selected.default_color);
    } else {
      setPreviewColor("#6c757d");
    }
  }, [values.nom, values.couleur, choices]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!values.nom.trim()) {
      toast.error('Le champ "Type" est obligatoire.');
      return;
    }

    if (values.nom === "autre" && !values.autre.trim()) {
      toast.error("Veuillez renseigner un nom personnalisé.");
      return;
    }

    try {
      await api.put(`/typeoffres/${id}/`, values);
      toast.success("Type d’offre mis à jour");
      navigate("/typeoffres");
    } catch {
      toast.error("Erreur lors de la modification");
    }
  };

  return (
    <PageTemplate
      title={libelle ? `Modifier le type : ${libelle}` : "Modifier un type d’offre"}
      backButton
      onBack={() => navigate(-1)}
      refreshButton
      onRefresh={resetForm}
    >
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="30vh">
          <CircularProgress />
        </Box>
      ) : (
        <Paper sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            {/* Infos actuelles */}
            {libelle && (
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{
                  backgroundColor: "action.hover",
                  p: 1.5,
                  borderLeft: 4,
                  borderLeftColor: "primary.main",
                  borderRadius: 1,
                  mb: 2,
                }}
              >
                <Typography>
                  🛈 Type en cours : <strong>{libelle}</strong>
                </Typography>
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: 1,
                    bgcolor: initialColor,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                  title={`Couleur actuelle : ${initialColor}`}
                />
              </Stack>
            )}

            {/* Select nom */}
            <TextField
              select
              fullWidth
              margin="normal"
              id="nom"
              name="nom"
              label="Type"
              value={values.nom}
              onChange={handleChange}
              required
            >
              {choices.map((c) => (
                <MenuItem key={c.value} value={c.value}>
                  {c.label}
                </MenuItem>
              ))}
            </TextField>

            {/* Champ autre */}
            {values.nom === "autre" && (
              <TextField
                fullWidth
                margin="normal"
                id="autre"
                name="autre"
                label="Nom personnalisé"
                value={values.autre}
                onChange={handleChange}
                required
              />
            )}

            {/* Champ couleur */}
            <TextField
              fullWidth
              margin="normal"
              id="couleur"
              name="couleur"
              label="Couleur"
              placeholder="#4e73df"
              value={values.couleur}
              onChange={handleChange}
            />

            {/* Aperçu couleur */}
            <Box
              role="img"
              aria-label={`Aperçu couleur ${previewColor}`}
              sx={{
                mt: 2,
                width: 24,
                height: 24,
                borderRadius: 1,
                bgcolor: previewColor,
                border: "1px solid",
                borderColor: "divider",
              }}
            />

            {/* Boutons */}
            <Stack direction="row" spacing={2} mt={3}>
              <Button type="submit" variant="contained" color="primary">
                💾 Enregistrer
              </Button>
              <Button
                type="button"
                variant="outlined"
                onClick={() => navigate("/typeoffres")}
              >
                Annuler
              </Button>
            </Stack>
          </form>
        </Paper>
      )}
    </PageTemplate>
  );
}

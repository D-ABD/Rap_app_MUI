// src/pages/formations/FormationsCreatePage.tsx
import { type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Box,
  Stack,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Checkbox,
  Typography,
  Paper,
  CircularProgress,
} from "@mui/material";

import useForm from "../../hooks/useForm";
import {
  useCreateFormation,
  useFormationChoices,
} from "../../hooks/useFormations";
import type {
  FormationFormData,
  FormationFormDataRaw,
  FormationFormErrors,
} from "../../types/formation";

import PageTemplate from "../../components/PageTemplate";

export default function FormationsCreatePage() {
  const navigate = useNavigate();
  const { createFormation, loading } = useCreateFormation();
  const {
    centres = [],
    statuts = [],
    typeOffres = [],
    loading: loadingChoices,
  } = useFormationChoices();

  const {
    values,
    errors,
    handleChange,
    handleCheckbox,
    setErrors,
    resetForm,
  } = useForm<FormationFormDataRaw>({
    nom: "",
    centre_id: null,
    type_offre_id: null,
    statut_id: null,
    start_date: "",
    end_date: "",
    num_kairos: "",
    num_offre: "",
    num_produit: "",
    assistante: "",
    prevus_crif: 0,
    prevus_mp: 0,
    inscrits_crif: 0,
    inscrits_mp: 0,
    cap: 0,
    convocation_envoie: false,
    entree_formation: 0,
    nombre_candidats: 0,
    nombre_entretiens: 0,
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const payload: FormationFormData = {
      ...values,
      centre_id: values.centre_id !== null ? Number(values.centre_id) : null,
      type_offre_id:
        values.type_offre_id !== null ? Number(values.type_offre_id) : null,
      statut_id: values.statut_id !== null ? Number(values.statut_id) : null,
    };

    try {
      await createFormation(payload);
      toast.success("✅ Formation créée");
      navigate("/formations");
    } catch (err: unknown) {
      const serverError = err as {
        response?: { data?: { errors?: FormationFormErrors } };
      };
      const backendErrors = serverError.response?.data?.errors;
      if (backendErrors) {
        setErrors(backendErrors);
      }
      toast.error("Erreur lors de la création");
    }
  };

  return (
    <PageTemplate
      title="Créer une formation"
      backButton
      onBack={() => navigate(-1)}
      refreshButton
      onRefresh={() => {
        resetForm();
        toast.info("Formulaire réinitialisé");
      }}
    >
      <Paper sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          {/* Section : Informations principales */}
          <Typography variant="h6" gutterBottom>
            📋 Informations principales
          </Typography>
          <TextField
            fullWidth
            margin="normal"
            label="Nom"
            name="nom"
            value={values.nom}
            onChange={handleChange}
            error={!!errors.nom}
            helperText={errors.nom}
            required
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Centre</InputLabel>
            <Select
              name="centre_id"
              value={values.centre_id?.toString() || ""}
              onChange={handleChange}
              label="Centre"
              required
            >
              {centres.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.nom}
                </MenuItem>
              ))}
            </Select>
            {errors.centre_id && (
              <Typography color="error">{errors.centre_id}</Typography>
            )}
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Type d'offre</InputLabel>
            <Select
              name="type_offre_id"
              value={values.type_offre_id?.toString() || ""}
              onChange={handleChange}
              label="Type d'offre"
              required
            >
              {typeOffres.map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {t.nom}
                </MenuItem>
              ))}
            </Select>
            {errors.type_offre_id && (
              <Typography color="error">{errors.type_offre_id}</Typography>
            )}
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Statut</InputLabel>
            <Select
              name="statut_id"
              value={values.statut_id?.toString() || ""}
              onChange={handleChange}
              label="Statut"
              required
            >
              {statuts.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.nom}
                </MenuItem>
              ))}
            </Select>
            {errors.statut_id && (
              <Typography color="error">{errors.statut_id}</Typography>
            )}
          </FormControl>

          <TextField
            fullWidth
            margin="normal"
            label="Date de début"
            type="date"
            name="start_date"
            value={values.start_date}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            error={!!errors.start_date}
            helperText={errors.start_date}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Date de fin"
            type="date"
            name="end_date"
            value={values.end_date}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            error={!!errors.end_date}
            helperText={errors.end_date}
          />

          {/* Section : Numéros & Assistante */}
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            🧾 Numéros & Assistante
          </Typography>
          <TextField
            margin="normal"
            label="N° Kairos"
            name="num_kairos"
            value={values.num_kairos}
            onChange={handleChange}
            error={!!errors.num_kairos}
            helperText={errors.num_kairos}
          />
          <TextField
            margin="normal"
            label="N° Offre"
            name="num_offre"
            value={values.num_offre}
            onChange={handleChange}
            error={!!errors.num_offre}
            helperText={errors.num_offre}
          />
          <TextField
            margin="normal"
            label="N° Produit"
            name="num_produit"
            value={values.num_produit}
            onChange={handleChange}
            error={!!errors.num_produit}
            helperText={errors.num_produit}
          />
          <TextField
            margin="normal"
            label="Assistante"
            name="assistante"
            value={values.assistante}
            onChange={handleChange}
            error={!!errors.assistante}
            helperText={errors.assistante}
          />

          {/* Section : Places */}
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            📊 Places
          </Typography>
          {["prevus_crif", "prevus_mp", "inscrits_crif", "inscrits_mp", "cap"].map(
            (field) => (
              <TextField
                key={field}
                margin="normal"
                type="number"
                label={field}
                name={field}
                value={values[field as keyof FormationFormDataRaw]?.toString() ?? ""}
                onChange={handleChange}
                error={!!errors[field as keyof FormationFormDataRaw]}
                helperText={errors[field as keyof FormationFormDataRaw]}
              />
            )
          )}

          {/* Section : Recrutement */}
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            📈 Recrutement
          </Typography>
          {["entree_formation", "nombre_candidats", "nombre_entretiens"].map(
            (field) => (
              <TextField
                key={field}
                margin="normal"
                type="number"
                label={field}
                name={field}
                value={values[field as keyof FormationFormDataRaw]?.toString() ?? ""}
                onChange={handleChange}
                error={!!errors[field as keyof FormationFormDataRaw]}
                helperText={errors[field as keyof FormationFormDataRaw]}
              />
            )
          )}

          <FormControlLabel
            control={
              <Checkbox
                checked={!!values.convocation_envoie}
                onChange={handleCheckbox}
                name="convocation_envoie"
              />
            }
            label="Convocation envoyée"
          />

          {/* Boutons */}
          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            <Button
              type="submit"
              variant="contained"
              color="success"
              disabled={loading || loadingChoices}
            >
              {loading ? <CircularProgress size={20} /> : "💾 Créer"}
            </Button>
            <Button
              type="button"
              variant="outlined"
              onClick={() => navigate("/formations")}
            >
              Annuler
            </Button>
          </Stack>
        </Box>
      </Paper>
    </PageTemplate>
  );
}

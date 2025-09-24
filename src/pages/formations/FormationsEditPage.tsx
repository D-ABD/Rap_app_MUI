// src/pages/formations/FormationsEditPage.tsx
import { useEffect, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Typography,
  Paper,
} from "@mui/material";

import {
  useFormation,
  useFormationChoices,
  useProspectionsByFormation,
  useUpdateFormation,
} from "../../hooks/useFormations";
import { useCommentaires } from "../../hooks/useCommentaires";
import useForm from "../../hooks/useForm";
import type {
  FormationFormData,
  FormationFormDataRaw,
  FormationFormErrors,
} from "../../types/formation";

import PageTemplate from "../../components/PageTemplate";
import CommentairesSection from "./componentsFormations/CommentairesSection";
import DocumentsSection from "./componentsFormations/DocumentsSection";
import ProspectionsSection from "./componentsFormations/ProspectionsSection";

export default function FormationsEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: formation, loading } = useFormation(Number(id));
  const { updateFormation, loading: updating } = useUpdateFormation(Number(id));
  const {
    centres = [],
    statuts = [],
    typeOffres = [],
    loading: loadingChoices,
  } = useFormationChoices();
  const { commentaires, loading: loadingCommentaires } = useCommentaires(
    Number(id)
  );
  const { prospections, loading: loadingProspections } =
    useProspectionsByFormation(Number(id));

  const { values, errors, handleChange, handleCheckbox, setValues, setErrors } =
    useForm<FormationFormDataRaw>({
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

  useEffect(() => {
    if (formation) {
      setValues({
        nom: formation.nom || "",
        centre_id: formation.centre?.id || null,
        type_offre_id: formation.type_offre?.id || null,
        statut_id: formation.statut?.id || null,
        start_date: formation.start_date || "",
        end_date: formation.end_date || "",
        num_kairos: formation.num_kairos || "",
        num_offre: formation.num_offre || "",
        num_produit: formation.num_produit || "",
        assistante: formation.assistante || "",
        prevus_crif: formation.prevus_crif ?? 0,
        prevus_mp: formation.prevus_mp ?? 0,
        inscrits_crif: formation.inscrits_crif ?? 0,
        inscrits_mp: formation.inscrits_mp ?? 0,
        cap: formation.cap ?? 0,
        convocation_envoie: formation.convocation_envoie ?? false,
        entree_formation: formation.entree_formation ?? 0,
        nombre_candidats: formation.nombre_candidats ?? 0,
        nombre_entretiens: formation.nombre_entretiens ?? 0,
      });
    }
  }, [formation, setValues]);

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
      await updateFormation(payload);
      toast.success("✅ Formation mise à jour");
      navigate("/formations");
    } catch (err: unknown) {
      const serverError = err as {
        response?: { data?: { errors?: FormationFormErrors } };
      };
      const backendErrors = serverError.response?.data?.errors;
      if (backendErrors) {
        setErrors(backendErrors);
      }
      toast.error("Erreur lors de la mise à jour");
    }
  };

  if (loading || !formation) return <CircularProgress />;

  return (
    <PageTemplate
      title={`Modifier : ${formation.nom}`}
      subtitle={`${formation.type_offre?.libelle ?? "Type inconnu"} – ${
        formation.statut?.libelle ?? "Statut inconnu"
      }`}
      backButton
      onBack={() => navigate(-1)}
    >
      <Paper sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          {/* Informations principales */}
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

          {/* Numéros & assistante */}
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

          {/* Places */}
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            📊 Places
          </Typography>
          {/* mêmes champs numériques que ton code */}

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

          {/* Commentaires */}
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            📈 Commentaires
          </Typography>
          {!loadingCommentaires && (
            <CommentairesSection
              commentaires={commentaires ?? []}
              formationId={formation.id}
              limit={3}
              paginate={false}
            />
          )}

          {/* Prospections */}
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            📞 Prospections
          </Typography>
          {!loadingProspections && (
            <ProspectionsSection
              prospections={prospections ?? []}
              formationId={formation.id}
            />
          )}

          {/* Documents */}
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            📎 Documents
          </Typography>
          <DocumentsSection documents={formation.documents} />

          {/* Actions */}
          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            <Button
              type="submit"
              variant="contained"
              color="success"
              disabled={updating || loadingChoices}
            >
              💾 Mettre à jour
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

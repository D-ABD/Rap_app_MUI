// src/pages/formations/FormationForm.tsx
import { useEffect, useState } from "react";
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
  CircularProgress,
  Grid,
  Paper,
  Divider,
} from "@mui/material";
import {
  School as SchoolIcon,
  Business as BusinessIcon,
  Numbers as NumbersIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";
import type { Formation, FormationFormDataRaw } from "../../types/formation";
import type { NomId } from "../../types/formation";


interface FormationFormProps {
  initialValues?: Partial<Formation>;
  centres: NomId[];
  statuts: NomId[];
  typeOffres: NomId[];
  loading?: boolean;
  loadingChoices?: boolean;
  onSubmit: (values: FormationFormDataRaw) => Promise<void> | void;
  onCancel?: () => void;
  submitLabel?: string;
}

export default function FormationForm({
  initialValues,
  centres,
  statuts,
  typeOffres,
  loading = false,
  loadingChoices = false,
  onSubmit,
  onCancel,
  submitLabel = "💾 Enregistrer",
}: FormationFormProps) {
  // 🧠 État local
  const [values, setValues] = useState<FormationFormDataRaw>({
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
    intitule_diplome: "",
    code_diplome: "",
    code_rncp: "",
    total_heures: 0,
    heures_distanciel: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // 🧩 1️⃣ Initialisation à partir de initialValues
  useEffect(() => {
    if (!initialValues) return;
    setValues({
      nom: initialValues.nom ?? "",
      centre_id: initialValues.centre?.id ?? null,
      type_offre_id: initialValues.type_offre?.id ?? null,
      statut_id: initialValues.statut?.id ?? null,
      start_date: initialValues.start_date ?? "",
      end_date: initialValues.end_date ?? "",
      num_kairos: initialValues.num_kairos ?? "",
      num_offre: initialValues.num_offre ?? "",
      num_produit: initialValues.num_produit ?? "",
      assistante: initialValues.assistante ?? "",
      prevus_crif: initialValues.prevus_crif ?? 0,
      prevus_mp: initialValues.prevus_mp ?? 0,
      inscrits_crif: initialValues.inscrits_crif ?? 0,
      inscrits_mp: initialValues.inscrits_mp ?? 0,
      cap: initialValues.cap ?? 0,
      convocation_envoie: initialValues.convocation_envoie ?? false,
      entree_formation: initialValues.entree_formation ?? 0,
      nombre_candidats: initialValues.nombre_candidats ?? 0,
      nombre_entretiens: initialValues.nombre_entretiens ?? 0,
      intitule_diplome: initialValues.intitule_diplome ?? "",
      code_diplome: initialValues.code_diplome ?? "",
      code_rncp: initialValues.code_rncp ?? "",
      total_heures: initialValues.total_heures ?? 0,
      heures_distanciel: initialValues.heures_distanciel ?? 0,
    });
  }, [initialValues]);

  // 🧩 2️⃣ Synchronisation quand les listes (centres / statuts / types) arrivent
  useEffect(() => {
    if (!initialValues) return;
    setValues((prev) => ({
      ...prev,
      centre_id: initialValues.centre?.id ?? prev.centre_id,
      type_offre_id: initialValues.type_offre?.id ?? prev.type_offre_id,
      statut_id: initialValues.statut?.id ?? prev.statut_id,
    }));
  }, [centres, statuts, typeOffres, initialValues]);

  // ----------------------------------------------------------------------
  // 🔹 Gestion des champs
  // ----------------------------------------------------------------------
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any
  ) => {
    const { name, value } = e.target;
    if (["centre_id", "type_offre_id", "statut_id"].includes(name)) {
      setValues((prev) => ({
        ...prev,
        [name]: value === "" ? null : Number(value),
      }));
    } else {
      setValues((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setValues((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    if (!values.nom.trim()) {
      setErrors({ nom: "Le nom est requis" });
      return;
    }

    try {
      await onSubmit(values);
    } catch (err: any) {
      if (err?.response?.data?.errors) {
        setErrors(err.response.data.errors);
      }
    }
  };

  // ----------------------------------------------------------------------
  // 🔹 Petits composants internes
  // ----------------------------------------------------------------------
  const Section = ({
    icon,
    title,
    children,
  }: {
    icon: React.ReactNode;
    title: string;
    children: React.ReactNode;
  }) => (
    <Paper
      variant="outlined"
      sx={{ p: 2.5, mb: 3, borderRadius: 2, backgroundColor: "#fafafa" }}
    >
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
        {icon}
        <Typography variant="h6" sx={{ fontWeight: 600, color: "primary.main" }}>
          {title}
        </Typography>
      </Stack>
      <Divider sx={{ mb: 2 }} />
      <Grid container spacing={2}>
        {children}
      </Grid>
    </Paper>
  );

  const Input = ({ label, name, type = "text", ...props }: any) => (
    <Grid item xs={12} sm={6}>
      <TextField
        fullWidth
        label={label}
        name={name}
        type={type}
        value={values[name as keyof FormationFormDataRaw] ?? ""}
        onChange={handleChange}
        error={!!errors[name]}
        helperText={errors[name]}
        {...props}
      />
    </Grid>
  );

console.log("🎯 Valeurs actuelles:", values);
console.log("📦 Centres:", centres);
console.log("📦 Statuts:", statuts);
console.log("📦 TypeOffres:", typeOffres);

  // ----------------------------------------------------------------------
  // 🔹 Rendu
  // ----------------------------------------------------------------------
  return (
    <Box component="form" onSubmit={handleSubmit}>
      {/* Section 1 */}
      <Section icon={<AssignmentIcon color="primary" />} title="Informations principales">
        <Input label="Nom" name="nom" required />

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Centre</InputLabel>
            <Select
              name="centre_id"
              value={values.centre_id ? String(values.centre_id) : ""}
              onChange={handleChange}
              label="Centre"
              required
            >
              {centres.map((c) => (
                <MenuItem key={c.id} value={String(c.id)}>
                  {c.nom}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Type d’offre</InputLabel>
            <Select
              name="type_offre_id"
              value={values.type_offre_id !== null && values.type_offre_id !== undefined ? String(values.type_offre_id) : ""}
              onChange={handleChange}
              label="Type d’offre"
              required
            >
              {typeOffres.map((t) => (
                <MenuItem key={t.id} value={String(t.id)}>
                  {t.nom}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Statut</InputLabel>
            <Select
              name="statut_id"
              value={values.statut_id !== null && values.statut_id !== undefined ? String(values.statut_id) : ""}
              onChange={handleChange}
              label="Statut"
              required
            >
              {statuts.map((s) => (
                <MenuItem key={s.id} value={String(s.id)}>
                  {s.nom}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Input label="Date de début" name="start_date" type="date" InputLabelProps={{ shrink: true }} />
        <Input label="Date de fin" name="end_date" type="date" InputLabelProps={{ shrink: true }} />
      </Section>

      {/* Section 2 */}
      <Section icon={<NumbersIcon color="primary" />} title="Numéros & assistante">
        <Input label="N° Kairos" name="num_kairos" />
        <Input label="N° Offre" name="num_offre" />
        <Input label="N° Produit" name="num_produit" />
        <Input label="Assistante" name="assistante" />
      </Section>

      {/* Section 3 */}
      <Section icon={<SchoolIcon color="primary" />} title="Diplôme ou titre visé">
        <Input label="Intitulé précis" name="intitule_diplome" />
        <Input label="Code diplôme" name="code_diplome" />
        <Input label="Code RNCP" name="code_rncp" />
        <Input label="Total heures" name="total_heures" type="number" />
        <Input label="Heures distanciel" name="heures_distanciel" type="number" />
      </Section>

      {/* Section 4 */}
      <Section icon={<BusinessIcon color="primary" />} title="Places & inscrits">
        {["prevus_crif", "prevus_mp", "inscrits_crif", "inscrits_mp", "cap"].map(
          (field) => (
            <Input
              key={field}
              label={field.replace("_", " ").toUpperCase()}
              name={field}
              type="number"
            />
          )
        )}
      </Section>

      {/* Section 5 */}
      <Section icon={<TrendingUpIcon color="primary" />} title="Recrutement & statistiques">
        {["entree_formation", "nombre_candidats", "nombre_entretiens"].map(
          (field) => (
            <Input
              key={field}
              label={field.replace("_", " ").toUpperCase()}
              name={field}
              type="number"
            />
          )
        )}

        <Grid item xs={12}>
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
        </Grid>
      </Section>

      {/* Boutons */}
      <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 3 }}>
        <Button
          type="submit"
          variant="contained"
          color="success"
          disabled={loading || loadingChoices}
          startIcon={loading ? <CircularProgress size={18} /> : undefined}
        >
          {loading ? "Enregistrement..." : submitLabel}
        </Button>

        {onCancel && (
          <Button variant="outlined" color="inherit" onClick={onCancel}>
            Annuler
          </Button>
        )}
      </Stack>
    </Box>
  );
}

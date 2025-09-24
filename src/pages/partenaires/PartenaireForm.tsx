// src/pages/partenaires/PartenaireForm.tsx
import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Stack,
  Button,
  Chip,
  Link,
} from "@mui/material";
import type {
  Partenaire,
  PartenaireChoicesResponse,
  CentreLite,
} from "../../types/partenaire";
import CentresSelectModal from "../../components/modals/CentresSelectModal";

type CentreOption = { value: number; label: string };

type FormProps = {
  initialValues?: Partial<Partenaire>;
  onSubmit: (values: Partial<Partenaire>) => void;
  loading: boolean;
  choices: PartenaireChoicesResponse | null;
  centreOptions?: CentreOption[];
};

const onlyDigits = (s: string) => s.replace(/\D/g, "").slice(0, 5);

function getDefaultCentreId(p: Partial<Partenaire>): number | "" {
  if (typeof p.default_centre_id === "number") return p.default_centre_id;
  const dc: CentreLite | null | undefined = p.default_centre ?? null;
  if (dc && typeof dc.id === "number") return dc.id;
  return "";
}

export default function PartenaireForm({
  initialValues = {},
  onSubmit,
  loading,
  choices,
  centreOptions,
}: FormProps) {
  const [form, setForm] = useState<Partial<Partenaire>>(initialValues);
  const [openCentreModal, setOpenCentreModal] = useState(false);

  useEffect(() => {
    setForm(initialValues);
  }, [initialValues]);

  const handleChange = <K extends keyof Partenaire>(
    field: K,
    value: Partenaire[K] | undefined
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleDefaultCentreChange = (val: string) => {
    const id = val ? Number(val) : null;
    const label =
      id != null ? centreOptions?.find((c) => c.value === id)?.label ?? null : null;

    setForm((prev) => ({
      ...prev,
      default_centre_id: id,
      default_centre: id != null ? { id, nom: label ?? `Centre #${id}` } : null,
      default_centre_nom: label,
    }));
  };

  const handleDefaultCentrePick = (c: { id: number; label: string }) => {
    setForm((prev) => ({
      ...prev,
      default_centre_id: c.id,
      default_centre: { id: c.id, nom: c.label },
      default_centre_nom: c.label,
    }));
    setOpenCentreModal(false);
  };

  const count = (s?: string | null) => (s ? s.length : 0);
  const defaultCentreId = getDefaultCentreId(form);

  return (
    <Box
      component="form"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
      aria-busy={loading || undefined}
    >
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6">Informations du partenaire</Typography>
        <Chip
          label={(form.is_active ?? true) ? "Actif" : "Inactif"}
          color={(form.is_active ?? true) ? "success" : "error"}
          variant="outlined"
        />
      </Stack>

      {/* Général */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Général
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              label="Nom (raison sociale)"
              value={form.nom || ""}
              onChange={(e) => handleChange("nom", e.target.value)}
              disabled={loading}
              required
              inputProps={{ maxLength: 255 }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              label="Type"
              value={form.type ?? ""}
              onChange={(e) =>
                handleChange("type", e.target.value ? (e.target.value as Partenaire["type"]) : undefined)
              }
              disabled={loading}
            >
              <MenuItem value="">Sélectionner…</MenuItem>
              {choices?.types?.map((t) => (
                <MenuItem key={t.value} value={t.value}>
                  {t.label}
                </MenuItem>
              ))}
            </TextField>

          </Grid>

          {/* Centre */}
          <Grid item xs={12} md={6}>
            {centreOptions && centreOptions.length > 0 ? (
              <Stack direction="row" spacing={1} alignItems="center">
                <TextField
                  select
                  fullWidth
                  label="Centre par défaut"
                  value={defaultCentreId === "" ? "" : String(defaultCentreId)}
                  onChange={(e) => handleDefaultCentreChange(e.target.value)}
                  disabled={loading}
                >
                  <MenuItem value="">Aucun</MenuItem>
                  {centreOptions.map((c) => (
                    <MenuItem key={c.value} value={c.value}>
                      {c.label}
                    </MenuItem>
                  ))}
                </TextField>
                <Button
                  variant="outlined"
                  onClick={() => setOpenCentreModal(true)}
                >
                  Parcourir…
                </Button>
              </Stack>
            ) : (
              <Stack spacing={1}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <TextField
                    type="number"
                    fullWidth
                    label="Centre par défaut (ID)"
                    value={defaultCentreId === "" ? "" : defaultCentreId}
                    onChange={(e) => handleDefaultCentreChange(e.target.value)}
                    disabled={loading}
                  />
                  <Button
                    variant="outlined"
                    onClick={() => setOpenCentreModal(true)}
                  >
                    Parcourir…
                  </Button>
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  Astuce : utilisez « Parcourir » pour choisir un centre.
                </Typography>
              </Stack>
            )}
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Secteur d’activité"
              value={form.secteur_activite || ""}
              onChange={(e) =>
                handleChange("secteur_activite", e.target.value)
              }
              disabled={loading}
              inputProps={{ maxLength: 255 }}
              helperText="Ex. Numérique, BTP, Santé…"
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Adresse */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Adresse
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Rue"
              value={form.street_name || ""}
              onChange={(e) => handleChange("street_name", e.target.value)}
              disabled={loading}
              inputProps={{ maxLength: 200 }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="Code postal"
              value={form.zip_code || ""}
              onChange={(e) =>
                handleChange("zip_code", onlyDigits(e.target.value))
              }
              disabled={loading}
              inputProps={{ maxLength: 5 }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Ville"
              value={form.city || ""}
              onChange={(e) => handleChange("city", e.target.value)}
              disabled={loading}
              inputProps={{ maxLength: 100 }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Pays"
              value={form.country || ""}
              onChange={(e) => handleChange("country", e.target.value)}
              disabled={loading}
              inputProps={{ maxLength: 100 }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Contact */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Contact
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Nom du contact"
              value={form.contact_nom || ""}
              onChange={(e) => handleChange("contact_nom", e.target.value)}
              disabled={loading}
              inputProps={{ maxLength: 255 }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Poste"
              value={form.contact_poste || ""}
              onChange={(e) => handleChange("contact_poste", e.target.value)}
              disabled={loading}
              inputProps={{ maxLength: 255 }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Téléphone"
              value={form.contact_telephone || ""}
              onChange={(e) => handleChange("contact_telephone", e.target.value)}
              disabled={loading}
              inputProps={{ maxLength: 20 }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="email"
              label="Email"
              value={form.contact_email || ""}
              onChange={(e) =>
                handleChange("contact_email", e.target.value.trim().toLowerCase())
              }
              disabled={loading}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Web */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Web & Réseaux
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="url"
              label="Site web"
              value={form.website || ""}
              onChange={(e) => handleChange("website", e.target.value)}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="url"
              label="Réseau social"
              value={form.social_network_url || ""}
              onChange={(e) => handleChange("social_network_url", e.target.value)}
              disabled={loading}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Action commerciale */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Action
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              label="Type d’action"
              value={form.actions ?? ""}
              onChange={(e) =>
                handleChange("actions", e.target.value ? (e.target.value as Partenaire["actions"]) : null)
              }
              disabled={loading}
            >
              <MenuItem value="">Sélectionner…</MenuItem>
              {choices?.actions?.map((a) => (
                <MenuItem key={a.value} value={a.value}>
                  {a.label}
                </MenuItem>
              ))}
            </TextField>

          </Grid>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              multiline
              minRows={3}
              label={`Description de l’action (${count(
                form.action_description
              )}/1000)`}
              value={form.action_description || ""}
              onChange={(e) =>
                handleChange("action_description", e.target.value)
              }
              disabled={loading}
              inputProps={{ maxLength: 1000 }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Description */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Description
        </Typography>
        <TextField
          fullWidth
          multiline
          minRows={4}
          label={`Informations complémentaires (${count(
            form.description
          )}/2000)`}
          value={form.description || ""}
          onChange={(e) => handleChange("description", e.target.value)}
          disabled={loading}
          inputProps={{ maxLength: 2000 }}
        />
      </Paper>

      {/* Statut */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={form.is_active ?? true}
                onChange={(e) =>
                  handleChange("is_active", e.target.checked)
                }
                disabled={loading}
              />
            }
            label="Partenaire actif"
          />
          {form.website ? (
            <Link href={String(form.website)} target="_blank" rel="noreferrer">
              Ouvrir le site ↗
            </Link>
          ) : (
            <Typography variant="caption" color="text.secondary">
              Aucun site renseigné
            </Typography>
          )}
        </Stack>
      </Paper>

      {/* Actions */}
      <Stack direction="row" justifyContent="flex-end" spacing={2}>
        <Button
          variant="outlined"
          onClick={() => setForm(initialValues)}
          disabled={loading}
        >
          Réinitialiser
        </Button>
        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </Stack>

      {/* Modal sélection centre */}
      <CentresSelectModal
        show={openCentreModal}
        onClose={() => setOpenCentreModal(false)}
        onSelect={handleDefaultCentrePick}
      />
    </Box>
  );
}

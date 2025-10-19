// src/pages/candidats/CandidatDetailModal.tsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Grid,
  Typography,
  Divider,
  Paper,
  CircularProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import type { Candidat } from "../../types/candidat";

/* ---------- Helpers ---------- */
const dtfFR =
  typeof Intl !== "undefined" ? new Intl.DateTimeFormat("fr-FR") : undefined;
const fmt = (iso?: string | null): string => {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : dtfFR
    ? dtfFR.format(d)
    : d.toLocaleDateString("fr-FR");
};
const nn = (s?: string | null) => (s ?? "").toString().trim() || "—";
const yn = (b?: boolean | null) =>
  typeof b === "boolean" ? (b ? "Oui" : "Non") : "—";

/* ---------- Props ---------- */
interface Props {
  open: boolean;
  onClose: () => void;
  candidat?: Candidat | null;
  loading?: boolean;
  onEdit?: (id: number) => void;
}

/* ---------- Component ---------- */
export default function CandidatDetailModal({
  open,
  onClose,
  candidat,
  loading = false,
  onEdit,
}: Props) {
  if (!open) return null;

  const f = candidat?.formation_info ?? null;
  const la = candidat?.last_appairage ?? null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      scroll="paper"
      disableEnforceFocus
    >
      {/* ────── En-tête ────── */}
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography component="div" variant="h6" fontWeight={700}>
          👤 Détail du candidat
        </Typography>
        <Button onClick={onClose} variant="outlined">
          Fermer
        </Button>
      </DialogTitle>

      {/* ────── Contenu ────── */}
      <DialogContent dividers>
        {loading || !candidat ? (
          <Box textAlign="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
            <Grid container spacing={3}>
              {/* ───────────── Identité ───────────── */}
              <Grid item xs={12}>
                <Section title="Identité">
                  <Field label="Nom" value={nn(candidat.nom)} />
                  <Field label="Prénom" value={nn(candidat.prenom)} />
                  <Field label="Email" value={nn(candidat.email)} />
                  <Field label="Téléphone" value={nn(candidat.telephone)} />
                  <Field label="Date de naissance" value={fmt(candidat.date_naissance)} />
                  <Field label="Nationalité" value={nn(candidat.nationalite)} />
                </Section>
              </Grid>

              {/* ───────────── Adresse ───────────── */}
              <Grid item xs={12}>
                <Section title="Adresse">
                  <Field label="Rue" value={nn(candidat.street_name)} />
                  <Field label="Ville" value={nn(candidat.ville)} />
                  <Field label="Code postal" value={nn(candidat.code_postal)} />
                </Section>
              </Grid>

              {/* ───────────── Formation ───────────── */}
              <Grid item xs={12}>
                <Section title="Formation">
                  <Field label="Nom formation" value={nn(f?.nom)} />
                  <Field label="Centre" value={nn(f?.centre?.nom)} />
                  <Field label="Dates" value={`${fmt(f?.date_debut)} → ${fmt(f?.date_fin)}`} />
                  <Field label="Type d’offre" value={nn(f?.type_offre?.nom ?? f?.type_offre?.libelle)} />
                </Section>
              </Grid>

              {/* ───────────── Contrat / Statut ───────────── */}
              <Grid item xs={12}>
                <Section title="Contrat et statut">
                  <Field label="Statut" value={nn(candidat.statut)} />
                  <Field label="Type de contrat" value={nn(candidat.type_contrat)} />
                  <Field label="Disponibilité" value={nn(candidat.disponibilite)} />
                  <Field label="Permis B" value={yn(candidat.permis_b)} />
                  <Field label="RQTH" value={yn(candidat.rqth)} />
                </Section>
              </Grid>

              {/* ───────────── Dernier appairage ───────────── */}
              <Grid item xs={12}>
                <Section title="Dernier appairage">
                  <Field label="Partenaire" value={nn(la?.partenaire_nom)} />
                  <Field label="Statut" value={nn(la?.statut_display ?? la?.statut)} />
                  <Field label="Date d’appairage" value={fmt(la?.date_appairage)} />
                  <Field label="Commentaire" value={nn(la?.commentaire)} />
                </Section>
              </Grid>

              {/* ───────────── Métadonnées ───────────── */}
              <Grid item xs={12}>
                <Section title="Méta / Système">
                  <Field label="Date inscription" value={fmt(candidat.date_inscription)} />
                  <Field label="Créé le" value={fmt(candidat.created_at)} />
                  <Field label="Mis à jour le" value={fmt(candidat.updated_at)} />
                  <Field
                    label="Créé par"
                    value={
                      candidat.created_by
                        ? typeof candidat.created_by === "object"
                          ? nn(candidat.created_by.full_name)
                          : `ID ${candidat.created_by}`
                        : "—"
                    }
                  />
                </Section>
              </Grid>
            </Grid>
          </Paper>
        )}
      </DialogContent>

      {/* ────── Actions ────── */}
      <DialogActions sx={{ justifyContent: "space-between", px: 3, py: 2 }}>
        {candidat && onEdit && candidat.id != null && (
          <Button
            startIcon={<EditIcon />}
            color="primary"
            variant="contained"
            onClick={() => onEdit(candidat.id)}
          >
            Modifier
          </Button>
        )}
        <Button variant="outlined" onClick={onClose}>
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/* ---------- Sous-composants ---------- */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography
        variant="subtitle1"
        sx={{ fontWeight: 600, color: "primary.main", mb: 0.5 }}
      >
        {title}
      </Typography>
      <Divider sx={{ mb: 1 }} />
      <Grid container spacing={1}>
        {children}
      </Grid>
    </Box>
  );
}

function Field({ label, value }: { label: string; value?: string | number | null }) {
  const display =
    value === null ||
    value === undefined ||
    value === "—" ||
    (typeof value === "string" && !value.trim())
      ? (
        <span style={{ color: "red", fontStyle: "italic", opacity: 0.85 }}>
          — NC
        </span>
      )
      : value;

  return (
    <Grid item xs={12} sm={6}>
      <Typography variant="body2">
        <strong>{label} :</strong> {display}
      </Typography>
    </Grid>
  );
}

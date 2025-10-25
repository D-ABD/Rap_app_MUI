// src/components/modals/FormationDetailModal.tsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Divider,
  Grid,
  Box,
  Button,
  CircularProgress,
  Paper,
} from "@mui/material";
import { useFormation } from "../../hooks/useFormations";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FormationCommentsModal from "../../components/modals/FormationCommentsModal";

/* ---------- Types ---------- */
type Props = {
  open: boolean;
  onClose: () => void;
  formationId: number;
};

/* ---------- Helpers ---------- */
const dtfFR =
  typeof Intl !== "undefined"
    ? new Intl.DateTimeFormat("fr-FR", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : undefined;

const fmt = (iso?: string | null): string => {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : dtfFR ? dtfFR.format(d) : d.toLocaleDateString("fr-FR");
};

const nn = (s?: string | number | null) =>
  s === null || s === undefined || s === "" ? "—" : String(s);

const yn = (b?: boolean | null) => (typeof b === "boolean" ? (b ? "Oui" : "Non") : "—");

/* ---------- Composant principal ---------- */
export default function FormationDetailModal({ open, onClose, formationId }: Props) {
  const { data: formation, loading, error } = useFormation(formationId);
  const [openComments, setOpenComments] = useState(false);
  const navigate = useNavigate();

  if (!open) return null;

  if (loading)
    return (
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
        <DialogContent sx={{ textAlign: "center", py: 5 }}>
          <CircularProgress />
        </DialogContent>
      </Dialog>
    );

  if (error || !formation)
    return (
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
        <DialogContent>
          <Typography color="error">Erreur lors du chargement de la formation.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Fermer</Button>
        </DialogActions>
      </Dialog>
    );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      scroll="paper"
      disableEnforceFocus
    >
      <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
        📘 Détail de la formation :{" "}
        <Typography component="span" color="primary" fontWeight={600}>
          {formation.nom}
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Grid container spacing={2}>
            {/* ─────────── Identité ─────────── */}
            <Grid item xs={12}>
              <Section title="Identité">
                <Field label="Nom" value={nn(formation.nom)} />
                <Field label="Centre" value={formation.centre?.nom ?? "—"} />
                <Field label="Type d’offre" value={formation.type_offre?.libelle ?? "—"} />
                <Field label="Statut" value={formation.statut?.libelle ?? "—"} />

                {/* 🆕 Activité */}
                <Field
                  label="Activité"
                  value={
                    formation.activite === "archivee"
                      ? "Archivée"
                      : formation.activite === "active"
                        ? "Active"
                        : "—"
                  }
                />

                <Field label="Active" value={yn(formation.is_active)} />
                <Field label="Statut temporel" value={nn(formation.status_temporel)} />
                <Field label="À recruter" value={yn(formation.is_a_recruter)} />
              </Section>
            </Grid>

            {/* ─────────── Dates ─────────── */}
            <Grid item xs={12}>
              <Section title="Dates">
                <Field label="Date de début" value={fmt(formation.start_date)} />
                <Field label="Date de fin" value={fmt(formation.end_date)} />
                <Field label="Créée le" value={fmt(formation.created_at)} />
                <Field label="Mise à jour le" value={fmt(formation.updated_at)} />
              </Section>
            </Grid>

            {/* ─────────── Références ─────────── */}
            <Grid item xs={12}>
              <Section title="Références administratives">
                <Field label="N° Kairos" value={nn(formation.num_kairos)} />
                <Field label="N° Offre" value={nn(formation.num_offre)} />
                <Field label="N° Produit" value={nn(formation.num_produit)} />
                <Field label="Assistante" value={nn(formation.assistante)} />
                <Field label="Convocation envoyée" value={yn(formation.convocation_envoie)} />
              </Section>
            </Grid>

            {/* ─────────── Diplôme ─────────── */}
            <Grid item xs={12}>
              <Section title="Diplôme ou titre visé">
                <Field label="Intitulé" value={nn(formation.intitule_diplome)} />
                <Field label="Code diplôme" value={nn(formation.code_diplome)} />
                <Field label="Code RNCP" value={nn(formation.code_rncp)} />
                <Field label="Total heures" value={nn(formation.total_heures)} />
                <Field label="Heures distanciel" value={nn(formation.heures_distanciel)} />
              </Section>
            </Grid>

            {/* ─────────── Places & inscrits ─────────── */}
            <Grid item xs={12}>
              <Section title="Places et inscrits">
                <Field label="Capacité" value={nn(formation.cap)} />
                <Field label="Prévu CRIF" value={nn(formation.prevus_crif)} />
                <Field label="Prévu MP" value={nn(formation.prevus_mp)} />
                <Field label="Inscrits CRIF" value={nn(formation.inscrits_crif)} />
                <Field label="Inscrits MP" value={nn(formation.inscrits_mp)} />
                <Field label="Inscrits total" value={nn(formation.inscrits_total)} />
                <Field label="Prévu total" value={nn(formation.prevus_total)} />
                <Field label="Places restantes" value={nn(formation.places_restantes)} />
                <Field label="À recruter (nb)" value={nn(formation.a_recruter)} />
              </Section>
            </Grid>

            {/* ─────────── Statistiques & indicateurs ─────────── */}
            <Grid item xs={12}>
              <Section title="Statistiques et indicateurs">
                <Field label="Entrées en formation" value={nn(formation.entree_formation)} />
                <Field label="Candidats" value={nn(formation.nombre_candidats)} />
                <Field label="Entretiens" value={nn(formation.nombre_entretiens)} />
                <Field label="Événements" value={nn(formation.nombre_evenements)} />
                <Field label="Saturation" value={nn(formation.saturation)} />
                <Field label="Badge saturation" value={nn(formation.saturation_badge)} />
                <Field label="Badge label" value={nn(formation.saturation_badge_label)} />
                <Field label="Taux de transformation" value={nn(formation.taux_transformation)} />
                <Field label="Badge transformation" value={nn(formation.transformation_badge)} />
              </Section>
            </Grid>

            {/* ─────────── Relations ─────────── */}
            <Grid item xs={12}>
              <Section title="Relations et liaisons">
                <Field
                  label="Partenaires"
                  value={
                    formation.partenaires?.length
                      ? formation.partenaires.map((p) => p.nom).join(", ")
                      : "—"
                  }
                />
                <Field
                  label="Prospections"
                  value={
                    formation.prospections?.length
                      ? `${formation.prospections.length} prospections`
                      : "—"
                  }
                />
                <Field
                  label="Documents"
                  value={
                    formation.documents?.length ? `${formation.documents.length} documents` : "—"
                  }
                />
                <Field
                  label="Commentaires"
                  value={
                    formation.commentaires?.length ? (
                      <Button
                        variant="outlined"
                        size="small"
                        color="primary"
                        onClick={() => setOpenComments(true)}
                      >
                        Voir ({formation.commentaires.length})
                      </Button>
                    ) : (
                      <Button
                        variant="text"
                        size="small"
                        color="primary"
                        onClick={() => setOpenComments(true)}
                      >
                        Ajouter un commentaire
                      </Button>
                    )
                  }
                />
              </Section>
            </Grid>
          </Grid>
        </Paper>
      </DialogContent>

      {/* ✅ Actions principales : Fermer + Modifier */}
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="outlined" onClick={onClose}>
          Fermer
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate(`/formations/${formation.id}/edit`)}
        >
          Modifier
        </Button>
      </DialogActions>

      {/* ✅ Sous-modale : commentaires */}
      <FormationCommentsModal
        open={openComments}
        onClose={() => setOpenComments(false)}
        formationId={formation.id}
      />
    </Dialog>
  );
}

/* ---------- Sous-composants ---------- */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "primary.main" }}>
        {title}
      </Typography>
      <Divider sx={{ mb: 1 }} />
      <Grid container spacing={1}>
        {children}
      </Grid>
    </Box>
  );
}

function Field({ label, value }: { label: string; value: string | number | React.ReactNode }) {
  const str = typeof value === "number" ? String(value) : value;
  const isMissing =
    str === null ||
    str === undefined ||
    str === "" ||
    str === "—" ||
    (typeof str === "string" && !str.trim());

  return (
    <Grid item xs={12} sm={6}>
      <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
        <strong>{label} :</strong>{" "}
        {isMissing ? (
          <span style={{ color: "red", fontStyle: "italic", opacity: 0.8 }}>— NC</span>
        ) : (
          str
        )}
      </Typography>
    </Grid>
  );
}

// src/pages/prospections/ProspectionDetail.tsx
import {
  Box,
  Grid,
  Typography,
  Link,
  Paper,
} from "@mui/material";
import { ProspectionDetailDTO } from "../../types/prospection";

const dtfFR = new Intl.DateTimeFormat("fr-FR");
const fmt = (iso?: string | null): string => {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : dtfFR.format(d);
};

const telHref = (s?: string | null): string =>
  s ? `tel:${s.replace(/[^\d+]/g, "")}` : "";
const mailHref = (s?: string | null): string =>
  s ? `mailto:${s}` : "";

type Props = {
  prospection: ProspectionDetailDTO;
  formationFallback?: {
    nom: string | null;
    start_date?: string | null;
    end_date?: string | null;
    num_offre?: string | null;
  } | null;
};

export default function ProspectionDetail({
  prospection,
  formationFallback,
}: Props) {
  const formationNom =
    prospection.formation_nom ?? formationFallback?.nom ?? null;
  const formationDateDebut =
    prospection.formation_date_debut ?? formationFallback?.start_date ?? null;
  const formationDateFin =
    prospection.formation_date_fin ?? formationFallback?.end_date ?? null;
  const numOffre =
    prospection.num_offre ?? formationFallback?.num_offre ?? null;

  return (
    <Paper
      variant="outlined"
      sx={{ p: 2, mb: 2, fontSize: "0.95rem" }}
    >
      <Grid container spacing={2}>
        {/* Bloc partenaire */}
        <Grid item xs={12} md={4}>
          <Typography variant="subtitle2">Partenaire</Typography>
          <Typography>{prospection.partenaire_nom || "—"}</Typography>
          <Typography color="text.secondary">
            {prospection.partenaire_ville || "—"}
          </Typography>
          {prospection.centre_nom && (
            <Typography>Centre : {prospection.centre_nom}</Typography>
          )}
        </Grid>

        {/* Bloc contacts */}
        <Grid item xs={12} md={4}>
          <Typography variant="subtitle2">Contacts</Typography>
          <Typography>
            {prospection.partenaire_tel ? (
              <Link href={telHref(prospection.partenaire_tel)}>
                {prospection.partenaire_tel}
              </Link>
            ) : (
              "Téléphone —"
            )}
          </Typography>
          <Typography>
            {prospection.partenaire_email ? (
              <Link href={mailHref(prospection.partenaire_email)}>
                {prospection.partenaire_email}
              </Link>
            ) : (
              "Email —"
            )}
          </Typography>
        </Grid>

        {/* Bloc formation */}
        <Grid item xs={12} md={4}>
          <Typography variant="subtitle2">Formation</Typography>
          <Typography>
            {formationNom || "—"} {numOffre ? ` — ${numOffre}` : ""}
          </Typography>
          <Typography color="text.secondary">
            {formationDateDebut || formationDateFin
              ? `${fmt(formationDateDebut)} → ${fmt(formationDateFin)}`
              : "Dates —"}
          </Typography>
          {prospection.type_offre_display && (
            <Typography>Type offre : {prospection.type_offre_display}</Typography>
          )}
          {prospection.formation_statut_display && (
            <Typography>
              Statut formation : {prospection.formation_statut_display}
            </Typography>
          )}
          {typeof prospection.places_disponibles === "number" && (
            <Typography>Places : {prospection.places_disponibles}</Typography>
          )}
        </Grid>

        {/* Bloc détails prospection */}
        <Grid item xs={12} md={4}>
          <Typography variant="subtitle2">Détails prospection</Typography>
          <Typography>
            Type : {prospection.type_prospection_display || "—"}
          </Typography>
          <Typography>Motif : {prospection.motif_display || "—"}</Typography>
          <Typography>
            Objectif : {prospection.objectif_display || "—"}
          </Typography>
          <Typography>Statut : {prospection.statut_display || "—"}</Typography>
          <Typography>
            Moyen contact : {prospection.moyen_contact_display || "—"}
          </Typography>
        </Grid>

        {/* Bloc méta */}
        <Grid item xs={12} md={4}>
          <Typography variant="subtitle2">Méta</Typography>
          <Typography>Créé par : {prospection.created_by || "—"}</Typography>
          <Typography>Créé le : {fmt(prospection.created_at)}</Typography>
          <Typography>Mis à jour : {fmt(prospection.updated_at)}</Typography>
          <Typography>
            Responsable : {prospection.owner_username || "—"}
          </Typography>
        </Grid>

        {/* Bloc commentaires */}
        <Grid item xs={12} md={4}>
          <Typography variant="subtitle2">Commentaires</Typography>
          <Typography>
            Dernier : {prospection.last_comment || "—"} (
            {fmt(prospection.last_comment_at)})
          </Typography>
          <Typography>
            Total : {prospection.comments_count ?? "—"}
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );
}

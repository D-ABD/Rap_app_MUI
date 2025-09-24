// src/pages/candidats/CandidatDetailPage.tsx
import { Box, Grid, Paper, Typography } from "@mui/material";
import type { Candidat } from "../../types/candidat";

/* ---------- Types ---------- */
export type CandidatDetailDTO = Candidat; // extensible si besoin plus tard

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
const nn = (s?: string | null) => (s ?? "").trim() || "—";

/* ---------- Props ---------- */
type Props = {
  candidat: CandidatDetailDTO;
};

/* ---------- Component ---------- */
export default function CandidatDetail({ candidat }: Props) {
  const f = candidat.formation_info ?? null;
  const la = candidat.last_appairage ?? null;

  return (
    <Paper
      variant="outlined"
      sx={{ p: 2, mb: 2, fontSize: "0.95rem" }}
    >
      <Grid container spacing={2}>
        {/* Infos perso */}
        <Grid item xs={12} md={3}>
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Candidat
            </Typography>
            <div>Nom : {nn(candidat.nom)}</div>
            <div>Prénom : {nn(candidat.prenom)}</div>
            <div>Email : {nn(candidat.email)}</div>
            <div>Téléphone : {nn(candidat.telephone)}</div>
          </Box>
        </Grid>

        {/* Formation */}
        <Grid item xs={12} md={3}>
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Formation
            </Typography>
            <div>{nn(f?.nom)}</div>
            <div>
              Dates : {fmt(f?.date_debut)} → {fmt(f?.date_fin)}
            </div>
            {f?.num_offre && <div>N° offre : {f.num_offre}</div>}
            {f?.centre?.nom && <div>Centre : {f.centre.nom}</div>}
            {f?.type_offre && (
              <div>Type : {nn(f.type_offre.nom ?? f.type_offre.libelle)}</div>
            )}
          </Box>
        </Grid>

        {/* Dernier appairage */}
        <Grid item xs={12} md={3}>
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Dernier appairage
            </Typography>
            <div>Partenaire : {nn(la?.partenaire_nom)}</div>
            <div>Statut : {nn(la?.statut_display ?? la?.statut)}</div>
            <div>Date : {fmt(la?.date_appairage)}</div>
            <div>Retour : {fmt(la?.date_retour)}</div>
            {la?.commentaire && <div>Commentaire : {la.commentaire}</div>}
            {la?.retour_partenaire && (
              <div>Retour partenaire : {la.retour_partenaire}</div>
            )}
          </Box>
        </Grid>

        {/* Méta */}
        <Grid item xs={12} md={3}>
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Méta
            </Typography>
            <div>Créé le : {fmt(candidat.created_at)}</div>
            <div>Maj : {fmt(candidat.updated_at)}</div>
            <div>
              Créé par :{" "}
              {candidat.created_by
                ? typeof candidat.created_by === "object"
                  ? nn(candidat.created_by.full_name)
                  : nn(String(candidat.created_by))
                : "—"}
            </div>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}

// src/pages/appairages/AppairageDetails.tsx
import { Box, Grid, Paper, Typography } from "@mui/material";
import type { Appairage } from "../../types/appairage";

interface Props {
  appairage: Appairage;
}

export default function AppairageDetails({ appairage }: Props) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        mb: 2,
        fontSize: "0.95rem",
      }}
    >
      <Grid container spacing={2}>
        {/* Partenaire */}
        <Grid item xs={12} md={3}>
          <Section title="Partenaire">
            <Item label="Nom" value={appairage.partenaire_nom} />
            <Item label="Email" value={appairage.partenaire_email} />
            <Item label="Téléphone" value={appairage.partenaire_telephone} />
          </Section>
        </Grid>

        {/* Candidat */}
        <Grid item xs={12} md={3}>
          <Section title="Candidat">
            <Item label="Nom" value={appairage.candidat_nom} />
          </Section>
        </Grid>

        {/* Formation */}
        <Grid item xs={12} md={3}>
          <Section title="Formation">
            <Item label="Nom" value={appairage.formation_nom} />
            <Item label="Type" value={appairage.formation_type_offre} />
            <Item label="Centre" value={appairage.formation_centre} />
            <Item label="Statut" value={appairage.formation_statut} />
            <Item
              label="Places"
              value={
                appairage.formation_places_disponibles != null &&
                appairage.formation_places_total != null
                  ? `${appairage.formation_places_disponibles} / ${appairage.formation_places_total}`
                  : "—"
              }
            />
            <Item
              label="Dates"
              value={
                appairage.formation_date_debut || appairage.formation_date_fin
                  ? `${appairage.formation_date_debut ?? "?"} → ${appairage.formation_date_fin ?? "?"}`
                  : "—"
              }
            />
            <Item label="Numéro offre" value={appairage.formation_numero_offre} />
          </Section>
        </Grid>

        {/* Audit */}
        <Grid item xs={12} md={3}>
          <Section title="Audit">
            <Item label="Statut appairage" value={appairage.statut_display} />
            <Item label="Créé par" value={appairage.created_by_nom} />
            <Item
              label="Créé le"
              value={
                appairage.created_at
                  ? new Date(appairage.created_at).toLocaleString()
                  : null
              }
            />
            <Item label="MAJ par" value={appairage.updated_by_nom} />
            <Item
              label="MAJ le"
              value={
                appairage.updated_at
                  ? new Date(appairage.updated_at).toLocaleString()
                  : null
              }
            />
          </Section>
        </Grid>
      </Grid>
    </Paper>
  );
}

/* 🔹 Petits composants internes pour éviter la répétition */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        {title}
      </Typography>
      {children}
    </Box>
  );
}

function Item({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <Typography variant="body2" sx={{ mb: 0.5 }}>
      <strong>{label} :</strong> {value ?? "—"}
    </Typography>
  );
}

// src/pages/widgets/overviewDashboard/OverviewDashboard.tsx
import * as React from "react";
import { Grid } from "@mui/material";
import FormationOverviewWidget from "./FormationOverviewWidget";
import FormationOverviewWidget2 from "./FormationOverviewWidget2";
import ProspectionOverviewWidget from "./ProspectionOverviewWidget";
import AppairageOverviewWidget from "./AppairageOverviewWidget";
import CandidatOverviewWidget from "./CandidatOverviewWidget";
import AteliersTREOverviewWidget from "./AteliersTREOverviewWidget";
import FormationPlacesWidget from "./FormationPlacesWidget";
import CandidatContratOverviewWidget from "./CandidatContratOverviewWidget";

export default function OverviewDashboard() {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={4}>
        <FormationOverviewWidget title="Overview Formations" />
      </Grid>

      <Grid item xs={12} md={4}>
        <FormationOverviewWidget2 title="Overview Formations2" />
      </Grid>

      <Grid item xs={12} md={4}>
        <FormationPlacesWidget title="Overview Formations places" />
      </Grid>

      <Grid item xs={12} md={4}>
        <CandidatOverviewWidget title="Overview Candidats" />
      </Grid>

      <Grid item xs={12} md={4}>
        <CandidatContratOverviewWidget title="Overview Candidats Contrats" />
      </Grid>

      <Grid item xs={12} md={4}>
        <ProspectionOverviewWidget title="Overview Prospections" />
      </Grid>

      <Grid item xs={12} md={4}>
        <AppairageOverviewWidget />
      </Grid>

      <Grid item xs={12} md={4}>
        <AteliersTREOverviewWidget />
      </Grid>
    </Grid>
  );
}

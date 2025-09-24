// src/pages/DashboardPage.tsx
import { Link as RouterLink } from "react-router-dom";
import { Typography, Button, Grid } from "@mui/material";
import { useAuth } from "../hooks/useAuth";
import PageWrapper from "../components/PageWrapper"; // ✅

import GroupedDashboard from "./widgets/groupeddashboard/GroupedDashboard";
import SaturationDashboard from "./widgets/saturationdashboard/SarurationDashboard";
import FormationOverviewDashboard from "./widgets/overviewDashboard/FormationOverviewDashboard";
import CandidatsOverviewDashboard from "./widgets/overviewDashboard/CandidatsOverviewDashboard";
import ProspectionOverviewWidget from "./widgets/overviewDashboard/ProspectionOverviewWidget";
import AppairageOverviewWidget from "./widgets/overviewDashboard/AppairageOverviewWidget";
import AteliersTREOverviewWidget from "./widgets/overviewDashboard/AteliersTREOverviewWidget";

const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <PageWrapper maxWidth="lg">
      <Typography variant="h5" gutterBottom>
        Bienvenue, {user?.email || "utilisateur"} 👋
      </Typography>

      <Typography variant="body1" gutterBottom>
        Ceci est votre tableau de bord.
      </Typography>

      <Button
        variant="contained"
        component={RouterLink}
        to="/parametres"
        sx={{ mt: 2 }}
      >
        Aller aux paramètres
      </Button>

      {/* Saturation */}
      <SaturationDashboard />

      {/* Formations + Candidats */}
      <FormationOverviewDashboard />
      <CandidatsOverviewDashboard />

      {/* 📌 Prospection + Appairage + Ateliers TRE côte à côte */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <ProspectionOverviewWidget />
        </Grid>
        <Grid item xs={12} md={4}>
          <AppairageOverviewWidget />
        </Grid>
        <Grid item xs={12} md={4}>
          <AteliersTREOverviewWidget />
        </Grid>
      </Grid>

      {/* Autres widgets */}
      <GroupedDashboard />
    </PageWrapper>
  );
};

export default DashboardPage;

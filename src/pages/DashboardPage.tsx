// ======================================================
// src/pages/DashboardPage.tsx
// Version brute — sans Accordion, ni styles superposés
// ======================================================

import { Link as RouterLink } from "react-router-dom";
import { Typography, Button, Grid, Box } from "@mui/material";
import { useAuth } from "../hooks/useAuth";
import PageWrapper from "../components/PageWrapper";

// Widgets
import FormationSaturationWidget from "./widgets/saturationdashboard/FormationSaturationWidget";
import ProspectionConversionKpi from "./widgets/saturationdashboard/ProspectionConversionKpi";
import AppairageConversionKpi from "./widgets/saturationdashboard/AppairageSaturationWidget";

import FormationOverviewWidget from "./widgets/overviewDashboard/FormationOverviewWidget";
import FormationOverviewWidget2 from "./widgets/overviewDashboard/FormationOverviewWidget2";
import FormationPlacesWidget from "./widgets/overviewDashboard/FormationPlacesWidget";

import CandidatOverviewWidget from "./widgets/overviewDashboard/CandidatOverviewWidget";
import CandidatContratOverviewWidget from "./widgets/overviewDashboard/CandidatContratOverviewWidget";

import ProspectionOverviewWidget from "./widgets/overviewDashboard/ProspectionOverviewWidget";
import AppairageOverviewWidget from "./widgets/overviewDashboard/AppairageOverviewWidget";
import AteliersTREOverviewWidget from "./widgets/overviewDashboard/AteliersTREOverviewWidget";

import ProspectionGroupedWidget from "./widgets/groupeddashboard/ProspectionGroupedWidget";
import FormationGroupedWidget from "./widgets/groupeddashboard/FormationGroupedWidget";
import AppairageGroupedTableWidget from "./widgets/groupeddashboard/AppairageGroupedTableWidget";
import CandidatGroupedTableWidget from "./widgets/groupeddashboard/CandidatGroupedTableWidget";
import AteliersTREGroupedWidget from "./widgets/groupeddashboard/AteliersTREGroupedWidget";

import AppairageCommentStatsDashboard from "./widgets/commentsDahboard/AppairageCommentStatsDashboard";
import CommentaireStatsDashboard from "./widgets/commentsDahboard/CommentaireStatsDashboard";
import ProspectionCommentStatsDashboard from "./widgets/commentsDahboard/ProspectionCommentStatsDashboard";

const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <PageWrapper maxWidth="lg">
      <Box display="flex" flexDirection="column" gap={4}>
        {/* 🧩 HEADER */}
        <Box>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Bienvenue, {user?.email || "utilisateur"} 👋
          </Typography>
          <Typography variant="body1" color="text.secondary">
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
        </Box>

        {/* SECTION : Indicateurs clés */}
        <Box>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Indicateurs clés
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <FormationSaturationWidget title="Saturation Formations" />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <ProspectionConversionKpi title="Tx transformation Prospections" />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <AppairageConversionKpi title="Tx transformation Appairages" />
            </Grid>
          </Grid>
        </Box>

        {/* SECTION : Stats Formations */}
        <Box>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Stats Formations
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <FormationOverviewWidget title="Répartition formations" />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormationOverviewWidget2 title="Types d’offres" />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormationPlacesWidget title="Places disponibles" />
            </Grid>
          </Grid>
        </Box>

        {/* SECTION : Stats Candidats */}
        <Box>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Stats Candidats
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <CandidatOverviewWidget title="Statuts candidats" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CandidatContratOverviewWidget title="Répartition contrats" />
            </Grid>
          </Grid>
        </Box>

        {/* SECTION : Suivi Prospection / Appairage / Ateliers */}
        <Box>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Suivi (Prospection / Appairage / Ateliers)
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <ProspectionOverviewWidget title="Overview Prospections" />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <AppairageOverviewWidget />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <AteliersTREOverviewWidget />
            </Grid>
          </Grid>
        </Box>

        {/* SECTION : Analyse groupée */}
        <Box>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Analyse groupée
          </Typography>
          <FormationGroupedWidget />
          <CandidatGroupedTableWidget />
          <AppairageGroupedTableWidget />
          <ProspectionGroupedWidget />
          <AteliersTREGroupedWidget />
        </Box>

        {/* SECTION : Commentaires */}
        <Box>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Derniers commentaires
          </Typography>
          <CommentaireStatsDashboard />
        </Box>

        <Box>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Derniers commentaires d’appairage
          </Typography>
          <AppairageCommentStatsDashboard />
        </Box>

        <Box>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Derniers commentaires de prospection
          </Typography>
          <ProspectionCommentStatsDashboard />
        </Box>
      </Box>
    </PageWrapper>
  );
};

export default DashboardPage;

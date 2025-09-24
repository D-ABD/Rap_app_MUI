// src/pages/DashboardPage.tsx
import { Link as RouterLink } from "react-router-dom";
import {
  Typography,
  Button,
  Grid,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
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

  const coloredAccordion = (
    children: React.ReactNode,
    title: string,
    color: string,
    expanded = false
  ) => (
    <Accordion
      defaultExpanded={expanded}
      sx={{
        borderRadius: 2,
        mb: 2,
        overflow: "hidden",
        boxShadow: "none", // 🔹 supprime l’ombre épaisse
        border: "1px solid rgba(0,0,0,0.08)", // 🔹 ligne fine autour
        "&:before": { display: "none" }, // 🔹 supprime la ligne par défaut MUI
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon htmlColor="#fff" />}
        sx={{
          backgroundColor: color,
          color: "#fff",
          minHeight: 10, // 🔹 réduit la hauteur
          "& .MuiAccordionSummary-content": { my: 0.5 }, // 🔹 resserre le contenu
          "&:hover": { opacity: 0.95 },
        }}
      >
        <Typography fontWeight="bold" variant="body1">
          {`Afficher / Masquer : ${title}`}
        </Typography>
      </AccordionSummary>
      <AccordionDetails
        sx={{
          backgroundColor: "#fafafa",
          borderTop: "1px solid rgba(0,0,0,0.06)", // 🔹 fine séparation
        }}
      >
        {children}
      </AccordionDetails>
    </Accordion>
  );

  return (
    <PageWrapper maxWidth="lg">
      {/* 🔹 Header */}
      <Box mb={3}>
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

      {/* ======================== */}
      {/* 🔹 Sections */}
      {/* ======================== */}
      {coloredAccordion(
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
        </Grid>,
        "Indicateurs clés",
        "#1976d2",
        true
      )}

      {coloredAccordion(
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
        </Grid>,
        "Stats Formations",
        "#388e3c"
      )}

      {coloredAccordion(
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <CandidatOverviewWidget title="Statuts candidats" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <CandidatContratOverviewWidget title="Répartition contrats" />
          </Grid>
        </Grid>,
        "Stats Candidats",
        "#f57c00"
      )}

      {coloredAccordion(
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
        </Grid>,
        "Suivi (Prospection/Appairage/Ateliers)",
        "#7b1fa2"
      )}

      {coloredAccordion(
        <>
          <FormationGroupedWidget />
          <CandidatGroupedTableWidget />
          <AppairageGroupedTableWidget />
          <ProspectionGroupedWidget />
          <AteliersTREGroupedWidget />
        </>,
        "Analyse groupée",
        "#0097a7"
      )}

      {/* 🔹 Commentaires */}
      {coloredAccordion(
        <CommentaireStatsDashboard />,
        "Derniers commentaires",
        "#d32f2f",
        true
      )}
      {coloredAccordion(
        <AppairageCommentStatsDashboard />,
        "Derniers commentaires d’appairage",
        "#512da8"
      )}
      {coloredAccordion(
        <ProspectionCommentStatsDashboard />,
        "Derniers commentaires de prospection",
        "#455a64"
      )}
    </PageWrapper>
  );
};

export default DashboardPage;

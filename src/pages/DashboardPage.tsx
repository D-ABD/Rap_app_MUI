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
  useTheme,
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

type PaletteColorKey = "primary" | "secondary" | "success" | "warning" | "info" | "error";

const DashboardPage = () => {
  const { user } = useAuth();
  const theme = useTheme();

  const styledAccordion = (
    children: React.ReactNode,
    title: string,
    color: PaletteColorKey,
    expanded = false
  ) => (
    <Accordion
      defaultExpanded={expanded}
      sx={{
        borderRadius: 2,
        mb: 2,
        overflow: "hidden",
        boxShadow: theme.shadows[1],
        "&:before": { display: "none" },
        minWidth: 0,
        minHeight: 0,
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon color="action" />}
        sx={{
          backgroundColor: theme.palette[color].light,
          "&:hover": {
            backgroundColor: theme.palette[color].main,
            color: theme.palette.getContrastText(theme.palette[color].main),
          },
        }}
      >
        <Typography variant="subtitle1" fontWeight="bold">
          {title}
        </Typography>
      </AccordionSummary>
      <AccordionDetails
        sx={{
          backgroundColor: theme.palette.background.paper,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          minWidth: 0,
          minHeight: 0,
        }}
      >
        {children}
      </AccordionDetails>
    </Accordion>
  );

  return (
    <PageWrapper maxWidth="lg">
      {/* ✅ Conteneur principal */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          minHeight: 0,
        }}
      >
        {/* 🧩 HEADER */}
        {/* ---------------------- */}
        <Box mb={3}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Bienvenue, {user?.email || "utilisateur"} 👋
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Ceci est votre tableau de bord.
          </Typography>

          <Button variant="contained" component={RouterLink} to="/parametres" sx={{ mt: 2 }}>
            Aller aux paramètres
          </Button>
        </Box>

        {/* 🟦 SECTION 1 : Indicateurs clés */}
        {/* ---------------------- */}
        {styledAccordion(
          <Grid container spacing={2} sx={{ minWidth: 0, minHeight: 0 }}>
            <Grid item xs={12} sm={6} md={4} sx={{ minWidth: 0, minHeight: 240 }}>
              <FormationSaturationWidget title="Saturation Formations" />
            </Grid>
            <Grid item xs={12} sm={6} md={4} sx={{ minWidth: 0, minHeight: 240 }}>
              <ProspectionConversionKpi title="Tx transformation Prospections" />
            </Grid>
            <Grid item xs={12} sm={6} md={4} sx={{ minWidth: 0, minHeight: 240 }}>
              <AppairageConversionKpi title="Tx transformation Appairages" />
            </Grid>
          </Grid>,
          "Indicateurs clés",
          "primary",
          true
        )}

        {/* 🟩 SECTION 2 : Stats Formations */}
        {/* ---------------------- */}
        {styledAccordion(
          <Grid container spacing={2} sx={{ minWidth: 0, minHeight: 0 }}>
            {/* 🧩 Widget 1 : FormationOverviewWidget */}
            <Grid item xs={12} sm={6} md={4} sx={{ minWidth: 0, minHeight: 240 }}>
              <FormationOverviewWidget title="Répartition formations" />
            </Grid>

            <Grid item xs={12} sm={6} md={4} sx={{ minWidth: 0, minHeight: 240 }}>
              <FormationOverviewWidget2 title="Types d’offres" />
            </Grid>

            <Grid item xs={12} sm={6} md={4} sx={{ minWidth: 0, minHeight: 240 }}>
              <FormationPlacesWidget title="Places disponibles" />
            </Grid>
          </Grid>,
          "Stats Formations",
          "success"
        )}

        {/* 🟨 SECTION 3 : Stats Candidats */}
        {styledAccordion(
          <Grid container spacing={2} sx={{ minWidth: 0, minHeight: 0 }}>
            {/* 🧩 Widget 1 : CandidatOverviewWidget */}

            <Grid item xs={12} sm={6} sx={{ minWidth: 0, minHeight: 240 }}>
              <CandidatOverviewWidget title="Statuts candidats" />
            </Grid>

            {/* 🧩 Widget 2 : CandidatContratOverviewWidget */}

            <Grid item xs={12} sm={6} sx={{ minWidth: 0, minHeight: 240 }}>
              <CandidatContratOverviewWidget title="Répartition contrats" />
            </Grid>
          </Grid>,
          "Stats Candidats",
          "warning"
        )}

        {/* 🟦 SECTION 4 : Suivi Prospection / Appairage / Ateliers */}
        {styledAccordion(
          <Grid container spacing={2} sx={{ minWidth: 0, minHeight: 0 }}>
            {/* 🧩 Widget 1 : ProspectionOverviewWidget */}

            <Grid item xs={12} sm={6} md={4} sx={{ minWidth: 0, minHeight: 240 }}>
              <ProspectionOverviewWidget title="Overview Prospections" />
            </Grid>

            {/* 🧩 Widget 2 : AppairageOverviewWidget */}

            <Grid item xs={12} sm={6} md={4} sx={{ minWidth: 0, minHeight: 240 }}>
              <AppairageOverviewWidget />
            </Grid>

            {/* 🧩 Widget 3 : AteliersTREOverviewWidget */}

            <Grid item xs={12} sm={6} md={4} sx={{ minWidth: 0, minHeight: 240 }}>
              <AteliersTREOverviewWidget />
            </Grid>
          </Grid>,
          "Suivi (Prospection/Appairage/Ateliers)",
          "info"
        )}

        {styledAccordion(
          <Box sx={{ minWidth: 0, minHeight: 0 }}>
            <FormationGroupedWidget />
            <CandidatGroupedTableWidget />
            <AppairageGroupedTableWidget />
            <ProspectionGroupedWidget />
            <AteliersTREGroupedWidget />
          </Box>,
          "Analyse groupée",
          "secondary"
        )}

        {styledAccordion(<CommentaireStatsDashboard />, "Derniers commentaires", "error", true)}

        {styledAccordion(
          <AppairageCommentStatsDashboard />,
          "Derniers commentaires d’appairage",
          "secondary"
        )}

        {styledAccordion(
          <ProspectionCommentStatsDashboard />,
          "Derniers commentaires de prospection",
          "info"
        )}
      </Box>
    </PageWrapper>
  );
};

export default DashboardPage;

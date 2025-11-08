// ======================================================
// src/pages/DashboardPage.tsx
// ✅ Version améliorée — lisibilité, transitions, cohérence MUI
// ======================================================

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
  useMediaQuery,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useMemo } from "react";
import { useAuth } from "../hooks/useAuth";
import PageWrapper from "../components/PageWrapper";

// ---------- Widgets ----------
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
import FormationStatsSummary from "./widgets/overviewDashboard/FormationStatsSummary";

// import CommentaireStatsDashboard from "./widgets/commentsDashboard/CommentaireStatsDashboard";
// import AppairageCommentStatsDashboard from "./widgets/commentsDashboard/AppairageCommentStatsDashboard";
// import ProspectionCommentStatsDashboard from "./widgets/commentsDashboard/ProspectionCommentStatsDashboard";

type PaletteColorKey = "primary" | "secondary" | "success" | "warning" | "info" | "error";

export default function DashboardPage() {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // ✅ Facteur de hauteur adaptatif
  const minCardHeight = isMobile ? 200 : 240;

  /* ---------- Wrapper pour accordéon stylé ---------- */
  const styledAccordion = useMemo(
    () =>
      (children: React.ReactNode, title: string, color: PaletteColorKey, expanded = false) => (
        <Accordion
          defaultExpanded={expanded}
          disableGutters
          sx={{
            mb: 2,
            borderRadius: 2,
            overflow: "hidden",
            boxShadow: theme.shadows[2],
            transition: "box-shadow 0.2s ease, transform 0.15s ease",
            "&:hover": { boxShadow: theme.shadows[4], transform: "translateY(-2px)" },
            "&:before": { display: "none" },
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
      ),
    [theme]
  );

  return (
    <PageWrapper maxWidth="lg">
      <Box display="flex" flexDirection="column" minWidth={0} minHeight={0}>
        {/* ---------- Header ---------- */}
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
            sx={{ mt: 2, alignSelf: "flex-start" }}
          >
            Aller aux paramètres
          </Button>
        </Box>

        <FormationStatsSummary title="Formations" />

        {/* ---------- Accordéons ---------- */}
        {styledAccordion(
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4} sx={{ minHeight: minCardHeight }}>
              <FormationSaturationWidget title="Saturation Formations" />
            </Grid>
            <Grid item xs={12} sm={6} md={4} sx={{ minHeight: minCardHeight }}>
              <ProspectionConversionKpi title="Tx transformation Prospections" />
            </Grid>
            <Grid item xs={12} sm={6} md={4} sx={{ minHeight: minCardHeight }}>
              <AppairageConversionKpi title="Tx transformation Appairages" />
            </Grid>
          </Grid>,
          "Indicateurs clés",
          "primary",
          true
        )}

        {styledAccordion(
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4} sx={{ minHeight: minCardHeight }}>
              <FormationOverviewWidget title="Répartition formations" />
            </Grid>
            <Grid item xs={12} sm={6} md={4} sx={{ minHeight: minCardHeight }}>
              <FormationOverviewWidget2 title="Types d’offres" />
            </Grid>
            <Grid item xs={12} sm={6} md={4} sx={{ minHeight: minCardHeight }}>
              <FormationPlacesWidget title="Places disponibles" />
            </Grid>
          </Grid>,
          "Stats Formations",
          "success"
        )}

        {styledAccordion(
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} sx={{ minHeight: minCardHeight }}>
              <CandidatOverviewWidget title="Statuts candidats" />
            </Grid>
            <Grid item xs={12} sm={6} sx={{ minHeight: minCardHeight }}>
              <CandidatContratOverviewWidget title="Répartition contrats" />
            </Grid>
          </Grid>,
          "Stats Candidats",
          "warning"
        )}

        {styledAccordion(
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4} sx={{ minHeight: minCardHeight }}>
              <ProspectionOverviewWidget title="Overview Prospections" />
            </Grid>
            <Grid item xs={12} sm={6} md={4} sx={{ minHeight: minCardHeight }}>
              <AppairageOverviewWidget />
            </Grid>
            <Grid item xs={12} sm={6} md={4} sx={{ minHeight: minCardHeight }}>
              <AteliersTREOverviewWidget />
            </Grid>
          </Grid>,
          "Suivi (Prospection / Appairage / Ateliers)",
          "info"
        )}

        {styledAccordion(
          <Box display="flex" flexDirection="column" gap={2}>
            <FormationGroupedWidget />
            <CandidatGroupedTableWidget />
            <AppairageGroupedTableWidget />
            <ProspectionGroupedWidget />
            <AteliersTREGroupedWidget />
          </Box>,
          "Analyse groupée",
          "secondary"
        )}

        {/* 🔜 Future section commentaires
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
        */}
      </Box>
    </PageWrapper>
  );
}

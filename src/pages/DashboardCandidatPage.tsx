// src/pages/DashboardCandidatPage.tsx

import { Link as RouterLink } from "react-router-dom";
import { Typography, Button, Box, Grid } from "@mui/material";
import { useAuth } from "../hooks/useAuth";
import PageWrapper from "../components/PageWrapper";

// Tu pourras ajouter quelques widgets allégés si besoin
import ProspectionOverviewWidget from "./widgets/overviewDashboard/ProspectionOverviewWidget";
import ProspectionCommentStatsDashboard from "./widgets/commentsDahboard/ProspectionCommentStatsDashboard";

const DashboardCandidatPage = () => {
  const { user } = useAuth();

  return (
    <PageWrapper maxWidth="md">
      <Box mb={3}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Bonjour, {user?.first_name || user?.email || "candidat"} 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Voici votre tableau de bord personnel.
        </Typography>

        <Button
          variant="contained"
          component={RouterLink}
          to="/mon-profil"
          sx={{ mt: 2 }}
        >
          Voir / Modifier mon profil
        </Button>
      </Box>

      {/* Widgets utiles pour un candidat */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <ProspectionOverviewWidget title="Mes Prospections" />
        </Grid>
        {/* Ici tu peux ajouter un widget Formations liées ou Appairages si besoin */}
            <ProspectionCommentStatsDashboard />,
    
      </Grid>
    </PageWrapper>
  );
};

export default DashboardCandidatPage;

import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Stack,
} from "@mui/material";
import PageTemplate from "../../components/PageTemplate";

const ParametresPage = () => {
  const cards = [
    { title: "Centres", text: "Gérer les centres de formation.", link: "/centres" },
    { title: "Types d'offres", text: "Gérer les types d’offres de formation.", link: "/typeoffres" },
    { title: "Utilisateurs", text: "Ajouter ou modifier les utilisateurs.", link: "/users" },
    { title: "Candidats", text: "Ajouter ou modifier les candidats.", link: "/candidats" },
    { title: "Partenaires", text: "Ajouter ou modifier un partenaire.", link: "/partenaires" },
    { title: "Statuts", text: "Configurer les statuts des formations.", link: "/statuts" },
    { title: "Commentaires", text: "Consulter ou modifier les commentaires.", link: "/commentaires" },
    { title: "Événements", text: "Consulter ou modifier les événements.", link: "/evenements" },
    { title: "Documents", text: "Consulter ou modifier les documents.", link: "/documents" },
    {
      title: "Recherche globale",
      text: "Rechercher sur toutes les ressources (formations, centres, utilisateurs...).",
      link: "/recherche",
    },
    {
      title: "📜 Historique des Formations",
      text: "Retrouvez toutes les modifications apportées aux formations : dates, places, statuts, etc.",
      link: "/formations/historiques",
    },
    {
      title: "Historique Prospections",
      text: "Consulter l’historique des prospections.",
      link: "/prospections/historiques",
    },
    {
      title: "Prépa compétences",
      text: "Gérer les objectifs Prépa Comp.",
      link: "/prepa-globaux",
    },
    {
      title: "Administration",
      text: "Accès à l'interface d’administration Django.",
      link: "/admin",
    },
  ];

  const handleLogout = () => {
    // TODO: branche ton vrai logout ici
    console.log("Déconnexion");
  };

  const handleToggleTheme = () => {
    // TODO: branche ton vrai toggle theme ici
    console.log("Basculer thème");
  };

  return (
    <PageTemplate title="Paramètres" centered={false}>
      <Grid container spacing={3}>
        {cards.map((c) => (
          <Grid item xs={12} sm={6} md={4} key={c.title}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "transform 0.2s",
                "&:hover": { transform: "translateY(-4px)" },
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {c.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {c.text}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  component={RouterLink}
                  to={c.link}
                  size="small"
                  color="primary"
                >
                  Accéder
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Actions bas de page */}
      <Stack
        direction="row"
        spacing={2}
        justifyContent="center"
        sx={{ mt: 4 }}
      >
        <Button variant="outlined" onClick={handleToggleTheme}>
          🎨 Basculer thème
        </Button>
        <Button variant="contained" color="error" onClick={handleLogout}>
          🚪 Déconnexion
        </Button>
      </Stack>
    </PageTemplate>
  );
};

export default ParametresPage;

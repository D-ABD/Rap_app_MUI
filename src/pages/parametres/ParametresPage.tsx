import { Link as RouterLink } from "react-router-dom";
import { Grid, Card, CardContent, CardActions, Typography, Button, Stack } from "@mui/material";
import PageTemplate from "../../components/PageTemplate";

const ParametresPage = () => {
  const cards = [
    {
      title: "Centres",
      text: "Gérer les centres de formation.",
      link: "/centres",
    },
    {
      title: "Types d'offres",
      text: "Gérer les types d’offres de formation.",
      link: "/typeoffres",
    },
    {
      title: "Statuts",
      text: "Configurer les statuts des formations.",
      link: "/statuts",
    },
    {
      title: "Administration",
      text: "Accès à l'interface d’administration Django.",
      link:
        import.meta.env.MODE === "production"
          ? "https://mon-domaine.com/admin/"
          : "http://localhost:8000/admin/",

      external: true,
    },
  ];

  const handleLogout = () => {
    ("Déconnexion");
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
                {c.external ? (
                  <Button
                    component="a"
                    href={c.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="small"
                    color="primary"
                  >
                    Accéder
                  </Button>
                ) : (
                  <Button component={RouterLink} to={c.link} size="small" color="primary">
                    Accéder
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 4 }}>
        <Button variant="contained" color="error" onClick={handleLogout}>
          🚪 Déconnexion
        </Button>
      </Stack>
    </PageTemplate>
  );
};

export default ParametresPage;

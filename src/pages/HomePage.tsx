// src/pages/HomePage.tsx
import { useNavigate } from "react-router-dom";
import {
  Typography,
  Box,
  Button,
  Card,
  Grid,
  useTheme,
} from "@mui/material";
import {
  FaChartLine,
  FaCalendarAlt,
  FaGraduationCap,
  FaUsers,
} from "react-icons/fa";
import { useAuth } from "../hooks/useAuth";
import logo from "../assets/logo.png";
import PageWrapper from "../components/PageWrapper"; // ✅ wrapper responsive

export default function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const theme = useTheme();

  const features = [
    {
      icon: (
        <FaChartLine
          aria-hidden="true"
          size={32}
          color={theme.palette.primary.main}
        />
      ),
      title: "Tableaux de bord",
      desc: "Visualisez les indicateurs clés pour un suivi optimal.",
    },
    {
      icon: (
        <FaCalendarAlt
          aria-hidden="true"
          size={32}
          color={theme.palette.primary.main}
        />
      ),
      title: "Événements",
      desc: "Planifiez et organisez vos événements de manière centralisée.",
    },
    {
      icon: (
        <FaGraduationCap
          aria-hidden="true"
          size={32}
          color={theme.palette.primary.main}
        />
      ),
      title: "Formations",
      desc: "Centralisez les informations liées à chaque session de formation.",
    },
    {
      icon: (
        <FaUsers
          aria-hidden="true"
          size={32}
          color={theme.palette.primary.main}
        />
      ),
      title: "Participants & VAE",
      desc: "Gérez les parcours VAE et les candidatures facilement.",
    },
  ];

  return (
    <PageWrapper maxWidth="lg">
      {/* 🔹 Hero Section */}
      <Box textAlign="center" py={{ xs: 2, md: 4 }}>
        <img
          src={logo}
          alt="Logo Rap App"
          style={{ height: 80, maxWidth: "100%" }}
        />
        <Typography
          variant="h3"
          sx={{
            mt: 2,
            color: "primary.main",
            fontWeight: "bold",
            fontSize: { xs: "2rem", md: "3rem" },
          }}
        >
          Bienvenue sur Rap App
        </Typography>
        <Typography
          variant="h6"
          sx={{ my: 2, fontSize: { xs: "1rem", md: "1.25rem" } }}
        >
          Suivez, gérez et analysez les projets de formation en toute simplicité.
        </Typography>

        {!isAuthenticated && (
          <Button
            variant="contained"
            size="large"
            sx={{ mt: 2 }}
            onClick={() => navigate("/login")}
            startIcon={<span role="img" aria-label="connexion">🔐</span>}
          >
            Se connecter
          </Button>
        )}
      </Box>

      {/* 🔹 Features Grid */}
      <Grid container spacing={3} mt={{ xs: 2, md: 6 }}>
        {features.map((f) => (
          <Grid key={f.title} item xs={12} sm={6} md={3}>
            <Card
              sx={{
                p: 3,
                textAlign: "center",
                height: "100%",
                transition: "0.3s",
                "&:hover": {
                  transform: "translateY(-6px)",
                  boxShadow: 6,
                },
              }}
            >
              {f.icon}
              <Typography
                variant="h6"
                sx={{ mt: 2, fontSize: { xs: "1rem", md: "1.1rem" } }}
              >
                {f.title}
              </Typography>
              <Typography
                variant="body2"
                sx={{ mt: 1, fontSize: { xs: "0.85rem", md: "0.95rem" } }}
              >
                {f.desc}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>
    </PageWrapper>
  );
}

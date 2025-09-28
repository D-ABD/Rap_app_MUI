// src/pages/PolitiqueConfidentialite.tsx
import { Box, Typography, Paper } from "@mui/material";

export default function PolitiqueConfidentialite() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        p: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          maxWidth: 800,
          width: "100%",
          p: 4,
        }}
      >
        <Typography variant="h4" gutterBottom>
          Politique de confidentialité
        </Typography>

        <Typography variant="body1" paragraph>
          Conformément au Règlement Général sur la Protection des Données (RGPD),
          nous vous informons de la manière dont vos données personnelles sont
          collectées, utilisées et protégées dans le cadre de l’utilisation de
          notre application.
        </Typography>

        <Typography variant="h6" gutterBottom>
          1. Données collectées
        </Typography>
        <Typography variant="body2" paragraph>
          Nous collectons uniquement les informations nécessaires à la création
          et à la gestion de votre compte utilisateur : prénom, nom, adresse
          e-mail, mot de passe et éventuellement numéro de téléphone.
        </Typography>

        <Typography variant="h6" gutterBottom>
          2. Finalité
        </Typography>
        <Typography variant="body2" paragraph>
          Vos données sont utilisées exclusivement pour vous permettre
          d’accéder aux services de la plateforme et pour la gestion de votre
          compte utilisateur.
        </Typography>

        <Typography variant="h6" gutterBottom>
          3. Conservation
        </Typography>
        <Typography variant="body2" paragraph>
          Les données sont conservées tant que votre compte est actif. Vous
          pouvez demander leur suppression à tout moment.
        </Typography>

        <Typography variant="h6" gutterBottom>
          4. Partage
        </Typography>
        <Typography variant="body2" paragraph>
          Nous ne partageons pas vos données personnelles avec des tiers sans
          votre consentement, sauf obligation légale.
        </Typography>

        <Typography variant="h6" gutterBottom>
          5. Vos droits
        </Typography>
        <Typography variant="body2" paragraph>
          Vous disposez d’un droit d’accès, de rectification et de suppression
          de vos données personnelles. Pour exercer ces droits, veuillez nous
          contacter via la page de contact ou votre espace personnel.
        </Typography>

        <Typography variant="body2" paragraph sx={{ mt: 3, fontStyle: "italic" }}>
          Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}
        </Typography>
      </Paper>
    </Box>
  );
}

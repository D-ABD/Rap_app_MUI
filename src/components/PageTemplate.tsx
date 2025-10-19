import { ReactNode } from "react";
import {
  Box,
  Stack,
  Typography,
  Button,
  IconButton,
  Collapse,
  Tooltip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RefreshIcon from "@mui/icons-material/Refresh";
import PageWrapper from "./PageWrapper";
import PageSection from "./PageSection";

export type PageTemplateProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  /** ✅ Nouveau : contenu affiché à droite du header (ex: bouton Archiver) */
  actionsRight?: ReactNode;
  backButton?: boolean;
  onBack?: () => void;
  refreshButton?: boolean;
  onRefresh?: () => void;
  filters?: ReactNode;
  showFilters?: boolean;
  children: ReactNode;
  footer?: ReactNode;
  centered?: boolean;
  /** Contenu supplémentaire sous le header (ex: tags, stats, infos rapides) */
  headerExtra?: ReactNode;
};

const centeredBoxStyles = {
  minHeight: "50vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  gap: 2,
} as const;

export default function PageTemplate({
  title,
  subtitle,
  actions,
  actionsRight, // ✅ nouveau
  backButton = false,
  onBack,
  refreshButton = false,
  onRefresh,
  filters,
  showFilters = true,
  children,
  footer,
  centered = false,
  headerExtra,
}: PageTemplateProps) {
  // ✅ Sécurisation du comportement par défaut du bouton retour
  const handleBack = () => {
    if (typeof onBack === "function") {
      onBack();
    } else if (window.history.length > 1) {
      window.history.back();
    } else {
      console.warn("[PageTemplate] Aucun onBack fourni, history.back() indisponible");
    }
  };

  return (
    <PageWrapper>
      {/* Header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        mb={2}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
      >
        {/* Bloc gauche : titre, bouton retour, etc. */}
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          flexWrap="wrap"
          sx={{ flexGrow: 1, minWidth: 0 }}
        >
          {backButton && (
            <Button
              startIcon={<ArrowBackIcon aria-hidden />}
              onClick={handleBack}
              variant="outlined"
              size="small"
              aria-label="Revenir à la page précédente"
            >
              Retour
            </Button>
          )}

          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            {title ? (
              <Tooltip title={title} disableInteractive>
                <Typography
                  variant="h5"
                  component="h1"
                  noWrap
                  sx={{ fontWeight: 600 }}
                >
                  {title}
                </Typography>
              </Tooltip>
            ) : null}

            {subtitle && (
              <Typography
                variant="body2"
                color="text.secondary"
                noWrap
                sx={{ maxWidth: "100%" }}
              >
                {subtitle}
              </Typography>
            )}

            {headerExtra && <Box mt={0.5}>{headerExtra}</Box>}
          </Box>

          {refreshButton && (
            <IconButton onClick={onRefresh} aria-label="Rafraîchir" size="small">
              <RefreshIcon aria-hidden />
            </IconButton>
          )}
        </Stack>

        {/* Bloc droit : actions classiques + nouveau slot actionsRight */}
        <Stack direction="row" spacing={1} alignItems="center">
          {actions}
          {actionsRight}
        </Stack>
      </Stack>

      {/* Filtres */}
      {filters && (
        <Collapse in={showFilters} unmountOnExit>
          <PageSection>{filters}</PageSection>
        </Collapse>
      )}

      {/* Contenu principal */}
      <PageSection>
        {centered ? <Box sx={centeredBoxStyles}>{children}</Box> : children}
      </PageSection>

      {/* Footer */}
      {footer && (
        <Box component="footer" mt={2}>
          {footer}
        </Box>
      )}
    </PageWrapper>
  );
}

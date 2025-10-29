// src/theme.ts
import { createTheme, responsiveFontSizes } from "@mui/material/styles";

export const getTheme = (mode: "light" | "dark") => {
  let theme = createTheme({
    palette: {
      mode,
      primary: {
        main: "#1976d2", // bleu
      },
      secondary: {
        main: "#9c27b0", // violet
      },
      ...(mode === "light"
        ? {
            background: {
              default: "#f9f9f9",
              paper: "#ffffff",
            },
          }
        : {
            background: {
              default: "#121212",
              paper: "#1e1e1e",
            },
          }),
    },
    typography: {
      fontFamily: `"Roboto", "Helvetica", "Arial", sans-serif`,
      h1: { fontWeight: 600, fontSize: "2.5rem" },
      h2: { fontWeight: 600, fontSize: "2rem" },
      h3: { fontWeight: 600, fontSize: "1.75rem" },
      h4: { fontWeight: 600, fontSize: "1.5rem" },
      h5: { fontWeight: 600, fontSize: "1.25rem" },
      h6: { fontWeight: 600, fontSize: "1.1rem" },
      body1: { fontSize: "1rem" },
      body2: { fontSize: "0.9rem" },
    },
    shape: {
      borderRadius: 10, // arrondis modernes
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none", // pas de majuscules forcées
            borderRadius: 8,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow:
              mode === "light" ? "0 2px 8px rgba(0,0,0,0.08)" : "0 2px 8px rgba(0,0,0,0.6)",
          },
        },
      },
    },
  });

  // ✅ Typo responsive selon breakpoints
  theme = responsiveFontSizes(theme);

  return theme;
};

// ⚠️ Mode par défaut
const theme = getTheme("light");
export default theme;

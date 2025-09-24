// src/theme.ts
import { createTheme, responsiveFontSizes } from "@mui/material/styles";

export const getTheme = (mode: "light" | "dark") => {
  let theme = createTheme({
    palette: {
      mode,
      primary: {
        main: "#6366F1", // Indigo moderne
        light: "#A5B4FC",
        dark: "#4F46E5",
        contrastText: "#FFFFFF",
      },
      secondary: {
        main: "#06B6D4", // Cyan/Teal moderne
        light: "#67E8F9",
        dark: "#0E7490",
        contrastText: "#FFFFFF",
      },
      ...(mode === "light"
        ? {
            background: {
              default: "#F8FAFC", // gris très clair
              paper: "#FFFFFF",
            },
            text: {
              primary: "#111827", // gris anthracite
              secondary: "#475569", // gris neutre foncé
            },
          }
        : {
            background: {
              default: "#0F172A", // bleu-noir élégant
              paper: "#1E293B", // bleu-gris foncé
            },
            text: {
              primary: "#F1F5F9", // gris très clair
              secondary: "#94A3B8", // gris bleuté
            },
          }),
      success: { main: "#22C55E" }, // vert moderne
      warning: { main: "#F59E0B" }, // orange ambré
      error: { main: "#EF4444" },   // rouge punchy
    },

    typography: {
      fontFamily: "'Inter', 'Roboto', sans-serif",
      h1: { fontWeight: 700, fontSize: "2.5rem", letterSpacing: "-0.02em" },
      h2: { fontWeight: 700, fontSize: "2rem", letterSpacing: "-0.01em" },
      h3: { fontWeight: 700, fontSize: "1.75rem" },
      h4: { fontWeight: 600, fontSize: "1.5rem" },
      h5: { fontWeight: 600, fontSize: "1.25rem" },
      h6: { fontWeight: 600, fontSize: "1.1rem" },
      body1: { fontSize: "1rem", lineHeight: 1.6 },
      body2: { fontSize: "0.9rem", color: "#6B7280" },
      button: { textTransform: "none", fontWeight: 600, letterSpacing: "0.01em" },
    },

    shape: {
      borderRadius: 14, // arrondis un peu plus généreux
    },

    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            padding: "8px 20px",
            fontWeight: 600,
            transition: "all 0.25s ease-in-out",
            boxShadow: "none",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: "0 8px 20px rgba(99, 102, 241, 0.25)",
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 18,
            boxShadow:
              mode === "light"
                ? "0 6px 20px rgba(0,0,0,0.06)"
                : "0 6px 20px rgba(0,0,0,0.5)",
            transition: "all 0.25s ease-in-out",
            "&:hover": {
              boxShadow:
                mode === "light"
                  ? "0 10px 28px rgba(0,0,0,0.1)"
                  : "0 10px 28px rgba(0,0,0,0.7)",
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            background:
              mode === "light"
                ? "linear-gradient(90deg, #6366F1, #06B6D4)"
                : "linear-gradient(90deg, #1E293B, #0F766E)",
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            fontWeight: 500,
            padding: "0 6px",
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            "&:nth-of-type(even)": {
              backgroundColor: mode === "light" ? "#F1F5F9" : "#1E293B",
            },
            "&:hover": {
              backgroundColor: mode === "light" ? "#EEF2FF" : "#334155",
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 18,
          },
        },
      },
    },
  });

  theme = responsiveFontSizes(theme);
  return theme;
};

export default getTheme("light");

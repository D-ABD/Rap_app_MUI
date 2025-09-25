// src/theme.ts
import { createTheme, responsiveFontSizes } from "@mui/material/styles";

// 🔹 Étendre MUI pour ajouter `tertiary`, `neutral` et `gradients`
declare module "@mui/material/styles" {
  interface Palette {
    tertiary: Palette["primary"];
    neutral: Palette["primary"];
    gradients: {
      primary: string;
      secondary: string;
      tertiary: string;
    };
  }
  interface PaletteOptions {
    tertiary?: PaletteOptions["primary"];
    neutral?: PaletteOptions["primary"];
    gradients?: {
      primary?: string;
      secondary?: string;
      tertiary?: string;
    };
  }
}

declare module "@mui/material/Button" {
  interface ButtonPropsColorOverrides {
    tertiary: true;
    neutral: true;
  }
}

declare module "@mui/material/Chip" {
  interface ChipPropsColorOverrides {
    tertiary: true;
    neutral: true;
  }
}

export const getTheme = (mode: "light" | "dark") => {
  let theme = createTheme({
    palette: {
      mode,
      primary: {
        main: "#6366F1",
        light: "#A5B4FC",
        dark: "#4F46E5",
        contrastText: "#FFFFFF",
      },
      secondary: {
        main: "#06B6D4",
        light: "#67E8F9",
        dark: "#0E7490",
        contrastText: "#FFFFFF",
      },
      tertiary: {
        main: "#64748B",
        light: "#CBD5E1",
        dark: "#334155",
        contrastText: "#FFFFFF",
      },
      neutral: {
        main: "#94A3B8",
        light: "#E2E8F0",
        dark: "#475569",
        contrastText: "#111827",
      },
      gradients: {
        primary: "linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)",
        secondary: "linear-gradient(135deg, #06B6D4 0%, #0E7490 100%)",
        tertiary: "linear-gradient(135deg, #64748B 0%, #334155 100%)",
      },
      ...(mode === "light"
        ? {
            background: {
              default: "#F8FAFC",
              paper: "#FFFFFF",
            },
            text: {
              primary: "#111827",
              secondary: "#475569",
            },
          }
        : {
            background: {
              default: "#0F172A",
              paper: "#1E293B",
            },
            text: {
              primary: "#F1F5F9",
              secondary: "#94A3B8",
            },
          }),
      success: { main: "#22C55E" },
      warning: { main: "#F59E0B" },
      error: { main: "#EF4444" },
      info: { main: "#3B82F6" },
    },

    typography: {
      fontFamily: "'Inter', 'Roboto', sans-serif",
      h1: { fontWeight: 800, fontSize: "2.75rem", letterSpacing: "-0.03em" },
      h2: { fontWeight: 700, fontSize: "2.2rem", letterSpacing: "-0.02em" },
      h3: { fontWeight: 700, fontSize: "1.9rem" },
      h4: { fontWeight: 600, fontSize: "1.6rem" },
      h5: { fontWeight: 600, fontSize: "1.3rem" },
      h6: { fontWeight: 600, fontSize: "1.1rem" },
      body1: { fontSize: "1rem", lineHeight: 1.7 },
      body2: { fontSize: "0.92rem", color: "#6B7280", lineHeight: 1.6 },
      button: { textTransform: "none", fontWeight: 600, letterSpacing: "0.02em" },
    },

    shape: {
      borderRadius: 16,
    },

    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            padding: "10px 22px",
            fontWeight: 600,
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "translateY(-2px) scale(1.02)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 20,
            backdropFilter: "blur(6px)",
            boxShadow:
              mode === "light"
                ? "0 6px 20px rgba(0,0,0,0.05)"
                : "0 6px 24px rgba(0,0,0,0.6)",
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow:
                mode === "light"
                  ? "0 12px 32px rgba(0,0,0,0.08)"
                  : "0 12px 32px rgba(0,0,0,0.8)",
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
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            fontWeight: 500,
            padding: "0 8px",
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            transition: "background-color 0.2s ease",
            "&:nth-of-type(even)": {
              backgroundColor: mode === "light" ? "#F9FAFB" : "#1E293B",
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
            borderRadius: 20,
          },
        },
      },
    },
  });

  theme = responsiveFontSizes(theme);
  return theme;
};

export default getTheme("light");

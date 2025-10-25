// src/contexts/AuthProvider.tsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import { login as loginAPI, getUserProfile } from "../api/auth";
import { storeTokens, getTokens, clearTokens } from "../api/tokenStorage";
import { toast } from "react-toastify";
import type { User } from "../types/User";
import { registerLogoutCallback } from "../api/globalLogout";
import { Box, CircularProgress, Typography } from "@mui/material";
import logo from "../assets/logo.png"; // ✅ ton logo

// ✅ Fonction helper pour enrichir l'objet user
function normalizeUser(userData: User): User {
  return {
    ...userData,
    is_admin:
      userData.is_admin ?? ["admin", "superadmin"].includes(userData.role?.toLowerCase() || ""),
    is_staff: userData.is_staff ?? userData.role?.toLowerCase() === "staff",
    is_superuser: userData.is_superuser ?? userData.role?.toLowerCase() === "superadmin",
  };
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // 📌 Sauvegarde la dernière page visitée
  useEffect(() => {
    if (location.pathname !== "/login") {
      localStorage.setItem("lastPage", location.pathname);
    }
  }, [location.pathname]);

  // 🔑 Connexion
  const login = async (email: string, password: string) => {
    const { access, refresh } = await loginAPI(email, password);
    storeTokens(access, refresh);
    const userData = await getUserProfile();
    setUser(normalizeUser(userData));

    toast.success("Connexion réussie");

    // 🔄 Redirige vers la dernière page visitée ou dashboard
    const lastPage = localStorage.getItem("lastPage") || "/dashboard";
    navigate(lastPage, { replace: true });
  };

  // 🚪 Déconnexion — version stabilisée avec useCallback
  const logout = useCallback(
    (redirect = true, expired = false) => {
      clearTokens();
      setUser(null);

      if (expired) {
        toast.error("⚠️ Session expirée, veuillez vous reconnecter.");
      } else {
        toast.info("Déconnexion réussie");
      }

      if (redirect) {
        navigate("/login", { replace: true });
      }
    },
    [navigate]
  );

  // 🔁 Restaure la session au chargement
  useEffect(() => {
    registerLogoutCallback(() => logout(true, true));

    const restoreSession = async () => {
      try {
        const { access } = getTokens();
        if (access) {
          const userData = await getUserProfile();
          setUser(normalizeUser(userData));
        }
      } catch {
        clearTokens();
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, [logout]); // ✅ ajouté proprement

  // ⏳ Splash screen pendant restauration session
  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          backgroundColor: (theme) => (theme.palette.mode === "light" ? "#f9f9f9" : "#121212"),
        }}
      >
        <img src={logo} alt="Logo" style={{ height: 80, marginBottom: 20 }} />
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2, color: "text.secondary", fontWeight: 500 }}>
          Chargement...
        </Typography>
      </Box>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

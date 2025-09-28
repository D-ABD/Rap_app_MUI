// src/pages/auth/RegisterPage.tsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import api from "../../api/axios";
import { toast } from "react-toastify";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Checkbox,
  FormControlLabel,
} from "@mui/material";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password1: "",
    password2: "",
    first_name: "",
    last_name: "",
    acceptRGPD: false, // ✅ ajout consentement
  });

  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, checked, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password1 !== form.password2) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    if (!form.acceptRGPD) {
      setError("Vous devez accepter la politique de confidentialité (RGPD).");
      return;
    }

    try {
      await api.post("/register/", {
        email: form.email,
        password: form.password1,
        first_name: form.first_name,
        last_name: form.last_name,
      });

      toast.success(
        "✅ Compte créé avec succès. En attente de validation par un administrateur."
      );
      navigate("/login");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as Record<string, string[]>;
        const msg =
          data?.email?.[0] ||
          data?.password?.[0] ||
          data?.first_name?.[0] ||
          data?.last_name?.[0] ||
          data?.non_field_errors?.[0] ||
          "Erreur lors de la création du compte.";
        setError(msg);
      } else {
        setError("Une erreur inconnue est survenue.");
      }
    }
  };

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
        elevation={6}
        sx={{
          maxWidth: 400,
          width: "100%",
          p: 4,
        }}
      >
        <Typography variant="h5" component="h1" gutterBottom align="center">
          Créer un compte
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            label="Prénom"
            name="first_name"
            value={form.first_name}
            onChange={handleChange}
            margin="normal"
            fullWidth
            required
          />

          <TextField
            label="Nom"
            name="last_name"
            value={form.last_name}
            onChange={handleChange}
            margin="normal"
            fullWidth
            required
          />

          <TextField
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            margin="normal"
            fullWidth
            required
          />

          <TextField
            label="Mot de passe"
            name="password1"
            type="password"
            value={form.password1}
            onChange={handleChange}
            margin="normal"
            fullWidth
            required
          />

          <TextField
            label="Confirmer le mot de passe"
            name="password2"
            type="password"
            value={form.password2}
            onChange={handleChange}
            margin="normal"
            fullWidth
            required
          />

          {/* ✅ Consentement RGPD */}
          <FormControlLabel
            control={
              <Checkbox
                name="acceptRGPD"
                checked={form.acceptRGPD}
                onChange={handleChange}
                required
              />
            }
            label={
              <Typography variant="body2">
                J’accepte la{" "}
                <Link to="/politique-confidentialite" target="_blank">
                  politique de confidentialité
                </Link>{" "}
                et le traitement de mes données personnelles.
              </Typography>
            }
            sx={{ mt: 2 }}
          />

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3 }}
          >
            Créer un compte
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

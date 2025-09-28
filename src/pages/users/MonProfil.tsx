import { useEffect, useState } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  Avatar,
} from "@mui/material";
import { toast } from "react-toastify";
import { useMe } from "../../hooks/useUsers";
import { MeUpdatePayload } from "../../types/User";
import api from "../../api/axios";
import { useAuth } from "../../hooks/useAuth";

export default function MonProfil() {
  const { user, loading, error } = useMe();
  const { logout } = useAuth();
  const [formData, setFormData] = useState<MeUpdatePayload>({});
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone || "",
        bio: user.bio || "",
      });
    }
  }, [user]);

  const handleChange = (field: keyof MeUpdatePayload, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAvatarFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);

      const payload =
        avatarFile !== null
          ? (() => {
              const fd = new FormData();
              Object.entries(formData).forEach(([k, v]) => {
                if (v !== undefined && v !== null) fd.append(k, v as string);
              });
              fd.append("avatar", avatarFile);
              return fd;
            })()
          : formData;

      const res = await api.patch("/users/me/", payload, {
        headers: avatarFile ? { "Content-Type": "multipart/form-data" } : {},
      });

      toast.success("✅ Profil mis à jour !");
      console.log("Nouvel utilisateur :", res.data.data);
    } catch (e) {
      toast.error("❌ Erreur lors de la mise à jour");
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("⚠️ Êtes-vous sûr de vouloir supprimer votre compte ?")) return;
    try {
      setDeleting(true);
      await api.post("/users/deactivate/");
      toast.success("🗑️ Votre compte a été désactivé.");
      logout(); // ✅ déconnecter l’utilisateur
    } catch (e) {
      toast.error("❌ Erreur lors de la désactivation du compte");
      console.error(e);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">Erreur chargement profil</Typography>;
  if (!user) return null;

  return (
    <Box sx={{ maxWidth: 500, mx: "auto", mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Mon profil
      </Typography>

      {/* ✅ Avatar actuel */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
        <Avatar
          src={avatarFile ? URL.createObjectURL(avatarFile) : user.avatar_url || ""}
          alt={user.full_name || user.email}
          sx={{ width: 64, height: 64 }}
        />
        <Button variant="outlined" component="label">
          Changer l’avatar
          <input type="file" hidden accept="image/*" onChange={handleAvatarChange} />
        </Button>
      </Box>

      <TextField
        label="Email"
        fullWidth
        margin="normal"
        value={formData.email || ""}
        onChange={(e) => handleChange("email", e.target.value)}
      />
      <TextField
        label="Prénom"
        fullWidth
        margin="normal"
        value={formData.first_name || ""}
        onChange={(e) => handleChange("first_name", e.target.value)}
      />
      <TextField
        label="Nom"
        fullWidth
        margin="normal"
        value={formData.last_name || ""}
        onChange={(e) => handleChange("last_name", e.target.value)}
      />
      <TextField
        label="Téléphone"
        fullWidth
        margin="normal"
        value={formData.phone || ""}
        onChange={(e) => handleChange("phone", e.target.value)}
      />
      <TextField
        label="Bio"
        fullWidth
        margin="normal"
        multiline
        minRows={3}
        value={formData.bio || ""}
        onChange={(e) => handleChange("bio", e.target.value)}
      />

      {/* ✅ Actions */}
      <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={saving}
        >
          {saving ? "⏳ Sauvegarde..." : "💾 Enregistrer"}
        </Button>

        <Button
          variant="outlined"
          color="error"
          onClick={handleDeleteAccount}
          disabled={deleting}
        >
          {deleting ? "⏳ Suppression..." : "🗑️ Supprimer mon compte"}
        </Button>
      </Box>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mt: 3, fontSize: "0.85rem", lineHeight: 1.4 }}
        >
        Conformément au RGPD, vous pouvez demander la suppression de votre compte.
        Cela entraîne la désactivation de votre accès. Certaines données peuvent être
        conservées temporairement pour des obligations légales ou statistiques.
        Pour toute demande complémentaire (export ou effacement total des données),
        veuillez contacter l’administrateur.
        </Typography>
    </Box>
  );
}

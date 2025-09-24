// src/pages/partenaires/PartenaireEditPage.tsx
import { useNavigate, useParams, Link } from "react-router-dom";
import { useState, useMemo } from "react";
import {
  Box,
  Stack,
  Button,
  CircularProgress,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import CampaignIcon from "@mui/icons-material/Campaign";
import HandshakeIcon from "@mui/icons-material/Handshake";

import {
  usePartenaire,
  useUpdatePartenaire,
  usePartenaireChoices,
} from "../../hooks/usePartenaires";
import PartenaireForm from "./PartenaireForm";
import type { Partenaire } from "../../types/partenaire";
import CandidatsSelectModal, {
  type CandidatPick,
} from "../../components/modals/CandidatsSelectModal";
import PageTemplate from "../../components/PageTemplate";

// Utilitaires de nettoyage du payload
function normalize(values: Partial<Partenaire>): Partial<Partenaire> {
  return Object.fromEntries(
    Object.entries(values)
      .map(([k, v]) => [k, v === "" ? null : v])
      .filter(([, v]) => v !== undefined)
  ) as Partial<Partenaire>;
}

function preparePayload(values: Partial<Partenaire>): Partial<Partenaire> {
  const default_centre_id =
    values.default_centre_id ??
    (values.default_centre && typeof values.default_centre.id === "number"
      ? values.default_centre.id
      : null);

  const payload: Partial<Partenaire> = {
    ...values,
    default_centre_id,
  };

  delete (payload as Record<string, unknown>).default_centre;
  delete (payload as Record<string, unknown>).default_centre_nom;

  return payload;
}

const enc = encodeURIComponent;

export default function PartenaireEditPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const partenaireId = Number(id);

  const { data, loading: loadingData, error: loadError } = usePartenaire(partenaireId);
  const { update, loading, error } = useUpdatePartenaire(partenaireId);
  const { data: choices } = usePartenaireChoices();

  const [openCandModal, setOpenCandModal] = useState(false);

  // Libellé du partenaire
  const partenaireNom = data?.nom ?? null;

  // URLs pré-remplies
  const newProspectionUrl = useMemo(() => {
    const base = `/prospections/create?partenaire=${partenaireId}`;
    return partenaireNom ? `${base}&partenaire_nom=${enc(partenaireNom)}` : base;
  }, [partenaireId, partenaireNom]);

  const newAppairageBaseUrl = useMemo(() => {
    const base = `/appairages/create?partenaire=${partenaireId}`;
    return partenaireNom ? `${base}&partenaire_nom=${enc(partenaireNom)}` : base;
  }, [partenaireId, partenaireNom]);

  const handleSubmit = async (values: Partial<Partenaire>) => {
    try {
      const payload = preparePayload(normalize(values));
      await update(payload);
      navigate("/partenaires");
    } catch (err) {
      console.error("Erreur de mise à jour", err);
    }
  };

  const handlePickCandidat = (c: CandidatPick) => {
    setOpenCandModal(false);
    const url =
      `${newAppairageBaseUrl}` +
      `&candidat=${c.id}` +
      (c.nom_complet ? `&candidat_nom=${enc(c.nom_complet)}` : "");
    navigate(url);
  };

  if (!id || Number.isNaN(partenaireId)) {
    return (
      <Typography color="error" p={2}>
        ID de partenaire invalide.
      </Typography>
    );
  }

  if (loadingData) return <CircularProgress sx={{ m: 2 }} />;
  if (loadError) {
    return (
      <Typography color="error" p={2}>
        Erreur de chargement partenaire.
      </Typography>
    );
  }
  if (!data) {
    return (
      <Typography color="error" p={2}>
        Partenaire introuvable.
      </Typography>
    );
  }

  return (
    <PageTemplate
      title={`✏️ Modifier le partenaire`}
      backButton
      onBack={() => navigate(-1)}
      actions={
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {/* 📣 Nouvelle prospection */}
          <Button
            component={Link}
            to={newProspectionUrl}
            variant="contained"
            color="primary"
            startIcon={<CampaignIcon />}
          >
            Nouvelle prospection
          </Button>

          {/* 🤝 Nouvel appairage */}
          <Button
            variant="outlined"
            startIcon={<HandshakeIcon />}
            onClick={() => setOpenCandModal(true)}
          >
            Nouvel appairage
          </Button>
        </Stack>
      }
    >
      <Box>
        <PartenaireForm
          initialValues={data}
          onSubmit={handleSubmit}
          loading={loading}
          choices={choices}
        />
        {error && (
          <Typography color="error" mt={2}>
            Erreur : {error.message}
          </Typography>
        )}
      </Box>

      {/* Modale de sélection de candidat */}
      <CandidatsSelectModal
        show={openCandModal}
        onClose={() => setOpenCandModal(false)}
        onSelect={handlePickCandidat}
        onlyCandidateLike
        onlyActive={false}
        requireLinkedUser={false}
      />
    </PageTemplate>
  );
}

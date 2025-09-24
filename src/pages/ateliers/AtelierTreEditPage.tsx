// src/pages/ateliers/AtelierTREEditPage.tsx
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import { Box, Button, CircularProgress, Typography } from "@mui/material";

import type { AtelierTREFormData } from "../../types/ateliersTre";
import {
  useAtelierTRE,
  useAtelierTREMeta,
  useDeleteAtelierTRE,
  useUpdateAtelierTRE,
} from "../../hooks/useAtelierTre";
import AtelierTREForm from "./AteliersTREForm";
import PageTemplate from "../../components/PageTemplate";

// Helpers typés
const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null;
const isStringArray = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every((x) => typeof x === "string");

function extractApiMessage(data: unknown): string | null {
  if (!isRecord(data)) return null;

  const maybeMessage = (data as { message?: unknown }).message;
  if (typeof maybeMessage === "string" && maybeMessage.trim()) {
    return maybeMessage;
  }

  const maybeErrors = (data as { errors?: unknown }).errors;
  const errorsObj = isRecord(maybeErrors)
    ? (maybeErrors as Record<string, unknown>)
    : data;

  const parts: string[] = [];
  for (const [field, val] of Object.entries(errorsObj)) {
    if (typeof val === "string") {
      parts.push(`${field}: ${val}`);
    } else if (isStringArray(val)) {
      parts.push(`${field}: ${val.join(" · ")}`);
    }
  }
  return parts.length ? parts.join(" | ") : null;
}

export default function AtelierTREEditPage() {
  const { id: idParam } = useParams<{ id: string }>();
  const id = useMemo(() => (idParam ? Number(idParam) : NaN), [idParam]);
  const navigate = useNavigate();

  const { data, loading, error } = useAtelierTRE(Number.isNaN(id) ? null : id);
  const { meta, loading: loadingMeta } = useAtelierTREMeta();
  const { update } = useUpdateAtelierTRE();
  const { remove } = useDeleteAtelierTRE();

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values: AtelierTREFormData) => {
    if (!id) return;
    try {
      setSubmitting(true);
      const payload = Object.fromEntries(
        Object.entries(values).map(([k, v]) =>
          v === "" ? [k, undefined] : [k, v]
        )
      ) as AtelierTREFormData;

      await update(id, payload);
      toast.success("✅ Atelier mis à jour");
      navigate("/ateliers-tre");
    } catch (e) {
      const axiosErr = e as AxiosError<unknown>;
      const parsed = axiosErr.response?.data
        ? extractApiMessage(axiosErr.response.data)
        : null;
      toast.error(
        parsed ?? axiosErr.message ?? "Erreur lors de la mise à jour"
      );
      console.error("Update atelier failed:", e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!window.confirm("Supprimer cet atelier ?")) return;
    try {
      await remove(id);
      toast.success("🗑️ Atelier supprimé");
      navigate("/ateliers-tre");
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  // Cas ID invalide
  if (Number.isNaN(id)) {
    return (
      <PageTemplate title="Modifier un atelier TRE">
        <Typography color="error">❌ ID invalide</Typography>
      </PageTemplate>
    );
  }

  // Cas chargement
  if (loading || loadingMeta) {
    return (
      <PageTemplate title={`Modifier un atelier TRE #${id}`} centered>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>⏳ Chargement…</Typography>
      </PageTemplate>
    );
  }

  // Cas erreur
  if (error) {
    return (
      <PageTemplate title={`Modifier un atelier TRE #${id}`}>
        <Typography color="error">❌ Erreur de chargement.</Typography>
      </PageTemplate>
    );
  }

  if (!data) {
    return (
      <PageTemplate title={`Modifier un atelier TRE #${id}`}>
        <Typography color="error">❌ Atelier introuvable.</Typography>
      </PageTemplate>
    );
  }

  const initialValues: Partial<AtelierTREFormData> = {
    type_atelier: data.type_atelier as AtelierTREFormData["type_atelier"],
    date_atelier:
      typeof data.date_atelier === "string" && data.date_atelier.trim() !== ""
        ? data.date_atelier
        : null,
    centre: typeof data.centre === "number" ? data.centre : null,
    candidats: Array.isArray(data.candidats)
      ? data.candidats.filter((x): x is number => typeof x === "number")
      : [],
  };

  return (
    <PageTemplate
      title={`Modifier un atelier TRE #${id}`}
      backButton
      onBack={() => navigate(-1)}
      actions={
        <Button color="error" variant="outlined" onClick={handleDelete}>
          Supprimer
        </Button>
      }
    >
      <Box mt={2}>
        <AtelierTREForm
          meta={meta ?? null}
          initialValues={initialValues}
          submitting={submitting}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/ateliers-tre")}
        />
      </Box>
    </PageTemplate>
  );
}

// src/components/export/ExportButtonAppairageComment.tsx
import { useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
} from "@mui/material";
import { toast } from "react-toastify";

import ExportSelect, { ExportFormat } from "./ExportSelect";

/** Aligné sur AppairageCommentSerializer (lecture) */
export type AppairageCommentRow = {
  id: number;
  appairage: number;
  partenaire_nom?: string | null;
  candidat_nom?: string | null;
  body: string;
  created_by_username: string | null;
  created_at: string;
};

type Props = {
  data: AppairageCommentRow[];
  selectedIds: number[];
};

const toStr = (v: unknown, fallback = "—"): string => {
  if (v === null || v === undefined) return fallback;
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return fallback;
};

const fmtDateTime = (iso?: string | null): string => {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
};

export default function ExportButtonAppairageComment({
  data,
  selectedIds,
}: Props) {
  const [showModal, setShowModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("pdf");
  const [busy, setBusy] = useState(false);

  const total = data?.length ?? 0;
  const selectedCount = selectedIds.length;
  const today = new Date().toISOString().slice(0, 10);
  const filename = `appairage_comments_${today}`;

  const openModal = () => setShowModal(true);
  const closeModal = () => {
    if (busy) return;
    setShowModal(false);
  };

  const handleExport = async () => {
    const toExport =
      selectedCount > 0
        ? data.filter((d) => selectedIds.includes(d.id))
        : data;

    if (!toExport || toExport.length === 0) {
      toast.warning("Aucun commentaire à exporter.");
      return;
    }

    try {
      setBusy(true);

      const headers = [
        "#",
        "Appairage",
        "Partenaire",
        "Candidat",
        "Auteur",
        "Date",
        "Commentaire",
      ];

      const mapper = (c: AppairageCommentRow): string[] => [
        `#${c.id}`,
        `#${c.appairage}`,
        toStr(c.partenaire_nom),
        toStr(c.candidat_nom),
        toStr(c.created_by_username),
        fmtDateTime(c.created_at),
        toStr(c.body),
      ];

      await exportData<AppairageCommentRow>(exportFormat, {
        data: toExport,
        headers,
        mapper,
        filename,
      });

      toast.success(
        `${exportFormat.toUpperCase()} prêt · ${toExport.length} commentaire(s) exporté(s).`
      );
      setShowModal(false);
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Erreur lors de l’export.";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        onClick={openModal}
        disabled={busy || total === 0}
        title={
          total === 0
            ? "Aucun commentaire à exporter"
            : `Exporter ${selectedCount || total} commentaire(s)`
        }
      >
        {busy ? "⏳ " : "⬇️ "}
        {selectedCount > 0
          ? `Exporter (${selectedCount})`
          : `Exporter (${total})`}
      </Button>

      <Dialog open={showModal} onClose={closeModal} maxWidth="sm" fullWidth>
        <DialogTitle>Exporter les commentaires</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "grid", gap: 1.5 }}>
            <Typography fontWeight={600}>Format d’export</Typography>
            <ExportSelect
              value={exportFormat}
              onChange={(v) => setExportFormat(v)}
            />
          </Box>

          {busy && (
            <Typography
              variant="body2"
              sx={{ mt: 2 }}
              aria-live="polite"
              aria-busy="true"
            >
              ⏳ Export en cours…
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModal} disabled={busy}>
            Annuler
          </Button>
          <Button
            onClick={handleExport}
            disabled={busy}
            variant="contained"
            color="primary"
          >
            Exporter
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
function exportData<T>(exportFormat: string, arg1: { data: AppairageCommentRow[]; headers: string[]; mapper: (c: AppairageCommentRow) => string[]; filename: string; }) {
  throw new Error("Function not implemented.");
}


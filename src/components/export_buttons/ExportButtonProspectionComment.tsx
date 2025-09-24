// src/components/prospections/ExportButtonProspectionComment.tsx
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


export type ProspectionCommentRow = {
  id: number;
  prospection: number;
  partenaire_nom?: string | null;
  formation_nom?: string | null;
  prospection_text?: string | null;
  body: string;
  is_internal: boolean;
  created_by_username: string | null;
  created_at: string;
};

type Props = {
  data: ProspectionCommentRow[];
  selectedIds: number[];
  label?: string;
  filenameBase?: string;
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
    : d.toLocaleString("fr-FR", {
        dateStyle: "short",
        timeStyle: "short",
      });
};

export default function ExportButtonProspectionComment({
  data,
  selectedIds,
  label = "⬇️ Exporter",
  filenameBase = "prospection_comments",
}: Props) {
  const [showModal, setShowModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("csv");
  const [busy, setBusy] = useState(false);

  const total = data?.length ?? 0;
  const selectedCount = selectedIds.length;
  const today = new Date().toISOString().slice(0, 10);
  const filename = `${filenameBase}_${today}`;

  const countBadge =
    selectedCount > 0
      ? ` (${selectedCount})`
      : total > 0
      ? ` (${total})`
      : "";

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
        "Prospection",
        "Partenaire",
        "Formation",
        "Interne",
        "Auteur",
        "Date",
        "Commentaire",
      ];

      const mapper = (c: ProspectionCommentRow): string[] => [
        `#${c.id}`,
        `#${c.prospection}`,
        toStr(c.partenaire_nom),
        toStr(c.formation_nom),
        c.is_internal ? "Oui" : "Non",
        toStr(c.created_by_username),
        fmtDateTime(c.created_at),
        toStr(c.body),
      ];

      await exportData<ProspectionCommentRow>(exportFormat, {
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
        variant="outlined"
        color="secondary"
        onClick={openModal}
        disabled={busy || total === 0}
        aria-label={`${label}${countBadge}`}
        title={
          total === 0
            ? "Aucun commentaire à exporter"
            : `Exporter ${selectedCount || total} commentaire(s)`
        }
      >
        {busy ? "⏳ " : "⬇️ "}
        {label}
        {countBadge}
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
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1 }}
            >
              Le fichier sera nommé <code>{filename}</code> avec l’extension du
              format choisi.
            </Typography>
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
function exportData<T>(exportFormat: string, arg1: { data: ProspectionCommentRow[]; headers: string[]; mapper: (c: ProspectionCommentRow) => string[]; filename: string; }) {
  throw new Error("Function not implemented.");
}


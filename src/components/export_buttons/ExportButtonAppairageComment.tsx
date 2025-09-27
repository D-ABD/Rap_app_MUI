// src/components/export_buttons/ExportButtonAppairageComment.tsx
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
import api from "../../api/axios";

import ExportSelect from "./ExportSelect";
import { ExportFormat } from "../../types/export"; // "pdf" | "xlsx"

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

export default function ExportButtonAppairageComment({
  data,
  selectedIds,
}: Props) {
  const [showModal, setShowModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("pdf");
  const [busy, setBusy] = useState(false);

  const total = data?.length ?? 0;
  const selectedCount = selectedIds.length;

  const openModal = () => setShowModal(true);
  const closeModal = () => {
    if (busy) return;
    setShowModal(false);
  };

  const handleExport = async () => {
    if (total === 0) {
      toast.warning("Aucun commentaire à exporter.");
      return;
    }

    try {
      setBusy(true);

      // ✅ Choix de l’endpoint en fonction du format
      const url =
        exportFormat === "pdf"
          ? "appairage-commentaires/export-pdf/"
          : "appairage-commentaires/export-xlsx/";

      let res;
      if (selectedIds.length > 0) {
        res = await api.post(url, { ids: selectedIds }, { responseType: "blob" });
      } else {
        res = await api.get(url, { responseType: "blob" });
      }

      const blob = new Blob([res.data], {
        type:
          exportFormat === "pdf"
            ? "application/pdf"
            : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const filename =
        res.headers["content-disposition"]?.split("filename=")[1]?.replace(/"/g, "") ||
        `commentaires_appairage.${exportFormat}`;

      const link = document.createElement("a");
      const urlBlob = URL.createObjectURL(blob);
      link.href = urlBlob;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(urlBlob);

      toast.success(
        `${exportFormat.toUpperCase()} prêt · ${
          selectedCount > 0 ? selectedCount : total
        } commentaire(s) exporté(s).`
      );
      setShowModal(false);
    } catch (e) {
      console.error("❌ Erreur export :", e);
      toast.error("Erreur lors de l’export.");
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
              options={["pdf", "xlsx"]} // ✅ limite aux formats backend
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

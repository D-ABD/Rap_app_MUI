// src/components/prospections/ExportButtonProspection.tsx
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
import type { Prospection } from "../../types/prospection";

type Props = {
  data: Prospection[];
  selectedIds: number[];
};

export default function ExportButtonProspection({ data, selectedIds }: Props) {
  const [showModal, setShowModal] = useState(false);
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
      toast.warning("Aucune prospection à exporter.");
      return;
    }

    try {
      setBusy(true);

      const url = "prospections/export-xlsx/";

      let res;
      if (selectedIds.length > 0) {
        res = await api.post(url, { ids: selectedIds }, { responseType: "blob" });
      } else {
        res = await api.get(url, { responseType: "blob" });
      }

      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const filename =
        res.headers["content-disposition"]?.split("filename=")[1]?.replace(/"/g, "") ||
        "prospections.xlsx";

      const link = document.createElement("a");
      const urlBlob = URL.createObjectURL(blob);
      link.href = urlBlob;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(urlBlob);

      toast.success(
        `XLSX prêt · ${selectedIds.length > 0 ? selectedIds.length : total} prospection(s) exportée(s).`
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
        variant="outlined"
        color="secondary"
        onClick={openModal}
        disabled={busy || total === 0}
        title={
          total === 0
            ? "Aucune prospection à exporter"
            : `Exporter ${selectedCount || total} prospection(s)`
        }
      >
        {busy ? "⏳ " : "⬇️ "}
        Exporter ({selectedCount > 0 ? selectedCount : total})
      </Button>

      <Dialog open={showModal} onClose={closeModal} maxWidth="sm" fullWidth>
        <DialogTitle>Exporter les prospections</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "grid", gap: 1.5 }}>
            <Typography>
              Le fichier sera exporté uniquement au format <strong>Excel (.xlsx)</strong>.
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

// src/components/export/ExportButtonCommentaires.tsx
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
import { Commentaire } from "../../types/commentaire";


type Props = {
  data: Commentaire[];
  label?: string;
  filenameBase?: string;
};

export default function ExportButtonCommentaires({
  data,
  label = "⬇️ Exporter les commentaires",
  filenameBase = "commentaires",
}: Props) {
  const [showModal, setShowModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("pdf");
  const [busy, setBusy] = useState(false);

  const count = data?.length ?? 0;
  const countBadge = count > 0 ? ` (${count})` : "";
  const today = new Date().toISOString().slice(0, 10);
  const filename = `${filenameBase}_${today}`;

  const openModal = () => setShowModal(true);
  const closeModal = () => {
    if (!busy) setShowModal(false);
  };

  const handleExport = async () => {
    if (!data || data.length === 0) {
      toast.warning("Aucun commentaire à exporter.");
      return;
    }

    try {
      setBusy(true);

      await exportData<Commentaire>(exportFormat, {
        data,
        filename,
        headers: [
          "Formation",
          "Centre",
          "Numéro offre",
          "Type d’offre",
          "Statut",
          "Saturation formation",
          "Contenu",
          "Auteur",
          "Date",
        ],
        mapper: (c) => [
          c.formation_nom || "—",
          c.centre_nom || "—",
          c.num_offre || "—",
          c.type_offre || "—",
          c.statut || "—",
          typeof c.saturation_formation === "number"
            ? `${c.saturation_formation}%`
            : "—",
          (c.contenu ?? "").toString(),
          c.auteur || "",
          c.date || "",
        ],
      });

      toast.success(
        `Export ${exportFormat.toUpperCase()} de ${count} commentaire(s) prêt.`
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
        disabled={busy || count === 0}
        aria-label={`${label}${countBadge}`}
        title={
          count === 0
            ? "Aucun commentaire à exporter"
            : `Exporter ${count} commentaire(s)`
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
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
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
            disabled={busy || count === 0}
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
function exportData<T>(exportFormat: string, arg1: { data: Commentaire[]; filename: string; headers: string[]; mapper: (c: any) => any[]; }) {
  throw new Error("Function not implemented.");
}


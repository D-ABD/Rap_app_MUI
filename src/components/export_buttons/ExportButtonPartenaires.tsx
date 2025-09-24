// src/components/export/ExportButtonPartenaires.tsx
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
import { Partenaire } from "../../types/partenaire";
import ExportSelect, { ExportFormat } from "./ExportSelect";

type Props = {
  data: Partenaire[];
  label?: string;
  filenameBase?: string;
};

export default function ExportButtonPartenaires({
  data,
  label = "⬇️ Exporter",
  filenameBase = "partenaires",
}: Props) {
  const [showModal, setShowModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("csv");
  const [busy, setBusy] = useState(false);

  const count = data?.length ?? 0;
  const countBadge = count > 0 ? ` (${count})` : "";
  const today = new Date().toISOString().slice(0, 10);
  const filename = `${filenameBase}_${today}`;

  const openModal = () => setShowModal(true);
  const closeModal = () => {
    if (busy) return;
    setShowModal(false);
  };

  const handleExport = async () => {
    if (!data || data.length === 0) {
      toast.warning("Aucun partenaire à exporter.");
      return;
    }

    try {
      setBusy(true);

      const headers = [
        "Nom",
        "Type",
        "Ville",
        "Secteur d’activité",
        "Créé par",
        "Date",
      ];

      const mapper = (p: Partenaire): string[] => [
        p.nom,
        p.type_display,
        p.city || "",
        p.secteur_activite || "",
        p.created_by?.full_name || "",
        p.created_at || "",
      ];

      await exportData<Partenaire>(exportFormat, {
        data,
        headers,
        mapper,
        filename,
      });

      toast.success(
        `Export ${exportFormat.toUpperCase()} de ${count} partenaire(s) prêt.`
      );
      setShowModal(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erreur lors de l’export.";
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
        title={count === 0 ? "Aucun partenaire à exporter" : `Exporter${countBadge}`}
      >
        {busy ? "⏳ " : "⬇️ "}
        {label}
        {countBadge}
      </Button>

      <Dialog open={showModal} onClose={closeModal} maxWidth="sm" fullWidth>
        <DialogTitle>Exporter les partenaires</DialogTitle>
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
function exportData<T>(exportFormat: string, arg1: { data: Partenaire[]; headers: string[]; mapper: (p: Partenaire) => string[]; filename: string; }) {
  throw new Error("Function not implemented.");
}


// src/components/export/ExportButtonAppairage.tsx
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
import axiosLib from "axios"; // for isAxiosError
import api from "../../api/axios";
import { ExportFormat } from "../../types/export";
import ExportSelect from "./ExportSelect";

type Props = {
  selectedIds: number[];
  label?: string;
  filenameBase?: string;
  endpointBase?: string;
};

function getFilenameFromDisposition(
  disposition?: string | null,
  fallback = "export"
) {
  if (!disposition) return fallback;
  const match =
    /filename\*=UTF-8''([^;]+)|filename="([^"]+)"/i.exec(disposition);
  const raw = match?.[1] ?? match?.[2] ?? "";
  try {
    const name = decodeURIComponent(raw).trim();
    return name || fallback;
  } catch {
    return raw || fallback;
  }
}

function getErrorMessage(err: unknown): string | null {
  if (axiosLib.isAxiosError(err)) {
    const data = err.response?.data as unknown;
    if (typeof data === "string") return data;
    if (data && typeof data === "object") {
      const maybe =
        (data as { message?: unknown }).message ??
        (data as { detail?: unknown }).detail ??
        (data as { error?: unknown }).error;
      if (typeof maybe === "string") return maybe;
    }
    return err.message ?? null;
  }
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  try {
    return JSON.stringify(err);
  } catch {
    return null;
  }
}

export default function ExportButtonAppairage({
  selectedIds,
  label = "⬇️ Exporter",
  filenameBase = "appairages",
  endpointBase = "/api/appairages",
}: Props) {
  const [showModal, setShowModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("xlsx"); // ✅ forcé à XLSX
  const [busy, setBusy] = useState(false);

  const openModal = () => setShowModal(true);
  const closeModal = () => {
    if (busy) return;
    setShowModal(false);
  };

  const handleExport = async () => {
    try {
      setBusy(true);
      const qs =
        typeof window !== "undefined" ? window.location.search || "" : "";
      const base = (endpointBase || "/api/appairages").replace(/\/$/, "");
      const url = `${base}/export-${exportFormat}${qs.startsWith("?") ? qs : ""}`;



      let res;
      if (selectedIds.length > 0) {
        console.log("   méthode = POST, body.ids =", selectedIds);
        res = await api.post(url, { ids: selectedIds }, { responseType: "blob" });
      } else {
        console.log("   méthode = GET (aucune sélection)");
        res = await api.get(url, { responseType: "blob" });
      }


      const contentType = res.headers["content-type"] || "";
      const fallbackMime =
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

      const blob = new Blob([res.data], { type: contentType || fallbackMime });

      const disposition = res.headers["content-disposition"] || null;
      const defaultName = `${filenameBase}.${exportFormat}`;
      const filename = getFilenameFromDisposition(disposition, defaultName);


      const link = document.createElement("a");
      const urlBlob = URL.createObjectURL(blob);
      link.href = urlBlob;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      try {
        URL.revokeObjectURL(urlBlob);
      } catch {
        /* no-op */
      }

      toast.success(
        selectedIds.length
          ? `Export XLSX des ${selectedIds.length} sélection(s) prêt.`
          : "Export XLSX du jeu filtré prêt."
      );
      setShowModal(false);
    } catch (e: unknown) {
      console.error("❌ Erreur export :", e);
      const msg = getErrorMessage(e) || "Erreur lors de l’export.";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  const countBadge = selectedIds.length > 0 ? ` (${selectedIds.length})` : "";
  const buttonTitle =
    selectedIds.length > 0
      ? `Exporter ${selectedIds.length} élément(s)`
      : `Exporter tous les résultats filtrés`;

  return (
    <>
      <Button
        variant="outlined"
        color="secondary"
        onClick={openModal}
        disabled={busy}
        aria-label={`${label}${countBadge}`}
        title={buttonTitle}
      >
        {busy ? "⏳ " : "⬇️ "}
        {label}
        {countBadge}
      </Button>

      <Dialog open={showModal} onClose={closeModal} maxWidth="sm" fullWidth>
        <DialogTitle>Exporter les appairages</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "grid", gap: 1.5 }}>
            <Typography fontWeight={600}>Format d’export</Typography>
            <ExportSelect
              value={exportFormat}
              onChange={setExportFormat}
              options={["xlsx"]} // ✅ limite à XLSX uniquement
            />
          </Box>

          {typeof window !== "undefined" && window.location.search ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 2 }}
            >
              Les filtres/tri actuels (
              <code>{window.location.search}</code>) seront appliqués si aucune
              sélection n’est fournie.
            </Typography>
          ) : (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 2 }}
            >
              Aucun filtre explicite dans l’URL : l’export portera sur l’ensemble
              du jeu courant.
            </Typography>
          )}

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

// src/pages/candidats/CandidatsPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Box,
  Stack,
  Button,
  CircularProgress,
  Typography,
  Select,
  MenuItem,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import { useCandidats, useCandidatFiltres, useDeleteCandidat } from "../../hooks/useCandidats";
import usePagination from "../../hooks/usePagination";
import type { Candidat, CandidatFiltresValues } from "../../types/candidat";

import CandidatsTable from "./CandidatsTable";
import FiltresCandidatsPanel from "../../components/filters/FiltresCandidatsPanel";
import PageTemplate from "../../components/PageTemplate";
import ExportButtonCandidat from "../../components/export_buttons/ExportButtonCandidat";

export default function CandidatsPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Filtres
  const [filters, setFilters] = useState<CandidatFiltresValues>({
    search: "",
    ordering: "-date_inscription",
  });

  const [showFilters, setShowFilters] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const saved = localStorage.getItem("candidats.showFilters");
    return saved != null ? saved === "1" : false;
  });
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("candidats.showFilters", showFilters ? "1" : "0");
    }
  }, [showFilters]);

  // Pagination
  const { page, setPage, pageSize, setPageSize, count, setCount, totalPages } =
    usePagination();

  type EffectiveFilters = CandidatFiltresValues & {
    page: number;
    page_size: number;
  };
  const effectiveFilters: EffectiveFilters = useMemo(
    () => ({ ...filters, page, page_size: pageSize }),
    [filters, page, pageSize]
  );

  const activeFiltersCount = useMemo(() => {
    const ignored = new Set(["page", "page_size", "search", "ordering"]);
    return Object.entries(effectiveFilters).filter(([key, val]) => {
      if (ignored.has(key)) return false;
      if (val == null) return false;
      if (typeof val === "string") return val.trim() !== "";
      if (Array.isArray(val)) return val.length > 0;
      return true;
    }).length;
  }, [effectiveFilters]);

  // Data
  const { data: pageData, loading } = useCandidats(effectiveFilters);
  const { options, loading: loadingOptions } = useCandidatFiltres();
  const { remove } = useDeleteCandidat();

  const items: Candidat[] = useMemo(() => pageData?.results ?? [], [pageData]);
  useEffect(() => {
    setCount(pageData?.count ?? 0);
  }, [pageData, setCount]);

  // Sélection
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  useEffect(() => {
    const visible = new Set(items.map((i) => i.id));
    setSelectedIds((prev) => prev.filter((id) => visible.has(id)));
  }, [items]);

  const clearSelection = () => setSelectedIds([]);
  const selectAll = () => setSelectedIds(items.map((i) => i.id));

  // Suppression
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    const idsToDelete = selectedId ? [selectedId] : selectedIds;
    if (!idsToDelete.length) return;
    try {
      await Promise.all(idsToDelete.map((id) => remove(id)));
      toast.success(`🗑️ ${idsToDelete.length} candidat(s) supprimé(s)`);
      setShowConfirm(false);
      setSelectedId(null);
      setSelectedIds([]);
      setPage((p) => p); // refresh soft
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  return (
    <PageTemplate
      title="👥 Candidats"
      refreshButton
      onRefresh={() => {
        setPage((p) => p);
        setFilters((f) => ({ ...f }));
      }}
      actions={
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          flexWrap="wrap"
        >
          <Button
            variant="outlined"
            onClick={() => setShowFilters((v) => !v)}
            fullWidth={isMobile}
          >
            {showFilters ? "🫣 Masquer filtres" : "🔎 Afficher filtres"}
            {activeFiltersCount > 0 ? ` (${activeFiltersCount})` : ""}
          </Button>

          <ExportButtonCandidat
            selectedIds={selectedIds}
            label="⬇️ Exporter"
            filenameBase="candidats"
            endpointBase="/candidats"
          />

          <Select
            size="small"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
          >
            {[5, 10, 20].map((s) => (
              <MenuItem key={s} value={s}>
                {s} / page
              </MenuItem>
            ))}
          </Select>

          <Button
            variant="contained"
            onClick={() => navigate("/candidats/create")}
            fullWidth={isMobile}
          >
            ➕ Nouveau candidat
          </Button>

          {selectedIds.length > 0 && (
            <>
              <Button
                variant="contained"
                color="error"
                onClick={() => setShowConfirm(true)}
              >
                🗑️ Supprimer ({selectedIds.length})
              </Button>
              <Button variant="outlined" onClick={selectAll}>
                ✅ Tout sélectionner
              </Button>
              <Button variant="outlined" onClick={clearSelection}>
                ❌ Annuler
              </Button>
            </>
          )}
        </Stack>
      }
      filters={
        showFilters &&
          (loadingOptions ? (
            <CircularProgress />
          ) : options ? (
            <FiltresCandidatsPanel
              options={options}
              values={effectiveFilters}
              onChange={(v) => {
                setFilters((f) => ({ ...f, ...v }));
                setPage(1);
              }}
            />
          ) : (
            <Typography color="error">
              ⚠️ Impossible de charger les filtres
            </Typography>
          ))
      }
      footer={
        count > 0 && (
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems="center"
            spacing={1}
          >
            <Typography variant="body2">
              Page {page} / {totalPages} ({count} résultats)
            </Typography>
            <Pagination
              page={page}
              count={totalPages}
              onChange={(_, val) => setPage(val)}
              color="primary"
              size={isMobile ? "small" : "medium"}
            />
          </Stack>
        )
      }
    >
      {loading ? (
        <CircularProgress />
      ) : !items.length ? (
        <Box textAlign="center" color="text.secondary" my={4}>
          <Typography>Aucun candidat trouvé.</Typography>
        </Box>
      ) : (
        <CandidatsTable
          items={items}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onDelete={(id) => {
            setSelectedId(id);
            setShowConfirm(true);
          }}
        />
      )}

      {/* Confirmation dialog */}
      <Dialog
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Confirmation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {selectedId
              ? "Supprimer ce candidat ?"
              : `Supprimer les ${selectedIds.length} candidats sélectionnés ?`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirm(false)}>Annuler</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </PageTemplate>
  );
}

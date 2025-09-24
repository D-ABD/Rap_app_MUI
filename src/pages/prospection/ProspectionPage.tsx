// src/pages/prospections/ProspectionPage.tsx
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
} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

import FiltresProspectionsPanel from "../../components/filters/FiltresProspectionsPanel";
import usePagination from "../../hooks/usePagination";
import useFiltresProspections, { useProspections } from "../../hooks/useProspection";
import type { Prospection, ProspectionFiltresValues } from "../../types/prospection";
import { useRedirectToCreateProspection } from "../../hooks/useRedirectToCreateProspection";
import { useAuth } from "../../hooks/useAuth";
import ProspectionTable from "./ProspectionTable";
import SearchInput from "../../components/SearchInput";
import PageTemplate from "../../components/PageTemplate";
import ExportButtonProspection from "../../components/export_buttons/ExportButtonProspection";

export default function ProspectionPage() {
  const navigate = useNavigate();
  const redirectToCreate = useRedirectToCreateProspection();
  const { user } = useAuth();
  const isCandidat = ["candidat", "stagiaire"].includes(user?.role ?? "");

  // ── filtres métier (hors page/page_size)
  const [filters, setFilters] = useState<ProspectionFiltresValues>({
    search: "",
    owner: undefined,
  });

  // ── toggle filtres (masqué par défaut + persistance)
  const [showFilters, setShowFilters] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const saved = localStorage.getItem("prospections.showFilters");
    return saved != null ? saved === "1" : false;
  });
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("prospections.showFilters", showFilters ? "1" : "0");
    }
  }, [showFilters]);

  // ── pagination homogène
  const {
    page,
    setPage,
    pageSize,
    setPageSize,
    count,
    setCount,
    totalPages,
  } = usePagination();

  // ── filtres réellement envoyés à l'API
  type EffectiveFilters = ProspectionFiltresValues & {
    page: number;
    page_size: number;
  };

  const effectiveFilters: EffectiveFilters = useMemo(() => {
    const base: EffectiveFilters = { ...filters, page, page_size: pageSize };

    const entries = Object.entries(base) as [
      keyof EffectiveFilters,
      EffectiveFilters[keyof EffectiveFilters]
    ][];

    const pairs: [keyof EffectiveFilters, EffectiveFilters[keyof EffectiveFilters]][] =
      [];

    for (const [k, v] of entries) {
      if (isCandidat && k === "owner") continue;

      const isEmptyString = typeof v === "string" && v.trim() === "";
      const isEmptyArray = Array.isArray(v) && (v as unknown[]).length === 0;
      if (v == null || isEmptyString || isEmptyArray) continue;

      pairs.push([k, v]);
    }

    return Object.fromEntries(pairs) as unknown as EffectiveFilters;
  }, [filters, page, pageSize, isCandidat]);

  // ── nombre de filtres actifs
  const activeFiltersCount = useMemo(() => {
    const ignored = new Set(["page", "page_size", "search"]);
    return Object.entries(effectiveFilters).filter(([k, v]) => {
      if (ignored.has(k)) return false;
      if (v == null) return false;
      if (typeof v === "string") return v.trim() !== "";
      if (Array.isArray(v)) return v.length > 0;
      return true;
    }).length;
  }, [effectiveFilters]);

  // ── options filtres + data
  const { filtres, loading: filtresLoading } = useFiltresProspections();

  // 🔁 clé de reload
  const [reloadKey, setReloadKey] = useState(0);

  const { pageData, loading, error } = useProspections(effectiveFilters, reloadKey);

  const prospections: Prospection[] = useMemo(
    () => (pageData?.results ?? []) as Prospection[],
    [pageData]
  );

  useEffect(() => {
    setCount(pageData?.count ?? 0);
  }, [pageData, setCount]);

  // ── sélection
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  useEffect(() => {
    const visible = new Set(prospections.map((p) => p.id));
    setSelectedIds((prev) => prev.filter((id) => visible.has(id)));
  }, [prospections]);

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };
  const clearSelection = () => setSelectedIds([]);
  const selectAll = () => setSelectedIds(prospections.map((p) => p.id));

  // ── suppression
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    const idsToDelete = selectedId ? [selectedId] : selectedIds;
    if (!idsToDelete.length) return;
    try {
      const api = await import("../../api/axios");
      await Promise.all(
        idsToDelete.map((id) => api.default.delete(`/prospections/${id}/`))
      );
      toast.success(`🗑️ ${idsToDelete.length} prospection(s) supprimée(s)`);
      setShowConfirm(false);
      setSelectedId(null);
      setSelectedIds([]);
      setReloadKey((k) => k + 1);
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  // ── navigation ligne
  const handleRowClick = (id: number) => {
    if (!user) return;
    const isAdmin = ["staff", "admin", "superadmin"].includes(user.role);
    navigate(isAdmin ? `/prospections/${id}/edit` : `/prospections/${id}/edit-candidat`);
  };
  const handleDeleteClick = (id: number) => {
    setSelectedId(id);
    setShowConfirm(true);
  };

  return (
    <PageTemplate
      title="📈 Prospections"
      refreshButton
      onRefresh={() => setReloadKey((k) => k + 1)}
      actions={
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Button variant="outlined" onClick={() => setShowFilters((v) => !v)}>
            {showFilters ? "🫣 Masquer filtres" : "🔎 Afficher filtres"}
            {activeFiltersCount > 0 ? ` (${activeFiltersCount})` : ""}
          </Button>

          <SearchInput
            placeholder="🔍 Rechercher..."
            value={filters.search || ""}
            onChange={(e) => {
              setFilters({ ...filters, search: e.target.value });
              setPage(1);
            }}
          />

          <ExportButtonProspection data={prospections} selectedIds={selectedIds} />

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

          <Button variant="contained" onClick={redirectToCreate}>
            ➕ Nouvelle prospection
          </Button>

          {selectedIds.length > 0 && (
            <>
              <Button
                color="error"
                variant="contained"
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
          (filtresLoading ? (
            <CircularProgress />
          ) : filtres ? (
            <FiltresProspectionsPanel
              filtres={{
                ...filtres,
                owners: isCandidat ? [] : filtres.owners,
              }}
              values={effectiveFilters}
              onChange={(newValues) => {
                setFilters((f) => ({ ...f, ...newValues }));
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
            />
          </Stack>
        )
      }
    >
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Typography color="error">
          Erreur lors du chargement des prospections.
        </Typography>
      ) : prospections.length === 0 ? (
        <Box textAlign="center" color="text.secondary" my={4}>
          <Box fontSize={48} mb={1}>
            📭
          </Box>
          <Typography>Aucune prospection trouvée.</Typography>
        </Box>
      ) : (
        <Box sx={{ width: "100%", overflowX: "auto", mt: 2 }}>
          <ProspectionTable
            prospections={prospections}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            onRowClick={handleRowClick}
            onDeleteClick={handleDeleteClick}
          />
        </Box>
      )}

      {/* Confirmation dialog */}
      <Dialog
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <WarningAmberIcon color="warning" />
          Confirmation
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {selectedId
              ? "Supprimer cette prospection ?"
              : `Supprimer les ${selectedIds.length} prospections sélectionnées ?`}
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

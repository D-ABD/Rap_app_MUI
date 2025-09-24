// src/components/CommentaireStatsDashboard.tsx
import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  Box,
  Typography,
  Select,
  MenuItem,
  TextField,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
} from "@mui/material";
import {
  ChatBubbleOutline as ChatBubbleOutlineIcon,
  Refresh as RefreshIcon,
  CalendarToday as CalendarTodayIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import {
  CommentaireFilters,
  CommentaireItem,
  useCommentaireLatest,
  useFormationOptionsFromGrouped,
} from "../../../types/commentaireStats";
import api from "../../../api/axios";

/* ──────────────────────────────
   Helpers fetch grouped options
────────────────────────────── */
type GroupedRow = {
  group_key?: string | number | null;
  group_label?: string | null;
  departement?: string | null;
  "formation__centre_id"?: number | null;
  "formation__centre__nom"?: string | null;
};

function sanitize(obj: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  Object.entries(obj).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    out[k] = v;
  });
  return out;
}

function useCentreOptionsFromGrouped(filters: CommentaireFilters) {
  const params = useMemo(
    () => sanitize({ ...filters, centre: undefined }),
    [filters]
  );
  return useQuery<Array<{ id: string | number; label: string }>, Error>({
    queryKey: ["commentaires:options:centre", params],
    queryFn: async () => {
      const { data } = await api.get<{ results: GroupedRow[] }>(
        "/commentaire-stats/grouped/",
        { params: { ...params, by: "centre" } }
      );
      return (data?.results ?? [])
        .map((r) => {
          const id =
            (typeof r["formation__centre_id"] === "number"
              ? r["formation__centre_id"]
              : undefined) ??
            (typeof r.group_key === "number" || typeof r.group_key === "string"
              ? r.group_key
              : undefined);
          if (id == null) return null;
          const label =
            (r["formation__centre__nom"] as string) ??
            (r.group_label as string) ??
            `Centre #${id}`;
          return { id, label };
        })
        .filter(Boolean) as Array<{ id: string | number; label: string }>;
    },
    staleTime: 5 * 60_000,
    placeholderData: (prev) => prev,
  });
}

function useDepartementOptionsFromGrouped(filters: CommentaireFilters) {
  const params = useMemo(
    () => sanitize({ ...filters, departement: undefined }),
    [filters]
  );
  return useQuery<Array<{ code: string; label: string }>, Error>({
    queryKey: ["commentaires:options:departement", params],
    queryFn: async () => {
      const { data } = await api.get<{ results: GroupedRow[] }>(
        "/commentaire-stats/grouped/",
        { params: { ...params, by: "departement" } }
      );
      return (data?.results ?? [])
        .map((r) => {
          const code =
            (r.departement as string) ??
            (typeof r.group_key === "string" ? r.group_key : "");
          if (!code) return null;
          const label = (r.group_label as string) ?? code;
          return { code, label };
        })
        .filter(Boolean) as Array<{ code: string; label: string }>;
    },
    staleTime: 5 * 60_000,
    placeholderData: (prev) => prev,
  });
}

/* ──────────────────────────────
   Page
────────────────────────────── */
export default function CommentaireStatsDashboard({
  title = "Derniers commentaires",
}: {
  title?: string;
}) {
  const [filters, setFilters] = useState<CommentaireFilters>({ limit: 10 });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { data, isLoading, error, refetch, isFetching } =
    useCommentaireLatest(filters);

  const total = data?.count ?? 0;
  const results = data?.results ?? [];

  const {
    data: centreOptions = [],
    isLoading: loadingCentres,
    error: errCentres,
  } = useCentreOptionsFromGrouped(filters);

  const {
    data: departementOptions = [],
    isLoading: loadingDeps,
    error: errDeps,
  } = useDepartementOptionsFromGrouped(filters);

  const {
    data: formationOptions = [],
    isLoading: loadingFormations,
    error: errFormations,
  } = useFormationOptionsFromGrouped(filters);

  // Pagination
  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };
  const paginated = results.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Card sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-end"
        flexWrap="wrap"
        gap={2}
      >
        <Typography variant="subtitle1" fontWeight="bold">
          {title}
        </Typography>

        {/* Filtres rapides */}
        <Box display="flex" gap={1} flexWrap="wrap" alignItems="center">
          {/* Centre */}
          <Select
            size="small"
            value={filters.centre ? String(filters.centre) : ""}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                centre: e.target.value ? Number(e.target.value) : undefined,
              }))
            }
            displayEmpty
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="">
              {loadingCentres
                ? "Chargement…"
                : errCentres
                ? "Centres indisponibles"
                : "Tous centres"}
            </MenuItem>
            {centreOptions.map((c) => (
              <MenuItem key={String(c.id)} value={String(c.id)}>
                {c.label}
              </MenuItem>
            ))}
          </Select>

          {/* Dép */}
          <Select
            size="small"
            value={filters.departement ?? ""}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                departement: e.target.value || undefined,
              }))
            }
            displayEmpty
            sx={{ minWidth: 140 }}
          >
            <MenuItem value="">
              {loadingDeps
                ? "Chargement…"
                : errDeps
                ? "Départements indisponibles"
                : "Tous départements"}
            </MenuItem>
            {departementOptions.map((d) => (
              <MenuItem key={d.code} value={d.code}>
                {d.label}
              </MenuItem>
            ))}
          </Select>

          {/* Formation */}
          <Select
            size="small"
            value={filters.formation ? String(filters.formation) : ""}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                formation: e.target.value ? Number(e.target.value) : undefined,
              }))
            }
            displayEmpty
            sx={{ minWidth: 220 }}
          >
            <MenuItem value="">
              {loadingFormations
                ? "Chargement…"
                : errFormations
                ? "Formations indisponibles"
                : "Toutes formations"}
            </MenuItem>
            {formationOptions.map((f) => (
              <MenuItem key={f.id} value={String(f.id)}>
                {f.nom} — {f.num_offre ?? "?"} ({f.type_offre_nom ?? "?"})
              </MenuItem>
            ))}
          </Select>

          {/* Recherche */}
          <TextField
            size="small"
            placeholder="Recherche"
            value={filters.search ?? ""}
            onChange={(e) =>
              setFilters((f) => ({ ...f, search: e.target.value || undefined }))
            }
            sx={{ minWidth: 180 }}
          />

          {/* Refresh */}
          <RefreshIcon
            fontSize="small"
            onClick={() => refetch()}
            style={{ cursor: "pointer" }}
            titleAccess="Rafraîchir"
            color={isFetching ? "disabled" : "action"}
          />
        </Box>
      </Box>

      {/* Content */}
      {isLoading ? (
        <Box display="flex" justifyContent="center" p={2}>
          <CircularProgress size={24} />
        </Box>
      ) : error ? (
        <Alert severity="error">{(error as Error).message}</Alert>
      ) : results.length === 0 ? (
        <Alert severity="info">Aucun commentaire trouvé.</Alert>
      ) : (
        <Paper sx={{ width: "100%", overflow: "hidden" }}>
          <TableContainer sx={{ maxHeight: 400 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Formation</TableCell>
                  <TableCell>Centre</TableCell>
                  <TableCell>Période</TableCell>
                  <TableCell>Auteur</TableCell>
                  <TableCell>Commentaire</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginated.map((c: CommentaireItem) => (
                  <TableRow key={c.id} hover>
                    {/* Date */}
                    <TableCell>
                      <ChatBubbleOutlineIcon fontSize="small" /> {c.date} ·{" "}
                      {c.heure}
                    </TableCell>

                    {/* Formation */}
                    <TableCell>
                      <strong>
                        {c.formation_nom ??
                          `Formation #${c.formation_id ?? "—"}`}
                      </strong>
                    </TableCell>

                    {/* Centre */}
                    <TableCell>
                      {c.centre_nom && (
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <BusinessIcon fontSize="small" />
                          {c.centre_nom}
                        </Box>
                      )}
                    </TableCell>

                    {/* Dates */}
                    <TableCell>
                      {(c.start_date || c.end_date) && (
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <CalendarTodayIcon fontSize="small" />
                          {c.start_date?.slice(0, 10) ?? "?"} →{" "}
                          {c.end_date?.slice(0, 10) ?? "?"}
                        </Box>
                      )}
                    </TableCell>

                    {/* Auteur */}
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <PersonIcon fontSize="small" />
                        <Typography
                          variant="body2"
                          noWrap
                          title={c.auteur}
                          sx={{ maxWidth: 150 }}
                        >
                          {c.auteur}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Commentaire (tronqué) */}
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: 400,
                        }}
                        title={c.contenu}
                      >
                        {c.contenu}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <TablePagination
            component="div"
            count={results.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 20, 50]}
            labelRowsPerPage="Lignes par page"
          />
        </Paper>
      )}

      {/* Footer stats */}
      <Box display="flex" gap={2}>
        <Typography variant="caption" color="text.secondary">
          Total : {total}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Affichés : {results.length}
        </Typography>
      </Box>
    </Card>
  );
}

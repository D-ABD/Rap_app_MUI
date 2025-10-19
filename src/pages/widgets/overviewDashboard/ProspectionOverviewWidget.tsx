import * as React from "react";
import {
  Box,
  Card,
  Typography,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Divider,
  Button,
} from "@mui/material";

import {
  getErrorMessage,
  ProspectionFilters,
  useProspectionOverview,
  useProspectionGrouped,
  resolveProspectionGroupLabel,
  ProspectionGroupRow,
} from "../../../types/prospectionStats";

// ✅ Icônes
import AssignmentIcon from "@mui/icons-material/Assignment";
import ArchiveIcon from "@mui/icons-material/Archive";

// ✅ Recharts
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#66bb6a", // success
  "#ffa726", // warning
  "#42a5f5", // info
  "#ef5350", // error
  "#ab47bc", // violet
  "#8d6e63", // brown
  "#26c6da", // cyan
];

type Props = {
  title?: string;
  initialFilters?: ProspectionFilters;
};

export default function ProspectionOverviewWidget({
  title = "Overview Prospections",
  initialFilters,
}: Props) {
  const [filters, setFilters] = React.useState<ProspectionFilters>(
    initialFilters ?? {}
  );

  const includeArchived = Boolean(filters.avec_archivees);

  const { data: overview, isLoading, error } = useProspectionOverview(filters);

  const { data: centresGrouped, isLoading: loadingCentres } =
    useProspectionGrouped("centre", { ...filters, centre: undefined });

  const { data: depsGrouped } = useProspectionGrouped("departement", {
    ...filters,
    departement: undefined,
  });

  const centreOptions =
    centresGrouped?.results
      ?.map((r: ProspectionGroupRow) => {
        const id =
          r.centre_id ??
          (typeof r.group_key === "string" || typeof r.group_key === "number"
            ? r.group_key
            : undefined);
        return id != null
          ? { id: String(id), label: resolveProspectionGroupLabel(r, "centre") }
          : null;
      })
      .filter((c): c is { id: string; label: string } => c !== null) ?? [];

  const departementOptions =
    depsGrouped?.results
      ?.map((r: ProspectionGroupRow) => {
        const code =
          (typeof r.departement === "string" && r.departement) ||
          (typeof r.group_key === "string" ? r.group_key : "");
        return code
          ? { code, label: resolveProspectionGroupLabel(r, "departement") }
          : null;
      })
      .filter((d): d is { code: string; label: string } => d !== null) ?? [];

  // ✅ Données camembert
  const pieData =
    overview &&
    [
      { name: "Actives", value: overview.kpis.actives ?? 0 },
      { name: "À relancer", value: overview.kpis.a_relancer ?? 0 },
      { name: "En cours", value: overview.kpis.en_cours ?? 0 },
      { name: "À faire", value: overview.kpis.a_faire ?? 0 },
      { name: "Acceptées", value: overview.kpis.acceptees ?? 0 },
      { name: "Refusées", value: overview.kpis.refusees ?? 0 },
      { name: "Annulées", value: overview.kpis.annulees ?? 0 },
      { name: "Non renseigné", value: overview.kpis.non_renseigne ?? 0 },
    ].filter((d) => d.value > 0);

  return (
    <Card
      sx={{
        p: 2,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        borderRadius: 2,
        height: "100%",
      }}
    >
      {/* Header */}
      <Box display="flex" alignItems="center" gap={1}>
        <AssignmentIcon color="primary" />
        <Typography variant="subtitle2" fontWeight="bold">
          {title}
        </Typography>
      </Box>

      <Divider />

      {/* Total prospections */}
      {!isLoading && !error && (
        <Box textAlign="center">
          <Typography variant="h6" fontWeight="bold" color="primary">
            {overview?.kpis.total ?? 0}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            prospections au total
          </Typography>
        </Box>
      )}

      {/* Filtres */}
      <Box display="flex" gap={1} flexWrap="wrap" alignItems="center">
        <Select
          size="small"
          value={filters.centre ?? ""}
          onChange={(e) =>
            setFilters((f) => ({ ...f, centre: e.target.value || undefined }))
          }
          disabled={loadingCentres}
          sx={{ minWidth: 120 }}
          displayEmpty
        >
          <MenuItem value="">Tous les centres</MenuItem>
          {centreOptions.map((c) => (
            <MenuItem key={c.id} value={c.id}>
              {c.label}
            </MenuItem>
          ))}
        </Select>

        <Select
          size="small"
          value={filters.departement ?? ""}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              departement: e.target.value || undefined,
            }))
          }
          sx={{ minWidth: 120 }}
          displayEmpty
        >
          <MenuItem value="">Tous les départements</MenuItem>
          {departementOptions.map((d) => (
            <MenuItem key={d.code} value={d.code}>
              {d.label}
            </MenuItem>
          ))}
        </Select>

        {/* 🔘 Bouton Archivées */}
        <Button
          size="small"
          variant={includeArchived ? "contained" : "outlined"}
          color={includeArchived ? "secondary" : "inherit"}
          onClick={() =>
            setFilters((f) => ({
              ...f,
              avec_archivees: f.avec_archivees ? undefined : true,
            }))
          }
          startIcon={<ArchiveIcon fontSize="small" />}
        >
          {includeArchived ? "Retirer archivées" : "Ajouter archivées"}
        </Button>
      </Box>

      {/* Graphique */}
      {isLoading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress size={22} />
        </Box>
      ) : error ? (
        <Alert severity="error">{getErrorMessage(error)}</Alert>
      ) : pieData && pieData.length > 0 ? (
        <Box sx={{ height: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={90}
                dataKey="value"
                label={({ name, value }) => (
                  <tspan style={{ fontSize: 11 }}>
                    {name}: {String(value)}
                  </tspan>
                )}
              >
                {pieData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `${v} prospections`} />
              <Legend
                verticalAlign="bottom"
                height={30}
                iconType="circle"
                wrapperStyle={{ fontSize: "11px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary">
          Aucune donnée disponible
        </Typography>
      )}
    </Card>
  );
}

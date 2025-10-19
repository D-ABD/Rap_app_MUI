// src/pages/widgets/overviewDashboard/FormationOverviewWidget.tsx
import * as React from "react";
import {
  Card,
  Typography,
  Box,
  Button,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import SchoolIcon from "@mui/icons-material/School";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import {
  Filters,
  GroupRow,
  useFormationOverview,
  useFormationGrouped,
} from "../../../types/formationStats";

/* Utils */
function toFixed0(n?: number | null) {
  return n == null ? "—" : Math.round(n).toString();
}
function omit<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const clone: T = { ...obj };
  for (const k of keys) delete clone[k];
  return clone;
}

// 🎨 couleurs cohérentes avec MUI
const COLORS = ["#4caf50", "#ff9800", "#2196f3"];

// ✅ Label custom : juste le % au centre de la part
const renderLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) / 2;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#0d47a1"
      textAnchor="middle"
      dominantBaseline="middle"
      style={{ fontSize: "13px", fontWeight: "bold" }}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function FormationOverviewWidget({
  title = "Formations - Vue d'ensemble",
  filters,
}: {
  title?: string;
  filters?: Filters;
}) {
  const [localFilters, setLocalFilters] = React.useState<Filters>(
    filters ?? {}
  );
  const [includeArchived, setIncludeArchived] = React.useState(false);

  React.useEffect(() => {
    if (filters) setLocalFilters(filters);
  }, [filters]);

  // On fusionne les filtres avec le flag d’archives
  const effectiveFilters = {
    ...localFilters,
    ...(includeArchived ? { avec_archivees: true } : {}),
  };

  const centreQuery = useFormationGrouped(
    "centre",
    omit(localFilters, ["centre"])
  );
  const deptQuery = useFormationGrouped(
    "departement",
    omit(localFilters, ["departement"])
  );
("Filters envoyés :", effectiveFilters);

  const { data, isLoading, error, refetch, isFetching } =
    useFormationOverview(effectiveFilters);
  const k = data?.kpis;

  // Options select
  const centreOptions =
    centreQuery.data?.results
      ?.map((r: GroupRow) => {
        const label =
          (typeof r["centre__nom"] === "string" && r["centre__nom"]) ||
          (typeof r.group_label === "string" && r.group_label) ||
          undefined;
        const value = r.group_key ?? r.centre_id ?? label;
        return value && label ? { label, value } : null;
      })
      .filter(Boolean) ?? [];

  const deptOptions =
    deptQuery.data?.results
      ?.map((r: GroupRow) => {
        const label =
          (typeof r.group_label === "string" && r.group_label) ||
          (typeof r.departement === "string" && r.departement) ||
          undefined;
        const value = r.group_key ?? r.departement ?? label;
        return value && label ? { label, value } : null;
      })
      .filter(Boolean) ?? [];

  // Données pour le camembert
  const pieData =
    k && [
      { name: "Actives", value: k.nb_actives ?? 0 },
      { name: "À venir", value: k.nb_a_venir ?? 0 },
      { name: "Finies", value: k.nb_terminees ?? 0 },
    ];

  // 🔁 Rafraîchit automatiquement si on change l’état des archivées
  React.useEffect(() => {
    refetch();
  }, [includeArchived]);

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
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        gap={1}
      >
        <Typography variant="subtitle2" fontWeight="bold">
          {title}
        </Typography>

        <Box display="flex" gap={1} flexWrap="wrap">
          {/* Filtre centre */}
          <Select
            size="small"
            value={localFilters.centre ?? ""}
            onChange={(e) =>
              setLocalFilters((f) => ({
                ...f,
                centre: e.target.value ? String(e.target.value) : undefined,
              }))
            }
            sx={{ minWidth: 120 }}
            displayEmpty
          >
            <MenuItem value="">Tous centres</MenuItem>
            {centreOptions.map((o) => (
              <MenuItem key={String(o!.value)} value={String(o!.value)}>
                {o!.label}
              </MenuItem>
            ))}
          </Select>

          {/* Filtre département */}
          <Select
            size="small"
            value={localFilters.departement ?? ""}
            onChange={(e) =>
              setLocalFilters((f) => ({
                ...f,
                departement: e.target.value
                  ? String(e.target.value)
                  : undefined,
              }))
            }
            sx={{ minWidth: 100 }}
            displayEmpty
          >
            <MenuItem value="">Tous dépts</MenuItem>
            {deptOptions.map((o) => (
              <MenuItem key={String(o!.value)} value={String(o!.value)}>
                {o!.label}
              </MenuItem>
            ))}
          </Select>

          {/* 🔘 Bouton inclure archivées */}
          <Button
            size="small"
            variant={includeArchived ? "contained" : "outlined"}
            color={includeArchived ? "secondary" : "inherit"}
            onClick={() => setIncludeArchived((prev) => !prev)}
          >
            {includeArchived ? "Retirer archivées" : "Ajouter archivées"}
          </Button>

          <Button
            size="small"
            variant="outlined"
            onClick={() => refetch()}
            startIcon={
              <RefreshIcon
                fontSize="small"
                sx={{
                  animation: isFetching ? "spin 1s linear infinite" : "none",
                }}
              />
            }
          >
            Rafraîchir
          </Button>
        </Box>
      </Box>

      {/* KPI global */}
      {k && (
        <Box display="flex" alignItems="center" gap={1}>
          <SchoolIcon color="primary" fontSize="small" />
          <Typography variant="h6">{toFixed0(k.nb_formations)}</Typography>
          <Typography variant="body2" color="text.secondary">
            Total
          </Typography>
        </Box>
      )}

      {/* Camembert */}
      {isLoading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress size={20} />
        </Box>
      ) : error ? (
        <Alert severity="error">{(error as Error).message}</Alert>
      ) : pieData ? (
        <Box sx={{ height: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius="40%"
                outerRadius="80%"
                paddingAngle={3}
                dataKey="value"
                labelLine={false}
                label={renderLabel}
              >
                {pieData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `${v} formations`} />
              <Legend
                verticalAlign="bottom"
                height={40}
                iconType="circle"
                wrapperStyle={{
                  fontSize: 11,
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  lineHeight: "14px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      ) : null}
    </Card>
  );
}

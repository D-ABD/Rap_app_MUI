// src/pages/widgets/overviewDashboard/FormationSaturationWidget.tsx
import * as React from "react";
import {
  Filters,
  GroupRow,
  useFormationOverview,
  useFormationGrouped,
} from "../../../types/formationStats";
import {
  Box,
  Typography,
  LinearProgress,
  MenuItem,
  Select,
  FormControl,
  Button,
} from "@mui/material";
import SpeedIcon from "@mui/icons-material/Speed";
import ArchiveIcon from "@mui/icons-material/Archive"; // 🆕 import
import DashboardTemplateSaturation from "../../../components/dashboard/DashboardTemplateSaturation";

function toFixed0(n?: number) {
  return n == null ? "—" : Math.round(n).toString();
}

function omit<T extends object, K extends keyof T>(
  obj: T,
  keys: readonly K[]
): Omit<T, K> {
  const clone = { ...obj };
  for (const k of keys) delete clone[k];
  return clone;
}

function ColoredProgressBar({ value }: { value: number }) {
  let color: "success" | "warning" | "error" = "success";
  if (value >= 80) color = "error";
  else if (value >= 50) color = "warning";

  return (
    <LinearProgress
      variant="determinate"
      value={value}
      color={color}
      sx={{ height: 6, borderRadius: 3 }}
    />
  );
}

export default function FormationSaturationWidget({
  title = "Formations - Saturation globale",
  filters,
}: {
  title?: string;
  filters?: Filters;
}) {
  const [localFilters, setLocalFilters] = React.useState<Filters>(
    filters ?? {}
  );

  const [includeArchived, setIncludeArchived] = React.useState<boolean>(
    !!filters?.avec_archivees
  );

  React.useEffect(() => {
    if (filters) setLocalFilters(filters);
  }, [filters]);

  // ⚙️ Fusion filtres + flag archivées
  const effectiveFilters = React.useMemo(
    () => ({ ...localFilters, avec_archivees: includeArchived }),
    [localFilters, includeArchived]
  );

  const centreQuery = useFormationGrouped(
    "centre",
    omit(effectiveFilters, ["centre"] as const)
  );
  const deptQuery = useFormationGrouped(
    "departement",
    omit(effectiveFilters, ["departement"] as const)
  );

  const { data, isLoading, error, isFetching } =
    useFormationOverview(effectiveFilters);

  const k = data?.kpis;

  // 🎨 couleur du titre selon le taux
  let toneColor:
    | "success.main"
    | "warning.main"
    | "error.main"
    | "text.secondary" = "text.secondary";
  if (k?.taux_saturation != null) {
    if (k.taux_saturation < 50) toneColor = "success.main";
    else if (k.taux_saturation < 80) toneColor = "warning.main";
    else toneColor = "error.main";
  }

  // 🔘 Filtres + bouton archivées
  const filtersBar = (
    <>
      {/* Sélecteur de centre */}
      <FormControl size="small" sx={{ minWidth: 140 }}>
        <Select
          aria-label="Filtrer par centre"
          value={localFilters.centre ?? ""}
          onChange={(e) =>
            setLocalFilters((f) => ({
              ...f,
              centre: e.target.value || undefined,
            }))
          }
          disabled={centreQuery.isLoading}
          displayEmpty
        >
          <MenuItem value="">Tous centres</MenuItem>
          {centreQuery.data?.results?.map((r: GroupRow, i: number) => {
            const value = r.group_key ?? r.centre_id;
            const label =
              (typeof r["centre__nom"] === "string" && r["centre__nom"]) ||
              (typeof r.group_label === "string" && r.group_label) ||
              (r.centre_id ? `Centre #${r.centre_id}` : undefined);
            return value && label ? (
              <MenuItem key={i} value={String(value)}>
                {label}
              </MenuItem>
            ) : null;
          })}
        </Select>
      </FormControl>

      {/* Sélecteur de département */}
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <Select
          aria-label="Filtrer par département"
          value={localFilters.departement ?? ""}
          onChange={(e) =>
            setLocalFilters((f) => ({
              ...f,
              departement: e.target.value || undefined,
            }))
          }
          disabled={deptQuery.isLoading}
          displayEmpty
        >
          <MenuItem value="">Tous départements</MenuItem>
          {deptQuery.data?.results?.map((r: GroupRow, i: number) => {
            const value = r.group_key ?? r.departement;
            const label =
              (typeof r.group_label === "string" && r.group_label) ||
              (typeof r.departement === "string" && r.departement) ||
              undefined;
            return value && label ? (
              <MenuItem key={i} value={String(value)}>
                {label}
              </MenuItem>
            ) : null;
          })}
        </Select>
      </FormControl>

      {/* Bouton Archivées */}
      <Button
        size="small"
        variant={includeArchived ? "contained" : "outlined"}
        color={includeArchived ? "secondary" : "inherit"}
        onClick={() => setIncludeArchived((v) => !v)}
        startIcon={<ArchiveIcon fontSize="small" />}
      >
        {includeArchived ? "Retirer archivées" : "Ajouter archivées"}
      </Button>
    </>
  );

  return (
    <DashboardTemplateSaturation
      title={title}
      toneColor={toneColor}
      isFetching={isFetching}
      isLoading={isLoading}
      error={error ? (error as Error).message : null}
      filters={filtersBar}
    >
      {k && (
        <Box display="flex" alignItems="center" gap={2}>
          {/* Icône ronde */}
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              bgcolor: "primary.light",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <SpeedIcon color="primary" />
          </Box>

          {/* Valeurs */}
          <Box flex={1}>
            <Typography variant="h6" fontWeight="bold">
              {toFixed0(k.taux_saturation)}%
            </Typography>
            <ColoredProgressBar value={k.taux_saturation} />
          </Box>
        </Box>
      )}
    </DashboardTemplateSaturation>
  );
}

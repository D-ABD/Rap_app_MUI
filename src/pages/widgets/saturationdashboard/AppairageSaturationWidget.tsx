import * as React from "react";
import {
  AppairageFilters,
  AppairageGroupRow,
  getErrorMessage,
  resolveAppairageGroupLabel,
  useAppairageGrouped,
  useAppairageOverview,
} from "../../../types/appairageStats";
import {
  Box,
  Typography,
  LinearProgress,
  Select,
  MenuItem,
  TextField,
  FormControl,
} from "@mui/material";
import HandshakeIcon from "@mui/icons-material/Handshake";
import DashboardTemplateSaturation from "../../../components/dashboard/DashboardTemplateSaturation";

function pct(n: number) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

export default function AppairageConversionKpi({
  title = "Appairages - Taux de transformation",
  initialFilters,
}: {
  title?: string;
  initialFilters?: AppairageFilters;
}) {
  const initialRef = React.useRef<AppairageFilters>(initialFilters ?? {});
  const [filters, setFilters] = React.useState<AppairageFilters>(
    initialRef.current
  );
  const [autoDepartement, setAutoDepartement] = React.useState(true);

  const { data, isLoading, error, isFetching } = useAppairageOverview(filters);

  const {
    data: centresGrouped,
    isLoading: loadingCentres,
    error: errCentres,
  } = useAppairageGrouped("centre", { ...filters, centre: undefined });

  const centreOptions = React.useMemo(() => {
    const rows = centresGrouped?.results ?? [];
    return rows
      .map((r: AppairageGroupRow) => {
        const rawId =
          r.formation__centre_id ??
          (typeof r.group_key === "number" || typeof r.group_key === "string"
            ? r.group_key
            : undefined);
        if (rawId == null) return null;
        return { id: String(rawId), label: resolveAppairageGroupLabel(r, "centre") };
      })
      .filter(Boolean)
      .sort((a, b) => (a!.label || "").localeCompare(b!.label || "")) as Array<{
      id: string;
      label: string;
    }>;
  }, [centresGrouped]);

  const centreValue = filters.centre && centreOptions.some((c) => c.id === filters.centre)
    ? filters.centre
    : "";

  const { data: depForCentre } = useAppairageGrouped("departement", {
    ...filters,
    departement: undefined,
    centre: filters.centre,
  });

  React.useEffect(() => {
    if (!autoDepartement || !filters.centre) return;
    const depRaw = depForCentre?.results?.[0]?.departement;
    const dep = depRaw ? String(depRaw) : undefined;
    if (dep && dep !== filters.departement) {
      setFilters((f) => ({ ...f, departement: dep }));
    }
  }, [autoDepartement, filters.centre, depForCentre, filters.departement]);

  const total = data?.kpis?.appairages_total ?? 0;
  const ok = (data?.kpis?.statuts?.["appairage_ok"] as number | undefined) ?? 0;
  const taux = total > 0 ? (ok / total) * 100 : 0;

  const filtersBar = (
    <>
      <FormControl size="small" sx={{ minWidth: 140 }}>
        <Select
          aria-label="Filtrer par centre"
          value={centreValue}
          onChange={(e) => {
            const value = e.target.value as string;
            setFilters((f) => ({ ...f, centre: value === "" ? undefined : value }));
            setAutoDepartement(true);
          }}
          displayEmpty
          disabled={loadingCentres}
        >
          <MenuItem value="">Tous centres</MenuItem>
          {centreOptions.map((c) => (
            <MenuItem key={c.id} value={c.id}>
              {c.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        aria-label="Filtrer par département"
        size="small"
        placeholder="Dépt (ex: 92)"
        value={filters.departement ?? ""}
        onChange={(e) => {
          const v = e.target.value.trim();
          setFilters((f) => ({ ...f, departement: v || undefined }));
          setAutoDepartement(false);
        }}
        sx={{ width: 100 }}
      />
    </>
  );

  return (
    <DashboardTemplateSaturation
      title={title}
      toneColor="primary.main"
      isFetching={isFetching}
      isLoading={isLoading}
      error={error ? getErrorMessage(error) : errCentres ? getErrorMessage(errCentres) : null}
      filters={filtersBar}
    >
      {total > 0 && (
        <Box display="flex" alignItems="center" gap={2}>
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
            <HandshakeIcon color="primary" />
          </Box>

          <Box flex={1}>
            <Typography variant="h6" fontWeight="bold">
              {pct(taux)}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {ok} OK / {total} appairage{total > 1 ? "s" : ""}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={pct(taux)}
              sx={{ mt: 1, borderRadius: 1, height: 8 }}
            />
          </Box>
        </Box>
      )}
    </DashboardTemplateSaturation>
  );
}

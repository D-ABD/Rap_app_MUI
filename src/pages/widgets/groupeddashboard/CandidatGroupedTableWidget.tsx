// src/components/candidats/CandidatGroupedTableWidget.tsx
import * as React from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Box,
  Select,
  MenuItem,
  Button,
} from "@mui/material";
import {
  CandidatFilters,
  CandidatGroupBy,
  useCandidatGrouped,
  getErrorMessage,
} from "../../../types/candidatStats";

/* 🛠 Utils */
function fmt(n?: number | null) {
  return n === undefined || n === null ? "—" : Math.round(n).toString();
}
function sum(rows: Record<string, unknown>[], field: string) {
  return rows.reduce((s, r) => s + ((r[field] as number) || 0), 0);
}

/* Résolution du label */
function resolveLabel(row: Record<string, unknown>, by: CandidatGroupBy): string {
  if (row.group_label && String(row.group_label).trim() !== "")
    return String(row.group_label);

  switch (by) {
    case "centre":
      return (row["formation__centre__nom"] as string) ??
        (row["formation__centre_id"] != null ? `Centre #${row["formation__centre_id"]}` : "—");
    case "departement":
      return (row["departement"] as string) ?? "—";
    case "formation":
      return (row["formation__nom"] as string) ??
        (row["formation_id"] != null ? `Formation #${row["formation_id"]}` : "—");
    case "statut":
      return (row["statut"] as string) ?? "—";
    case "type_contrat":
      return (row["type_contrat"] as string) ?? "—";
    case "cv_statut":
      return (row["cv_statut"] as string) ?? "—";
    case "resultat_placement":
      return (row["resultat_placement"] as string) ?? "—";
    case "contrat_signe":
      return (row["contrat_signe"] as string) ?? "—";
    case "responsable":
      return row["responsable_placement_id"] != null
        ? `User #${row["responsable_placement_id"]}`
        : "—";
    case "entreprise":
      return (row["entreprise_placement__nom"] as string) ??
        (row["entreprise_placement_id"] != null ? `Entreprise #${row["entreprise_placement_id"]}` : "—");
    default:
      return "—";
  }
}

/* 🎯 Composant principal */
export default function CandidatGroupedTableWidget({
  title = "Candidats — Détails groupés",
  defaultBy = "centre",
  defaultFilters,
  showControls = true,
  className,
}: {
  title?: string;
  defaultBy?: CandidatGroupBy;
  defaultFilters?: CandidatFilters;
  showControls?: boolean;
  className?: string;
}) {
  const initial = React.useRef<CandidatFilters>(defaultFilters ?? {});
  const [by, setBy] = React.useState<CandidatGroupBy>(defaultBy);
  const [filters, setFilters] = React.useState<CandidatFilters>(initial.current);

  const { data, isLoading, error } = useCandidatGrouped(by, filters);

  const isDirty = React.useMemo(
    () => JSON.stringify(filters) !== JSON.stringify(initial.current),
    [filters]
  );

  const handleReset = React.useCallback(() => {
    setFilters(initial.current);
  }, []);

  return (
    <Card className={className}>
      <CardHeader
        title={
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Regrouper par centre / département / formation / statut / …
            </Typography>
          </Box>
        }
        action={
          showControls && (
            <Box display="flex" gap={1} flexWrap="wrap">
              <Select
                size="small"
                value={by}
                onChange={(e) => setBy(e.target.value as CandidatGroupBy)}
              >
                <MenuItem value="centre">Par centre</MenuItem>
                <MenuItem value="departement">Par département</MenuItem>
                <MenuItem value="formation">Par formation</MenuItem>
                <MenuItem value="statut">Par statut</MenuItem>
                <MenuItem value="type_contrat">Par type de contrat</MenuItem>
                <MenuItem value="cv_statut">Par statut CV</MenuItem>
                <MenuItem value="resultat_placement">Par résultat placement</MenuItem>
                <MenuItem value="contrat_signe">Par contrat signé</MenuItem>
                <MenuItem value="responsable">Par responsable</MenuItem>
                <MenuItem value="entreprise">Par entreprise</MenuItem>
              </Select>
              <Button
                size="small"
                variant="outlined"
                onClick={handleReset}
                disabled={!isDirty}
              >
                Réinitialiser
              </Button>
            </Box>
          )
        }
        sx={{ alignItems: "flex-end" }}
      />

      <CardContent sx={{ overflowX: "auto", maxHeight: "65vh" }}>
        {isLoading ? (
          <Typography color="text.secondary">Chargement…</Typography>
        ) : error ? (
          <Typography color="error.main">
            Erreur: {getErrorMessage(error)}
          </Typography>
        ) : !data ? null : (
          <>
            <Box component="table"
              sx={{
                minWidth: 1600,
                borderCollapse: "collapse",
                width: "100%",
                fontSize: "0.85rem",
                "& th": {
                  position: "sticky",
                  top: 0,
                  bgcolor: "#e3f2fd",
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  fontWeight: "bold",
                  fontSize: "0.8rem",
                  textAlign: "right",
                  p: 1,
                  zIndex: 2,
                },
                "& th:first-of-type, & td:first-of-type": {
                  textAlign: "left",
                  position: "sticky",
                  left: 0,
                  bgcolor: "background.paper",
                  zIndex: 1,
                  fontWeight: 500,
                },
                "& td": {
                  borderTop: "1px solid",
                  borderColor: "divider",
                  p: 1,
                  textAlign: "right",
                },
                "& tbody tr:nth-of-type(even)": {
                  bgcolor: "grey.50",
                },
                "& tbody tr:hover": {
                  bgcolor: "grey.100",
                },
              }}
            >
              <thead>
                <tr>
                  <th>Groupe</th>
                  <th>Candidats</th>
                  <th>Entretiens OK</th>
                  <th>Tests OK</th>
                  <th>Inscrits GESPERS</th>
                  <th>Admissibles</th>
                  <th>En formation</th>
                  <th>En appairage</th>
                  <th>RQTH</th>
                  <th>OSIA</th>
                  <th>Courriers rentrée</th>
                  <th>Apprentissage</th>
                  <th>Professionnalisation</th>
                  <th>POEI/POEC</th>
                  <th>CRIF</th>
                  <th>Sans contrat</th>
                  <th>Autres contrats</th>
                </tr>
              </thead>
              <tbody>
                {data.results.map((r: Record<string, unknown>, idx: number) => {
                  const label = resolveLabel(r, by);
                  return (
                    <tr key={idx}>
                      <td>{label}</td>
                      <td>{fmt(r["total"] as number | undefined)}</td>
                      <td style={{ background: "#c8e6c9", fontWeight: 600 }}>
                        {fmt(r["entretien_ok"] as number | undefined)}
                      </td>
                      <td style={{ background: "#c8e6c9", fontWeight: 600 }}>
                        {fmt(r["test_ok"] as number | undefined)}
                      </td>
                      <td>{fmt(r["gespers"] as number | undefined)}</td>
                      <td style={{ background: "#bbdefb", fontWeight: 600 }}>
                        {fmt(r["admissibles"] as number | undefined)}
                      </td>
                      <td>{fmt(r["en_formation"] as number | undefined)}</td>
                      <td style={{ background: "#ffe0b2", fontWeight: 600 }}>
                        {fmt(r["en_appairage"] as number | undefined)}
                      </td>
                      <td>{fmt(r["rqth_count"] as number | undefined)}</td>
                      <td>{fmt(r["osia_count"] as number | undefined)}</td>
                      <td>{fmt(r["courrier_rentree_count"] as number | undefined)}</td>
                      <td>{fmt(r["contrat_apprentissage"] as number | undefined)}</td>
                      <td>{fmt(r["contrat_professionnalisation"] as number | undefined)}</td>
                      <td>{fmt(r["contrat_poei_poec"] as number | undefined)}</td>
                      <td>{fmt(r["contrat_crif"] as number | undefined)}</td>
                      <td>{fmt(r["contrat_sans"] as number | undefined)}</td>
                      <td>{fmt(r["contrat_autre"] as number | undefined)}</td>
                    </tr>
                  );
                })}

                {data.results.length > 0 && (
                  <tr style={{ fontWeight: "bold", background: "#f5f5f5" }}>
                    <td>Total</td>
                    <td>{fmt(sum(data.results, "total"))}</td>
                    <td>{fmt(sum(data.results, "entretien_ok"))}</td>
                    <td>{fmt(sum(data.results, "test_ok"))}</td>
                    <td>{fmt(sum(data.results, "gespers"))}</td>
                    <td>{fmt(sum(data.results, "admissibles"))}</td>
                    <td>{fmt(sum(data.results, "en_formation"))}</td>
                    <td>{fmt(sum(data.results, "en_appairage"))}</td>
                    <td>{fmt(sum(data.results, "rqth_count"))}</td>
                    <td>{fmt(sum(data.results, "osia_count"))}</td>
                    <td>{fmt(sum(data.results, "courrier_rentree_count"))}</td>
                    <td>{fmt(sum(data.results, "contrat_apprentissage"))}</td>
                    <td>{fmt(sum(data.results, "contrat_professionnalisation"))}</td>
                    <td>{fmt(sum(data.results, "contrat_poei_poec"))}</td>
                    <td>{fmt(sum(data.results, "contrat_crif"))}</td>
                    <td>{fmt(sum(data.results, "contrat_sans"))}</td>
                    <td>{fmt(sum(data.results, "contrat_autre"))}</td>
                  </tr>
                )}
              </tbody>
            </Box>

            {data.results.length === 0 && (
              <Typography
                sx={{ p: 2, fontSize: "0.9rem" }}
                color="text.secondary"
              >
                Aucun résultat pour les filtres sélectionnés.
              </Typography>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

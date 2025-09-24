// src/components/formation/FormationGroupedWidget.tsx
import * as React from "react";
import {
  Card,
  Typography,
  Box,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  Filters,
  GroupBy,
  useFormationGrouped,
  useFormationDictionaries,
  resolveGroupLabel,
} from "../../../types/formationStats";

function toFixed0(n?: number) {
  return n == null ? "—" : Math.round(n).toString();
}

// 🔹 Colonnes définies une seule fois (perf + clarté)
const COLUMNS = [
  "Formations",
  "Places CRIF",
  "Inscrits CRIF",
  "Places MP",
  "Inscrits MP",
  "Dispo",
  "Saturation",
  "Entrées (formations)",
  "Candidats",
  "Admissibles",
  "Entretiens OK",
  "Tests OK",
  "Inscrits GESPERS",
  "Contrats Appr.",
  "Contrats Prof.",
  "Contrats POEI/POEC",
  "Contrats Autres",
  "Appairages en cours",
  "Appairages OK",
  "Appairages En attente",
  "Appairages À faire",
];

export default function FormationGroupedWidget({
  title = "Détails des formations",
  initialBy = "centre",
  filters,
}: {
  title?: string;
  initialBy?: GroupBy;
  filters?: Filters;
}) {
  const [by, setBy] = React.useState<GroupBy>(initialBy);
  const { data: dicts } = useFormationDictionaries();
  const { data, isLoading, error } = useFormationGrouped(by, filters ?? {});

  return (
    <Card sx={{ p: 2, width: "100%" }}>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        mb={2}
      >
        <Typography variant="h6" fontWeight="bold">
          {title}
        </Typography>
        <Select
          size="small"
          value={by}
          onChange={(e) => setBy(e.target.value as GroupBy)}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="formation">Par formation</MenuItem>
          <MenuItem value="centre">Par centre</MenuItem>
          <MenuItem value="departement">Par département</MenuItem>
          <MenuItem value="type_offre">Par type d’offre</MenuItem>
          <MenuItem value="statut">Par statut</MenuItem>
        </Select>
      </Box>

      {/* Contenu */}
      {isLoading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress size={28} />
        </Box>
      ) : error ? (
        <Alert severity="error">{(error as Error).message}</Alert>
      ) : !data ? null : (
        <Box
          sx={{
            overflowX: "auto",
            maxHeight: { xs: "50vh", md: "65vh" },
          }}
        >
          <Table stickyHeader size="small" aria-label="Tableau des formations">
            {/* 🔹 Entête */}
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    position: "sticky",
                    left: 0,
                    zIndex: 2,
                    backgroundColor: "primary.light",
                    fontWeight: "bold",
                  }}
                >
                  Groupe
                </TableCell>
                {COLUMNS.map((col) => (
                  <TableCell
                    key={col}
                    align="right"
                    sx={{
                      backgroundColor: "primary.light",
                      fontWeight: "bold",
                      fontSize: "0.8rem",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {col}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            {/* 🔹 Corps */}
            <TableBody>
              {data.results.map((r, idx) => {
                const label = resolveGroupLabel(r, by, dicts);
                const rowAny = r as Record<string, unknown>;

                const centreNom =
                  by === "formation" && typeof rowAny["centre__nom"] === "string"
                    ? (rowAny["centre__nom"] as string)
                    : undefined;
                const numOffreRaw =
                  by === "formation" && rowAny["num_offre"] != null
                    ? String(rowAny["num_offre"])
                    : undefined;
                const meta =
                  by === "formation"
                    ? [centreNom, numOffreRaw ? `Offre ${numOffreRaw}` : undefined]
                        .filter(Boolean)
                        .join(" · ")
                    : undefined;

                const nbContratsAppr = rowAny["nb_contrats_apprentissage"] as number;
                const nbContratsProf = rowAny["nb_contrats_professionnalisation"] as number;
                const nbContratsPoeiPoec = rowAny["nb_contrats_poei_poec"] as number;
                const nbContratsAutres = rowAny["nb_contrats_autres"] as number;

                const isEven = idx % 2 === 0;
                const saturation = r.taux_saturation ?? 0;

                let saturationColor: string;
                if (saturation < 50) saturationColor = "success.main";
                else if (saturation < 80) saturationColor = "warning.main";
                else saturationColor = "error.main";

                return (
                  <TableRow
                    key={idx}
                    sx={{
                      backgroundColor: isEven ? "background.default" : "grey.50",
                      "&:hover": { backgroundColor: "action.hover" },
                    }}
                  >
                    {/* Groupe */}
                    <TableCell
                      sx={{
                        position: "sticky",
                        left: 0,
                        backgroundColor: isEven ? "background.default" : "grey.50",
                        zIndex: 1,
                        fontWeight: 500,
                        minWidth: 180,
                        maxWidth: 240,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      <Typography variant="body2">{label}</Typography>
                      {meta && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                        >
                          {meta}
                        </Typography>
                      )}
                    </TableCell>

                    {/* Valeurs */}
                    <TableCell align="right">{toFixed0(r.nb_formations)}</TableCell>
                    <TableCell align="right">{toFixed0(r.total_places_crif)}</TableCell>
                    <TableCell align="right">{toFixed0(r.total_inscrits_crif)}</TableCell>
                    <TableCell align="right">{toFixed0(r.total_places_mp)}</TableCell>
                    <TableCell align="right">{toFixed0(r.total_inscrits_mp)}</TableCell>
                    <TableCell align="right">{toFixed0(r.total_disponibles)}</TableCell>

                    {/* 🔸 Saturation colorée */}
                    <TableCell
                      align="right"
                      sx={{ color: saturationColor, fontWeight: 600 }}
                    >
                      {Math.round(saturation)}%
                    </TableCell>

                    <TableCell align="right">{toFixed0(r.entrees_formation)}</TableCell>
                    <TableCell align="right">{toFixed0(r.nb_candidats)}</TableCell>
                    <TableCell align="right">{toFixed0(r.nb_admissibles)}</TableCell>
                    <TableCell align="right">{toFixed0(r.nb_entretien_ok)}</TableCell>
                    <TableCell align="right">{toFixed0(r.nb_test_ok)}</TableCell>
                    <TableCell align="right">{toFixed0(r.nb_inscrits_gespers)}</TableCell>
                    <TableCell align="right">{toFixed0(nbContratsAppr)}</TableCell>
                    <TableCell align="right">{toFixed0(nbContratsProf)}</TableCell>
                    <TableCell align="right">{toFixed0(nbContratsPoeiPoec)}</TableCell>
                    <TableCell align="right">{toFixed0(nbContratsAutres)}</TableCell>
                    <TableCell align="right">{toFixed0(r.app_total)}</TableCell>

                    {/* 🔸 Appairages mis en avant */}
                    <TableCell
                      align="right"
                      sx={{
                        backgroundColor: alpha("#4caf50", 0.15),
                        fontWeight: 600,
                      }}
                    >
                      {toFixed0(r.app_appairage_ok)}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        backgroundColor: alpha("#ff9800", 0.15),
                        fontWeight: 600,
                      }}
                    >
                      {toFixed0(r.app_en_attente)}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        backgroundColor: alpha("#f44336", 0.15),
                        fontWeight: 600,
                      }}
                    >
                      {toFixed0(r.app_a_faire)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>
      )}
    </Card>
  );
}

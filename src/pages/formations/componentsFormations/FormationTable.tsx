// src/pages/formations/componentsFormations/FormationTable.tsx
import { useMemo, useState } from "react";
import {
  Button,
  Chip,
  LinearProgress,
  Typography,
  Box,
} from "@mui/material";
import ResponsiveTableTemplate, {
  TableColumn,
} from "../../../components/ResponsiveTableTemplate";
import type { Formation } from "../../../types/formation";
import { getFieldValue } from "../../../utils/getFieldValue";

interface Props {
  formations: Formation[];
  selectedIds: number[];
  onToggleSelect: (id: number) => void;
  onRowClick?: (id: number) => void; // ✅ support navigation au clic
}

const formatDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString("fr-FR") : "—";

export default function FormationTable({
  formations,
  selectedIds,
  onToggleSelect,
  onRowClick,
}: Props) {
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  const handleSort = (field: string) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const sortedFormations = useMemo(() => {
    return [...formations].sort((a, b) => {
      if (!sortField) return 0;
      const aValue = getFieldValue(a, sortField);
      const bValue = getFieldValue(b, sortField);
      if (aValue == null) return 1;
      if (bValue == null) return -1;
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortAsc
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortAsc ? aValue - bValue : bValue - aValue;
      }
      return 0;
    });
  }, [formations, sortField, sortAsc]);

  /* === Colonnes === */
  const columns: TableColumn<Formation>[] = [
    {
      key: "nom",
      label: "Formation",
      sticky: "left",
      width: 220,
      render: (row) => <strong>{row.nom || "—"}</strong>,
    },
    {
      key: "centre.nom",
      label: "Centre",
      render: (row) => row.centre?.nom || "—",
    },
    {
      key: "type_offre",
      label: "Type",
      render: (row) =>
        row.type_offre ? (
          <Chip
            size="small"
            label={row.type_offre.libelle || row.type_offre.nom}
            sx={{
              backgroundColor: row.type_offre.couleur || "#ccc",
              color: "#fff",
            }}
          />
        ) : (
          "—"
        ),
    },
    {
      key: "statut",
      label: "Statut",
      render: (row) =>
        row.statut ? (
          <Chip
            size="small"
            label={row.statut.libelle || row.statut.nom}
            sx={{
              backgroundColor: row.statut.couleur || "#ccc",
              color: "#fff",
            }}
          />
        ) : (
          "—"
        ),
    },
    { key: "num_offre", label: "N° Offre" },
    {
      key: "start_date",
      label: "Début",
      render: (row) => formatDate(row.start_date),
    },
    {
      key: "end_date",
      label: "Fin",
      render: (row) => formatDate(row.end_date),
    },
    { key: "nombre_candidats", label: "Candidats" },
    { key: "nombre_entretiens", label: "Entretiens" },
    {
      key: "inscrits",
      label: "Inscrits",
      render: (row) => {
        const inscrits = (row.inscrits_crif ?? 0) + (row.inscrits_mp ?? 0);
        const cap = row.cap ?? 0;
        const pct = cap > 0 ? (inscrits / cap) * 100 : 0;

        return (
          <Box>
            <Typography variant="body2">{inscrits} inscrits</Typography>
            {cap > 0 && (
              <LinearProgress
                variant="determinate"
                value={pct}
                sx={{
                  mt: 0.5,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: "#eee",
                  "& .MuiLinearProgress-bar": {
                    backgroundColor:
                      pct > 90 ? "#d32f2f" : pct > 70 ? "#ed6c02" : "#2e7d32",
                  },
                }}
              />
            )}
          </Box>
        );
      },
    },
    {
      key: "saturation",
      label: "Saturation",
      render: (row) =>
        typeof row.saturation === "number" ? (
          <Box>
            <Typography variant="body2">
              {Math.round(row.saturation)}%
            </Typography>
            <LinearProgress
              variant="determinate"
              value={row.saturation}
              sx={{
                mt: 0.5,
                height: 6,
                borderRadius: 3,
                backgroundColor: "#eee",
                "& .MuiLinearProgress-bar": {
                  backgroundColor:
                    row.saturation > 90
                      ? "#d32f2f"
                      : row.saturation > 70
                      ? "#ed6c02"
                      : "#2e7d32",
                },
              }}
            />
          </Box>
        ) : (
          "—"
        ),
    },
    {
      key: "taux_transformation",
      label: "Transformation",
      render: (row) =>
        typeof row.taux_transformation === "number" ? (
          <Box>
            <Typography variant="body2">{row.taux_transformation}%</Typography>
            <LinearProgress
              variant="determinate"
              value={row.taux_transformation}
              sx={{
                mt: 0.5,
                height: 6,
                borderRadius: 3,
                backgroundColor: "#eee",
                "& .MuiLinearProgress-bar": {
                  backgroundColor:
                    row.taux_transformation > 60
                      ? "#2e7d32"
                      : row.taux_transformation > 30
                      ? "#ed6c02"
                      : "#d32f2f",
                },
              }}
            />
          </Box>
        ) : (
          "—"
        ),
    },
  ];

  return (
    <ResponsiveTableTemplate
      columns={columns}
      data={sortedFormations}
      getRowId={(row) => row.id}
      cardTitle={(row) => row.nom || "—"}
      actions={(row) => (
        <>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => {
              e.stopPropagation();
              window.location.href = `/formations/${row.id}`;
            }}
          >
            Voir
          </Button>
          <Button
            size="small"
            variant="contained"
            color="success"
            onClick={(e) => {
              e.stopPropagation();
              window.location.href = `/formations/${row.id}/edit`;
            }}
          >
            Éditer
          </Button>
        </>
      )}
      onRowClick={(row) => onRowClick?.(row.id)} // ✅ clic ligne → callback
    />
  );
}

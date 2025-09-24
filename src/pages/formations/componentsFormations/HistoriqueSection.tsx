// src/pages/formations/componentsFormations/HistoriqueSection.tsx
import { useEffect, useState, useMemo } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Button,
  Stack,
  Pagination,
  CircularProgress,
  Alert,
  Paper,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import api from "../../../api/axios";
import type { HistoriqueFormation } from "../../../types/historique";
import HistoriqueFormationTable from "./HistoriqueFormationTable";

type Props = {
  formationId: number;
  defaultOpen?: boolean;
};

const ITEMS_PER_PAGE = 3;

export default function HistoriqueSection({
  formationId,
  defaultOpen = false,
}: Props) {
  const [data, setData] = useState<HistoriqueFormation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<
    "created_at" | "champ_modifie" | null
  >(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/formations/historique/?formation=${formationId}`)
      .then((res) => {
        setData(res.data.data || []);
        setError(false);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [formationId]);

  const sortedData = useMemo(() => {
    if (!sortField) return data;
    return [...data].sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (valA === valB) return 0;
      return sortDirection === "asc"
        ? valA > valB
          ? 1
          : -1
        : valA < valB
        ? 1
        : -1;
    });
  }, [data, sortField, sortDirection]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return sortedData.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedData, page]);

  const pageCount = Math.ceil(sortedData.length / ITEMS_PER_PAGE);

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const allVisibleIds = paginatedData.map((d) => d.id);
    const allSelected = allVisibleIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !allVisibleIds.includes(id)));
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...allVisibleIds])]);
    }
  };

  const handleExport = () => {
    const selected = data.filter((h) => selectedIds.includes(h.id));
    const rows = selected.length > 0 ? selected : data;

    const csv = [
      [
        "Formation",
        "Centre",
        "Type d'offre",
        "Statut",
        "N° Offre",
        "Modifié par",
        "Date",
        "Champ",
        "Ancienne",
        "Nouvelle",
        "Saturation",
        "Transformation",
        "Commentaire",
      ],
      ...rows.map((h) => [
        h.formation_nom ?? "—",
        h.centre_nom ?? "—",
        h.type_offre_nom ?? "—",
        h.statut_nom ?? "—",
        h.numero_offre ?? "—",
        h.created_by?.nom ?? "—",
        formatDate(h.created_at),
        h.champ_modifie,
        h.ancienne_valeur ?? "—",
        h.nouvelle_valeur ?? "—",
        h.saturation !== null ? `${h.saturation}%` : "",
        h.taux_transformation !== null ? `${h.taux_transformation}%` : "",
        h.commentaire ?? "—",
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(";"))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "historique_formation.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Accordion defaultExpanded={defaultOpen} sx={{ mt: 2 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6">
          🕓 Historique de la formation ({data.length})
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        {loading && <CircularProgress />}
        {!loading && error && (
          <Alert severity="error">
            Erreur lors du chargement de l’historique.
          </Alert>
        )}
        {!loading && !error && data.length === 0 && (
          <Alert severity="info">Aucune modification enregistrée.</Alert>
        )}
        {!loading && !error && data.length > 0 && (
          <Box>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography variant="body2" fontWeight="bold">
                {selectedIds.length > 0
                  ? `${selectedIds.length} sélectionné(s)`
                  : `${sortedData.length} lignes`}
              </Typography>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleExport}
              >
                📤 Export CSV
              </Button>
            </Stack>

            <Paper variant="outlined">
              <HistoriqueFormationTable
                data={paginatedData}
                selectedIds={selectedIds}
                onSelect={toggleSelect}
                onSelectAll={toggleSelectAll}
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={(field) => {
                  if (sortField === field) {
                    setSortDirection((prev) =>
                      prev === "asc" ? "desc" : "asc"
                    );
                  } else {
                    setSortField(field);
                    setSortDirection("asc");
                  }
                }}
              />
            </Paper>

            {pageCount > 1 && (
              <Stack direction="row" justifyContent="center" mt={2}>
                <Pagination
                  count={pageCount}
                  page={page}
                  onChange={(_, val) => setPage(val)}
                  color="primary"
                />
              </Stack>
            )}
          </Box>
        )}
      </AccordionDetails>
    </Accordion>
  );
}

// 🧠 Format date
function formatDate(iso: string): string {
  const d = new Date(iso);
  return isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
}

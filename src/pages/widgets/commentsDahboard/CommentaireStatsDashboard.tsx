// ======================================================
// src/pages/widgets/commentsDahboard/CommentaireStatsDashboard.tsx
// ✅ Version finale — couleurs & surlignage Quill préservés (identique à CommentairesTable)
// ======================================================

import React, { useState } from "react";
import {
  Card,
  Box,
  Typography,
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
  IconButton,
  Divider,
  Tooltip,
} from "@mui/material";
import { Refresh as RefreshIcon } from "@mui/icons-material";
import DOMPurify from "dompurify";
import {
  CommentaireFilters,
  CommentaireItem,
  useCommentaireLatest,
} from "../../../types/commentaireStats";

/* ---------- 🕒 Format date FR ---------- */
function formatDate(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/* ---------- 🧩 Contenu HTML enrichi sécurisé (identique à CommentairesTable) ---------- */
function CommentaireContent({ html, maxLength = 400 }: { html: string; maxLength?: number }) {
  // ✅ Étape 1 — Sanitize HTML
  const sanitized = DOMPurify.sanitize(html || "<em>—</em>", {
    ALLOWED_TAGS: ["b", "i", "u", "em", "strong", "p", "br", "ul", "ol", "li", "span", "a"],
    ALLOWED_ATTR: ["href", "title", "target", "style"],
    FORBID_TAGS: ["script", "style"],
    FORBID_ATTR: ["onerror", "onclick", "onload"],
  });

  // ✅ Étape 2 — Nettoie les styles inline (conserve color / background / font / déco)
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = sanitized;
  tempDiv.querySelectorAll<HTMLElement>("span").forEach((el) => {
    const style = el.getAttribute("style");
    if (!style) return;
    const safeStyle = style
      .split(";")
      .map((s) => s.trim())
      .filter(
        (s) =>
          s.startsWith("color:") ||
          s.startsWith("background-color:") ||
          s.startsWith("font-weight:") ||
          s.startsWith("font-style:") ||
          s.startsWith("text-decoration:")
      )
      .join(";");
    el.setAttribute("style", safeStyle);
  });

  const cleanedHTML = tempDiv.innerHTML;
  const truncated =
    cleanedHTML.length > maxLength ? cleanedHTML.slice(0, maxLength) + "..." : cleanedHTML;

  // ✅ Étape 3 — Rendu HTML sécurisé, isolé du thème MUI
  return (
    <Tooltip
      title={
        <Box
          sx={{
            all: "revert", // ← neutralise tout style hérité
            maxWidth: 500,
            p: 1,
            fontSize: "0.9rem",
            lineHeight: 1.4,
            "& p": { m: 0, mb: 0.5 },
            "& ul, & ol": { pl: 2, mb: 0.5 },
          }}
          dangerouslySetInnerHTML={{ __html: cleanedHTML }}
        />
      }
      placement="top-start"
      arrow
      enterDelay={400}
    >
      <Box
        sx={{
          all: "revert", // ✅ clé absolue : neutralise le thème MUI ici aussi
          maxHeight: 160,
          overflowY: "auto",
          wordBreak: "break-word",
          fontSize: "0.9rem",
          lineHeight: 1.4,
          "& p": { margin: 0, marginBottom: 0.5 },
          "& ul, & ol": { paddingLeft: 3, marginBottom: 0.5 },
          "& a": { color: "#1976d2", textDecoration: "underline" },
        }}
        dangerouslySetInnerHTML={{ __html: truncated || "<em>—</em>" }}
      />
    </Tooltip>
  );
}

/* ---------- Composant principal ---------- */
export default function CommentaireStatsDashboard({
  title = "Derniers commentaires",
}: {
  title?: string;
}) {
  const [filters] = useState<CommentaireFilters>({ limit: 10 });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { data, isLoading, error, refetch, isFetching } = useCommentaireLatest(filters);
  const results = data?.results ?? [];
  const total = data?.count ?? 0;

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const paginated = results.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Card
      sx={{
        p: 2,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        // 🚫 pas de color ici : on laisse le thème MUI neutre pour préserver les styles inline
      }}
    >
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        gap={2}
      >
        <Typography variant="subtitle1" fontWeight="bold">
          {title}
        </Typography>
        <IconButton onClick={() => refetch()} disabled={isFetching} size="small" title="Rafraîchir">
          <RefreshIcon fontSize="small" />
        </IconButton>
      </Box>

      <Divider />

      {/* États de chargement / erreur */}
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
                  <TableCell>Formation</TableCell>
                  <TableCell>Auteur / Date</TableCell>
                  <TableCell>Commentaire</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {paginated.map((c: CommentaireItem) => (
                  <TableRow key={c.id} hover>
                    {/* Formation */}
                    <TableCell sx={{ maxWidth: 340 }}>
                      <strong>{c.formation_nom || "—"}</strong>
                      <br />
                      {c.type_offre || "—"} / {c.num_offre || "—"}
                      <br />
                      {c.centre_nom || "—"}
                    </TableCell>

                    {/* Auteur / Date */}
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {c.auteur || "—"}
                      <br />
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(c.created_at)}
                      </Typography>
                    </TableCell>

                    {/* Contenu enrichi Quill */}
                    <TableCell sx={{ maxWidth: 420 }}>
                      <CommentaireContent html={c.contenu || "<em>—</em>"} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

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

      {/* Footer */}
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

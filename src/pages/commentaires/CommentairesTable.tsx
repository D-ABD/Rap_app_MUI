// ======================================================
// src/pages/commentaires/CommentairesTable.tsx
// Affichage enrichi des commentaires + infos formation + état
// ======================================================

import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Checkbox,
  Button,
  LinearProgress,
  Box,
  Typography,
  Chip,
  Tooltip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";
import type { Commentaire } from "../../types/commentaire";

/* ---------- 🕒 Formateur de date en français ---------- */
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

/* ---------- 🧩 Contenu HTML enrichi sécurisé (avec couleurs/surlignage) ---------- */
function CommentaireContent({ html, maxLength = 400 }: { html: string; maxLength?: number }) {
  // ✅ Étape 1 — Sanitize HTML
  const sanitized = DOMPurify.sanitize(html || "<em>—</em>", {
    ALLOWED_TAGS: ["b", "i", "u", "em", "strong", "p", "br", "ul", "ol", "li", "span", "a"],
    ALLOWED_ATTR: ["href", "title", "target", "style"],
    FORBID_TAGS: ["script", "style"],
    FORBID_ATTR: ["onerror", "onclick", "onload"],
  });

  // ✅ Étape 2 — Nettoyage des styles inline : garde color / background-color
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = sanitized;

  tempDiv.querySelectorAll<HTMLElement>("span").forEach((el) => {
    const style = el.getAttribute("style");
    if (!style) return;

    const safeStyle = style
      .split(";")
      .map((s) => s.trim().toLowerCase()) // 👈 normalise tout
      .filter(
        (s) =>
          s.startsWith("color:") ||
          s.startsWith("background-color:") ||
          s.startsWith("font-weight:") ||
          s.startsWith("font-style:") ||
          s.startsWith("text-decoration:")
      )
      .join("; ");

    el.setAttribute("style", safeStyle);
  });

  const cleanedHTML = tempDiv.innerHTML;
  const truncated =
    cleanedHTML.length > maxLength ? cleanedHTML.slice(0, maxLength) + "..." : cleanedHTML;

  // ✅ Étape 3 — Rendu fidèle
  return (
    <Tooltip
      title={
        <Box sx={{ maxWidth: 500, p: 1 }}>
          <div
            dangerouslySetInnerHTML={{ __html: cleanedHTML }}
            style={{
              all: "revert",
              fontSize: "0.9rem",
              lineHeight: 1.4,
              wordBreak: "break-word",
            }}
          />
        </Box>
      }
      placement="top-start"
      arrow
      enterDelay={400}
    >
      <Box
        sx={{
          maxHeight: 160,
          overflowY: "auto",
          wordBreak: "break-word",
          fontSize: "0.9rem",
          lineHeight: 1.4,
        }}
      >
        <div
          dangerouslySetInnerHTML={{ __html: truncated || "<em>—</em>" }}
          style={{
            all: "revert",
            fontSize: "0.9rem",
            lineHeight: 1.4,
            wordBreak: "break-word",
          }}
        />
      </Box>
    </Tooltip>
  );
}

/* ---------- Types Props ---------- */
interface Props {
  commentaires: Commentaire[];
  selectedIds: number[];
  onToggleSelect: (id: number) => void;
  onClickRow?: (id: number) => void;
}

/* ---------- Composant principal ---------- */
export default function CommentairesTable({
  commentaires,
  selectedIds,
  onToggleSelect,
  onClickRow,
}: Props) {
  const navigate = useNavigate();

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell padding="checkbox" />
          <TableCell>Formation</TableCell>
          <TableCell>État</TableCell>
          <TableCell>Auteur / Date</TableCell>
          <TableCell>Contenu</TableCell>
          <TableCell align="right">Actions</TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {commentaires.map((c) => {
          const isSelected = selectedIds.includes(c.id);
          const isArchived = c.statut_commentaire === "archive" || c.is_archived;

          return (
            <TableRow
              key={c.id}
              hover
              selected={isSelected}
              sx={{
                cursor: "pointer",
                "&:hover td": { bgcolor: "grey.50" },
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const target = e.target as HTMLElement;
                if (target.closest("a")) return; // évite le clic sur les liens
                if (onClickRow) onClickRow(c.id);
                else navigate(`/commentaires/${c.id}/edit`);
              }}
            >
              {/* ✅ Checkbox */}
              <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                <Checkbox checked={isSelected} onChange={() => onToggleSelect(c.id)} />
              </TableCell>

              {/* ✅ Infos formation */}
              <TableCell sx={{ maxWidth: 340 }}>
                <strong>{c.formation_label || c.formation_nom || "—"}</strong>
                <br />
                {c.type_offre_nom || "—"} / {c.num_offre || "—"}
                <br />
                {c.centre_nom || "—"} / {c.statut_nom || "—"}
                {typeof c.saturation_formation === "number" && (
                  <Box mt={1}>
                    <Typography variant="caption" color="text.secondary">
                      🧪 Saturation au moment du commentaire :{" "}
                      <strong>{c.saturation_formation}%</strong>
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={c.saturation_formation}
                      sx={{
                        mt: 0.5,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: "grey.200",
                        "& .MuiLinearProgress-bar": {
                          backgroundColor:
                            c.saturation_formation < 50
                              ? "warning.main"
                              : c.saturation_formation < 80
                                ? "info.main"
                                : "success.main",
                        },
                      }}
                    />
                  </Box>
                )}
                {typeof c.taux_saturation === "number" && (
                  <Typography variant="caption" display="block" mt={0.5}>
                    📈 Saturation actuelle : <strong>{c.taux_saturation}%</strong>
                  </Typography>
                )}
                {typeof c.saturation_commentaires === "number" && (
                  <Typography variant="caption" display="block">
                    💬 Moy. des commentaires : <strong>{c.saturation_commentaires}%</strong>
                  </Typography>
                )}
                {c.centre_id && (
                  <Typography variant="caption" display="block" color="text.secondary" mt={0.5}>
                    ID centre : {c.centre_id}
                  </Typography>
                )}
              </TableCell>

              {/* ✅ Statut */}
              <TableCell>
                <Chip
                  label={isArchived ? "Archivé" : "Actif"}
                  color={isArchived ? "default" : "success"}
                  size="small"
                  sx={{
                    fontWeight: 500,
                    bgcolor: isArchived ? "grey.200" : "success.light",
                  }}
                />
              </TableCell>

              {/* ✅ Auteur + date */}
              <TableCell sx={{ whiteSpace: "nowrap" }}>
                {c.auteur || "—"}
                <br />
                <Typography variant="caption" color="text.secondary">
                  {formatDate(c.date || c.created_at)}
                </Typography>
              </TableCell>

              {/* ✅ Contenu enrichi */}
              <TableCell sx={{ maxWidth: 420 }}>
                <CommentaireContent html={c.contenu || "<em>—</em>"} />
              </TableCell>

              {/* ✅ Actions */}
              <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => navigate(`/commentaires/${c.id}/edit`)}
                >
                  ✏️ Éditer
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

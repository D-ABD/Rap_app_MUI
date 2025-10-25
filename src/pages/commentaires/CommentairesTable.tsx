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
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";
import type { Commentaire } from "../../types/commentaire";

/** 🕒 Formateur de date en français : "10 oct. 2025, 14:32" */
function formatDate(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (isNaN(date.getTime())) return value; // fallback si format inattendu
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/** 🧩 Contenu HTML enrichi sécurisé */
function CommentaireContent({ html }: { html: string }) {
  const sanitized = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["b", "i", "u", "em", "strong", "p", "br", "ul", "ol", "li", "span", "a"],
    ALLOWED_ATTR: ["href", "title", "target", "style"],
  });

  return (
    <Box
      sx={{
        maxHeight: 180,
        overflowY: "auto",
        wordBreak: "break-word",
        "& p": { m: 0, mb: 0.5 },
        "& ul, & ol": { pl: 3, mb: 0.5 },
        "& a": { color: "primary.main", textDecoration: "underline" },
      }}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}

interface Props {
  commentaires: Commentaire[];
  selectedIds: number[];
  onToggleSelect: (id: number) => void;
  onClickRow?: (id: number) => void;
}

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
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const target = e.target as HTMLElement;
                if (target.closest("a")) return;
                if (onClickRow) {
                  onClickRow(c.id);
                } else {
                  navigate(`/commentaires/${c.id}/edit`);
                }
              }}
              sx={{ cursor: "pointer" }}
            >
              <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                <Checkbox checked={isSelected} onChange={() => onToggleSelect(c.id)} />
              </TableCell>

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

              <TableCell sx={{ whiteSpace: "nowrap" }}>
                {c.auteur || "—"}
                <br />
                <Typography variant="caption" color="text.secondary">
                  {formatDate(c.date || c.created_at)}
                </Typography>
              </TableCell>

              <TableCell>
                <CommentaireContent html={c.contenu || "<em>—</em>"} />
              </TableCell>

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

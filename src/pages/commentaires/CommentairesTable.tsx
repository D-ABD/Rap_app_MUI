// src/pages/commentaires/CommentairesTable.tsx
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
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import type { Commentaire } from "../../types/commentaire";
import CommentaireContent from "./CommentaireContent";

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
          <TableCell>Auteur / Date</TableCell>
          <TableCell>Contenu</TableCell>
          <TableCell align="right">Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {commentaires.map((c) => {
          const isSelected = selectedIds.includes(c.id);

          return (
            <TableRow
              key={c.id}
              hover
              selected={isSelected}
              onClick={() =>
                onClickRow ? onClickRow(c.id) : navigate(`/commentaires/edit/${c.id}`)
              }
              sx={{ cursor: "pointer" }}
            >
              <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={isSelected}
                  onChange={() => onToggleSelect(c.id)}
                />
              </TableCell>

              <TableCell>
                <strong>{c.formation_nom}</strong> / {c.type_offre || "—"} /{" "}
                {c.num_offre || "—"}
                <br />
                {c.centre_nom || "—"}
                <br />
                {c.statut || "—"}
                {typeof c.saturation_formation === "number" && (
                  <Box mt={1}>
                    Saturation : {c.saturation_formation}%
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
              </TableCell>

              <TableCell>
                {c.auteur}
                <br />
                {c.date}
              </TableCell>

              <TableCell>
                <CommentaireContent html={c.contenu || "<em>—</em>"} />
              </TableCell>

              <TableCell
                align="right"
                onClick={(e) => e.stopPropagation()} // évite le clic row
              >
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => navigate(`/commentaires/edit/${c.id}`)}
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

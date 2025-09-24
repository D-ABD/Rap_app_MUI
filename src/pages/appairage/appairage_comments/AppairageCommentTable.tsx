// src/features/appairages/components/AppairageCommentTable.tsx
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  IconButton,
  Box,
} from "@mui/material";
import { Link } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import type { AppairageCommentDTO } from "../../../types/appairageComment";

interface Props {
  rows: AppairageCommentDTO[];
  onEdit?: (row: AppairageCommentDTO) => void;
  onDelete?: (row: AppairageCommentDTO) => void;
  linkToAppairage?: (appairageId: number) => string;
}

export default function AppairageCommentTable({
  rows,
  onEdit,
  onDelete,
  linkToAppairage,
}: Props) {
  return (
    <Box sx={{ mt: 2, overflowX: "auto" }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Appairage</TableCell>
            <TableCell>Partenaire</TableCell>
            <TableCell>Candidat</TableCell>
            <TableCell>Formation</TableCell>
            <TableCell>Auteur</TableCell>
            <TableCell>Statut (snapshot)</TableCell>
            <TableCell>Statut actuel</TableCell>
            <TableCell>Commentaire</TableCell>
            <TableCell>Créé</TableCell>
            {(onEdit || onDelete) && <TableCell>Actions</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.id} hover>
              <TableCell>#{r.id}</TableCell>
              <TableCell>
                {linkToAppairage ? (
                  <Typography
                    component={Link}
                    to={linkToAppairage(r.appairage)}
                    sx={{
                      color: "primary.main",
                      textDecoration: "none",
                      "&:hover": { textDecoration: "underline" },
                    }}
                  >
                    {r.appairage_label}
                  </Typography>
                ) : (
                  r.appairage_label
                )}
              </TableCell>
              <TableCell>{r.partenaire_nom ?? "—"}</TableCell>
              <TableCell>
                {`${r.candidat_nom ?? ""} ${r.candidat_prenom ?? ""}`.trim() ||
                  "—"}
              </TableCell>
              <TableCell>
                {r.formation_nom ? (
                  <>
                    <Typography variant="body2" fontWeight="bold">
                      {r.formation_nom}
                    </Typography>
                    {r.formation_numero_offre && (
                      <Typography variant="caption" display="block">
                        N° {r.formation_numero_offre}
                      </Typography>
                    )}
                    {r.formation_centre && (
                      <Typography variant="caption" display="block">
                        Centre : {r.formation_centre}
                      </Typography>
                    )}
                    {r.formation_type_offre && (
                      <Typography variant="caption" display="block">
                        Type : {r.formation_type_offre}
                      </Typography>
                    )}
                  </>
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell>{r.created_by_username || "—"}</TableCell>
              <TableCell>{r.statut_snapshot ?? "—"}</TableCell>
              <TableCell>{r.appairage_statut_display ?? "—"}</TableCell>
              <TableCell>
                {r.body ? (
                  <Typography
                    variant="body2"
                    sx={{
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {r.body}
                  </Typography>
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell>
                {new Date(r.created_at).toLocaleString("fr-FR")}
              </TableCell>
              {(onEdit || onDelete) && (
                <TableCell>
                  {onEdit && (
                    <IconButton
                      aria-label="Éditer"
                      size="small"
                      onClick={() => onEdit(r)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  )}
                  {onDelete && (
                    <IconButton
                      aria-label="Supprimer"
                      size="small"
                      color="error"
                      onClick={() => onDelete(r)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}

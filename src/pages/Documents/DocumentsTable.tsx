// src/pages/documents/DocumentsTable.tsx
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import type { Document } from "../../types/document";
import DocumentPreview from "./DocumentPreview";

interface Props {
  documents: Document[];
  showActions?: boolean;
  onDelete?: (id: number) => void;
}

export default function DocumentsTable({
  documents,
  showActions = false,
  onDelete,
}: Props) {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box width="100%" mt={2}>
      {/* Desktop Table */}
      {!isMobile && (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nom</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Taille</TableCell>
                <TableCell>Aperçu</TableCell>
                {showActions && <TableCell>Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {documents.map((doc) => (
                <TableRow
                  key={`document-${doc.id}`}
                  hover
                  sx={{ cursor: "pointer" }}
                  onClick={() =>
                    navigate(`/documents/edit/${doc.id}?formation_id=${doc.formation}`)
                  }
                >
                  <TableCell>{doc.nom_fichier}</TableCell>
                  <TableCell>{doc.type_document_display}</TableCell>
                  <TableCell>{doc.taille_readable ?? "–"}</TableCell>
                  <TableCell>
                    <DocumentPreview
                      url={doc.download_url || doc.fichier}
                      nom={doc.nom_fichier}
                    />
                  </TableCell>
                  {showActions && (
                    <TableCell
                      onClick={(e) => e.stopPropagation()} // éviter navigation
                    >
                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() =>
                            navigate(
                              `/documents/edit/${doc.id}?formation_id=${doc.formation}`
                            )
                          }
                        >
                          ✏️ Modifier
                        </Button>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() =>
                            window.open(doc.download_url || doc.fichier, "_blank")
                          }
                        >
                          ⬇️ Télécharger
                        </Button>
                        {onDelete && (
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => onDelete(doc.id)}
                          >
                            🗑️ Supprimer
                          </Button>
                        )}
                      </Stack>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Mobile Card List */}
      {isMobile && (
        <Stack spacing={2}>
          {documents.map((doc) => (
            <Card key={`card-${doc.id}`} variant="outlined">
              <CardContent>
                <Typography variant="body2" gutterBottom>
                  🗂️ {doc.type_document_display} —{" "}
                  <strong>{doc.nom_fichier}</strong>
                </Typography>
                <Box mb={1}>
                  <DocumentPreview
                    url={doc.download_url || doc.fichier}
                    nom={doc.nom_fichier}
                  />
                </Box>
                {showActions && (
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() =>
                        navigate(`/documents/edit/${doc.id}?formation_id=${doc.formation}`)
                      }
                    >
                      ✏️ Modifier
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() =>
                        window.open(doc.download_url || doc.fichier, "_blank")
                      }
                    >
                      ⬇️ Télécharger
                    </Button>
                    {onDelete && (
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => onDelete(doc.id)}
                      >
                        🗑️ Supprimer
                      </Button>
                    )}
                  </Stack>
                )}
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
}

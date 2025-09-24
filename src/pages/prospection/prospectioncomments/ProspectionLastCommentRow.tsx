// src/pages/prospections/components/ProspectionLastCommentRow.tsx
import { useMemo } from "react";
import {
  Box,
  Stack,
  Typography,
  Button,
  Skeleton,
  Paper,
} from "@mui/material";
import { useListProspectionComments } from "../../../hooks/useProspectionComments";
import type { ProspectionCommentDTO } from "../../../types/prospectionComment";

type Props = {
  prospectionId: number;
  onOpenModal: () => void;
};

const formatDate = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ""
    : new Intl.DateTimeFormat("fr-FR", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(d);
};

export default function ProspectionLastCommentRow({
  prospectionId,
  onOpenModal,
}: Props) {
  const params = useMemo(
    () => ({ prospection: prospectionId, ordering: "-created_at" as const }),
    [prospectionId]
  );
  const { data, loading, error } = useListProspectionComments(params);

  const last: ProspectionCommentDTO | undefined = Array.isArray(data)
    ? data[0]
    : undefined;

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "180px 1fr auto" },
        gap: 2,
        alignItems: "center",
      }}
    >
      <Typography variant="subtitle2" fontWeight={600} color="text.primary">
        Dernier commentaire
      </Typography>

      <Box sx={{ minHeight: 40 }}>
        {loading && (
          <Stack spacing={1}>
            <Skeleton width="60%" height={20} />
            <Skeleton height={20} />
          </Stack>
        )}

        {!loading && error && (
          <Typography variant="body2" color="error">
            Erreur de chargement des commentaires.
          </Typography>
        )}

        {!loading && !error && !last && (
          <Typography variant="body2" color="text.secondary">
            Aucun commentaire pour le moment.
          </Typography>
        )}

        {!loading && !error && last && (
          <Stack spacing={0.5}>
            <Typography
              variant="body2"
              noWrap
              title={last.body}
              sx={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {last.body}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              par {last.created_by_username} • {formatDate(last.created_at)}
              {typeof data?.length === "number" && data.length > 1
                ? ` • ${data.length} au total`
                : ""}
            </Typography>
          </Stack>
        )}
      </Box>

      <Box>
        <Button
          onClick={onOpenModal}
          variant="outlined"
          size="small"
          aria-label="Voir tous les commentaires"
        >
          Voir tous / ajouter un commentaire
        </Button>
      </Box>
    </Paper>
  );
}

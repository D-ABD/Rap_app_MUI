// src/pages/prospection/ProspectionComment/ProspectionCommentTable.tsx
import { Link } from "react-router-dom";
import { IconButton, Stack } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import ResponsiveTableTemplate, {
  TableColumn,
} from "../../../components/ResponsiveTableTemplate";
import type { ProspectionCommentDTO } from "../../../types/prospectionComment";

interface Props {
  rows: ProspectionCommentDTO[];
  onEdit?: (row: ProspectionCommentDTO) => void;
  onDelete?: (row: ProspectionCommentDTO) => void;
  linkToProspection?: (prospectionId: number) => string;
}

const dtfFR =
  typeof Intl !== "undefined"
    ? new Intl.DateTimeFormat("fr-FR", {
        dateStyle: "short",
        timeStyle: "short",
      })
    : undefined;

const fmt = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : dtfFR
    ? dtfFR.format(d)
    : d.toLocaleString("fr-FR");
};

export default function ProspectionCommentTable({
  rows,
  onEdit,
  onDelete,
  linkToProspection,
}: Props) {
  // détection colonnes optionnelles
  const showOwnerCol = rows.some(
    (r: any) =>
      r.prospection_owner_username != null || r.prospection_owner != null
  );
  const showPartenaireCol = rows.some(
    (r) => !!(r.partenaire_nom && r.partenaire_nom.trim())
  );

  const columns: TableColumn<ProspectionCommentDTO>[] = [
    {
      key: "id",
      label: "ID",
      sticky: "left",
      width: 70,
      render: (r) => `#${r.id}`,
    },
    {
      key: "prospection",
      label: "Prospection",
      sticky: "left",
      width: 260,
      render: (r) => {
        const label =
          r.prospection_text?.trim() ||
          [r.partenaire_nom, r.formation_nom].filter(Boolean).join(" • ") ||
          `#${r.prospection}`;
        return linkToProspection ? (
          <Link to={linkToProspection(r.prospection)}>{label}</Link>
        ) : (
          label
        );
      },
    },
    ...(showPartenaireCol
      ? [
          {
            key: "partenaire_nom",
            label: "Partenaire",
            render: (r) => r.partenaire_nom || "—",
          } as TableColumn<ProspectionCommentDTO>,
        ]
      : []),
    ...(showOwnerCol
      ? [
          {
            key: "prospection_owner_username",
            label: "Prospecteur",
            render: (r: any) => r.prospection_owner_username || "—",
          } as TableColumn<ProspectionCommentDTO>,
        ]
      : []),
    {
      key: "created_by_username",
      label: "Auteur",
      render: (r) => r.created_by_username || "—",
    },
    {
      key: "body",
      label: "Commentaire",
      render: (r) => (r.body ? <span title={r.body}>{r.body}</span> : "—"),
    },
    {
      key: "created_at",
      label: "Créé",
      render: (r) => fmt(r.created_at),
    },
  ];

  return (
    <ResponsiveTableTemplate
      columns={columns}
      data={rows}
      getRowId={(r) => r.id}
      cardTitle={(r) => `#${r.id} • ${r.created_by_username || "—"}`}
      actions={(r) =>
        (onEdit || onDelete) && (
          <Stack direction="row" spacing={1}>
            {onEdit && (
              <IconButton
                aria-label={`Modifier le commentaire #${r.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(r);
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            )}
            {onDelete && (
              <IconButton
                aria-label={`Supprimer le commentaire #${r.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(r);
                }}
                color="error"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </Stack>
        )
      }
      onRowClick={onEdit}
    />
  );
}

import {
  Checkbox,
  Typography,
  Button,
  Box,
  Chip,
  Link,
} from "@mui/material";
import { Theme } from "@mui/material/styles";
import ResponsiveTableTemplate, {
  type TableColumn,
} from "../../components/ResponsiveTableTemplate";
import { Prospection } from "../../types/prospection";

type ProspectionDisplayFields = {
  partenaire_nom?: string | null;
  formation_nom?: string | null;
  num_offre?: string | null;
  centre_nom?: string | null;
  type_prospection_display?: string | null;
  motif_display?: string | null;
  statut_display?: string | null;
  objectif_display?: string | null;
  owner_username?: string | null;
  created_by?: string | null;
  created_at?: string | null;
  relance_prevue?: string | null;
  commentaire?: string | null;
  partenaire_ville?: string | null;
  partenaire_tel?: string | null;
  partenaire_email?: string | null;
  formation_date_debut?: string | null;
  formation_date_fin?: string | null;
  type_offre_display?: string | null;
  formation_statut_display?: string | null;
  places_disponibles?: number | null;
};

type ProspectionWithLast = Prospection &
  ProspectionDisplayFields & {
    last_comment?: string | null;
    last_comment_at?: string | null;
    comments_count?: number | null;
  };

interface Props {
  prospections: ProspectionWithLast[];
  selectedIds: number[];
  onToggleSelect: (id: number) => void;
  onRowClick: (id: number) => void;
  onDeleteClick: (id: number) => void;
}

const dtfFR =
  typeof Intl !== "undefined" ? new Intl.DateTimeFormat("fr-FR") : undefined;

const fmt = (iso?: string | null): string => {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : dtfFR
    ? dtfFR.format(d)
    : d.toLocaleDateString("fr-FR");
};

// 🎨 Couleurs de statuts
const statutColor = (s?: string | null) => {
  switch ((s || "").toLowerCase()) {
    case "à faire":
    case "a_faire":
      return "warning";
    case "en cours":
      return "info";
    case "acceptee":
    case "acceptée":
      return "success";
    case "refusee":
    case "refusée":
      return "error";
    case "annulee":
    case "annulée":
      return "default";
    default:
      return "default";
  }
};

export default function ProspectionTable({
  prospections,
  selectedIds,
  onToggleSelect,
  onRowClick,
  onDeleteClick,
}: Props) {
  const columns: TableColumn<ProspectionWithLast>[] = [
    {
      key: "select",
      label: "#",
      sticky: "left",
      width: 40,
      render: (row) => (
        <Checkbox
          checked={selectedIds.includes(row.id)}
          onClick={(e) => e.stopPropagation()}
          onChange={() => onToggleSelect(row.id)}
          inputProps={{ "aria-label": `Sélectionner #${row.id}` }}
        />
      ),
    },
    {
      key: "owner",
      label: "👤 Candidat",
      sticky: "left",
      width: 160,
      render: (row) => (
        <Box display="flex" flexDirection="column" gap={0.4}>
          <Typography variant="subtitle2" fontWeight={600} noWrap>
            {row.owner_username || <span style={{ color: "#aaa" }}>—</span>}
          </Typography>
          {row.date_prospection ? (
            <Chip
              size="small"
              variant="outlined"
              color="info"
              label={fmt(row.date_prospection)}
              sx={{ maxWidth: "100%" }}
            />
          ) : (
            <Typography variant="caption" color="text.disabled">
              —
            </Typography>
          )}
        </Box>
      ),
    },
    {
      key: "prospection_infos",
      label: "📌 Prospection",
      width: 220,
      render: (row) => (
        <Box display="flex" flexDirection="column" gap={0.3}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            {row.statut_display && (
              <Chip
                size="small"
                color={statutColor(row.statut_display)}
                label={row.statut_display}
              />
            )}
           
          </Box>
          <Typography variant="subtitle2" fontWeight={600} noWrap>
            {row.type_prospection_display || "—"}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            Motif : {row.motif_display || "—"}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            🎯 {row.objectif_display || "—"}
          </Typography>
          {row.relance_prevue && (
            <Chip
              size="small"
              variant="outlined"
              color="warning"
              label={`Relance le ${fmt(row.relance_prevue)}`}
              sx={{ maxWidth: "100%" }}
            />
          )}
        </Box>
      ),
    },
    {
      key: "activite",
      label: "📦 Activité",
      width: 120,
      render: (row) => (
        <Chip
          size="small"
          label={
            row.activite === "archivee" ? "Archivée" : "Active"
          }
          color={row.activite === "archivee" ? "default" : "success"}
          sx={{
            fontStyle: row.activite === "archivee" ? "italic" : "normal",
            bgcolor: row.activite === "archivee" ? "#e0e0e0" : "rgba(76,175,80,0.1)",
            color: row.activite === "archivee" ? "#555" : "green",
            border: row.activite === "archivee" ? "1px solid #ccc" : "1px solid #9ccc65",
          }}
        />
      ),
    },
    {
      key: "partenaire",
      label: "🏢 Partenaire",
      sticky: "left",
      width: 200,
      render: (row) => (
        <Box display="flex" flexDirection="column" gap={0.2}>
          <Typography variant="subtitle2" fontWeight={700} noWrap>
            {row.partenaire_nom || "—"}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            📍 {row.partenaire_ville || "—"}
          </Typography>
          {row.partenaire_tel && (
            <Typography variant="body2" color="text.secondary" noWrap>
              📞 {row.partenaire_tel}
            </Typography>
          )}
          {row.partenaire_email && (
            <Link
              href={`mailto:${row.partenaire_email}`}
              onClick={(e) => e.stopPropagation()}
              underline="hover"
              sx={{ fontSize: "0.8rem" }}
            >
              ✉️ {row.partenaire_email}
            </Link>
          )}
        </Box>
      ),
    },
    {
      key: "formation_offre",
      label: "🎓 Formation / Offre",
      width: 220,
      render: (row) => (
        <Box display="flex" flexDirection="column" gap={0.2}>
          <Typography variant="subtitle2" fontWeight={600} noWrap>
            {row.formation_nom || "—"}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {row.centre_nom || "—"}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {row.type_offre_display || "—"}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            N° {row.num_offre || "—"}
          </Typography>
        </Box>
      ),
    },
    {
      key: "session",
      label: "📅 Session",
      width: 160,
      render: (row) => (
        <Box display="flex" flexDirection="column" gap={0.2}>
          {row.formation_date_debut || row.formation_date_fin ? (
            <Typography variant="caption" color="text.secondary" noWrap>
              {fmt(row.formation_date_debut)} → {fmt(row.formation_date_fin)}
            </Typography>
          ) : (
            <Typography variant="body2" color="text.disabled">
              —
            </Typography>
          )}
          {typeof row.places_disponibles === "number" ? (
            <Chip
              size="small"
              variant="outlined"
              color={row.places_disponibles > 0 ? "success" : "error"}
              label={`${row.places_disponibles} places`}
            />
          ) : (
            <Typography variant="body2" color="text.disabled">
              —
            </Typography>
          )}
        </Box>
      ),
    },
    {
      key: "last_comment",
      label: "💬 Dernier commentaire",
      width: 220,
      render: (row) => {
        const last = row.last_comment ?? row.commentaire;
        const lastAt = row.last_comment_at;
        const count =
          typeof row.comments_count === "number" ? row.comments_count : null;

        return last ? (
          <Box
            sx={{
              backgroundColor: (theme: Theme) => theme.palette.action.hover,
              p: 0.6,
              borderRadius: 1,
              overflow: "hidden",
            }}
          >
            <Typography
              variant="body2"
              sx={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {last}
            </Typography>
            {(lastAt || (count && count > 1)) && (
              <Typography variant="caption" color="text.secondary" noWrap>
                {lastAt && `le ${fmt(lastAt)}`}{" "}
                {count && count > 1 && `• ${count} comm.`}
              </Typography>
            )}
          </Box>
        ) : (
          <Typography variant="body2" color="text.disabled">
            —
          </Typography>
        );
      },
    },
    {
      key: "audit",
      label: "Créateur",
      width: 140,
      render: (row) => (
        <Box display="flex" flexDirection="column">
          <Typography variant="body2" noWrap>
            {row.created_by || "—"}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {fmt(row.created_at)}
          </Typography>
        </Box>
      ),
    },
  ];

  return (
    <ResponsiveTableTemplate
      columns={columns}
      data={prospections}
      getRowId={(p) => p.id}
      cardTitle={(p) => p.partenaire_nom || "—"}
      actions={(p) => (
        <Button
          size="small"
          color="error"
          variant="outlined"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteClick(p.id);
          }}
        >
          Supprimer
        </Button>
      )}
      onRowClick={(p) => onRowClick(p.id)}
      rowSx={(row) =>
        row.activite === "archivee"
          ? { backgroundColor: "#f6f6f6", opacity: 0.85 }
          : {}
      }
    />
  );
}

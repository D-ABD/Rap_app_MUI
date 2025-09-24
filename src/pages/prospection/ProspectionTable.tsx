// src/pages/prospection/ProspectionTable.tsx
import {
  Checkbox,
  Link,
  Typography,
  Button,
  Box,
  Chip,
} from "@mui/material";
import ResponsiveTableTemplate, {
  type TableColumn,
} from "../../components/ResponsiveTableTemplate";
import {
  Prospection,
  ProspectionMoyenContact,
} from "../../types/prospection";

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

const MOYEN_LABEL: Record<ProspectionMoyenContact, string> = {
  email: "Email",
  telephone: "Téléphone",
  visite: "Visite",
  reseaux: "Réseaux",
};
const MOYEN_ICON: Record<ProspectionMoyenContact, string> = {
  email: "📧",
  telephone: "📞",
  visite: "🤝",
  reseaux: "💬",
};

// 🎨 Statuts colorés
const statutColor = (s?: string | null) => {
  switch ((s || "").toLowerCase()) {
    case "à faire":
    case "a_faire":
      return "warning";
    case "en cours":
      return "info";
    case "terminée":
    case "réalisée":
      return "success";
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
      width: 50,
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
      key: "partenaire_nom",
      label: "Partenaire",
      sticky: "left",
      width: 240,
      render: (row) => (
        <Box>
          <Typography fontWeight={600}>
            {row.partenaire_nom || "—"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {row.partenaire_ville || "—"}
          </Typography>
        </Box>
      ),
    },
    {
      key: "partenaire_tel",
      label: "📞 Téléphone",
      render: (row) =>
        row.partenaire_tel ? (
          <Link
            href={`tel:${row.partenaire_tel}`}
            onClick={(e) => e.stopPropagation()}
          >
            {row.partenaire_tel}
          </Link>
        ) : (
          "—"
        ),
    },
    {
      key: "partenaire_email",
      label: "📧 Email",
      render: (row) =>
        row.partenaire_email ? (
          <Link
            href={`mailto:${row.partenaire_email}`}
            onClick={(e) => e.stopPropagation()}
          >
            {row.partenaire_email}
          </Link>
        ) : (
          "—"
        ),
    },

    // 🔹 Formation éclatée en colonnes
    { key: "formation_nom", label: "Formation", render: (row) => row.formation_nom || "—" },
    { key: "num_offre", label: "N° Offre", render: (row) => row.num_offre || "—" },
    {
      key: "formation_dates",
      label: "Dates",
      render: (row) =>
        row.formation_date_debut || row.formation_date_fin ? (
          <Typography variant="body2" color="text.secondary">
            {fmt(row.formation_date_debut)} → {fmt(row.formation_date_fin)}
          </Typography>
        ) : (
          "—"
        ),
    },
    { key: "type_offre_display", label: "Type offre", render: (row) => row.type_offre_display || "—" },
    {
      key: "formation_statut_display",
      label: "Statut formation",
      render: (row) =>
        row.formation_statut_display ? (
          <Chip
            size="small"
            color={statutColor(row.formation_statut_display)}
            label={row.formation_statut_display}
          />
        ) : (
          "—"
        ),
    },

    {
      key: "places_disponibles",
      label: "Places",
      render: (row) =>
        typeof row.places_disponibles === "number" ? (
          <Chip
            size="small"
            color={row.places_disponibles > 0 ? "success" : "error"}
            label={`${row.places_disponibles} dispo`}
          />
        ) : (
          "—"
        ),
    },
    { key: "centre_nom", label: "Centre" },
    { key: "type_prospection_display", label: "Type" },
    { key: "motif_display", label: "Motif" },
    {
      key: "statut_display",
      label: "Statut",
      render: (row) =>
        row.statut_display ? (
          <Chip
            size="small"
            color={statutColor(row.statut_display)}
            label={row.statut_display}
          />
        ) : (
          "—"
        ),
    },
    { key: "objectif_display", label: "Objectif" },
    {
      key: "moyen_contact",
      label: "Moyen",
      render: (row) =>
        row.moyen_contact ? (
          <Typography variant="body2">
            {MOYEN_ICON[row.moyen_contact]} {MOYEN_LABEL[row.moyen_contact]}
          </Typography>
        ) : (
          "—"
        ),
    },
    { key: "date_prospection", label: "Date", render: (r) => fmt(r.date_prospection) },
    {
      key: "relance_prevue",
      label: "Relance prévue",
      render: (row) =>
        row.relance_prevue ? (
          <Chip
            size="small"
            color="warning"
            icon={<span>⏰</span>}
            label={fmt(row.relance_prevue)}
          />
        ) : (
          "—"
        ),
    },
    {
      key: "last_comment",
      label: "Dernier commentaire",
      render: (row) => {
        const last = row.last_comment ?? row.commentaire;
        const lastAt = row.last_comment_at;
        const count =
          typeof row.comments_count === "number" ? row.comments_count : null;

        return last ? (
          <Box>
            <Typography
              variant="body2"
              sx={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {last}
            </Typography>
            {(lastAt || (count && count > 1)) && (
              <Typography variant="caption" color="text.secondary">
                {lastAt && `le ${fmt(lastAt)}`}{" "}
                {count && count > 1 && `• ${count} comm.`}
              </Typography>
            )}
          </Box>
        ) : (
          "—"
        );
      },
    },
    { key: "owner_username", label: "Responsable" },
    {
      key: "audit",
      label: "Création",
      render: (row) => (
        <Box>
          <Typography variant="body2">{row.created_by || "—"}</Typography>
          <Typography variant="caption" color="text.secondary">
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
    />
  );
}

// src/pages/formations/componentsFormations/HistoriqueFormationTable.tsx
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Checkbox,
  Typography,
} from "@mui/material";
import type { HistoriqueFormation } from "../../../types/historique";
import EtatBadge from "../../../components/EtatBadge";

type Props = {
  data: HistoriqueFormation[];
  selectedIds: number[];
  onSelect: (id: number) => void;
  onSelectAll: () => void;
  sortField: string | null;
  sortDirection: "asc" | "desc";
  onSort: (field: "created_at" | "champ_modifie") => void;
};

export default function HistoriqueFormationTable({
  data,
  selectedIds,
  onSelect,
  onSelectAll,
  sortField,
  sortDirection,
  onSort,
}: Props) {
  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell padding="checkbox">
            <Checkbox
              indeterminate={
                selectedIds.length > 0 && selectedIds.length < data.length
              }
              checked={data.length > 0 && selectedIds.length === data.length}
              onChange={onSelectAll}
            />
          </TableCell>
          <TableCell>Formation</TableCell>
          <TableCell>Centre</TableCell>
          <TableCell>Type d&apos;offre</TableCell>
          <TableCell>Statut</TableCell>
          <TableCell>N° Offre</TableCell>
          <TableCell>🧑 Modifié par</TableCell>
          <TableCell
            sx={{ cursor: "pointer", whiteSpace: "nowrap" }}
            onClick={() => onSort("created_at")}
          >
            🕒 Date{" "}
            {sortField === "created_at" &&
              (sortDirection === "asc" ? "▲" : "▼")}
          </TableCell>
          <TableCell
            sx={{ cursor: "pointer", whiteSpace: "nowrap" }}
            onClick={() => onSort("champ_modifie")}
          >
            Champ{" "}
            {sortField === "champ_modifie" &&
              (sortDirection === "asc" ? "▲" : "▼")}
          </TableCell>
          <TableCell>Ancienne</TableCell>
          <TableCell>Nouvelle</TableCell>
          <TableCell>📊 Stats</TableCell>
          <TableCell>💬 Commentaire</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map((h) => {
          const isSelected = selectedIds.includes(h.id);
          return (
            <TableRow
              key={h.id}
              selected={isSelected}
              hover
              sx={{ "&:nth-of-type(even)": { backgroundColor: "action.hover" } }}
            >
              <TableCell padding="checkbox">
                <Checkbox
                  checked={isSelected}
                  onChange={() => onSelect(h.id)}
                />
              </TableCell>
              <TableCell>{h.formation_nom ?? "—"}</TableCell>
              <TableCell>{h.centre_nom ?? "—"}</TableCell>
              <TableCell>{h.type_offre_nom ?? "—"}</TableCell>
              <TableCell>{h.statut_nom ?? "—"}</TableCell>
              <TableCell>{h.numero_offre ?? "—"}</TableCell>
              <TableCell>
                {h.created_by ? (
                  <>
                    <Typography variant="body2">{h.created_by.nom}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      ({h.created_by.role_label})
                    </Typography>
                  </>
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell>{formatDate(h.created_at)}</TableCell>
              <TableCell>{h.champ_modifie}</TableCell>
              <TableCell>{h.ancienne_valeur ?? "—"}</TableCell>
              <TableCell>{h.nouvelle_valeur ?? "—"}</TableCell>
              <TableCell>
                {typeof h.saturation === "number" && (
                  <EtatBadge
                    label={`Saturation : ${h.saturation}%`}
                    variant={extractVariant(h.saturation_badge)}
                  />
                )}
                {typeof h.taux_transformation === "number" && (
                  <EtatBadge
                    label={`Transfo : ${h.taux_transformation}%`}
                    variant={extractVariant(h.transformation_badge)}
                  />
                )}
                {h.saturation == null && h.taux_transformation == null && "—"}
              </TableCell>
              <TableCell>{h.commentaire ?? "—"}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

// Helpers
function formatDate(iso: string): string {
  const d = new Date(iso);
  return isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
}

type EtatVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "orange"
  | "dark"
  | "default";
const allowed: EtatVariant[] = [
  "success",
  "warning",
  "danger",
  "info",
  "orange",
  "dark",
];

function extractVariant(badge: string | null | undefined): EtatVariant {
  const raw = badge?.replace("badge-", "") ?? "";
  return allowed.includes(raw as EtatVariant)
    ? (raw as EtatVariant)
    : "default";
}

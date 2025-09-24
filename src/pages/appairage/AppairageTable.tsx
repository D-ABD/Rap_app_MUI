// src/components/appairages/AppairageTable.tsx
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Link,
  Typography,
  Stack,
} from "@mui/material";
import { useEffect, useMemo, useRef, useCallback } from "react";
import type { AppairageListItem, TypeOffreMini } from "../../types/appairage";

export type FormationChoice = { value: number; label: string };

type Props = {
  items: AppairageListItem[];
  selectedIds: number[];
  onSelectionChange: (ids: number[]) => void;
  onRowClick: (id: number) => void;
  onDeleteClick?: (id: number) => void;
  onHistoryClick?: (id: number) => void;
  formationChoices?: FormationChoice[];
  maxHeight?: string;
};

const STICKY_COL_1_PX = 36;

const dtfFR =
  typeof Intl !== "undefined" ? new Intl.DateTimeFormat("fr-FR") : undefined;

function formatDateFR(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return dtfFR ? dtfFR.format(d) : d.toLocaleDateString("fr-FR");
}

function resolveFormationLabel(
  r: AppairageListItem,
  formationMap: Map<number, string>
): string {
  if (r.formation_nom) return r.formation_nom;
  const id = r.formation ?? null;
  if (id != null && formationMap.size) {
    const label = formationMap.get(id);
    if (label) return label;
  }
  return "—";
}

function resolveTypeOffre(r: AppairageListItem): string {
  const maybe =
    r.formation_detail?.type_offre ?? r.formation_type_offre ?? null;
  if (!maybe) return "—";
  if (typeof maybe === "string") return maybe;
  const obj = maybe as TypeOffreMini;
  return obj.libelle ?? obj.nom ?? "—";
}

function resolvePlacesDispo(r: AppairageListItem): string {
  const v = r.formation_places_disponibles;
  return typeof v === "number" ? String(v) : "—";
}

function resolvePlacesTotal(r: AppairageListItem): string {
  const v = r.formation_places_total;
  return typeof v === "number" ? String(v) : "—";
}

export default function AppairageTable({
  items,
  selectedIds,
  onSelectionChange,
  onRowClick,
  onDeleteClick,
  formationChoices,
  maxHeight,
}: Props) {
  const formationMap = useMemo(() => {
    const m = new Map<number, string>();
    formationChoices?.forEach((f) => m.set(f.value, f.label));
    return m;
  }, [formationChoices]);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const pageIds = useMemo(() => items.map((i) => i.id), [items]);
  const allChecked =
    pageIds.length > 0 && pageIds.every((id) => selectedSet.has(id));
  const someChecked = pageIds.some((id) => selectedSet.has(id)) && !allChecked;

  const headerCbRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (headerCbRef.current) headerCbRef.current.indeterminate = someChecked;
  }, [someChecked]);

  const toggleAllThisPage = useCallback(() => {
    if (allChecked) {
      onSelectionChange(selectedIds.filter((id) => !pageIds.includes(id)));
    } else {
      const set = new Set(selectedIds);
      for (const id of pageIds) set.add(id);
      onSelectionChange(Array.from(set));
    }
  }, [allChecked, onSelectionChange, pageIds, selectedIds]);

  const toggleOne = useCallback(
    (id: number, checked: boolean) => {
      if (checked) {
        if (!selectedSet.has(id)) onSelectionChange([...selectedIds, id]);
      } else {
        if (selectedSet.has(id))
          onSelectionChange(selectedIds.filter((x) => x !== id));
      }
    },
    [onSelectionChange, selectedIds, selectedSet]
  );

  if (!items.length) {
    return (
      <Typography
        variant="body2"
        sx={{ p: 2, color: "text.secondary", textAlign: "center" }}
      >
        Aucun appairage.
      </Typography>
    );
  }

  return (
    <TableContainer
      sx={{
        maxHeight: maxHeight ?? "65vh",
        borderRadius: 2,
        bgcolor: "background.paper",
      }}
    >
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                width: STICKY_COL_1_PX,
                textAlign: "center",
                left: 0,
                zIndex: 5,
                bgcolor: "grey.100",
                position: "sticky",
              }}
            >
              <Checkbox
                inputRef={headerCbRef}
                checked={allChecked}
                onChange={toggleAllThisPage}
                onClick={(e) => e.stopPropagation()}
              />
            </TableCell>
            <TableCell
              sx={{
                position: "sticky",
                left: STICKY_COL_1_PX,
                zIndex: 4,
                bgcolor: "grey.100",
              }}
            >
              Candidat
            </TableCell>
            <TableCell>Partenaire</TableCell>
            <TableCell>Tél. partenaire</TableCell>
            <TableCell>Email partenaire</TableCell>
            <TableCell>Formation</TableCell>
            <TableCell>Type d’offre</TableCell>
            <TableCell>N° offre</TableCell>
            <TableCell>Places totales</TableCell>
            <TableCell>Places dispo</TableCell>
            <TableCell>Centre</TableCell>
            <TableCell>Début formation</TableCell>
            <TableCell>Fin formation</TableCell>
            <TableCell>Statut formation</TableCell>
            <TableCell>Statut appairage</TableCell>
            <TableCell>Dernier commentaire</TableCell>
            <TableCell>Date appairage</TableCell>
            <TableCell>MAJ le</TableCell>
            <TableCell>MAJ par</TableCell>
            <TableCell>Créé par</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((r, idx) => {
            const isChecked = selectedSet.has(r.id);
            const formationLib = resolveFormationLabel(r, formationMap);
            const typeOffreLib = resolveTypeOffre(r);
            const numOffre =
              r.formation_bref?.num_offre ??
              r.formation_detail?.num_offre ??
              "—";
            const centreNom =
              r.formation_bref?.centre_nom ??
              r.formation_detail?.centre_nom ??
              "—";
            const debut = formatDateFR(
              r.formation_bref?.start_date ?? r.formation_detail?.start_date
            );
            const fin = formatDateFR(r.formation_detail?.end_date);
            const statutFormation = r.formation_detail?.statut ?? "—";
            const placesDispo = resolvePlacesDispo(r);
            const placesTotal = resolvePlacesTotal(r);

            return (
              <TableRow
                key={r.id}
                hover
                tabIndex={0}
                onClick={() => onRowClick(r.id)}
                sx={{
                  cursor: "pointer",
                  "&:nth-of-type(even)": { bgcolor: "grey.50" },
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onRowClick(r.id);
                  }
                }}
              >
                <TableCell
                  sx={{
                    width: STICKY_COL_1_PX,
                    textAlign: "center",
                    left: 0,
                    position: "sticky",
                    bgcolor: "background.paper",
                    zIndex: 2,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Checkbox
                    checked={isChecked}
                    onChange={(e) => toggleOne(r.id, e.target.checked)}
                  />
                </TableCell>

                <TableCell
                  sx={{
                    position: "sticky",
                    left: STICKY_COL_1_PX,
                    bgcolor: "background.paper",
                    zIndex: 1,
                    whiteSpace: "nowrap",
                  }}
                  title={r.candidat_nom ?? ""}
                >
                  {r.candidat_nom ?? "—"}
                </TableCell>

                <TableCell>{r.partenaire_nom ?? "—"}</TableCell>
                <TableCell>{r.partenaire_telephone ?? "—"}</TableCell>
                <TableCell>
                  {r.partenaire_email ? (
                    <Link
                      href={`mailto:${r.partenaire_email}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {r.partenaire_email}
                    </Link>
                  ) : (
                    "—"
                  )}
                </TableCell>

                <TableCell title={formationLib}>{formationLib}</TableCell>
                <TableCell>{typeOffreLib}</TableCell>
                <TableCell>{numOffre}</TableCell>
                <TableCell>{placesTotal}</TableCell>
                <TableCell>{placesDispo}</TableCell>
                <TableCell>{centreNom}</TableCell>
                <TableCell>{debut}</TableCell>
                <TableCell>{fin}</TableCell>
                <TableCell>{statutFormation}</TableCell>
                <TableCell>{r.statut_display ?? "—"}</TableCell>

                <TableCell>
                  {r.last_commentaire ? (
                    <Typography
                      noWrap
                      sx={{
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: 300,
                      }}
                      title={r.last_commentaire}
                    >
                      {r.last_commentaire}
                    </Typography>
                  ) : (
                    "—"
                  )}
                </TableCell>

                <TableCell>{formatDateFR(r.date_appairage)}</TableCell>
                <TableCell>{formatDateFR(r.updated_at)}</TableCell>
                <TableCell>{r.updated_by_nom ?? "—"}</TableCell>
                <TableCell>{r.created_by_nom ?? "—"}</TableCell>

                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Stack direction="row" spacing={1}>
                    <Link component="button" onClick={() => onRowClick(r.id)}>
                      Éditer
                    </Link>
                    {onDeleteClick && (
                      <Link
                        component="button"
                        color="error"
                        onClick={() => onDeleteClick(r.id)}
                      >
                        Supprimer
                      </Link>
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

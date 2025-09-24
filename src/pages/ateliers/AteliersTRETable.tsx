// pages/ateliers/AteliersTRETable.tsx (full MUI)
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Typography,
  IconButton,
  Stack,
  Paper,
} from "@mui/material";
import { useEffect, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import type { AtelierTRE, BasicUserRef } from "../../types/ateliersTre";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";

type Props = {
  items: AtelierTRE[];
  selectedIds: number[];
  onSelectionChange: (ids: number[]) => void;
  onEdit?: (id: number) => void;
  onShow?: (id: number) => void;
  onDelete?: (id: number) => void;
  maxHeight?: string;
};

const dtfDateTimeFR =
  typeof Intl !== "undefined"
    ? new Intl.DateTimeFormat("fr-FR", {
        year: "2-digit",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : undefined;

function formatDateTimeFR(iso?: string | null): string {
  if (!iso) return "—";
  const s = iso.includes("T") ? iso : iso.replace(" ", "T");
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return "—";
  return dtfDateTimeFR ? dtfDateTimeFR.format(d) : d.toLocaleString("fr-FR");
}

function createdByLabel(created_by: AtelierTRE["created_by"]): string {
  if (created_by == null) return "—";
  if (typeof created_by === "number") return `#${created_by}`;
  const ref = created_by as BasicUserRef;
  return ref.full_name?.trim() || `#${ref.id}`;
}

function candidatsPreview(a: AtelierTRE): string {
  const list = a.candidats_detail ?? [];
  if (!list.length) return "—";
  const names = list.slice(0, 3).map((c) => c.nom).join(", ");
  const more = list.length > 3 ? ` +${list.length - 3}` : "";
  return `${names}${more}`;
}

export default function AteliersTreTable({
  items,
  selectedIds,
  onSelectionChange,
  onEdit,
  onShow,
  onDelete,
  maxHeight,
}: Props) {
  const navigate = useNavigate();

  const goEdit = useCallback(
    (id: number) => (onEdit ? onEdit(id) : navigate(`/ateliers-tre/${id}/edit`)),
    [navigate, onEdit]
  );
  const goShow = useCallback(
    (id: number) => (onShow ? onShow(id) : navigate(`/ateliers-tre/${id}`)),
    [navigate, onShow]
  );

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
      const set = new Set<number>(selectedIds);
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
      <Typography sx={{ p: 2, color: "text.secondary", textAlign: "center" }}>
        Aucun atelier.
      </Typography>
    );
  }

  return (
    <TableContainer
      component={Paper}
      sx={{ maxHeight: maxHeight ?? "65vh" }}
    >
      <Table stickyHeader size="small" aria-label="Table des ateliers TRE">
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox
                inputRef={headerCbRef}
                indeterminate={someChecked}
                checked={allChecked}
                onChange={toggleAllThisPage}
                inputProps={{
                  "aria-label": allChecked
                    ? "Tout désélectionner"
                    : "Tout sélectionner la page",
                }}
              />
            </TableCell>
            <TableCell>Atelier</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Centre</TableCell>
            <TableCell>Inscrits</TableCell>
            <TableCell>Candidats (aperçu)</TableCell>
            <TableCell>Créé par</TableCell>
            <TableCell>Créé / MAJ</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {items.map((a) => {
            const isChecked = selectedSet.has(a.id);
            const typeDisplay = a.type_atelier_display || a.type_atelier;
            const dateTxt = formatDateTimeFR(a.date_atelier);
            const centre = a.centre_detail?.label ?? "—";
            const nb =
              typeof a.nb_inscrits === "number"
                ? a.nb_inscrits
                : a.candidats?.length ?? 0;
            const candPrev = candidatsPreview(a);
            const createdBy = createdByLabel(a.created_by);
            const createdAt = formatDateTimeFR(a.created_at ?? null);
            const updatedAt = formatDateTimeFR(a.updated_at ?? null);

            return (
              <TableRow
                key={a.id}
                hover
                role="checkbox"
                tabIndex={-1}
                onClick={() => goEdit(a.id)}
                sx={{ cursor: "pointer" }}
              >
                <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={isChecked}
                    onChange={(e) => toggleOne(a.id, e.target.checked)}
                    inputProps={{
                      "aria-label": `Sélectionner atelier #${a.id}`,
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Typography fontWeight={600}>{typeDisplay}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    #{a.id} · {a.type_atelier}
                  </Typography>
                </TableCell>
                <TableCell>{dateTxt}</TableCell>
                <TableCell>{centre}</TableCell>
                <TableCell>
                  <strong>{nb}</strong>
                </TableCell>
                <TableCell>{candPrev}</TableCell>
                <TableCell>{createdBy}</TableCell>
                <TableCell>
                  <Typography variant="body2">créé&nbsp;: {createdAt}</Typography>
                  <Typography variant="body2">maj&nbsp;: {updatedAt}</Typography>
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Stack direction="row" spacing={1}>
                    <IconButton
                      aria-label="Voir"
                      size="small"
                      onClick={() => goShow(a.id)}
                    >
                      <VisibilityIcon fontSize="inherit" />
                    </IconButton>
                    <IconButton
                      aria-label="Éditer"
                      size="small"
                      onClick={() => goEdit(a.id)}
                    >
                      <EditIcon fontSize="inherit" />
                    </IconButton>
                    {onDelete && (
                      <IconButton
                        aria-label="Supprimer"
                        size="small"
                        color="error"
                        onClick={() => onDelete(a.id)}
                      >
                        <DeleteIcon fontSize="inherit" />
                      </IconButton>
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

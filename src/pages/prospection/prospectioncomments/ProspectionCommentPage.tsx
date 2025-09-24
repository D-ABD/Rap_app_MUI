// src/pages/prospection/ProspectionComment/ProspectionCommentPage.tsx
import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Typography,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

import PageTemplate from "../../../components/PageTemplate";
import ProspectionCommentTable from "./ProspectionCommentTable";
import type {
  ProspectionCommentDTO,
  ProspectionCommentListParams,
} from "../../../types/prospectionComment";
import { useListProspectionComments } from "../../../hooks/useProspectionComments";
import api from "../../../api/axios";
import FiltresProspectionCommentsPanel from "../../../components/filters/FiltresProspectionCommentsPanel";
import { useMe } from "../../../hooks/useUsers";
import { CustomUserRole, User } from "../../../types/User";
import ExportButtonProspectionComment from "../../../components/export_buttons/ExportButtonProspectionComment";

type ProspectionDisplayLite = {
  partenaire_nom: string | null;
  formation_nom: string | null;
};

type ChoiceStr = { value: string; label: string };
type NormalizedRole =
  | "superadmin"
  | "admin"
  | "staff"
  | "stagiaire"
  | "candidat"
  | "autre";

/** Normalise le rôle d’après le type User + flags staff/superuser */
function normalizeRole(u: User | null): NormalizedRole {
  if (!u) return "autre";
  if (u.is_superuser) return "superadmin";
  const r = (u.role || "").toLowerCase() as CustomUserRole | string;
  if (r === "superadmin") return "superadmin";
  if (r === "admin") return "admin";
  if (u.is_staff || r === "staff") return "staff";
  if (r === "stagiaire") return "stagiaire";
  if (r === "candidat" || r === "candidatuser") return "candidat";
  return "autre";
}

export default function ProspectionCommentPage() {
  const navigate = useNavigate();
  const { prospectionId } = useParams<{ prospectionId?: string }>();

  const { user: me } = useMe();
  const role: NormalizedRole = useMemo(() => normalizeRole(me), [me]);

  const showFilters = ["superadmin", "admin", "staff"].includes(role);
  const panelMode: "default" | "candidate" = showFilters ? "default" : "candidate";

  const [params, setParams] = useState<
    ProspectionCommentListParams & { search?: string }
  >(() => {
    const initial: ProspectionCommentListParams & { search?: string } = {
      ordering: "-created_at",
      search: "",
    };
    if (prospectionId && Number.isFinite(Number(prospectionId))) {
      initial.prospection = Number(prospectionId);
    }
    return initial;
  });

  const [reloadKey, setReloadKey] = useState(0);

  const { data, loading, error } = useListProspectionComments(params, reloadKey);

  const rows: ProspectionCommentDTO[] = useMemo(
    () => (Array.isArray(data) ? data : []),
    [data]
  );

  const [prospLookup, setProspLookup] = useState<
    Record<number, ProspectionDisplayLite>
  >({});

  useEffect(() => {
    const missingIds = Array.from(new Set(rows.map((r) => r.prospection))).filter(
      (id) => !(id in prospLookup)
    );
    if (missingIds.length === 0) return;

    (async () => {
      try {
        const results = await Promise.all(
          missingIds.map(async (id) => {
            const { data: p } = await api.get(`/prospections/${id}/`);
            return [
              id,
              {
                partenaire_nom: p?.partenaire_nom ?? null,
                formation_nom: p?.formation_nom ?? null,
              },
            ] as const;
          })
        );
        setProspLookup((prev) => {
          const next = { ...prev };
          for (const [id, meta] of results) next[id] = meta;
          return next;
        });
      } catch {
        // silencieux
      }
    })();
  }, [rows, prospLookup]);

  const enrichedRows: ProspectionCommentDTO[] = useMemo(
    () =>
      rows.map((r) => ({
        ...r,
        partenaire_nom:
          r.partenaire_nom ??
          prospLookup[r.prospection]?.partenaire_nom ??
          null,
        formation_nom:
          r.formation_nom ?? prospLookup[r.prospection]?.formation_nom ?? null,
      })),
    [rows, prospLookup]
  );

  const exportRows = useMemo(
    () =>
      enrichedRows.map((r) => ({
        id: r.id,
        prospection: r.prospection,
        partenaire_nom: r.partenaire_nom ?? null,
        formation_nom: r.formation_nom ?? null,
        prospection_text: r.prospection_text ?? null,
        body: r.body,
        is_internal: r.is_internal,
        created_by_username: r.created_by_username ?? null,
        created_at: r.created_at,
      })),
    [enrichedRows]
  );

  const filtresFromRows = useMemo(() => {
    const add = (set: Set<string>, v?: string | null) => {
      if (v) set.add(v);
    };
    const formations = new Set<string>();
    const partenaires = new Set<string>();
    const authors = new Set<string>();
    for (const r of enrichedRows) {
      add(formations, r.formation_nom);
      add(partenaires, r.partenaire_nom);
      add(authors, r.created_by_username);
    }
    const toChoices = (arr: string[]): ChoiceStr[] =>
      arr.sort((a, b) => a.localeCompare(b)).map((x) => ({ value: x, label: x }));
    return {
      formations: toChoices(Array.from(formations)),
      partenaires: toChoices(Array.from(partenaires)),
      authors: toChoices(Array.from(authors)),
      user_role: role,
    };
  }, [enrichedRows, role]);

  const [selectedRow, setSelectedRow] = useState<ProspectionCommentDTO | null>(
    null
  );
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = useCallback(async () => {
    if (!selectedRow) return;
    try {
      await api.delete(`/prospection-commentaires/${selectedRow.id}/`);
      toast.success(`🗑️ Commentaire #${selectedRow.id} supprimé`);
      setShowConfirm(false);
      setSelectedRow(null);
      setReloadKey((k) => k + 1);
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  }, [selectedRow]);

  return (
    <PageTemplate
      title="Commentaires de prospection"
      refreshButton
      onRefresh={() => setReloadKey((k) => k + 1)}
      actions={
        <Stack direction="row" spacing={1}>
          <Chip
            label={`Rôle : ${role}`}
            size="small"
            color="primary"
            variant="outlined"
          />
          <ExportButtonProspectionComment
            data={exportRows}
            selectedIds={[]}
          />
          <Button
            variant="contained"
            onClick={() => navigate("/prospection-commentaires/create")}
          >
            ➕ Nouveau commentaire
          </Button>
        </Stack>
      }
      filters={
        <FiltresProspectionCommentsPanel
          mode={panelMode}
          filtres={
            showFilters
              ? filtresFromRows
              : { authors: [], formations: [], partenaires: [], user_role: role }
          }
          values={params}
          onChange={(next) => setParams(next)}
          onRefresh={() => setReloadKey((k) => k + 1)}
          onReset={() =>
            setParams({
              prospection:
                prospectionId && Number.isFinite(Number(prospectionId))
                  ? Number(prospectionId)
                  : undefined,
              is_internal: undefined,
              created_by: undefined,
              ordering: "-created_at",
              search: "",
              formation_nom: undefined,
              partenaire_nom: undefined,
              created_by_username: undefined,
            })
          }
        />
      }
    >
      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" align="center" py={4}>
          Erreur lors du chargement des commentaires.
        </Typography>
      ) : enrichedRows.length === 0 ? (
        <Typography color="text.secondary" align="center" py={4}>
          Aucun commentaire trouvé.
        </Typography>
      ) : (
        <ProspectionCommentTable
          rows={enrichedRows}
          onDelete={(r) => {
            setSelectedRow(r);
            setShowConfirm(true);
          }}
          onEdit={(r) => navigate(`/prospection-commentaires/${r.id}/edit`)}
          linkToProspection={(id) => `/prospections/${id}`}
        />
      )}

      {/* ✅ Confirmation avec Dialog */}
      <Dialog
        open={showConfirm}
        onClose={() => {
          setShowConfirm(false);
          setSelectedRow(null);
        }}
      >
        <DialogTitle>Confirmation</DialogTitle>
        <DialogContent>
          <Typography>
            {selectedRow
              ? `Supprimer le commentaire #${selectedRow.id} ?`
              : "Supprimer ce commentaire ?"}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setShowConfirm(false);
              setSelectedRow(null);
            }}
          >
            Annuler
          </Button>
          <Button color="error" variant="contained" onClick={handleDelete}>
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </PageTemplate>
  );
}

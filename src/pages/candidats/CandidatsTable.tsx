// src/components/candidats/CandidatsTable.tsx
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Checkbox, Paper, Tooltip, IconButton, Typography, Box
} from '@mui/material';
import { useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Candidat } from '../../types/candidat';

/* ================= Helpers ================= */
const dtfFR = typeof Intl !== 'undefined' ? new Intl.DateTimeFormat('fr-FR') : undefined;

function fullName(c: Candidat): string {
  if (c.nom_complet && c.nom_complet.trim()) return c.nom_complet;
  return [c.nom, c.prenom].filter(Boolean).join(' ').trim() || '—';
}
function formatDateFR(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return dtfFR ? dtfFR.format(d) : d.toLocaleDateString('fr-FR');
}
function yesNo(v?: boolean): string {
  return typeof v === 'boolean' ? (v ? 'Oui' : 'Non') : '—';
}
function stars(v?: number | null): string {
  return typeof v === 'number' ? `${v} ★` : '—';
}
function labelOrId(name?: string | null, id?: number | null): string {
  return (name && name.trim()) ? name : (typeof id === 'number' ? `#${id}` : '—');
}
function formatFormation(c: Candidat): string {
  const f = c.formation_info;
  if (!f) return typeof c.formation === 'number' ? `#${c.formation}` : '—';
  return (f.nom ?? '').trim() || '—';
}
function typeOffreLabel(c: Candidat): string {
  const to = c.formation_info?.type_offre;
  return to?.nom ?? to?.libelle ?? '—';
}
type AppairageLite = {
  partenaire_nom?: string | null;
  statut?: string | null;
  statut_display?: string | null;
  date_appairage?: string | null;
  created_by_nom?: string | null;
  last_commentaire?: string | null;
};
function getLastAppairage(c: Candidat): AppairageLite | null {
  const obj = c as unknown as { last_appairage?: AppairageLite | null };
  return obj.last_appairage ?? null;
}
function ellipsize(s?: string | null, max = 90): string {
  if (!s) return '—';
  const t = s.trim();
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}
const CV_MAP: Record<string, string> = { oui: 'Oui', en_cours: 'En cours', a_modifier: 'À modifier' };
function cvStatutLabel(c: Candidat): string {
  return c.cv_statut_display ?? (c.cv_statut ? (CV_MAP[c.cv_statut] ?? c.cv_statut) : '—');
}
/* ---------- Ateliers compact ---------- */
type AtelierKey =
  | 'atelier_1' | 'atelier_2' | 'atelier_3' | 'atelier_4'
  | 'atelier_5' | 'atelier_6' | 'atelier_7' | 'autre';
const AT_KEYS: AtelierKey[] = [
  'atelier_1','atelier_2','atelier_3','atelier_4','atelier_5','atelier_6','atelier_7','autre'
];
const AT_LABELS: Record<AtelierKey, string> = {
  atelier_1: 'Atelier 1', atelier_2: 'Atelier 2', atelier_3: 'Atelier 3',
  atelier_4: 'Atelier 4', atelier_5: 'Atelier 5', atelier_6: 'Atelier 6',
  atelier_7: 'Atelier 7', autre: 'Autre',
};
const AT_TOKENS: Record<AtelierKey, string> = {
  atelier_1: 'A1', atelier_2: 'A2', atelier_3: 'A3',
  atelier_4: 'A4', atelier_5: 'A5', atelier_6: 'A6',
  atelier_7: 'A7', autre: 'Autre',
};
function readCount(obj: Record<string, unknown>, key: string): number {
  const v = obj[key];
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
  if (typeof v === 'string') {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}
function countsFromResume(text: string): Partial<Record<AtelierKey, number>> {
  const s = text.toLowerCase();
  const out: Partial<Record<AtelierKey, number>> = {};
  for (let i = 1; i <= 7; i++) {
    const re = new RegExp(`atelier\\s*${i}\\b`, 'g');
    const m = s.match(re);
    if (m && m.length > 0) out[`atelier_${i}` as AtelierKey] = m.length;
  }
  const mAutre = s.match(/\bautre\b/g);
  if (mAutre && mAutre.length > 0) out.autre = mAutre.length;
  return out;
}
function extractAteliersCounts(c: Candidat): Partial<Record<AtelierKey, number>> {
  const obj = c as unknown as Record<string, unknown>;
  const out: Partial<Record<AtelierKey, number>> = {};
  for (const k of AT_KEYS) {
    const n = readCount(obj, `count_${k}`);
    if (n > 0) out[k] = n;
  }
  if (Object.keys(out).length) return out;
  const resume = typeof c.ateliers_resume === 'string' ? c.ateliers_resume : '';
  if (resume.trim()) return countsFromResume(resume);
  return {};
}
function atelierCountsCompact(c: Candidat, limit = 3): { display: string; title: string } {
  const counts = extractAteliersCounts(c);
  const pairs = AT_KEYS.map((k) => [k, counts[k] ?? 0] as const).filter(([, n]) => n > 0);
  if (pairs.length === 0) return { display: '—', title: '' };
  const full = pairs.map(([k, n]) => `${AT_LABELS[k]}: ${n}`).join(', ');
  const short = pairs.slice(0, limit).map(([k, n]) => `${AT_TOKENS[k]}×${n}`).join(' · ');
  const extra = pairs.length > limit ? ` +${pairs.length - limit}` : '';
  return { display: short + extra, title: full };
}

/* ================= Component ================= */
type Props = {
  items: Candidat[];
  selectedIds: number[];
  onSelectionChange: (ids: number[]) => void;
  onDelete?: (id: number) => void;
  maxHeight?: string;
};

export default function CandidatsTable({
  items, selectedIds, onSelectionChange, onDelete, maxHeight = '65vh'
}: Props) {
  const navigate = useNavigate();

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const pageIds = useMemo(() => items.map(i => i.id), [items]);
  const allChecked = pageIds.length > 0 && pageIds.every(id => selectedSet.has(id));
  const someChecked = pageIds.some(id => selectedSet.has(id)) && !allChecked;

  const headerCbRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (headerCbRef.current) headerCbRef.current.indeterminate = someChecked;
  }, [someChecked]);

  const toggleAllThisPage = useCallback(() => {
    if (allChecked) {
      onSelectionChange(selectedIds.filter(id => !pageIds.includes(id)));
    } else {
      const set = new Set(selectedIds);
      for (const id of pageIds) set.add(id);
      onSelectionChange(Array.from(set));
    }
  }, [allChecked, onSelectionChange, pageIds, selectedIds]);

  const toggleOne = useCallback((id: number, checked: boolean) => {
    if (checked) {
      if (!selectedSet.has(id)) onSelectionChange([...selectedIds, id]);
    } else {
      if (selectedSet.has(id)) onSelectionChange(selectedIds.filter(x => x !== id));
    }
  }, [onSelectionChange, selectedIds, selectedSet]);

  const goEdit = useCallback((id: number) => navigate(`/candidats/${id}/edit`), [navigate]);
  const goShow = useCallback((id: number) => navigate(`/candidats/${id}`), [navigate]);

  if (!items.length) {
    return (
      <Typography sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
        Aucun candidat.
      </Typography>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ maxHeight, borderRadius: 2 }}>
      <Table stickyHeader size="small" aria-label="Table des candidats">
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox" sx={{ position: 'sticky', left: 0, zIndex: 3, backgroundColor: 'background.paper' }}>
              <Checkbox
                inputRef={headerCbRef}
                checked={allChecked}
                onChange={toggleAllThisPage}
                indeterminate={someChecked}
              />
            </TableCell>
            <TableCell sx={{ position: 'sticky', left: 50, zIndex: 2, backgroundColor: 'background.paper' }}>Candidat</TableCell>
            <TableCell>Âge</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Tél.</TableCell>
            <TableCell>Ville</TableCell>
            <TableCell>CP</TableCell>
            <TableCell>Origine sourcing</TableCell>
            <TableCell>Formation</TableCell>
            <TableCell>N° d’offre</TableCell>
            <TableCell>Centre</TableCell>
            <TableCell>Type d’offre</TableCell>
            <TableCell>Début</TableCell>
            <TableCell>Fin</TableCell>
            <TableCell>Statut</TableCell>
            <TableCell>CV</TableCell>
            <TableCell>Contrat</TableCell>
            <TableCell>Disp.</TableCell>
            <TableCell>RQTH</TableCell>
            <TableCell>Permis B</TableCell>
            <TableCell>Inscrit GESPERS</TableCell>
            <TableCell>Communication</TableCell>
            <TableCell>Expérience</TableCell>
            <TableCell>CSP</TableCell>
            <TableCell>Entretien</TableCell>
            <TableCell>Test</TableCell>
            <TableCell>Admissible</TableCell>
            <TableCell>Inscription</TableCell>
            <TableCell>Naissance</TableCell>
            <TableCell>Appairages</TableCell>
            <TableCell>Prospections</TableCell>
            <TableCell>Appairage · Partenaire</TableCell>
            <TableCell>Appairage · Statut</TableCell>
            <TableCell>Appairage · Date</TableCell>
            <TableCell>Appairage · Créé par</TableCell>
            <TableCell>Appairage · Dernier commentaire</TableCell>
            <TableCell>Courrier rentrée</TableCell>
            <TableCell>Date rentrée</TableCell>
            <TableCell>Vu par</TableCell>
            <TableCell>Ateliers (compact)</TableCell>
            <TableCell>OSIA</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((c) => {
            const name = fullName(c);
            const isChecked = selectedSet.has(c.id);
            const la = getLastAppairage(c);
            const { display: ateliersDisplay, title: ateliersTitle } = atelierCountsCompact(c);

            return (
              <TableRow hover key={c.id} onClick={() => goEdit(c.id)} sx={{ cursor: 'pointer' }}>
                <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}
                  sx={{ position: 'sticky', left: 0, backgroundColor: 'background.paper', zIndex: 2 }}
                >
                  <Checkbox
                    checked={isChecked}
                    onChange={(e) => toggleOne(c.id, e.target.checked)}
                  />
                </TableCell>

                <TableCell sx={{ position: 'sticky', left: 50, backgroundColor: 'background.paper', zIndex: 1 }}>
                  <Box>
                    <Typography noWrap fontWeight="bold">{name}</Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {c.nom} {c.prenom}
                    </Typography>
                  </Box>
                </TableCell>

                <TableCell>{typeof c.age === 'number' ? c.age : '—'}</TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>{c.email ? <a href={`mailto:${c.email}`}>{c.email}</a> : '—'}</TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>{c.telephone ? <a href={`tel:${c.telephone}`}>{c.telephone}</a> : '—'}</TableCell>
                <TableCell>{c.ville || '—'}</TableCell>
                <TableCell>{c.code_postal || '—'}</TableCell>
                <TableCell>{c.origine_sourcing || '—'}</TableCell>
                <TableCell>{formatFormation(c)}</TableCell>
                <TableCell>{c.formation_info?.num_offre ?? '—'}</TableCell>
                <TableCell>{c.formation_info?.centre?.nom ?? '—'}</TableCell>
                <TableCell>{typeOffreLabel(c)}</TableCell>
                <TableCell>{formatDateFR(c.formation_info?.date_debut)}</TableCell>
                <TableCell>{formatDateFR(c.formation_info?.date_fin)}</TableCell>
                <TableCell>{c.statut || '—'}</TableCell>
                <TableCell>{cvStatutLabel(c)}</TableCell>
                <TableCell>{c.type_contrat || '—'}</TableCell>
                <TableCell>{c.disponibilite || '—'}</TableCell>
                <TableCell>{yesNo(c.rqth)}</TableCell>
                <TableCell>{yesNo(c.permis_b)}</TableCell>
                <TableCell>{yesNo(c.inscrit_gespers)}</TableCell>
                <TableCell>{stars(c.communication)}</TableCell>
                <TableCell>{stars(c.experience)}</TableCell>
                <TableCell>{stars(c.csp)}</TableCell>
                <TableCell>{yesNo(c.entretien_done)}</TableCell>
                <TableCell>{yesNo(c.test_is_ok)}</TableCell>
                <TableCell>{yesNo(c.admissible)}</TableCell>
                <TableCell>{formatDateFR(c.date_inscription)}</TableCell>
                <TableCell>{formatDateFR(c.date_naissance)}</TableCell>
                <TableCell>{c.nb_appairages ?? '—'}</TableCell>
                <TableCell>{c.nb_prospections ?? '—'}</TableCell>
                <TableCell>{la?.partenaire_nom ?? '—'}</TableCell>
                <TableCell>{la?.statut_display ?? la?.statut ?? '—'}</TableCell>
                <TableCell>{formatDateFR(la?.date_appairage)}</TableCell>
                <TableCell>{la?.created_by_nom ?? '—'}</TableCell>
                <TableCell>{ellipsize(la?.last_commentaire)}</TableCell>
                <TableCell>{yesNo(c.courrier_rentree)}</TableCell>
                <TableCell>{formatDateFR(c.date_rentree)}</TableCell>
                <TableCell>{labelOrId(c.vu_par_nom, c.vu_par)}</TableCell>
                <TableCell title={ateliersTitle}>{ateliersDisplay}</TableCell>
                <TableCell>{c.numero_osia || '—'}</TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Tooltip title="Voir">
                    <IconButton size="small" onClick={() => goShow(c.id)}>
                      <VisibilityIcon fontSize="inherit" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Éditer">
                    <IconButton size="small" onClick={() => goEdit(c.id)}>
                      <EditIcon fontSize="inherit" />
                    </IconButton>
                  </Tooltip>
                  {onDelete && (
                    <Tooltip title="Supprimer">
                      <IconButton size="small" color="error" onClick={() => onDelete(c.id)}>
                        <DeleteIcon fontSize="inherit" />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

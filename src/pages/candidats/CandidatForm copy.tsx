// =============================================
// components/candidats/CandidatForm.tsx
// =============================================
import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  FormLabel,
  FormHelperText,
  FormControlLabel,
  Checkbox,
  Button,
  Chip,
  Divider,
  Autocomplete,
} from '@mui/material';
import type {
  CandidatFormData,
  CandidatMeta,
  Candidat,
  CVStatutValue,
  Choice,
} from '../../types/candidat';
import { User } from '../../types/User';
import FormationSelectModal, {
  type FormationPick,
} from '../../components/modals/FormationSelectModal';
import UsersSelectModal, { type UserPick } from '../../components/modals/UsersSelectModal';

export type FormationOption = { value: number; label: string };
export type Option = { value: number; label: string };

type Props = {
  initialValues?: CandidatFormData;
  meta?: CandidatMeta | null;
  formationOptions?: FormationOption[];
  userOptions?: Option[];
  partenaireOptions?: Option[];
  currentUser?: User | null;
  canEditFormation?: boolean;
  submitting?: boolean;
  onSubmit: (values: CandidatFormData) => void | Promise<void>;
  onCancel?: () => void;
  initialFormationInfo?: Candidat['formation_info'] | null;
};

/* ====================== Constantes ====================== */
const CV_STATUT_FALLBACK: Choice[] = [
  { value: 'oui',        label: 'Oui' },
  { value: 'en_cours',   label: 'En cours' },
  { value: 'a_modifier', label: 'À modifier' },
];

/* Helpers */
const mapFormationInfo = (fi?: Candidat['formation_info'] | null): FormationPick | null => {
  if (!fi) return null;
  return {
    id: fi.id,
    nom: fi.nom ?? null,
    centre: fi.centre ? { id: fi.centre.id, nom: fi.centre.nom } : null,
    type_offre: fi.type_offre
      ? { id: fi.type_offre.id, nom: fi.type_offre.nom ?? null, libelle: fi.type_offre.libelle ?? null, couleur: fi.type_offre.couleur ?? null }
      : null,
    num_offre: fi.num_offre ?? null,
  };
};
const formatFormation = (p: FormationPick) =>
  `${p.nom ?? '—'} — ${p.centre?.nom ?? '—'} · ${p.num_offre ?? '—'}`;

/* ========================= Composant ========================= */
export default function CandidatForm({
  initialValues,
  initialFormationInfo,
  meta,
  formationOptions = [],
  userOptions = [],
  currentUser,
  canEditFormation = true,
  submitting = false,
  onSubmit,
  onCancel,
}: Props) {
  const [form, setForm] = useState<CandidatFormData>({
    nom: '', prenom: '', email: '', telephone: '', ville: '', code_postal: '',
    statut: undefined,
    cv_statut: undefined,
    rqth: false, permis_b: false, entretien_done: false, test_is_ok: false,
    courrier_rentree: false, admissible: false,
    inscrit_gespers: false,
    date_naissance: undefined, date_rentree: undefined, date_placement: undefined,
    numero_osia: null,
    formation: undefined,
    type_contrat: undefined, disponibilite: undefined,
    communication: undefined, experience: undefined, csp: undefined,
    responsable_placement: undefined, entreprise_placement: undefined,
    entreprise_validee: undefined, resultat_placement: undefined,
    contrat_signe: undefined, vu_par: undefined,
    origine_sourcing: undefined,
    ...initialValues,
  });

  // Modals & labels
  const [showFormationModal, setShowFormationModal] = useState(false);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [formationInfo, setFormationInfo] = useState<FormationPick | null>(mapFormationInfo(initialFormationInfo));
  const [formationLabel, setFormationLabel] = useState<string>('');
  const [vuParLabel, setVuParLabel] = useState<string>('');

  // CV statut avec fallback
  const cvStatutChoices: Choice[] = useMemo(() => {
    const server = meta?.cv_statut_choices ?? [];
    return server.length ? server : CV_STATUT_FALLBACK;
  }, [meta?.cv_statut_choices]);

  useEffect(() => {
    const pick = mapFormationInfo(initialFormationInfo);
    if (!pick) return;
    setFormationInfo(pick);
    if (!form.formation || form.formation === pick.id) {
      setForm(f => ({ ...f, formation: f.formation ?? pick.id }));
      setFormationLabel(formatFormation(pick));
    }
  }, [initialFormationInfo]);

  useEffect(() => {
    if (!form.formation) { setFormationLabel(''); return; }
    if (formationInfo && formationInfo.id === form.formation) {
      setFormationLabel(formatFormation(formationInfo));
      return;
    }
    const opt = formationOptions.find(o => o.value === form.formation);
    if (opt?.label) setFormationLabel(opt.label);
  }, [form.formation, formationOptions, formationInfo]);

  useEffect(() => {
    if (!form.formation && currentUser?.formation_info?.id) {
      setForm((f) => ({ ...f, formation: currentUser.formation_info!.id }));
    }
  }, [currentUser?.formation_info?.id]);

  useEffect(() => {
    if (form.vu_par && userOptions.length) {
      const opt = userOptions.find(u => u.value === form.vu_par);
      if (opt?.label) setVuParLabel(opt.label);
    }
  }, [form.vu_par, userOptions]);

  const effectiveCanEditFormation = useMemo(() => {
    if (!canEditFormation) return false;
    const role = currentUser?.role;
    return !['candidat', 'stagiaire'].includes(role ?? '');
  }, [canEditFormation, currentUser?.role]);

  const handleCheckbox = (key: keyof CandidatFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.checked as CandidatFormData[typeof key] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
  };

  return (
    <>
      <Box component="form" onSubmit={handleSubmit} display="grid" gap={2} aria-busy={!!submitting}>
        
        {/* Identité & contact */}
        <Card variant="outlined">
          <CardHeader title="Identité & contact" subheader="Les champs marqués * sont obligatoires." />
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}><TextField fullWidth required label="Nom" value={form.nom ?? ''} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} /></Grid>
              <Grid item xs={12} md={6}><TextField fullWidth required label="Prénom" value={form.prenom ?? ''} onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))} /></Grid>
              <Grid item xs={12} md={6}><TextField fullWidth type="email" label="Email" value={form.email ?? ''} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></Grid>
              <Grid item xs={12} md={6}><TextField fullWidth label="Téléphone" value={form.telephone ?? ''} onChange={e => setForm(f => ({ ...f, telephone: e.target.value }))} /></Grid>
              <Grid item xs={12} md={6}><TextField fullWidth label="Ville" value={form.ville ?? ''} onChange={e => setForm(f => ({ ...f, ville: e.target.value }))} /></Grid>
              <Grid item xs={12} md={6}><TextField fullWidth label="Code postal" value={form.code_postal ?? ''} onChange={e => setForm(f => ({ ...f, code_postal: e.target.value }))} /></Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Identité complète */}
        <Card variant="outlined">
          <CardHeader title="Identité complète" />
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <FormLabel>Sexe</FormLabel>
                  <Select
                    value={form.sexe ?? ''}
                    onChange={e =>
                      setForm(f => ({
                        ...f,
                        sexe: e.target.value === ''
                          ? undefined
                          : (e.target.value as 'M' | 'F'),
                      }))
                    }
                  >
                    <MenuItem value="">—</MenuItem>
                    {(meta?.sexe_choices ?? []).map(opt => (
                      <MenuItem
                        key={String(opt.value)}
                        value={String(opt.value)}
                      >
                        {opt.label}
                      </MenuItem>
                    ))}
                  </Select>

                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}><TextField fullWidth label="Nom de naissance" value={form.nom_naissance ?? ''} onChange={e => setForm(f => ({ ...f, nom_naissance: e.target.value }))} /></Grid>
              <Grid item xs={12} md={3}><TextField fullWidth label="Nationalité" value={form.nationalite ?? ''} onChange={e => setForm(f => ({ ...f, nationalite: e.target.value }))} /></Grid>
              <Grid item xs={12} md={3}><TextField fullWidth label="NIR (N° sécu sociale)" value={form.nir ?? ''} onChange={e => setForm(f => ({ ...f, nir: e.target.value }))} /></Grid>
              <Grid item xs={12} md={4}><TextField fullWidth label="Département de naissance" value={form.departement_naissance ?? ''} onChange={e => setForm(f => ({ ...f, departement_naissance: e.target.value }))} /></Grid>
              <Grid item xs={12} md={4}><TextField fullWidth label="Commune de naissance" value={form.commune_naissance ?? ''} onChange={e => setForm(f => ({ ...f, commune_naissance: e.target.value }))} /></Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <FormLabel>Pays de naissance</FormLabel>
                  <Autocomplete
                    freeSolo
                    options={(meta?.pays_choices ?? []).map(p => String(p.label))}
                    value={form.pays_naissance ?? ''}
                    onChange={(_, newValue) =>
                      setForm(f => ({
                        ...f,
                        pays_naissance: newValue || undefined,
                      }))
                    }
                    onInputChange={(_, newInputValue) =>
                      setForm(f => ({
                        ...f,
                        pays_naissance: newInputValue || undefined,
                      }))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Pays de naissance"
                        placeholder="Saisir ou choisir un pays"
                      />
                    )}
                  />                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Situation & dates */}
        <Card variant="outlined">
          <CardHeader title="Situation & dates" />
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <FormLabel>Statut</FormLabel>
                  <Select value={form.statut ?? ''} onChange={e => setForm(f => ({ ...f, statut: e.target.value || undefined }))}>
                    <MenuItem value="">— Choisir —</MenuItem>
                    {(meta?.statut_choices ?? []).map(c => (
                      <MenuItem key={String(c.value)} value={String(c.value)}>{c.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <FormLabel>CV</FormLabel>
                  <Select value={form.cv_statut ?? ''} onChange={e => setForm(f => ({ ...f, cv_statut: (e.target.value || undefined) as CVStatutValue | undefined }))}>
                    <MenuItem value="">— Choisir —</MenuItem>
                    {cvStatutChoices.map(c => (
                      <MenuItem key={String(c.value)} value={String(c.value)}>{c.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth type="date" label="Date de naissance" InputLabelProps={{ shrink: true }} value={form.date_naissance ?? ''} onChange={e => setForm(f => ({ ...f, date_naissance: e.target.value || undefined }))} />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Situation particulière */}
        <Card variant="outlined">
          <CardHeader title="Situation particulière" />
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <FormLabel>Régime social</FormLabel>
                  <Select value={form.regime_social ?? ''} onChange={e => setForm(f => ({ ...f, regime_social: e.target.value || undefined }))}>
                    <MenuItem value="">—</MenuItem>
                    {(meta?.regime_social_choices ?? []).map(opt => (
                      <MenuItem key={String(opt.value)} value={String(opt.value)}>{opt.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <FormLabel>Situation actuelle</FormLabel>
                  <Select value={form.situation_actuelle ?? ''} onChange={e => setForm(f => ({ ...f, situation_actuelle: e.target.value || undefined }))}>
                    <MenuItem value="">—</MenuItem>
                    {(meta?.situation_actuelle_choices ?? []).map(opt => (
                      <MenuItem key={String(opt.value)} value={String(opt.value)}>{opt.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={3}><FormControlLabel control={<Checkbox checked={!!form.sportif_haut_niveau} onChange={handleCheckbox('sportif_haut_niveau')} />} label="Sportif de haut niveau" /></Grid>
              <Grid item xs={12} md={3}><FormControlLabel control={<Checkbox checked={!!form.equivalence_jeunes} onChange={handleCheckbox('equivalence_jeunes')} />} label="Équivalence jeunes" /></Grid>
              <Grid item xs={12} md={3}><FormControlLabel control={<Checkbox checked={!!form.extension_boe} onChange={handleCheckbox('extension_boe')} />} label="Extension BOE" /></Grid>
              <Grid item xs={12} md={3}><FormControlLabel control={<Checkbox checked={!!form.projet_creation_entreprise} onChange={handleCheckbox('projet_creation_entreprise')} />} label="Projet de création d’entreprise" /></Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Représentant légal */}
        <Card variant="outlined">
          <CardHeader title="Représentant légal" />
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}><TextField fullWidth label="Lien" value={form.representant_lien ?? ''} onChange={e => setForm(f => ({ ...f, representant_lien: e.target.value }))} /></Grid>
              <Grid item xs={12} md={4}><TextField fullWidth label="Nom de naissance" value={form.representant_nom_naissance ?? ''} onChange={e => setForm(f => ({ ...f, representant_nom_naissance: e.target.value }))} /></Grid>
              <Grid item xs={12} md={4}><TextField fullWidth label="Prénom" value={form.representant_prenom ?? ''} onChange={e => setForm(f => ({ ...f, representant_prenom: e.target.value }))} /></Grid>
              <Grid item xs={12} md={6}><TextField fullWidth type="email" label="Email" value={form.representant_email ?? ''} onChange={e => setForm(f => ({ ...f, representant_email: e.target.value }))} /></Grid>
              <Grid item xs={12} md={6}><TextField fullWidth label="Adresse" value={form.representant_street_name ?? ''} onChange={e => setForm(f => ({ ...f, representant_street_name: e.target.value }))} /></Grid>
              <Grid item xs={12} md={3}><TextField fullWidth label="Code postal" value={form.representant_zip_code ?? ''} onChange={e => setForm(f => ({ ...f, representant_zip_code: e.target.value }))} /></Grid>
              <Grid item xs={12} md={9}><TextField fullWidth label="Ville" value={form.representant_city ?? ''} onChange={e => setForm(f => ({ ...f, representant_city: e.target.value }))} /></Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Formation & OSIA */}
        <Card variant="outlined">
          <CardHeader title="Formation & OSIA" subheader={!effectiveCanEditFormation ? "La formation n’est pas modifiable pour votre rôle." : undefined} />
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Formation" value={formationLabel || (form.formation ? `#${form.formation}` : '')} InputProps={{ readOnly: true }} placeholder={effectiveCanEditFormation ? '— Aucune sélection —' : 'Non modifiable'} />
                {effectiveCanEditFormation && (
                  <Box display="flex" gap={1} mt={1}>
                    <Button variant="outlined" onClick={() => setShowFormationModal(true)}>🔍 Sélectionner</Button>
                    {form.formation && <Button color="error" variant="outlined" onClick={() => { setForm(f => ({ ...f, formation: undefined })); setFormationLabel(''); setFormationInfo(null); }}>✖ Effacer</Button>}
                  </Box>
                )}
                {formationInfo && form.formation === formationInfo.id && (
                  <Box mt={2} p={1.5} borderLeft={3} borderColor="primary.main" bgcolor="grey.50" borderRadius={1}>
                    <Typography variant="body2"><b>Nom :</b> {formationInfo.nom ?? '—'}</Typography>
                    <Typography variant="body2"><b>Centre :</b> {formationInfo.centre?.nom ?? '—'}</Typography>
                    <Typography variant="body2"><b>Type d’offre :</b> <Chip size="small" label={formationInfo.type_offre?.nom ?? '—'} /></Typography>
                    <Typography variant="body2"><b>N° d’offre :</b> {formationInfo.num_offre ?? '—'}</Typography>
                  </Box>
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Numéro OSIA" value={form.numero_osia ?? ''} onChange={e => setForm(f => ({ ...f, numero_osia: e.target.value }))} />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Prospection & placement */}
        <Card variant="outlined">
          <CardHeader title="Prospection & placement" />
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <FormLabel>Type de contrat</FormLabel>
                  <Select value={form.type_contrat ?? ''} onChange={e => setForm(f => ({ ...f, type_contrat: e.target.value || undefined }))}>
                    <MenuItem value="">—</MenuItem>
                    {(meta?.type_contrat_choices ?? []).map(c => (
                      <MenuItem key={String(c.value)} value={String(c.value)}>{c.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <FormLabel>Disponibilité</FormLabel>
                  <Select value={form.disponibilite ?? ''} onChange={e => setForm(f => ({ ...f, disponibilite: e.target.value || undefined }))}>
                    <MenuItem value="">—</MenuItem>
                    {(meta?.disponibilite_choices ?? []).map(c => (
                      <MenuItem key={String(c.value)} value={String(c.value)}>{c.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Origine sourcing" value={form.origine_sourcing ?? ''} onChange={e => setForm(f => ({ ...f, origine_sourcing: e.target.value }))} />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField fullWidth type="date" label="Date de placement" InputLabelProps={{ shrink: true }} value={form.date_placement ?? ''} onChange={e => setForm(f => ({ ...f, date_placement: e.target.value || undefined }))} />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Niveaux & indicateurs */}
        <Card variant="outlined">
          <CardHeader title="Niveaux & indicateurs" />
          <CardContent>
            <Grid container spacing={2}>
              {['communication','experience','csp'].map((key) => (
                <Grid item xs={12} md={4} key={key}>
                  <FormControl fullWidth>
                    <FormLabel>{key.charAt(0).toUpperCase()+key.slice(1)}</FormLabel>
                    <Select value={(form as any)[key] ?? ''} onChange={e => setForm(f => ({ ...f, [key]: e.target.value ? Number(e.target.value) : undefined }))}>
                      <MenuItem value="">—</MenuItem>
                      {(meta?.niveau_choices ?? []).map(n => (
                        <MenuItem key={String(n.value)} value={String(n.value)}>{n.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              ))}
            </Grid>

            <Divider sx={{ my:2 }} />
            <Grid container spacing={2}>
              {[
                ['rqth','RQTH'],
                ['permis_b','Permis B'],
                ['entretien_done','Entretien OK'],
                ['test_is_ok','Test OK'],
                ['admissible','Admissible'],
                ['courrier_rentree','Courrier rentrée'],
                ['inscrit_gespers','Inscrit GESPERS'],
              ].map(([key,label]) => (
                <Grid item xs={12} md={3} key={key}>
                  <FormControlLabel control={<Checkbox checked={(form as any)[key]} onChange={handleCheckbox(key as keyof CandidatFormData)} />} label={label} />
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        {/* Assignations */}
        <Card variant="outlined">
          <CardHeader title="Assignations & visibilité" />
          <CardContent>
            <TextField fullWidth label="Vu par" value={vuParLabel || (form.vu_par ? `Utilisateur #${form.vu_par}` : '')} InputProps={{ readOnly: true }} placeholder="— Aucune sélection —" />
            <Box display="flex" gap={1} mt={1}>
              <Button variant="outlined" onClick={() => setShowUsersModal(true)}>🔍 Choisir un utilisateur</Button>
              {form.vu_par && <Button color="error" variant="outlined" onClick={() => { setForm(f => ({ ...f, vu_par: undefined })); setVuParLabel(''); }}>✖ Effacer</Button>}
            </Box>
            <FormHelperText>Recherche sur nom et email. Rôles proposés : staff, admin, superadmin.</FormHelperText>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card variant="outlined">
          <CardHeader title="Notes" subheader="Ajoutez tout contexte utile (entretien, contraintes, remarques…)" />
          <CardContent>
            <TextField fullWidth multiline minRows={4} placeholder="Saisir une note…" value={form.notes ?? ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </CardContent>
        </Card>

        {/* Actions */}
        <Box display="flex" justifyContent="flex-end" gap={2}>
          {onCancel && <Button variant="outlined" onClick={onCancel}>Annuler</Button>}
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? 'Enregistrement…' : 'Enregistrer'}
          </Button>
        </Box>
      </Box>

      {/* Modal sélection formation */}
      <FormationSelectModal
        show={showFormationModal}
        onClose={() => setShowFormationModal(false)}
        onSelect={(pick: FormationPick) => {
          setForm((f) => ({ ...f, formation: pick.id }));
          setFormationInfo(pick);
          setFormationLabel(formatFormation(pick));
          setShowFormationModal(false);
        }}
      />

      {/* Modal sélection utilisateur (vu_par) */}
      <UsersSelectModal
        show={showUsersModal}
        onClose={() => setShowUsersModal(false)}
        allowedRoles={['staff', 'admin', 'superadmin']}
        onlyActive
        onSelect={(pick: UserPick) => {
          setForm((f) => ({ ...f, vu_par: pick.id }));
          setVuParLabel(pick.full_name || pick.email || `Utilisateur #${pick.id}`);
          setShowUsersModal(false);
        }}
      />
    </>
  );
}

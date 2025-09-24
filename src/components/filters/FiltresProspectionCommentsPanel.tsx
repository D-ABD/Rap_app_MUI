import React, { useMemo, useCallback } from 'react';
import FilterTemplate, { type FieldConfig } from './FilterTemplate';
import type { ProspectionCommentListParams } from '../../types/prospectionComment';

type Choice<T extends string | number> = { value: T; label: string };

/** Valeurs parent (compat API) */
type BaseValues = ProspectionCommentListParams & {
  search?: string;
  formation_nom?: string;
  partenaire_nom?: string;
  created_by_username?: string;
};

/** Valeurs utilisées par le panneau (sans `prospection` obligatoire) */
type UIValues = Omit<BaseValues, 'prospection'> & {
  is_internal_ui: 'all' | 'public' | 'internal';
};

type Props = {
  mode?: 'default' | 'candidate';
  filtres?: {
    authors?: Choice<string>[];
    formations?: Choice<string>[];
    partenaires?: Choice<string>[];
    user_role?: string;
  };
  /** Peut être undefined au 1er render */
  values?: BaseValues;
  onChange: (values: BaseValues) => void;
  onRefresh?: () => void;
  onReset?: () => void;
};

const withPlaceholder = (opts: Array<{ value: string; label: string }>) =>
  opts.length ? opts : [{ value: '', label: '—' }];

/** Normalise pour ne jamais lire `values` directement plus bas */
function normalizeValues(v?: BaseValues): BaseValues {
  return {
    prospection: v?.prospection,
    is_internal: v?.is_internal,
    created_by: v?.created_by,
    ordering: v?.ordering ?? '-created_at',
    search: v?.search ?? '',
    formation_nom: v?.formation_nom,
    partenaire_nom: v?.partenaire_nom,
    created_by_username: v?.created_by_username,
  };
}

export default React.memo(function FiltresProspectionCommentsPanel({
  mode = 'default',
  filtres,
  values,
  onChange,
  onRefresh,
  onReset,
}: Props) {
  const v = useMemo(() => normalizeValues(values), [values]);

  const safe = useMemo(
    () => ({
      authors: filtres?.authors ?? [],
      formations: filtres?.formations ?? [],
      partenaires: filtres?.partenaires ?? [],
      user_role: filtres?.user_role ?? '',
    }),
    [filtres]
  );

  const isCandidate = mode === 'candidate';

  const isInternalUI: UIValues['is_internal_ui'] =
    v.is_internal === true ? 'internal' : v.is_internal === false ? 'public' : 'all';

  // ⚙️ Les valeurs passées au FilterTemplate (sans `prospection`)
  const uiValues: UIValues = useMemo(
    () => ({
      is_internal: v.is_internal,
      created_by: v.created_by,
      ordering: v.ordering,
      search: v.search,
      formation_nom: v.formation_nom,
      partenaire_nom: v.partenaire_nom,
      created_by_username: v.created_by_username,
      is_internal_ui: isInternalUI,
    }),
    [v, isInternalUI]
  );

  const defaultReset = useCallback(() => {
    const out: BaseValues = {
      prospection: v.prospection,
      is_internal: undefined,
      created_by: undefined,
      ordering: '-created_at',
      search: '',
      formation_nom: undefined,
      partenaire_nom: undefined,
      created_by_username: undefined,
    };
    onChange(out);
  }, [onChange, v]);

  // 🔁 Conversion UI → API
  const handleChange = useCallback(
    (next: UIValues) => {
      const { is_internal_ui, ...rest } = next;
      let is_internal: boolean | undefined;
      if (is_internal_ui === 'public') is_internal = false;
      else if (is_internal_ui === 'internal') is_internal = true;

      const out: BaseValues = {
        prospection: v.prospection,
        is_internal,
        created_by: rest.created_by,
        ordering: rest.ordering,
        search: rest.search,
        formation_nom: rest.formation_nom,
        partenaire_nom: rest.partenaire_nom,
        created_by_username: rest.created_by_username,
      };
      onChange(out);
    },
    [onChange, v.prospection]
  );

  // ✅ Champs bien typés
  const fields = useMemo<FieldConfig<UIValues>[]>(() => {
    return [
      {
        key: 'search' as const,
        label: '🔎 Recherche',
        type: 'text' as const,
        placeholder: 'Texte du commentaire…',
      },
      ...(isCandidate
        ? []
        : [
            {
              key: 'formation_nom' as const,
              label: '🎓 Formation',
              type: 'select' as const,
              options: withPlaceholder(
                safe.formations.map((o) => ({ value: o.value, label: o.label }))
              ),
            },
            {
              key: 'partenaire_nom' as const,
              label: '🏢 Partenaire',
              type: 'select' as const,
              options: withPlaceholder(
                safe.partenaires.map((o) => ({ value: o.value, label: o.label }))
              ),
            },
          ]),
      {
        key: 'is_internal_ui' as const,
        label: '👁️ Visibilité',
        type: 'select' as const,
        options: [
          { value: 'all', label: 'Tous' },
          { value: 'public', label: 'Public' },
          { value: 'internal', label: 'Interne' },
        ],
      },
      ...(isCandidate
        ? []
        : [
            {
              key: 'created_by_username' as const,
              label: '👤 Auteur',
              type: 'select' as const,
              hidden: safe.authors.length === 0,
              options: withPlaceholder(
                safe.authors.map((o) => ({ value: o.value, label: o.label }))
              ),
            },
          ]),
      {
        key: 'ordering' as const,
        label: '↕️ Tri',
        type: 'select' as const,
        options: [
          { value: '-created_at', label: 'Plus récent' },
          { value: 'created_at', label: 'Plus ancien' },
          { value: '-id', label: 'ID décroissant' },
          { value: 'id', label: 'ID croissant' },
        ],
      },
    ];
  }, [safe, isCandidate]);

  const actions = useMemo(
    () => ({
      onReset: onReset ?? defaultReset,
      onRefresh,
      resetLabel: 'Réinitialiser',
      refreshLabel: 'Rafraîchir',
    }),
    [onReset, onRefresh, defaultReset]
  );

  return (
    <FilterTemplate<UIValues>
      values={uiValues}
      onChange={handleChange}
      fields={fields}
      actions={actions}
      cols={3}
    />
  );
});

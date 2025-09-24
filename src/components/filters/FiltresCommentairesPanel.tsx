// src/components/ui/FiltresCommentairesPanel.tsx
import React, { useMemo } from "react";
import { Box } from "@mui/material";
import FilterTemplate, { type FieldConfig } from "./FilterTemplate";
import type { FiltresValues } from "../../types/Filtres";

interface FiltresPanelProps {
  filtres?: {
    centres: { id: number; nom: string }[];
    statuts: { id: number; nom: string }[];
    type_offres: { id: number; nom: string }[];
    formation_etats?: { value: string | number; label: string }[];
  };
  values: FiltresValues;
  onChange: (values: FiltresValues) => void;
  onReset?: () => void;
  onRefresh?: () => void;
}

/** util: supprime les doublons et formate en options {value,label} */
function toOptionsUnique<
  T extends { id?: number; value?: string | number; nom?: string; label?: string }
>(arr: T[] = [], labelKey: "nom" | "label" = "nom") {
  const seen = new Set<string | number>();
  return arr.reduce<Array<{ value: string | number; label: string }>>(
    (acc, item) => {
      const value = item.id ?? item.value;
      const label =
        (labelKey === "nom" ? item.nom : item.label) ?? "";
      if (value == null || !label || seen.has(value)) return acc;
      seen.add(value);
      acc.push({ value, label });
      return acc;
    },
    []
  );
}

/** insère un placeholder quand la liste d'options est vide */
const withPlaceholder = (
  opts: Array<{ value: string | number; label: string }>
) => (opts.length ? opts : [{ value: "", label: "—" }]);

/** reset par défaut si onReset non fourni */
function defaultReset(values: FiltresValues): FiltresValues {
  return {
    ...values,
    centre_id: undefined,
    statut_id: undefined,
    type_offre_id: undefined,
    formation_etat: undefined,
  };
}

export default React.memo(function FiltresCommentairesPanel({
  filtres,
  values,
  onChange,
  onReset,
  onRefresh,
}: FiltresPanelProps) {
  const fields = useMemo<Array<FieldConfig<FiltresValues>>>(() => {
    if (!filtres) return []; // en attente des filtres

    return [
      {
        key: "centre_id" as const,
        label: "🏫 Centre",
        type: "select" as const,
        options: withPlaceholder(
          toOptionsUnique(filtres.centres, "nom").map((o) => ({
            value: Number(o.value),
            label: o.label,
          }))
        ),
      },
      {
        key: "statut_id" as const,
        label: "📍 Statut",
        type: "select" as const,
        options: withPlaceholder(
          toOptionsUnique(filtres.statuts, "nom").map((o) => ({
            value: Number(o.value),
            label: o.label,
          }))
        ),
      },
      {
        key: "type_offre_id" as const,
        label: "📦 Type d'offre",
        type: "select" as const,
        options: withPlaceholder(
          toOptionsUnique(filtres.type_offres, "nom").map((o) => ({
            value: Number(o.value),
            label: o.label,
          }))
        ),
      },
      ...(filtres.formation_etats && filtres.formation_etats.length
        ? [
            {
              key: "formation_etat" as const,
              label: "📚 État de formation",
              type: "select" as const,
              options: withPlaceholder(
                toOptionsUnique(filtres.formation_etats, "label")
              ),
            } as FieldConfig<FiltresValues>,
          ]
        : []),
    ];
  }, [filtres]);

  const actions = useMemo(
    () => ({
      onReset: onReset ? onReset : () => onChange(defaultReset(values)),
      onRefresh,
      resetLabel: "Réinitialiser",
      refreshLabel: "Rafraîchir",
    }),
    [onReset, onRefresh, onChange, values]
  );

  if (!filtres) {
    return (
      <Box
        role="status"
        aria-live="polite"
        sx={{
          p: "0.75rem 1rem",
          border: "1px dashed",
          borderColor: "divider",
          borderRadius: 2,
          color: "text.secondary",
          bgcolor: "grey.50",
          mb: 2,
          textAlign: "center",
        }}
      >
        Chargement des filtres…
      </Box>
    );
  }

  return (
    <FilterTemplate<FiltresValues>
      values={values}
      onChange={onChange}
      fields={fields}
      actions={actions}
      cols={4}
    />
  );
});

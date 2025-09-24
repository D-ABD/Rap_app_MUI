// src/components/formations/FiltresFormationsPanel.tsx
import React, { useMemo, useCallback } from "react";
import {
  Box,
  Stack,
  Button,
  TextField,
  Typography,
} from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import FilterTemplate, { type FieldConfig } from "./FilterTemplate";
import type {
  FiltresFormationsData,
  FiltresFormationsValues,
} from "../../types/formation";

type Props = {
  filtres: FiltresFormationsData | null;
  values: FiltresFormationsValues;
  onChange: (values: FiltresFormationsValues) => void;
  onReset?: () => void;
  onRefresh?: () => void;
};

// util: unique + format {value,label}
function toOptionsUnique<T extends { id: number; nom: string }>(arr: T[] = []) {
  const seen = new Set<number>();
  return arr.reduce<Array<{ value: number; label: string }>>((acc, item) => {
    if (seen.has(item.id)) return acc;
    seen.add(item.id);
    acc.push({ value: item.id, label: item.nom });
    return acc;
  }, []);
}

// placeholder si liste vide
const withPlaceholder = (
  opts: Array<{ value: string | number; label: string }>
) => (opts.length ? opts : [{ value: "", label: "—" }]);

// reset par défaut
function buildReset(values: FiltresFormationsValues): FiltresFormationsValues {
  return {
    ...values,
    texte: "",
    centre: undefined,
    statut: undefined,
    type_offre: undefined,
    page: 1,
  };
}

export default function FiltresFormationsPanel({
  filtres,
  values,
  onChange,
  onReset,
  onRefresh,
}: Props) {
  const onLocalSearchChange = useCallback<
    React.ChangeEventHandler<HTMLInputElement>
  >(
    (e) => {
      onChange({ ...values, texte: e.target.value, page: 1 });
    },
    [onChange, values]
  );

  const onSearchKeyDown = useCallback<
    React.KeyboardEventHandler<HTMLInputElement>
  >(
    (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        if (values.texte) {
          onChange({ ...values, texte: "", page: 1 });
        }
      }
    },
    [onChange, values]
  );

  const fields = useMemo<Array<FieldConfig<FiltresFormationsValues>>>(() => {
    if (!filtres) return [];
    return [
      {
        key: "centre",
        label: "🏫 Centre",
        type: "select",
        options: withPlaceholder(
          toOptionsUnique(filtres.centres).map((o) => ({
            value: Number(o.value),
            label: o.label,
          }))
        ),
      },
      {
        key: "statut",
        label: "📍 Statut",
        type: "select",
        options: withPlaceholder(
          toOptionsUnique(filtres.statuts).map((o) => ({
            value: Number(o.value),
            label: o.label,
          }))
        ),
      },
      {
        key: "type_offre",
        label: "📦 Type d'offre",
        type: "select",
        options: withPlaceholder(
          toOptionsUnique(filtres.type_offres).map((o) => ({
            value: Number(o.value),
            label: o.label,
          }))
        ),
      },
    ];
  }, [filtres]);

  const actions = useMemo(
    () => ({
      onReset:
        onReset ??
        (() => {
          onChange(buildReset(values));
        }),
      onRefresh,
      resetLabel: "Réinitialiser",
      refreshLabel: "Rafraîchir",
    }),
    [onReset, onRefresh, onChange, values]
  );

  const ready = Boolean(filtres);

  return !ready ? (
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
  ) : (
    <>
      {/* 🔎 Recherche */}
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        mb={1.5}
        flexWrap={{ xs: "wrap", md: "nowrap" }}
      >
        <label
          htmlFor="formations-search-input"
          style={visuallyHidden as React.CSSProperties}
        >
          Rechercher des formations
        </label>
        <Typography
          component="span"
          id="formations-search-help"
          sx={visuallyHidden}
        >
          Tapez votre recherche. Appuyez sur Échap pour effacer.
        </Typography>

        <TextField
          id="formations-search-input"
          type="search"
          size="small"
          fullWidth
          value={values.texte ?? ""}
          onChange={onLocalSearchChange}
          onKeyDown={onSearchKeyDown}
          placeholder="🔎 Recherche (nom, centre, type, statut…)"
          inputProps={{
            "aria-describedby": "formations-search-help",
          }}
        />

        {values.texte && (
          <Button
            variant="outlined"
            onClick={() => onChange({ ...values, texte: "", page: 1 })}
          >
            ✕
          </Button>
        )}
      </Stack>

      {/* 📋 Filtres dynamiques */}
      <FilterTemplate<FiltresFormationsValues>
        values={values}
        onChange={(next) => onChange({ ...next, page: 1 })}
        fields={fields}
        actions={actions}
        cols={4}
      />
    </>
  );
}

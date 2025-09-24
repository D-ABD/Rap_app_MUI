// src/components/filters/FiltresAppairageCommentsPanel.tsx
import React, { useCallback, useMemo } from "react";
import {
  Box,
  Stack,
  Button,
  TextField,
  Typography,
} from "@mui/material";
import { visuallyHidden } from "@mui/utils";

import FilterTemplate, { type FieldConfig } from "./FilterTemplate";
import type { AppairageCommentListParams } from "../../types/appairageComment";

type Choice<T extends string> = { value: T; label: string };

type BaseValues = AppairageCommentListParams & {
  search?: string;
  partenaire_nom?: string;
  candidat_nom?: string;
  created_by_username?: string;
};

type Props = {
  mode?: "default" | "candidate";
  filtres?: {
    authors?: Choice<string>[];
    partenaires?: Choice<string>[];
    candidats?: Choice<string>[];
    user_role?: string;
  };
  values: BaseValues;
  onChange: (values: BaseValues) => void;
  onRefresh?: () => void;
  onReset?: () => void;
};

const withPlaceholder = (opts: Array<{ value: string; label: string }>) =>
  opts.length ? opts : [{ value: "", label: "—" }];

function buildReset(values: BaseValues): BaseValues {
  return {
    ...values,
    search: "",
    partenaire_nom: undefined,
    candidat_nom: undefined,
    created_by_username: undefined,
    created_by: undefined,
    ordering: "-created_at",
    page: 1,
  };
}

export default function FiltresAppairageCommentsPanel({
  mode = "default",
  filtres,
  values,
  onChange,
  onRefresh,
  onReset,
}: Props) {
  const safe = useMemo(
    () => ({
      authors: filtres?.authors ?? [],
      partenaires: filtres?.partenaires ?? [],
      candidats: filtres?.candidats ?? [],
      user_role: filtres?.user_role ?? "",
    }),
    [filtres]
  );

  const isCandidate = mode === "candidate";

  const onLocalSearchChange =
    useCallback<React.ChangeEventHandler<HTMLInputElement>>(
      (e) => {
        onChange({ ...values, search: e.target.value, page: 1 });
      },
      [onChange, values]
    );

  const onSearchKeyDown =
    useCallback<React.KeyboardEventHandler<HTMLInputElement>>(
      (e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          if (values.search) {
            onChange({ ...values, search: "", page: 1 });
          }
        }
      },
      [onChange, values]
    );

  const fields = useMemo<Array<FieldConfig<BaseValues>>>(() => {
    return [
      ...(isCandidate
        ? []
        : [
            {
              key: "partenaire_nom" as const,
              label: "🏢 Partenaire",
              type: "select" as const,
              options: withPlaceholder(
                safe.partenaires.map((o) => ({
                  value: String(o.value),
                  label: o.label,
                }))
              ),
            },
            {
              key: "candidat_nom" as const,
              label: "👤 Candidat",
              type: "select" as const,
              options: withPlaceholder(
                safe.candidats.map((o) => ({
                  value: String(o.value),
                  label: o.label,
                }))
              ),
            },
            {
              key: "created_by_username" as const,
              label: "Auteur",
              type: "select" as const,
              hidden: safe.authors.length === 0,
              options: withPlaceholder(
                safe.authors.map((o) => ({
                  value: String(o.value),
                  label: o.label,
                }))
              ),
            },
          ]),
      {
        key: "ordering" as const,
        label: "↕️ Tri",
        type: "select" as const,
        options: [
          { value: "-created_at", label: "Plus récent" },
          { value: "created_at", label: "Plus ancien" },
          { value: "-id", label: "ID décroissant" },
          { value: "id", label: "ID croissant" },
        ],
      },
    ];
  }, [safe, isCandidate]);

  const actions = useMemo(
    () => ({
      onRefresh,
      onReset:
        onReset ??
        (() => {
          onChange(buildReset(values));
        }),
      resetLabel: "Réinitialiser",
      refreshLabel: "Rafraîchir",
    }),
    [onRefresh, onReset, onChange, values]
  );

  return (
    <>
      {/* 🔎 Barre de recherche */}
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        mb={1.5}
        flexWrap={{ xs: "wrap", md: "nowrap" }}
      >
        <label
          htmlFor="comments-search-input"
          style={visuallyHidden as React.CSSProperties}
        >
          Rechercher dans les commentaires
        </label>
        <Typography
          component="span"
          id="comments-search-help"
          sx={visuallyHidden}
        >
          Tapez votre recherche. Appuyez sur Échap pour effacer.
        </Typography>

        <TextField
          id="comments-search-input"
          type="search"
          size="small"
          fullWidth
          value={values.search ?? ""}
          onChange={onLocalSearchChange}
          onKeyDown={onSearchKeyDown}
          placeholder="🔎 Recherche (texte, auteur, partenaire…)"
          inputProps={{
            "aria-describedby": "comments-search-help",
          }}
        />

        {values.search && (
          <Button
            variant="outlined"
            onClick={() => onChange({ ...values, search: "", page: 1 })}
          >
            ✕
          </Button>
        )}
      </Stack>

      {/* 📋 Filtres dynamiques */}
      <FilterTemplate<BaseValues>
        values={values}
        onChange={onChange}
        fields={fields}
        actions={actions}
        cols={3}
      />
    </>
  );
}

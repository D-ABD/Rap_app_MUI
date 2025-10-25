// src/components/filters/DocumentsFiltresPanel.tsx
import React, { useMemo, useCallback } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
} from "@mui/material";
import { FiltresValues } from "../../types/Filtres";

// 🔧 Supprime les doublons par ID ou value
function uniqueById<T extends { id?: number; value?: string | number }>(arr: T[] = []): T[] {
  const seen = new Set<string | number>();
  return arr.filter((item) => {
    const key = item.id ?? item.value;
    if (key == null) return false;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

interface DocumentsFiltresPanelProps {
  filtres: {
    centres: { id: number; nom: string }[];
    statuts: { id: number; nom: string }[];
    type_offres: { id: number; nom: string }[];
    formation_etats?: { value: string; label: string }[];
  };
  values: FiltresValues;
  onChange: (values: FiltresValues) => void;
}

export default function DocumentsFiltresPanel({
  filtres,
  values,
  onChange,
}: DocumentsFiltresPanelProps) {
  const centres = useMemo(() => uniqueById(filtres.centres), [filtres.centres]);
  const statuts = useMemo(() => uniqueById(filtres.statuts), [filtres.statuts]);
  const types = useMemo(() => uniqueById(filtres.type_offres), [filtres.type_offres]);
  const formationEtats = useMemo(
    () => uniqueById(filtres.formation_etats ?? []),
    [filtres.formation_etats]
  );

  const handleChange = useCallback(
    (e: SelectChangeEvent<string | number>) => {
      const { name, value } = e.target;
      const parsed = value === "" ? undefined : Number.isNaN(Number(value)) ? value : Number(value);
      const key = name as keyof FiltresValues;
      onChange({ ...values, [key]: parsed } as FiltresValues);
    },
    [onChange, values]
  );

  return (
    <Box
      sx={{
        p: 2,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        bgcolor: "background.paper",
        mb: 2,
      }}
    >
      <Stack direction="row" spacing={2} flexWrap="wrap">
        {/* Centre */}
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="filtres-centre-label">Centre</InputLabel>
          <Select
            labelId="filtres-centre-label"
            id="filtres-centre"
            name="centre_id"
            value={values.centre_id ?? ""}
            label="Centre"
            onChange={handleChange}
          >
            <MenuItem value="">— Tous les centres —</MenuItem>
            {centres.map((c) => (
              <MenuItem key={`centre-${c.id}`} value={c.id}>
                {c.nom}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Statut */}
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="filtres-statut-label">Statut</InputLabel>
          <Select
            labelId="filtres-statut-label"
            id="filtres-statut"
            name="statut_id"
            value={values.statut_id ?? ""}
            label="Statut"
            onChange={handleChange}
          >
            <MenuItem value="">— Tous les statuts —</MenuItem>
            {statuts.map((s) => (
              <MenuItem key={`statut-${s.id}`} value={s.id}>
                {s.nom}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Type d'offre */}
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="filtres-type-label">Type d’offre</InputLabel>
          <Select
            labelId="filtres-type-label"
            id="filtres-type"
            name="type_offre_id"
            value={values.type_offre_id ?? ""}
            label="Type d’offre"
            onChange={handleChange}
          >
            <MenuItem value="">— Tous les types —</MenuItem>
            {types.map((t) => (
              <MenuItem key={`type-${t.id}`} value={t.id}>
                {t.nom}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* État de formation (optionnel) */}
        {formationEtats.length > 0 && (
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="filtres-etat-label">État de formation</InputLabel>
            <Select
              labelId="filtres-etat-label"
              id="filtres-etat-formation"
              name="formation_etat"
              value={values.formation_etat ?? ""}
              label="État de formation"
              onChange={handleChange}
            >
              <MenuItem value="">— Tous les états —</MenuItem>
              {formationEtats.map((e) => (
                <MenuItem key={`etat-${e.value}`} value={e.value}>
                  {e.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Stack>
    </Box>
  );
}

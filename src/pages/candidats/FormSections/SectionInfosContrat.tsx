import React from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Grid,
  TextField,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import type { CandidatFormData } from "../../../types/candidat";

interface Props {
  form: CandidatFormData;
  setForm: React.Dispatch<React.SetStateAction<CandidatFormData>>;
}

export default function SectionInfosContrat({ form, setForm }: Props) {
  return (
    <Card variant="outlined">
      <CardHeader
        title="Informations complémentaires pour CERFA"
        subheader="Scolarité, diplômes et statut social"
      />
      <CardContent>
        <Grid container spacing={2}>
          {/* Situation avant contrat */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Situation avant contrat"
              value={form.situation_avant_contrat ?? ""}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  situation_avant_contrat: e.target.value || null,
                }))
              }
            />
          </Grid>

          {/* Dernier diplôme préparé */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Dernier diplôme préparé"
              value={form.dernier_diplome_prepare ?? ""}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  dernier_diplome_prepare: e.target.value || null,
                }))
              }
            />
          </Grid>

          {/* Diplôme le plus élevé obtenu */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Diplôme le plus élevé obtenu"
              value={form.diplome_plus_eleve_obtenu ?? ""}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  diplome_plus_eleve_obtenu: e.target.value || null,
                }))
              }
            />
          </Grid>

          {/* Dernière classe */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Dernière classe fréquentée"
              value={form.derniere_classe ?? ""}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  derniere_classe: e.target.value || null,
                }))
              }
            />
          </Grid>

          {/* Intitulé du diplôme préparé */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Intitulé du diplôme préparé"
              value={form.intitule_diplome_prepare ?? ""}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  intitule_diplome_prepare: e.target.value || null,
                }))
              }
            />
          </Grid>

          {/* Numéro OSIA */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Numéro OSIA"
              value={form.numero_osia ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, numero_osia: e.target.value || null }))}
            />
          </Grid>

          {/* Régime social (texte libre) */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Régime social"
              value={form.regime_social ?? ""}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  regime_social: e.target.value || null,
                }))
              }
              placeholder="Ex. : Étudiant, salarié, sans emploi..."
            />
          </Grid>

          {/* Situation actuelle (texte libre) */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Situation actuelle"
              value={form.situation_actuelle ?? ""}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  situation_actuelle: e.target.value || null,
                }))
              }
              placeholder="Ex. : En recherche d’emploi, en reconversion..."
            />
          </Grid>

          {/* Cases à cocher */}
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={!!form.sportif_haut_niveau}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      sportif_haut_niveau: e.target.checked,
                    }))
                  }
                />
              }
              label="Sportif de haut niveau"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={!!form.equivalence_jeunes}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      equivalence_jeunes: e.target.checked,
                    }))
                  }
                />
              }
              label="Équivalence jeunes"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={!!form.extension_boe}
                  onChange={(e) => setForm((f) => ({ ...f, extension_boe: e.target.checked }))}
                />
              }
              label="Extension BOE"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={!!form.projet_creation_entreprise}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      projet_creation_entreprise: e.target.checked,
                    }))
                  }
                />
              }
              label="Projet de création d’entreprise"
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

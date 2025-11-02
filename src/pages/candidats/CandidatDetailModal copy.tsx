import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Grid,
  Typography,
  Divider,
  Paper,
  CircularProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import type { Candidat } from "../../types/candidat";

/* ---------- Helpers ---------- */
type CandidatWithFormation = Candidat & {
  formation_nom?: string | null;
  formation_centre_nom?: string | null;
  formation_type_offre_nom?: string | null;
  formation_type_offre_libelle?: string | null;
  formation_num_offre?: string | null;
  formation_date_debut?: string | null;
  formation_date_fin?: string | null;
};

const dtfFR =
  typeof Intl !== "undefined" ? new Intl.DateTimeFormat("fr-FR") : undefined;

const fmt = (iso?: string | null): string => {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : dtfFR
    ? dtfFR.format(d)
    : d.toLocaleDateString("fr-FR");
};

const nn = (s?: string | null) => (s ?? "").toString().trim() || "—";
const yn = (b?: boolean | null) =>
  typeof b === "boolean" ? (b ? "Oui" : "Non") : "—";

/* ---------- Props ---------- */
interface Props {
  open: boolean;
  onClose: () => void;
  candidat?: CandidatWithFormation | null; // ✅ ici
  loading?: boolean;
  onEdit?: (id: number) => void;
}


/* ---------- Sections à afficher ---------- */
const SECTIONS: {
  title: string;
  fields: { key: keyof Candidat; label: string }[];
}[] = [
  {
    title: "Identité",
    fields: [
      { key: "sexe", label: "Sexe" },
      { key: "nom_naissance", label: "Nom de naissance" },
      { key: "nom", label: "Nom d’usage" },
      { key: "prenom", label: "Prénom" },
      { key: "date_naissance", label: "Date de naissance" },
      { key: "departement_naissance", label: "Département de naissance" },
      { key: "commune_naissance", label: "Commune de naissance" },
      { key: "pays_naissance", label: "Pays de naissance" },
      { key: "nationalite", label: "Nationalité" },
      { key: "nir", label: "NIR" },
    ],
  },
  {
    title: "Contact et Adresse",
    fields: [
      { key: "email", label: "Email" },
      { key: "telephone", label: "Téléphone" },
      { key: "street_number", label: "Numéro de voie" },
      { key: "street_name", label: "Rue" },
      { key: "street_complement", label: "Complément" },
      { key: "code_postal", label: "Code postal" },
      { key: "ville", label: "Ville" },
    ],
  },


{
  title: "Formation",
  fields: [
    { key: "centre_nom", label: "Centre" },
    { key: "date_rentree", label: "Date de rentrée" },
    { key: "admissible", label: "Admissible" },
    { key: "entretien_done", label: "Entretien réalisé" },
    { key: "test_is_ok", label: "Test d’entrée OK" },
    { key: "cv_statut_display", label: "Statut du CV" },
    { key: "disponibilite", label: "Disponibilité" },
    // Champs issus de formation_info
    { key: "formation_nom", label: "Nom formation" },
    { key: "formation_centre_nom", label: "Centre (formation)" },
    { key: "formation_type_offre_nom", label: "Type d’offre" },
    { key: "formation_type_offre_libelle", label: "Libellé offre" },
    { key: "formation_num_offre", label: "N° offre" },
    { key: "formation_date_debut", label: "Début de formation" },
    { key: "formation_date_fin", label: "Fin de formation" },
  ],
},





  
  {
    title: "Statut et Contrat",
    fields: [
      { key: "statut", label: "Statut" },
      { key: "admissible", label: "Admissible" },
      { key: "type_contrat", label: "Type de contrat" },
      { key: "contrat_signe_display", label: "Contrat signé" },
    
      { key: "entretien_done", label: "Entretien réalisé" },
      { key: "test_is_ok", label: "Test d’entrée OK" },


      { key: "disponibilite", label: "Disponibilité" },
      
      { key: "cv_statut_display", label: "Statut du CV" },
      { key: "permis_b", label: "Permis B" },
      { key: "rqth", label: "RQTH" },

      { key: "communication", label: "Communication ★" },
      { key: "experience", label: "Expérience ★" },
      { key: "csp", label: "CSP ★" },

    ],
  },

    {
    title: "Placement",
    fields: [
      { key: "resultat_placement_display", label: "Résultat placement" },
      { key: "date_placement", label: "Date placement" },
      { key: "contrat_signe_display", label: "Contrat signé" },
      { key: "entreprise_placement_nom", label: "Entreprise placement" },
      { key: "entreprise_validee_nom", label: "Entreprise validée" },
      { key: "responsable_placement_nom", label: "Responsable placement" },
      { key: "vu_par_nom", label: "Vu par (staff)" },
      { key: "inscrit_gespers", label: "Inscrit GESPERS" },
      { key: "courrier_rentree", label: "Courrier rentrée envoyé" },
      { key: "numero_osia", label: "Numéro OSIA" },
    ],
  },

  {
    title: "Infos pour CERFA : Parcours scolaire et projet...",
    fields: [
      { key: "dernier_diplome_prepare", label: "Dernier diplôme préparé" },
      { key: "diplome_plus_eleve_obtenu", label: "Diplôme le plus élevé obtenu" },
      { key: "derniere_classe", label: "Dernière classe fréquentée" },
      { key: "intitule_diplome_prepare", label: "Intitulé du diplôme préparé" },
      { key: "situation_avant_contrat", label: "Situation avant contrat" },
      { key: "projet_creation_entreprise", label: "Projet création entreprise" },


      { key: "regime_social", label: "Régime social" },
      { key: "sportif_haut_niveau", label: "Sportif de haut niveau" },
      { key: "equivalence_jeunes", label: "Équivalence jeunes" },
      { key: "extension_boe", label: "Extension BOE" },
      { key: "situation_actuelle", label: "Situation actuelle" },
    ],
  },

  
  {
    title: "Représentant légal",
    fields: [
      { key: "representant_lien", label: "Lien" },
      { key: "representant_nom_naissance", label: "Nom naissance" },
      { key: "representant_prenom", label: "Prénom" },
      { key: "representant_email", label: "Email" },
      { key: "representant_street_name", label: "Rue" },
      { key: "representant_zip_code", label: "Code postal" },
      { key: "representant_city", label: "Ville" },
    ],
  },

  {
    title: "Métadonnées / Système",
    fields: [
      { key: "date_inscription", label: "Date d’inscription" },
      { key: "created_at", label: "Créé le" },
      { key: "updated_at", label: "Mis à jour le" },
      { key: "created_by", label: "Créé par (ID ou user)" },
      { key: "nb_appairages", label: "Nb appairages" },
      { key: "nb_prospections", label: "Nb prospections" },
    ],
  },
];

/* ---------- Component ---------- */
export default function CandidatDetailModal({
  open,
  onClose,
  candidat,
  loading = false,
  onEdit,
}: Props) {
  if (!open) return null;

  const f = candidat?.formation_info ?? null;
  const la = candidat?.last_appairage ?? null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      scroll="paper"
      disableEnforceFocus
    >
      {/* ────── En-tête ────── */}
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography component="div" variant="h6" fontWeight={700}>
          👤 Détail du candidat
        </Typography>
        <Button onClick={onClose} variant="outlined">
          Fermer
        </Button>
      </DialogTitle>

      {/* ────── Contenu ────── */}
      <DialogContent dividers>
        {loading || !candidat ? (
          <Box textAlign="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
            <Grid container spacing={3}>
              {SECTIONS.map((section) => (
                <Grid item xs={12} key={section.title}>
                  <Section title={section.title}>
                    {section.fields.map(({ key, label }) => {
                      const val = candidat[key];
                      const value =
                        typeof val === "boolean"
                          ? yn(val)
                          : key.toLowerCase().includes("date")
                          ? fmt(val as string)
                          : nn(val as string);
                      return <Field key={key as string} label={label} value={value} />;
                    })}
                  </Section>
                </Grid>
              ))}

              {/* ───────────── Formation détaillée ───────────── */}
              {f && (
                <Grid item xs={12}>
                  <Section title="Détails de la formation">
                    <Field label="Nom formation" value={nn(f.nom)} />
                    <Field label="Centre" value={nn(f.centre?.nom)} />
                    <Field label="Dates" value={`${fmt(f.date_debut)} → ${fmt(f.date_fin)}`} />
                    <Field
                      label="Type d’offre"
                      value={nn(f.type_offre?.nom ?? f.type_offre?.libelle)}
                    />
                    <Field label="N° offre" value={nn(f.num_offre)} />
                  </Section>
                </Grid>
              )}

              {/* ───────────── Dernier appairage ───────────── */}
              {la && (
                <Grid item xs={12}>
                  <Section title="Dernier appairage">
                    <Field label="Partenaire" value={nn(la.partenaire_nom)} />
                    <Field label="Statut" value={nn(la.statut_display ?? la.statut)} />
                    <Field label="Date d’appairage" value={fmt(la.date_appairage)} />
                    <Field label="Commentaire" value={nn(la.commentaire)} />
                  </Section>
                </Grid>
              )}
            </Grid>
          </Paper>
        )}
      </DialogContent>

      {/* ────── Actions ────── */}
      <DialogActions sx={{ justifyContent: "space-between", px: 3, py: 2 }}>
        {candidat && onEdit && candidat.id != null && (
          <Button
            startIcon={<EditIcon />}
            color="primary"
            variant="contained"
            onClick={() => onEdit(candidat.id)}
          >
            Modifier
          </Button>
        )}
        <Button variant="outlined" onClick={onClose}>
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/* ---------- Sous-composants ---------- */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography
        variant="subtitle1"
        sx={{ fontWeight: 600, color: "primary.main", mb: 0.5 }}
      >
        {title}
      </Typography>
      <Divider sx={{ mb: 1 }} />
      <Grid container spacing={1}>
        {children}
      </Grid>
    </Box>
  );
}

function Field({ label, value }: { label: string; value?: string | number | null }) {
  const display =
    value === null ||
    value === undefined ||
    value === "—" ||
    (typeof value === "string" && !value.trim()) ? (
      <span style={{ color: "red", fontStyle: "italic", opacity: 0.85 }}>— NC</span>
    ) : (
      value
    );

  return (
    <Grid item xs={12} sm={6}>
      <Typography variant="body2">
        <strong>{label} :</strong> {display}
      </Typography>
    </Grid>
  );
}

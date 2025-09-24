// src/pages/formations/FormationsDetailPage.tsx
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Box,
  Typography,
  Stack,
  Paper,
  Button,
  CircularProgress,
  Divider,
} from "@mui/material";

import PageTemplate from "../../components/PageTemplate";
import { useFormation } from "../../hooks/useFormations";
import { useCommentaires } from "../../hooks/useCommentaires";
import CommentairesSection from "./componentsFormations/CommentairesSection";
import DocumentsSection from "./componentsFormations/DocumentsSection";
import HistoriqueSection from "./componentsFormations/HistoriqueSection";
import ProspectionsSection from "./componentsFormations/ProspectionsSection";

export default function FormationsDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: formation, loading, error } = useFormation(Number(id));
  const { commentaires, loading: loadingCommentaires } = useCommentaires(Number(id));

  if (loading) return <CircularProgress />;
  if (error || !formation) {
    toast.error("Erreur lors du chargement de la formation");
    return null;
  }

  const FieldRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <Stack direction="row" spacing={1} sx={{ mb: 0.5 }}>
      <Typography fontWeight={600}>{label}</Typography>
      <Typography color="text.secondary">{value ?? "–"}</Typography>
    </Stack>
  );

  return (
    <PageTemplate
      title={`Détail : ${formation.nom}`}
      backButton
      onBack={() => navigate(-1)}
      actions={
        <Button
          variant="contained"
          onClick={() => navigate(`/formations/${formation.id}/edit`)}
        >
          ✏️ Modifier
        </Button>
      }
    >
      {/* 📋 Informations générales */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          📋 Informations générales
        </Typography>
        <FieldRow label="Nom :" value={formation.nom} />
        <FieldRow label="Centre :" value={formation.centre?.nom} />
        <FieldRow label="Type d'offre :" value={formation.type_offre?.libelle} />
        <FieldRow label="Statut :" value={formation.statut?.libelle} />
        <FieldRow label="Date de début :" value={formation.start_date} />
        <FieldRow label="Date de fin :" value={formation.end_date} />
        <FieldRow
          label="Convocation envoyée :"
          value={formation.convocation_envoie ? "✅ Oui" : "❌ Non"}
        />
      </Paper>

      {/* 🧾 Références */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          🧾 Références
        </Typography>
        <FieldRow label="N° Kairos :" value={formation.num_kairos} />
        <FieldRow label="N° Offre :" value={formation.num_offre} />
        <FieldRow label="N° Produit :" value={formation.num_produit} />
        <FieldRow label="Assistante :" value={formation.assistante} />
      </Paper>

      {/* 📊 Places */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          📊 Places
        </Typography>
        <FieldRow label="Prévus CRIF :" value={formation.prevus_crif} />
        <FieldRow label="Prévus MP :" value={formation.prevus_mp} />
        <FieldRow label="Inscrits CRIF :" value={formation.inscrits_crif} />
        <FieldRow label="Inscrits MP :" value={formation.inscrits_mp} />
        <FieldRow label="Capacité :" value={formation.cap} />
      </Paper>

      {/* 📈 Recrutement */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          📈 Recrutement
        </Typography>
        <FieldRow label="Entrées :" value={formation.entree_formation} />
        <FieldRow label="Candidats :" value={formation.nombre_candidats} />
        <FieldRow label="Entretiens :" value={formation.nombre_entretiens} />
      </Paper>

      {/* 📈 Commentaires */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          📈 Commentaires
        </Typography>
        {!loadingCommentaires && (
          <CommentairesSection
            commentaires={commentaires ?? []}
            formationId={formation.id}
            limit={3}
            paginate={false}
          />
        )}
      </Paper>

      {/* 📎 Documents */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          📎 Documents
        </Typography>
        <DocumentsSection documents={formation.documents} />
      </Paper>

      {/* 📎 Historique */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          📎 Historique de la formation
        </Typography>
        <HistoriqueSection formationId={formation.id} defaultOpen={false} />
      </Paper>

      {/* 📎 Prospections */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          📎 Prospections liées
        </Typography>
        <ProspectionsSection
          prospections={formation.prospections ?? []}
          formationId={formation.id}
        />
      </Paper>
    </PageTemplate>
  );
}

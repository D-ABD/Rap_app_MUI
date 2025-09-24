// src/pages/documents/DocumentsEditPage.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { CircularProgress, Typography } from "@mui/material";

import PageTemplate from "../../components/PageTemplate";
import DocumentForm from "./DocumentForm";
import api from "../../api/axios";

import type { DocumentFormInitialValues } from "../../types/document";

export default function DocumentsEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const formationIdFromUrl = searchParams.get("formation_id");

  const [initialValues, setInitialValues] = useState<DocumentFormInitialValues | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    api
      .get(`/documents/${id}/`)
      .then((res) => {
        const doc = res.data?.data ?? res.data;
        setInitialValues({
          nom_fichier: doc.nom_fichier ?? "",
          type_document: doc.type_document ?? "",
          type_document_display: doc.type_document_display ?? "",
          fichier: null,
          formation: doc.formation ?? null,
          formation_nom: doc.formation_nom ?? undefined,
          download_url: doc.download_url ?? "",
          taille_readable: doc.taille_readable ?? undefined,
          mime_type: doc.mime_type ?? undefined,
          extension: doc.extension ?? undefined,
          icon_class: doc.icon_class ?? undefined,
          is_viewable_in_browser: doc.is_viewable_in_browser ?? undefined,

          // Champs enrichis de la formation
          formation_centre_nom: doc.formation_centre_nom ?? undefined,
          formation_type_offre_libelle: doc.formation_type_offre_libelle ?? undefined,
          formation_num_offre: doc.formation_num_offre ?? undefined,
          formation_start_date: doc.formation_start_date ?? undefined,
          formation_end_date: doc.formation_end_date ?? undefined,
          formation_statut: doc.formation_statut ?? undefined,
        });
      })
      .catch(() => {
        toast.error("Erreur lors du chargement du document");
        navigate("/documents");
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  return (
    <PageTemplate title="✏️ Modifier un document" backButton onBack={() => navigate(-1)}>
      {loading ? (
        <CircularProgress />
      ) : initialValues ? (
        <DocumentForm
          initialValues={initialValues}
          documentId={id}
          formationId={formationIdFromUrl || undefined}
        />
      ) : (
        <Typography color="error" align="center">
          ⚠️ Impossible de charger le document.
        </Typography>
      )}
    </PageTemplate>
  );
}

// src/components/ui/DocumentForm.tsx

import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import FormationSelectModal from "../../components/modals/FormationSelectModal";
import useForm from "../../hooks/useForm";
import { useDocumentsApi } from "../../hooks/useDocuments";
import type {
  DocumentFormInitialValues,
  TypeDocumentChoice,
} from "../../types/document";

type Formation = { id: number; nom: string };

interface DocumentFormDataRaw {
  nom_fichier: string;
  fichier: File | null;
  type_document: string;
  formation: number | "";
  [key: string]: string | number | File | null | "";
}

type Props = {
  formationId?: string;
  initialValues?: DocumentFormInitialValues;
  documentId?: string;
};

export default function DocumentForm({
  formationId,
  initialValues,
  documentId,
}: Props) {
  const navigate = useNavigate();
  const [formationNom, setFormationNom] = useState<string | null>(
    initialValues?.formation_nom ?? null
  );
  const [loading, setLoading] = useState(
    !!formationId && !initialValues?.formation_nom
  );
  const [showModal, setShowModal] = useState(false);
  const [typeDocumentChoices, setTypeDocumentChoices] = useState<
    TypeDocumentChoice[]
  >([]);

  const { createDocument, updateDocument, fetchTypeDocuments } =
    useDocumentsApi();

  const { values, errors, setErrors, setValues } =
    useForm<DocumentFormDataRaw>({
      nom_fichier: initialValues?.nom_fichier ?? "",
      fichier: null,
      type_document: initialValues?.type_document ?? "",
      formation: initialValues?.formation ?? (formationId ? Number(formationId) : ""),
    });

  // 🔽 Charger le nom de la formation si absent
  useEffect(() => {
    const id =
      initialValues?.formation ?? (formationId ? Number(formationId) : null);
    if (!id || formationNom) return;

    import("../../api/axios").then((api) => {
      api.default
        .get(`/formations/${id}/`)
        .then((res) => setFormationNom(res.data.nom))
        .catch(() => toast.error("Formation introuvable"))
        .finally(() => setLoading(false));
    });
  }, [formationId, initialValues, formationNom]);

  // 🔽 Charger les types de document
  useEffect(() => {
    fetchTypeDocuments()
      .then(setTypeDocumentChoices)
      .catch(() => toast.error("Erreur chargement des types de document"));
  }, [fetchTypeDocuments]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!values.nom_fichier || !values.type_document || !values.formation) {
      toast.error("Tous les champs sont requis.");
      return;
    }

    try {
      if (documentId) {
        await updateDocument(Number(documentId), {
          nom_fichier: values.nom_fichier,
          fichier: values.fichier,
          type_document: values.type_document,
          formation: Number(values.formation),
        });
        toast.success("Document modifié avec succès");
      } else {
        await createDocument({
          nom_fichier: values.nom_fichier,
          fichier: values.fichier,
          type_document: values.type_document,
          formation: Number(values.formation),
        });
        toast.success("Document créé avec succès");
      }

      navigate("/documents");
    } catch (err: unknown) {
      const axiosError = err as {
        response?: {
          data?: Partial<Record<keyof DocumentFormDataRaw, string[]>>;
        };
      };

      if (axiosError.response?.data) {
        const formattedErrors: Partial<
          Record<keyof DocumentFormDataRaw, string>
        > = {};
        for (const key in axiosError.response.data) {
          const val = axiosError.response.data[
            key as keyof DocumentFormDataRaw
          ];
          if (Array.isArray(val)) {
            formattedErrors[key as keyof DocumentFormDataRaw] = val.join(" ");
          }
        }
        setErrors(formattedErrors);
        toast.error("Erreur lors de la soumission");
      }
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      {loading ? (
        <CircularProgress />
      ) : (
        <Box component="form" onSubmit={handleSubmit}>
          {/* Infos existantes */}
          {documentId && initialValues && (
            <Box mb={2}>
              <Typography variant="subtitle1" gutterBottom>
                📄 Informations actuelles
              </Typography>
              <Typography>Nom actuel : {initialValues.nom_fichier}</Typography>
              <Typography>
                Formation : {formationNom || initialValues.formation_nom}
              </Typography>
              {initialValues.formation_centre_nom && (
                <Typography>🏢 Centre : {initialValues.formation_centre_nom}</Typography>
              )}
              {initialValues.type_document_display && (
                <Typography>🗂️ Type : {initialValues.type_document_display}</Typography>
              )}
              {initialValues.download_url && (
                <Typography>
                  📥 <a href={initialValues.download_url}>Télécharger</a>
                </Typography>
              )}
            </Box>
          )}

          {/* Sélection formation si nécessaire */}
          {!formationId && !initialValues?.formation && (
            <>
              <Button
                variant="outlined"
                onClick={() => setShowModal(true)}
                sx={{ mb: 2 }}
              >
                🔍 {formationNom ? "Changer de formation" : "Rechercher une formation"}
              </Button>
              <FormationSelectModal
                show={showModal}
                onClose={() => setShowModal(false)}
                onSelect={(pick) => {
                  setValues((prev) => ({ ...prev, formation: pick.id }));
                  setFormationNom(pick.nom ?? "—"); // car nom peut être null
                  setShowModal(false);
                }}
              />

            </>
          )}

          {/* Champs du formulaire */}
          <Stack spacing={2}>
            <TextField
              label="Nom du fichier"
              value={values.nom_fichier}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, nom_fichier: e.target.value }))
              }
              error={!!errors.nom_fichier}
              helperText={errors.nom_fichier}
              fullWidth
            />

            <Select
              value={values.type_document}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, type_document: e.target.value }))
              }
              displayEmpty
            >
              <MenuItem value="">-- Sélectionner un type --</MenuItem>
              {typeDocumentChoices.map((choice) => (
                <MenuItem key={choice.value} value={choice.value}>
                  {choice.label}
                </MenuItem>
              ))}
            </Select>
            {errors.type_document && (
              <Typography color="error" variant="body2">
                {errors.type_document}
              </Typography>
            )}

            <Button variant="outlined" component="label">
              📎 Importer un fichier
              <input
                type="file"
                hidden
                onChange={(e) => {
                  const input = e.target as HTMLInputElement;
                  setValues((prev) => ({
                    ...prev,
                    fichier: input.files?.[0] ?? null,
                  }));
                }}
              />
            </Button>

            {documentId && initialValues?.download_url && (
              <Typography variant="body2" color="text.secondary">
                📎{" "}
                <a href={initialValues.download_url} target="_blank" rel="noreferrer">
                  Télécharger le fichier actuel
                </a>{" "}
                — laisser vide pour le conserver.
              </Typography>
            )}

            <Stack direction="row" spacing={2} mt={2}>
              <Button type="submit" variant="contained" color="success">
                💾 Enregistrer
              </Button>
              <Button variant="outlined" onClick={() => navigate("/documents")}>
                Annuler
              </Button>
            </Stack>
          </Stack>
        </Box>
      )}
    </Paper>
  );
}

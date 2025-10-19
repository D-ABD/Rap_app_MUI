// src/pages/formations/FormationsCreatePage.tsx
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Paper } from "@mui/material";

import PageTemplate from "../../components/PageTemplate";
import useForm from "../../hooks/useForm";
import { useCreateFormation, useFormationChoices } from "../../hooks/useFormations";
import type {
  FormationFormData,
  FormationFormDataRaw,
  FormationFormErrors,
} from "../../types/formation";
import FormationForm from "./FormationForm";

export default function FormationsCreatePage() {
  const navigate = useNavigate();
  const { createFormation, loading } = useCreateFormation();
  const {
    centres = [],
    statuts = [],
    typeOffres = [],
    loading: loadingChoices,
  } = useFormationChoices();

  const { values, errors, handleChange, handleCheckbox, setErrors, resetForm } =
    useForm<FormationFormDataRaw>({
      nom: "",
      centre_id: null,
      type_offre_id: null,
      statut_id: null,
      start_date: "",
      end_date: "",
      num_kairos: "",
      num_offre: "",
      num_produit: "",
      assistante: "",
      prevus_crif: 0,
      prevus_mp: 0,
      inscrits_crif: 0,
      inscrits_mp: 0,
      cap: 0,
      convocation_envoie: false,
      entree_formation: 0,
      nombre_candidats: 0,
      nombre_entretiens: 0,
      intitule_diplome: "",
      code_diplome: "",
      code_rncp: "",
      total_heures: 0,
      heures_distanciel: 0,
    });

  /** 🔄 Nouvelle signature : on reçoit directement `values` */
  const handleSubmit = async (values: FormationFormDataRaw) => {
    const payload: FormationFormData = {
      ...values,
      centre_id: values.centre_id ? Number(values.centre_id) : null,
      type_offre_id: values.type_offre_id ? Number(values.type_offre_id) : null,
      statut_id: values.statut_id ? Number(values.statut_id) : null,
    };

    try {
      await createFormation(payload);
      toast.success("✅ Formation créée avec succès !");
      navigate("/formations");
    } catch (err: unknown) {
      const serverError = err as {
        response?: { data?: { errors?: FormationFormErrors } };
      };
      const backendErrors = serverError.response?.data?.errors;
      if (backendErrors) setErrors(backendErrors);
      toast.error("❌ Erreur lors de la création de la formation");
    }
  };

  return (
    <PageTemplate
      title="Créer une formation"
      backButton
      onBack={() => navigate(-1)}
      refreshButton
      onRefresh={() => {
        resetForm();
        toast.info("Formulaire réinitialisé");
      }}
    >
      <Paper sx={{ p: 3 }}>
        <FormationForm
          initialValues={values}
          centres={centres}
          statuts={statuts}
          typeOffres={typeOffres}
          loading={loading}
          loadingChoices={loadingChoices}
          onSubmit={handleSubmit}
          onCancel={() => navigate(-1)}
          submitLabel="💾 Créer"
        />
      </Paper>
    </PageTemplate>
  );
}

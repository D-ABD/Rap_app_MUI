import React, { useState, useCallback, useRef } from "react";
import {
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Alert,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Candidat, CandidatFormData, CandidatMeta } from "../../types/candidat";
import { User } from "../../types/User";
import FormationSelectModal, { FormationPick } from "../../components/modals/FormationSelectModal";
import UsersSelectModal, { UserPick } from "../../components/modals/UsersSelectModal";

// Sections
import { mapFormationInfo } from "./FormSections/utils";
import SectionIdentite from "./FormSections/SectionIdentite";
import SectionIndicateurs from "./FormSections/SectionInSuvi";
import SectionNotes from "./FormSections/SectionNotes";
import ActionsBar from "./FormSections/ActionsBar";
import SectionAssignations from "./FormSections/SectionAssignations";

// ------------------ MEMO ------------------
const MemoIdentite = React.memo(SectionIdentite);
const MemoIndicateurs = React.memo(SectionIndicateurs);
const MemoNotes = React.memo(SectionNotes);
const MemoAssignations = React.memo(SectionAssignations);

type Props = {
  initialValues?: CandidatFormData;
  initialFormationInfo?: Candidat["formation_info"] | null;
  meta?: CandidatMeta | null;
  currentUser?: User | null;
  canEditFormation?: boolean;
  submitting?: boolean;
  onSubmit: (values: CandidatFormData) => Promise<void>;
  onCancel?: () => void;
};

export default function CandidatForm({
  initialValues,
  initialFormationInfo,
  meta,
  canEditFormation = true,
  submitting = false,
  onSubmit,
  onCancel,
}: Props) {

  // ---------------------------------------------------------------------
  // FORM STATE
  // ---------------------------------------------------------------------
  const formRef = useRef<CandidatFormData>(initialValues ?? ({} as CandidatFormData));
  const [, forceRender] = useState(0);

  const setForm = useCallback(
    (updater: Partial<CandidatFormData> | ((prev: CandidatFormData) => CandidatFormData)) => {
      const current = formRef.current;
      formRef.current =
        typeof updater === "function" ? updater(current) : { ...current, ...updater };
      forceRender((n) => n + 1);
    },
    []
  );

  const form = formRef.current;

  // ---------------------------------------------------------------------
  // STATES
  // ---------------------------------------------------------------------
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [showFormationModal, setShowFormationModal] = useState(false);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [formationInfo, setFormationInfo] = useState<FormationPick | null>(
    mapFormationInfo(initialFormationInfo)
  );
  const [openSection, setOpenSection] = useState<string | false>("identite");

  // ---------------------------------------------------------------------
  // toggleSection
  // ---------------------------------------------------------------------
  const toggleSection = useCallback(
    (section: string) => {
      setOpenSection((prev) => (prev === section ? false : section));
    },
    []
  );

  // ---------------------------------------------------------------------
  // handleSubmit — formation obligatoire
  // ---------------------------------------------------------------------
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setErrors({});
      setGlobalError(null);

      if (!form.formation) {
        setOpenSection("identite");
        setGlobalError("Veuillez sélectionner une formation.");
        return;
      }

      try {
        await onSubmit(form);
      } catch (err: any) {
        if (err.response?.status === 400 && typeof err.response.data === "object") {
          setErrors(err.response.data);

          if (err.response.data.non_field_errors) {
            setGlobalError(err.response.data.non_field_errors.join(", "));
          }
        } else {
          setGlobalError("Une erreur inattendue est survenue.");
        }
      }
    },
    [form, onSubmit]
  );

  // ---------------------------------------------------------------------
  // select formation
  // ---------------------------------------------------------------------
  const handleSelectFormation = useCallback((pick: FormationPick) => {
    setForm((f) => ({ ...f, formation: pick.id }));
    setFormationInfo(pick);
    setShowFormationModal(false);
  }, [setForm]);

  // ---------------------------------------------------------------------
  // select vu_par
  // ---------------------------------------------------------------------
  const handleSelectUser = useCallback((pick: UserPick) => {
    setForm((f) => ({ ...f, vu_par: pick.id }));
    setShowUsersModal(false);
  }, [setForm]);

  // ---------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------
  return (
    <Box component="form" onSubmit={handleSubmit} display="grid" gap={2}>

      <Alert severity="info" sx={{ mb: 1 }}>
        Les champs marqués d’un * sont obligatoires. Remplissez au minimum la section{" "}
        <b>Identité + Formation</b>.
      </Alert>

      {globalError && <Alert severity="error">{globalError}</Alert>}

      {/* Identité (inclut Adresse + Formation) */}
      <Accordion
        expanded={openSection === "identite"}
        onChange={() => toggleSection("identite")}
        TransitionProps={{ unmountOnExit: false }}
        sx={{ borderLeft: errors.nom || errors.prenom ? "3px solid red" : undefined }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight={600}>Identité & Formation</Typography>
        </AccordionSummary>

        <AccordionDetails>
          <MemoIdentite
            form={form}
            setForm={setForm}
            meta={meta}

            canEditFormation={canEditFormation}
            showFormationModal={showFormationModal}
            setShowFormationModal={setShowFormationModal}
            formationInfo={formationInfo}
          />
        </AccordionDetails>
      </Accordion>

      {/* Suivi */}
      <Accordion
        expanded={openSection === "suivi"}
        onChange={() => toggleSection("suivi")}
        TransitionProps={{ unmountOnExit: false }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight={600}>Suivi administratif</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <MemoIndicateurs form={form} setForm={setForm} meta={meta} />
        </AccordionDetails>
      </Accordion>

      {/* Assignations */}
      <Accordion
        expanded={openSection === "assignations"}
        onChange={() => toggleSection("assignations")}
        TransitionProps={{ unmountOnExit: false }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight={600}>Assignations / visibilité</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <MemoAssignations
            form={form}
            setForm={setForm}
            showUsersModal={showUsersModal}
            setShowUsersModal={setShowUsersModal}
          />
        </AccordionDetails>
      </Accordion>

      {/* Notes */}
      <Accordion
        expanded={openSection === "notes"}
        onChange={() => toggleSection("notes")}
        TransitionProps={{ unmountOnExit: false }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight={600}>Notes internes</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <MemoNotes form={form} setForm={setForm} />
        </AccordionDetails>
      </Accordion>

      <ActionsBar onCancel={onCancel} submitting={submitting} />

      {/* Modaux */}
      <FormationSelectModal
        show={showFormationModal}
        onClose={() => setShowFormationModal(false)}
        onSelect={handleSelectFormation}
      />

      <UsersSelectModal
        show={showUsersModal}
        onClose={() => setShowUsersModal(false)}
        allowedRoles={["staff", "admin", "superadmin"]}
        onSelect={handleSelectUser}
      />
    </Box>
  );
}

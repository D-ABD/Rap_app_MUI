import React, { useState } from 'react';
import {
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Alert,
  Card,
  CardHeader,
  CardContent,
  TextField,
  Button,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Candidat, CandidatFormData, CandidatMeta } from '../../types/candidat';
import { User } from '../../types/User';
import FormationSelectModal, { FormationPick } from '../../components/modals/FormationSelectModal';
import UsersSelectModal, { UserPick } from '../../components/modals/UsersSelectModal';

// Sections
import { mapFormationInfo } from './FormSections/utils';
import SectionIdentite from './FormSections/SectionIdentite';
import SectionAdresse from './FormSections/SectionAdresse';
import SectionFormation from './FormSections/SectionFormation';
import SectionInfosContrat from './FormSections/SectionInfosContrat';
import SectionIndicateurs from './FormSections/SectionInSuvi';
import SectionRepresentant from './FormSections/SectionRepresentant';
import SectionNotes from './FormSections/SectionNotes';
import ActionsBar from './FormSections/ActionsBar';
import SectionAssignations from './FormSections/SectionAssignations';

type Props = {
  initialValues?: CandidatFormData;
  initialFormationInfo?: Candidat['formation_info'] | null;
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
  const [form, setForm] = useState<CandidatFormData>({ ...initialValues });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [showFormationModal, setShowFormationModal] = useState(false);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [formationInfo, setFormationInfo] = useState<FormationPick | null>(
    mapFormationInfo(initialFormationInfo)
  );

  const [openSection, setOpenSection] = useState<string | false>('identite');
  const toggleSection = (section: string) =>
    setOpenSection(prev => (prev === section ? false : section));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGlobalError(null);
    try {
      await onSubmit(form);
    } catch (err: any) {
      console.error('Erreur lors de la soumission :', err);
      if (err.response?.status === 400 && typeof err.response.data === 'object') {
        setErrors(err.response.data);
        if (err.response.data.non_field_errors) {
          setGlobalError(err.response.data.non_field_errors.join(', '));
        }
      } else {
        setGlobalError("Une erreur inattendue est survenue.");
      }
    }
  };

  const handleSelectFormation = (pick: FormationPick) => {
    setForm(f => ({ ...f, formation: pick.id }));
    setFormationInfo(pick);
    setShowFormationModal(false);
  };

  const handleSelectUser = (pick: UserPick) => {
    setForm(f => ({ ...f, vu_par: pick.id }));
    setShowUsersModal(false);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} display="grid" gap={2}>
      {/* ✅ Message d’aide global permanent */}
      <Alert severity="info" sx={{ mb: 1 }}>
        Les champs marqués d’un * sont obligatoires.  
        Remplissez au minimum les sections <b>Identité</b>, <b>Adresse</b> et <b>Formation</b>.
      </Alert>

      {/* ✅ Erreur globale en haut */}
      {globalError && <Alert severity="error">{globalError}</Alert>}

      {/* Section Identité */}
      <Accordion
        expanded={openSection === 'identite'}
        onChange={() => toggleSection('identite')}
        sx={{ borderLeft: errors.nom || errors.prenom ? '3px solid red' : undefined }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight={600} color={errors.nom || errors.prenom ? 'error' : undefined}>
            Identité
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <SectionIdentite form={form} setForm={setForm} meta={meta} />
        </AccordionDetails>
      </Accordion>

      {/* Section Adresse */}
      <Accordion
        expanded={openSection === 'adresse'}
        onChange={() => toggleSection('adresse')}
        sx={{
          borderLeft:
            errors.ville || errors.code_postal || errors.street_name ? '3px solid red' : undefined,
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography
            fontWeight={600}
            color={errors.ville || errors.code_postal || errors.street_name ? 'error' : undefined}
          >
            Adresse
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <SectionAdresse form={form} setForm={setForm} />
          {/* Aide ou erreurs visibles */}
          {errors.code_postal && (
            <Typography color="error" variant="body2">
              Code postal : {errors.code_postal[0]}
            </Typography>
          )}
          {errors.ville && (
            <Typography color="error" variant="body2">
              Ville : {errors.ville[0]}
            </Typography>
          )}
        </AccordionDetails>
      </Accordion>

      {/* Section Formation */}
      <Accordion
        expanded={openSection === 'formation'}
        onChange={() => toggleSection('formation')}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight={600}>Formation</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <SectionFormation
            form={form}
            setForm={setForm}
            canEditFormation={canEditFormation}
            showFormationModal={showFormationModal}
            setShowFormationModal={setShowFormationModal}
            formationInfo={formationInfo}
          />
          {/* ✅ Aide explicative persistante */}
          <Typography variant="body2" color="text.secondary" mt={1}>
            ℹ️ Sélectionnez une formation pour remplir automatiquement le centre, le numéro d’offre, et le type d’offre.
          </Typography>
        </AccordionDetails>
      </Accordion>

      {/* Section Suivi */}
      <Accordion expanded={openSection === 'suivi'} onChange={() => toggleSection('suivi')}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight={600}>Suivi administratif</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <SectionIndicateurs form={form} setForm={setForm} meta={meta} />
        </AccordionDetails>
      </Accordion>

      {/* Section Infos Contrat */}
      <Accordion expanded={openSection === 'infosContrat'} onChange={() => toggleSection('infosContrat')}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight={600}>Informations complémentaires / CERFA</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <SectionInfosContrat form={form} setForm={setForm} />
        </AccordionDetails>
      </Accordion>

      {/* Section Représentant */}
      <Accordion expanded={openSection === 'representant'} onChange={() => toggleSection('representant')}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight={600}>Représentant légal (si mineur)</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <SectionRepresentant form={form} setForm={setForm} />
        </AccordionDetails>
      </Accordion>

      {/* Section Assignations */}
      <Accordion expanded={openSection === 'assignations'} onChange={() => toggleSection('assignations')}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight={600}>Assignations / visibilité</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <SectionAssignations
            form={form}
            setForm={setForm}
            showUsersModal={showUsersModal}
            setShowUsersModal={setShowUsersModal}
          />
          {/* ✅ Aide persistante et claire */}
          <Typography variant="body2" color="text.secondary" mt={1}>
            ℹ️ Recherche par nom ou email. Seuls les rôles <b>staff</b>, <b>admin</b> et <b>superadmin</b> sont proposés.
          </Typography>
        </AccordionDetails>
      </Accordion>

      {/* Section Notes */}
      <Accordion expanded={openSection === 'notes'} onChange={() => toggleSection('notes')}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight={600}>Notes internes</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <SectionNotes form={form} setForm={setForm} />
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
        allowedRoles={['staff', 'admin', 'superadmin']}
        onSelect={handleSelectUser}
      />
    </Box>
  );
}

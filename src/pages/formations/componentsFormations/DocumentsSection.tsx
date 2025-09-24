// src/pages/formations/componentsFormations/DocumentsSection.tsx
import type { Document } from '../../../types/document';
import DocumentsTable from '../../Documents/DocumentsTable';
import FormationSection from './FormationSection';

interface Props {
  documents?: Document[];
}

export default function DocumentsSection({ documents = [] }: Props) {
  return (
    <FormationSection title={`📎 Documents (${documents.length})`}>
      {documents.length ? (
        <DocumentsTable documents={documents} showActions />
      ) : (
        <p>— Aucun document —</p>
      )}
    </FormationSection>
  );
}

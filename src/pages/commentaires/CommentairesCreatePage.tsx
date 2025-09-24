// src/pages/commentaires/CommentairesCreatePage.tsx
import PageTemplate from "../../components/PageTemplate";
import CommentaireForm from "./CommentaireForm";

export default function CommentairesCreatePage() {
  return (
    <PageTemplate
      title="➕ Créer un commentaire"
      backButton
      onBack={() => window.history.back()}
    >
      <CommentaireForm />
    </PageTemplate>
  );
}

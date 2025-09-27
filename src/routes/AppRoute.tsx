import { Routes, Route, Navigate } from "react-router-dom";
import { ReactNode } from "react";

import MainLayout from "../layout/MainLayout";
import LoginPage from "../pages/auth/LoginPage";
import HomePage from "../pages/HomePage";
import DashboardPage from "../pages/DashboardPage";
import NotFoundPage from "../pages/NotFoundPage";

import AppairagesPage from "../pages/appairage/AppairagesPage";
import AppairagesCreatePage from "../pages/appairage/AppairagesCreatePage";
import AppairagesEditPage from "../pages/appairage/AppairagesEditPage";

import AppairageCommentPage from "../pages/appairage/appairage_comments/AppairageCommentPage";
import AppairageCommentCreatePage from "../pages/appairage/appairage_comments/AppairageCommentCreate";
import AppairageCommentEditPage from "../pages/appairage/appairage_comments/AppairageCommentEdit";

import CandidatsPage from "../pages/candidats/candidatsPage";
import CandidatCreatePage from "../pages/candidats/candidatsCreatePage";
import CandidatEditPage from "../pages/candidats/candidatsEditPage";
import CandidatDetailPage from "../pages/candidats/CandidatDetailPage";

import AteliersTrePage from "../pages/ateliers/AteliersTrePage";
import AteliersTRECreatePage from "../pages/ateliers/AteliersTRECreatePage";

import { useAuth } from "../hooks/useAuth";
import CentresPage from "../pages/centres/CentresPage";
import CentresCreatePage from "../pages/centres/CreateCentre";
import CentresEditPage from "../pages/centres/EditCentre";
import StatutsPage from "../pages/statuts/StatutsPage";
import TypeOffresPage from "../pages/typeOffres/TypeOffresPage";
import TypeOffresCreatePage from "../pages/typeOffres/TypeOffresCreatePage";
import TypeOffresEditPage from "../pages/typeOffres/TypeOffresEditPage";
import StatutsCreatePage from "../pages/statuts/StatutsCreatePage";
import StatutsEditPage from "../pages/statuts/StatutsEditPage";
import ParametresPage from "../pages/parametres/ParametresPage";
import UsersPage from "../pages/users/UsersPage";
import UsersCreatePage from "../pages/users/UsersCreatePage";
import UsersEditPage from "../pages/users/UsersEditPage";
import CommentairesPage from "../pages/commentaires/CommentairesPage";
import CommentairesCreatePage from "../pages/commentaires/CommentairesCreatePage";
import CommentairesCreateFromFormationPage from "../pages/commentaires/CommentairesCreateFromFormationPage";
import CommentairesEditPage from "../pages/commentaires/CommentairesEditPage";
import DocumentsPage from "../pages/Documents/DocumentsPage";
import DocumentsCreatePage from "../pages/Documents/DocumentsCreatePage";
import DocumentsEditPage from "../pages/Documents/DocumentsEditPage";
import FormationsPage from "../pages/formations/FormationsPage";
import FormationsCreatePage from "../pages/formations/FormationsCreatePage";
import FormationsEditPage from "../pages/formations/FormationsEditPage";
import FormationDetailPage from "../pages/formations/FormationDetailPage";
import FormationsCommentairesPage from "../pages/formations/componentsFormations/FormationsCommentairesPage";
import FormationsDocumentsPage from "../pages/formations/componentsFormations/FormationsDocumentsPage";
import PartenairesPage from "../pages/partenaires/PartenairesPage";
import PartenairesCreatePage from "../pages/partenaires/PartenairesCreatePage";
import PartenairesEditPage from "../pages/partenaires/PartenairesEditPage";
import ProspectionPage from "../pages/prospection/ProspectionPage";
import ProspectionCreatePage from "../pages/prospection/ProspectionCreatePage";
import ProspectionCreatePageCandidat from "../pages/prospection/ProspectionCreatePageCandidat";
import ProspectionEditCandidatPage from "../pages/prospection/ProspectionEditCandidatPage";
import ProspectionEditPage from "../pages/prospection/ProspectionEditCandidatPage";
import ProspectionCommentPage from "../pages/prospection/prospectioncomments/ProspectionCommentPage";
import ProspectionCommentCreatePage from "../pages/prospection/prospectioncomments/ProspectionCommentCreate";
import ProspectionCommentEditPage from "../pages/prospection/prospectioncomments/ProspectionCommentEdit";
import RegisterPage from "../pages/auth/RegisterPage";


/* ---------- SecureRoute ---------- */
type SecureRouteProps = { children: ReactNode };

function SecureRoute({ children }: SecureRouteProps) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

const secure = (el: ReactNode) => <SecureRoute>{el}</SecureRoute>;

/* ---------- Routes ---------- */
export default function AppRoute() {
  return (
    <Routes>
      {/* 🔓 Routes publiques */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />


      {/* 🔐 Routes protégées avec layout */}
      <Route element={<MainLayout />}>
        {/* Index */}
        <Route index element={<HomePage />} />

        {/* Dashboard */}
        <Route path="/dashboard" element={secure(<DashboardPage />)} />

        {/* ✅ Paramètres */}
        <Route path="/parametres" element={secure(<ParametresPage />)} />

        {/* Appairages */}
        <Route path="/appairages" element={secure(<AppairagesPage />)} />
        <Route path="/appairages/create" element={secure(<AppairagesCreatePage />)} />
        <Route path="/appairages/:id/edit" element={secure(<AppairagesEditPage />)} />

        {/* Appairage - commentaires */}
        <Route path="/appairage-commentaires" element={secure(<AppairageCommentPage />)} />
        <Route path="/appairage-commentaires/create" element={secure(<AppairageCommentCreatePage />)} />
        <Route path="/appairage-commentaires/create/:appairageId" element={secure(<AppairageCommentCreatePage />)} />
        <Route path="/appairage-commentaires/:id/edit" element={secure(<AppairageCommentEditPage />)} />

        {/* Ateliers TRE */}
        <Route path="/ateliers-tre" element={secure(<AteliersTrePage />)} />
        <Route path="/ateliers-tre/create" element={secure(<AteliersTRECreatePage />)} />
        <Route path="/ateliers-tre/:id/edit" element={secure(<AteliersTrePage />)} />

        {/* Candidats */}
        <Route path="/candidats" element={secure(<CandidatsPage />)} />
        <Route path="/candidats/create" element={secure(<CandidatCreatePage />)} />
        <Route path="/candidats/:id/edit" element={secure(<CandidatEditPage />)} />


      {/* Centres */}
      <Route path="/centres" element={secure(<CentresPage />)} />
      <Route path="/centres/create" element={secure(<CentresCreatePage />)} />
      <Route path="/centres/:id/edit" element={secure(<CentresEditPage />)} />

      {/* Commentaires */}
      <Route path="/commentaires" element={secure(<CommentairesPage />)} />
      <Route path="/commentaires/create" element={secure(<CommentairesCreatePage />)} />
      <Route path="/commentaires/create/:formationId" element={secure(<CommentairesCreateFromFormationPage />)} />
      <Route path="/commentaires/edit/:id" element={secure(<CommentairesEditPage />)} />

      {/* Documents */}
      <Route path="/documents" element={secure(<DocumentsPage />)} />
      <Route path="/documents/create" element={secure(<DocumentsCreatePage />)} />
      <Route path="/documents/edit/:id" element={secure(<DocumentsEditPage />)} />

      {/* Formations */}
      <Route path="/formations" element={secure(<FormationsPage />)} />
      <Route path="/formations/create" element={secure(<FormationsCreatePage />)} />
      <Route path="/formations/:id/edit" element={secure(<FormationsEditPage />)} />
      <Route path="/formations/:id" element={secure(<FormationDetailPage />)} />
      <Route path="/formations/:formationId/commentaires" element={secure(<FormationsCommentairesPage />)} />
      <Route path="/formations/:formationId/documents" element={secure(<FormationsDocumentsPage />)} />
 
       {/* Partenaires */}
      <Route path="/partenaires" element={secure(<PartenairesPage />)} />
      <Route path="/partenaires/create" element={secure(<PartenairesCreatePage />)} />
      <Route path="/partenaires/:id/edit" element={secure(<PartenairesEditPage />)} />

       {/* Prospection */}
      <Route path="/prospection" element={secure(<ProspectionPage />)} />
      <Route path="/prospections/create" element={secure(<ProspectionCreatePage />)} />
      <Route path="/prospections/create/candidat" element={<ProspectionCreatePageCandidat />} />
      <Route path="/prospections/:id/edit-candidat" element={<ProspectionEditCandidatPage />} /> 
      <Route path="/prospections/:id/edit" element={secure(<ProspectionEditPage />)} />
     
           {/* Prospection — Commentaires dédiés */}
      <Route path="/prospection-commentaires" element={secure(<ProspectionCommentPage />)}/>
      <Route path="/prospection-commentaires/create" element={secure(<ProspectionCommentCreatePage />)}/>
      <Route path="/prospection-commentaires/:id/edit" element={secure(<ProspectionCommentEditPage />)}/>
      <Route path="/prospection-commentaires/create/:prospectionId" element={secure(<ProspectionCommentCreatePage />)} />




      {/* Statuts */}
      <Route path="/statuts" element={secure(<StatutsPage />)} />
      <Route path="/statuts/create" element={secure(<StatutsCreatePage />)} />
      <Route path="/statuts/:id/edit" element={secure(<StatutsEditPage />)} />

      {/* TypeOffres */}
      <Route path="/typeoffres" element={secure(<TypeOffresPage />)} />
      <Route path="/typeoffres/create" element={secure(<TypeOffresCreatePage />)} />
      <Route path="/typeoffres/:id/edit" element={secure(<TypeOffresEditPage />)} />

      {/* Utilisateurs */}
      <Route path="/users" element={secure(<UsersPage />)} />
      <Route path="/users/create" element={secure(<UsersCreatePage />)} />
      <Route path="/users/:id/edit" element={secure(<UsersEditPage />)} />
            
</Route>
      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

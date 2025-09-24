// src/layout/SidebarItems.tsx
import { ReactNode } from "react";

// Icônes Material
import HomeIcon from "@mui/icons-material/Home";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SearchIcon from "@mui/icons-material/Search";
import FolderIcon from "@mui/icons-material/Folder";
import SettingsIcon from "@mui/icons-material/Settings";
import PeopleIcon from "@mui/icons-material/People";
import WorkIcon from "@mui/icons-material/Work";
import SchoolIcon from "@mui/icons-material/School";
import DescriptionIcon from "@mui/icons-material/Description";
import BusinessIcon from "@mui/icons-material/Business";

// 🔹 Définition du type d’un item de sidebar
export interface SidebarItem {
  label: string;
  path?: string;
  icon: ReactNode;
  children?: SidebarItem[];
}

// 🔹 Liste des items de la sidebar
export const sidebarItems: SidebarItem[] = [
  { label: "Accueil", path: "/", icon: <HomeIcon /> },
  { label: "Dashboard", path: "/dashboard", icon: <DashboardIcon /> },

  // CRM
  {
    label: "CRM",
    icon: <SearchIcon />,
    children: [
      { label: "Prospections", path: "/prospection", icon: <SearchIcon /> },
      { label: "Prospections commentaires", path: "/prospection-commentaires", icon: <SearchIcon /> },
      { label: "Partenaires", path: "/partenaires", icon: <BusinessIcon /> },
      { label: "Appairages commentaires", path: "/appairage-commentaires", icon: <SearchIcon /> },
      { label: "Appairage", path: "/appairages", icon: <WorkIcon /> },
      { label: "Candidats", path: "/candidats", icon: <PeopleIcon /> },
      { label: "Ateliers TRE", path: "/ateliers-tre", icon: <SchoolIcon /> },
    ],
  },

  // Revue d’offres
  {
    label: "Revue d’offres",
    icon: <FolderIcon />,
    children: [
      { label: "Formations", path: "/formations", icon: <FolderIcon /> },
      { label: "Commentaires", path: "/commentaires", icon: <DescriptionIcon /> },
      { label: "Documents", path: "/documents", icon: <FolderIcon /> },
    ],
  },

  // Paramètres
  { label: "Paramètres", path: "/parametres", icon: <SettingsIcon /> },
];

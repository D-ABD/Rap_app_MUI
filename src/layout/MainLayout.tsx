// src/layout/MainLayout.tsx
import { useState, useEffect, useContext } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CssBaseline,
  Box,
  Divider,
  Collapse,
  Button,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  Breadcrumbs,
  Link as MuiLink,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import AccountCircle from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import SearchIcon from "@mui/icons-material/Search";
import FolderIcon from "@mui/icons-material/Folder";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";

import { sidebarItems } from "./SidebarItems";
import { useAuth } from "../hooks/useAuth";
import { ThemeContext } from "../contexts/ThemeContext";
import logo from "../assets/logo.png";
import { breadcrumbLabels } from "../utils/breadcrumbLabels";
import Footer from "./footer";

const drawerWidth = 240;

export default function MainLayout() {
  const [open, setOpen] = useState(false);
  const [submenuOpen, setSubmenuOpen] = useState<Record<string, boolean>>({});
  const [anchorCrm, setAnchorCrm] = useState<null | HTMLElement>(null);
  const [anchorRevue, setAnchorRevue] = useState<null | HTMLElement>(null);
  const [anchorUser, setAnchorUser] = useState<null | HTMLElement>(null);

  const location = useLocation();
  const navigate = useNavigate();

  const { user, isAuthenticated, logout } = useAuth();

  // ✅ Contexte thème
  const themeContext = useContext(ThemeContext);
  if (!themeContext) {
    throw new Error("MainLayout doit être utilisé dans un <ThemeProvider>");
  }
  const { mode, toggleTheme } = themeContext;

  // ✅ Responsive
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const toggleDrawer = () => setOpen((prev) => !prev);
  const toggleSubmenu = (label: string) => {
    setSubmenuOpen((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const isActive = (path?: string) => !!path && location.pathname.startsWith(path);

  // Auto-ouverture des sous-menus si actif
  useEffect(() => {
    const newState: Record<string, boolean> = {};
    sidebarItems.forEach((item) => {
      if (item.children?.some((child) => isActive(child.path))) {
        newState[item.label] = true;
      }
    });
    setSubmenuOpen((prev) => ({ ...prev, ...newState }));
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const canSeeAdvanced =
    !!user &&
    (user.is_superuser === true ||
      user.is_staff === true ||
      ["admin", "superadmin", "staff"].includes((user.role ?? "").toLowerCase()));

  // ✅ Fil d’Ariane
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <CssBaseline />

      {/* 🔹 Navbar */}
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar sx={{ px: { xs: 1, sm: 2 } }}>
          {/* 🔹 Bouton menu burger (ouvre toujours la sidebar) */}
          <IconButton color="inherit" edge="start" onClick={toggleDrawer} sx={{ mr: 1 }}>
            <MenuIcon />
          </IconButton>

          {/* Logo + Titre */}
          <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
            <img src={logo} alt="Logo" style={{ height: 32, marginRight: 8 }} />
            <Typography
              variant="h6"
              noWrap
              component={Link}
              to="/"
              sx={{
                color: "inherit",
                textDecoration: "none",
                fontSize: { xs: "1rem", sm: "1.2rem" },
              }}
            >
              Rap App
            </Typography>
          </Box>

          {/* 🔹 Menu Desktop */}
          {!isMobile && (
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button color="inherit" component={Link} to="/">
                Accueil
              </Button>
              <Button color="inherit" component={Link} to="/dashboard">
                Dashboard
              </Button>

              {/* CRM submenu */}
              <Button
                color="inherit"
                onClick={(e) => setAnchorCrm(e.currentTarget)}
                endIcon={<SearchIcon />}
              >
                CRM
              </Button>
              <Menu
                anchorEl={anchorCrm}
                open={Boolean(anchorCrm)}
                onClose={() => setAnchorCrm(null)}
              >
                <MenuItem component={Link} to="/prospection">Prospections</MenuItem>
                <MenuItem component={Link} to="/prospection-commentaires">Prospections commentaires</MenuItem>
                <MenuItem component={Link} to="/partenaires">Partenaires</MenuItem>
                {canSeeAdvanced && (
                  <>
                    <MenuItem component={Link} to="/appairage-commentaires">Appairages commentaires</MenuItem>
                    <MenuItem component={Link} to="/appairages">Appairage</MenuItem>
                    <MenuItem component={Link} to="/candidats">Candidats</MenuItem>
                    <MenuItem component={Link} to="/ateliers-tre">Ateliers TRE</MenuItem>
                  </>
                )}
              </Menu>

              {/* Revue d'offres submenu */}
              {canSeeAdvanced && (
                <>
                  <Button
                    color="inherit"
                    onClick={(e) => setAnchorRevue(e.currentTarget)}
                    endIcon={<FolderIcon />}
                  >
                    Revue d&apos;offres
                  </Button>
                  <Menu
                    anchorEl={anchorRevue}
                    open={Boolean(anchorRevue)}
                    onClose={() => setAnchorRevue(null)}
                  >
                    <MenuItem component={Link} to="/formations">Formations</MenuItem>
                    <MenuItem component={Link} to="/commentaires">Commentaires</MenuItem>
                    <MenuItem component={Link} to="/documents">Documents</MenuItem>
                  </Menu>
                </>
              )}

              <Button color="inherit" component={Link} to="/parametres">
                Paramètres
              </Button>
            </Box>
          )}

          {/* 🔹 Toggle thème */}
          <IconButton color="inherit" onClick={toggleTheme}>
            {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>

          {/* 🔹 Auth */}
          {isAuthenticated ? (
            <>
              <IconButton color="inherit" onClick={(e) => setAnchorUser(e.currentTarget)}>
                <AccountCircle />
              </IconButton>
              <Menu
                anchorEl={anchorUser}
                open={Boolean(anchorUser)}
                onClose={() => setAnchorUser(null)}
              >
                <MenuItem disabled>{user?.username || user?.email}</MenuItem>
                <MenuItem onClick={handleLogout}>
                  <LogoutIcon fontSize="small" /> &nbsp;Déconnexion
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button
              color="inherit"
              component={Link}
              to="/login"
              startIcon={<LoginIcon />}
              sx={{ fontSize: { xs: "0.8rem", sm: "1rem" } }}
            >
              Connexion
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {/* 🔹 Sidebar Drawer */}
      <Drawer
        variant="temporary"
        open={open}
        onClose={toggleDrawer}
        ModalProps={{ keepMounted: true }}
        sx={{
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        <Toolbar />
        <Divider />
        <List>
          {sidebarItems.map((item) => (
            <Box key={item.label}>
              <ListItemButton
                component={item.path ? Link : "div"}
                to={item.path || ""}
                selected={isActive(item.path)}
                onClick={() => {
                  if (item.children) toggleSubmenu(item.label);
                  if (item.path) toggleDrawer();
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
                {item.children &&
                  (submenuOpen[item.label] ? <ExpandLess /> : <ExpandMore />)}
              </ListItemButton>

              {item.children && (
                <Collapse in={submenuOpen[item.label]} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.children.map((child) => (
                      <ListItemButton
                        key={child.label}
                        sx={{ pl: 4 }}
                        component={Link}
                        to={child.path || ""}
                        selected={isActive(child.path)}
                        onClick={toggleDrawer}
                      >
                        <ListItemIcon>{child.icon}</ListItemIcon>
                        <ListItemText primary={child.label} />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              )}
            </Box>
          ))}
        </List>
      </Drawer>

      {/* 🔹 Contenu principal */}
      <Box
        component="main"
        sx={{
          flex: 1,
          p: { xs: 2, sm: 3 },
          mt: { xs: 7, sm: 8 },
          backgroundColor: (theme) =>
            theme.palette.mode === "light" ? "#f9f9f9" : "#121212",
        }}
      >
        {/* ✅ Fil d’Ariane */}
        <Breadcrumbs
          aria-label="breadcrumb"
          separator={<NavigateNextIcon fontSize="small" />}
          sx={{ mb: 2 }}
        >
          <MuiLink component={Link} to="/" underline="hover" color="inherit">
            Accueil
          </MuiLink>
          {pathnames.map((value, index) => {
            const to = `/${pathnames.slice(0, index + 1).join("/")}`;
            const isLast = index === pathnames.length - 1;
            const label =
              breadcrumbLabels[value] ??
              value.charAt(0).toUpperCase() + value.slice(1);

            return isLast ? (
              <Typography key={to} color="text.primary">
                {label}
              </Typography>
            ) : (
              <MuiLink key={to} component={Link} underline="hover" color="inherit" to={to}>
                {label}
              </MuiLink>
            );
          })}
        </Breadcrumbs>

        <Outlet />
      </Box>

      {/* 🔹 Footer */}
      <Footer />
    </Box>
  );
}

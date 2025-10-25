import { useState, useContext } from "react";
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
  Button,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  Stack,
} from "@mui/material";

import InfoIcon from "@mui/icons-material/Info";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircle from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CommentIcon from "@mui/icons-material/Comment";
import DashboardIcon from "@mui/icons-material/Dashboard";
import GroupIcon from "@mui/icons-material/Group";

import { Link, useNavigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ThemeContext } from "../contexts/ThemeContext";
import logo from "../assets/logo.png";
import Footer from "./footer";

const drawerWidth = 240;

export default function MainLayoutCandidat() {
  const [open, setOpen] = useState(false);
  const [anchorUser, setAnchorUser] = useState<null | HTMLElement>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  // ✅ Contexte thème
  const themeContext = useContext(ThemeContext);
  if (!themeContext) {
    throw new Error("MainLayoutCandidat doit être utilisé dans un <ThemeProvider>");
  }
  const { mode, toggleTheme } = themeContext;

  // ✅ Responsive
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const toggleDrawer = () => setOpen((prev) => !prev);
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <CssBaseline />

      {/* 🔹 Navbar */}
      <AppBar
        position="fixed"
        elevation={3}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backdropFilter: "blur(8px)",
          background: (theme) =>
            theme.palette.mode === "light" ? "rgba(25, 118, 210, 0.9)" : "rgba(18,18,18,0.9)",
        }}
      >
        <Toolbar sx={{ px: { xs: 1, sm: 2 }, minHeight: 56 }}>
          {/* Bouton menu burger (mobile) */}
          <IconButton color="inherit" edge="start" onClick={toggleDrawer} sx={{ mr: 1 }}>
            <MenuIcon />
          </IconButton>

          {/* Logo + titre */}
          <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
            <img src={logo} alt="Logo" style={{ height: 28, marginRight: 8 }} />
            <Typography
              variant="h6"
              noWrap
              component={Link}
              to="/"
              sx={{
                color: "inherit",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: { xs: "1rem", sm: "1.1rem" },
              }}
            >
              Rap App
            </Typography>
          </Box>

          {/* 🔹 Menu Desktop */}
          {!isMobile && (
            <Stack direction="row" spacing={1} alignItems="center">
              <Button color="inherit" component={Link} to="/dashboard">
                Dashboard
              </Button>
              <Button color="inherit" component={Link} to="/prospections/candidat">
                Prospections
              </Button>
              <Button color="inherit" component={Link} to="/prospection-commentaires">
                Commentaires prospections
              </Button>
              <Button color="inherit" component={Link} to="/partenaires/candidat">
                Partenaires
              </Button>
              <Button color="inherit" component={Link} to="/about">
                À propos
              </Button>
            </Stack>
          )}

          {/* Toggle thème */}
          <IconButton color="inherit" onClick={toggleTheme}>
            {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>

          {/* Auth */}
          {isAuthenticated ? (
            <>
              <IconButton color="inherit" onClick={(e) => setAnchorUser(e.currentTarget)}>
                <AccountCircle />
              </IconButton>
              <Menu
                anchorEl={anchorUser}
                open={Boolean(anchorUser)}
                onClose={() => setAnchorUser(null)}
                PaperProps={{ sx: { borderRadius: 2, boxShadow: 3, mt: 1 } }}
              >
                <MenuItem disabled>{user?.username || user?.email}</MenuItem>
                {user?.role && <MenuItem disabled>🎭 Rôle : {user.role}</MenuItem>}
                <MenuItem component={Link} to="/mon-profil" onClick={() => setAnchorUser(null)}>
                  <AccountCircle fontSize="small" /> &nbsp;Mon profil
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <LogoutIcon fontSize="small" /> &nbsp;Déconnexion
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button color="inherit" component={Link} to="/login" startIcon={<LoginIcon />}>
              Connexion
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {/* 🔹 Sidebar Drawer (mobile) */}
      <Drawer
        variant="temporary"
        open={open}
        onClose={toggleDrawer}
        ModalProps={{ keepMounted: true }}
        sx={{
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            borderRight: (theme) => `1px solid ${theme.palette.divider}`,
            borderTopRightRadius: 12,
            borderBottomRightRadius: 12,
          },
        }}
      >
        <Toolbar />
        <Divider />
        <List>
          <ListItemButton
            component={Link}
            to="/dashboard"
            onClick={toggleDrawer}
            selected={isActive("/dashboard")}
          >
            <ListItemIcon>
              <DashboardIcon color="primary" />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>

          <ListItemButton
            component={Link}
            to="/prospections/candidat"
            onClick={toggleDrawer}
            selected={isActive("/prospections/candidat")}
          >
            <ListItemIcon>
              <AssignmentIcon color="info" />
            </ListItemIcon>
            <ListItemText primary="Prospections" />
          </ListItemButton>

          <ListItemButton
            component={Link}
            to="/prospection-commentaires"
            onClick={toggleDrawer}
            selected={isActive("/prospection-commentaires")}
          >
            <ListItemIcon>
              <CommentIcon color="secondary" />
            </ListItemIcon>
            <ListItemText primary="Commentaires" />
          </ListItemButton>

          <ListItemButton
            component={Link}
            to="/partenaires/candidat"
            onClick={toggleDrawer}
            selected={isActive("/partenaires/candidat")}
          >
            <ListItemIcon>
              <GroupIcon color="success" />
            </ListItemIcon>
            <ListItemText primary="Partenaires" />
          </ListItemButton>

          <ListItemButton
            component={Link}
            to="/about"
            onClick={toggleDrawer}
            selected={isActive("/about")}
          >
            <ListItemIcon>
              <InfoIcon color="action" />
            </ListItemIcon>
            <ListItemText primary="À propos" />
          </ListItemButton>
        </List>
      </Drawer>

      {/* 🔹 Contenu principal */}
      <Box
        component="main"
        sx={{
          flex: 1,
          p: { xs: 2, sm: 3 },
          mt: { xs: 7, sm: 8 },
          backgroundColor: (theme) => (theme.palette.mode === "light" ? "#f9f9f9" : "#121212"),
          transition: "background-color 0.3s ease",
        }}
      >
        <Outlet />
      </Box>

      {/* 🔹 Footer */}
      <Box
        component="footer"
        sx={{
          py: 2,
          textAlign: "center",
          borderTop: (theme) => `1px solid ${theme.palette.divider}`,
          backgroundColor: (theme) => (theme.palette.mode === "light" ? "#fafafa" : "#1a1a1a"),
        }}
      >
        <Typography variant="caption" color="text.secondary">
          <Footer />
        </Typography>
      </Box>
    </Box>
  );
}

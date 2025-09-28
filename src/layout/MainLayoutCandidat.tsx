// src/layout/MainLayoutCandidat.tsx
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
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";

import MenuIcon from "@mui/icons-material/Menu";
import AccountCircle from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import AssignmentIcon from "@mui/icons-material/Assignment"; // prospection
import CommentIcon from "@mui/icons-material/Comment"; // commentaires
import DashboardIcon from "@mui/icons-material/Dashboard"; // dashboard

import { Link, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ThemeContext } from "../contexts/ThemeContext";
import logo from "../assets/logo.png";
import Footer from "./footer";

const drawerWidth = 240;

export default function MainLayoutCandidat() {
  const [open, setOpen] = useState(false);
  const [anchorUser, setAnchorUser] = useState<null | HTMLElement>(null);

  const navigate = useNavigate();
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

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <CssBaseline />

      {/* 🔹 Navbar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: (theme) =>
            theme.palette.mode === "light"
              ? "linear-gradient(90deg, #1976d2, #1565c0)"
              : "linear-gradient(90deg, #212121, #000)",
        }}
      >
        <Toolbar sx={{ px: { xs: 1, sm: 2 } }}>
          {/* Bouton menu burger (mobile) */}
          <IconButton color="inherit" edge="start" onClick={toggleDrawer} sx={{ mr: 1 }}>
            <MenuIcon />
          </IconButton>

          {/* Logo + titre */}
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
                fontWeight: 600,
              }}
            >
              Rap App
            </Typography>
          </Box>

          {/* 🔹 Menu Desktop */}
          {!isMobile && (
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button color="inherit" component={Link} to="/dashboard">
                Dashboard
              </Button>
              <Button color="inherit" component={Link} to="/prospection">
                Prospections
              </Button>
              <Button color="inherit" component={Link} to="/prospection-commentaires">
                Commentaires Prospection
              </Button>
              <Button color="inherit" component={Link} to="/about">
                À propos
              </Button>
            </Box>
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
              >
                <MenuItem disabled>{user?.username || user?.email}</MenuItem>
                <MenuItem component={Link} to="/mon-profil" onClick={() => setAnchorUser(null)}>
                  <AccountCircle fontSize="small" /> &nbsp;Mon profil
                </MenuItem>
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
            >
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
          },
        }}
      >
        <Toolbar />
        <Divider />
        <List>
          <ListItemButton component={Link} to="/dashboard" onClick={toggleDrawer}>
            <ListItemIcon><DashboardIcon /></ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
          <ListItemButton component={Link} to="/prospection" onClick={toggleDrawer}>
            <ListItemIcon><AssignmentIcon /></ListItemIcon>
            <ListItemText primary="Prospections" />
          </ListItemButton>
          <ListItemButton component={Link} to="/prospection-commentaires" onClick={toggleDrawer}>
            <ListItemIcon><CommentIcon /></ListItemIcon>
            <ListItemText primary="Commentaires Prospection" />
          </ListItemButton>
          <ListItemButton component={Link} to="/about" onClick={toggleDrawer}>
          <ListItemIcon><InfoIcon /></ListItemIcon>
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
          backgroundColor: (theme) =>
            theme.palette.mode === "light" ? "#f9f9f9" : "#121212",
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
        }}
      >
        <Footer />
      </Box>
    </Box>
  );
}

// src/pages/documents/DocumentPreview.tsx
import { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

type Props = {
  url?: string;
  nom?: string;
};

export default function DocumentPreview({ url, nom }: Props) {
  const [open, setOpen] = useState(false);

  if (!url) return <Typography color="text.secondary">Aucun fichier</Typography>;

  const extension = url.toLowerCase().split(".").pop() || "";
  const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(extension);
  const isPdf = extension === "pdf";

  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  return (
    <>
      {isImage ? (
        <Box
          component="img"
          src={url}
          alt={nom || "aperçu"}
          sx={{
            maxWidth: 80,
            maxHeight: 60,
            objectFit: "contain",
            border: 1,
            borderColor: "divider",
            borderRadius: 1,
            cursor: "pointer",
          }}
          onClick={handleOpen}
        />
      ) : isPdf ? (
        <Button variant="text" onClick={handleOpen}>
          📄 Voir PDF
        </Button>
      ) : (
        <Button
          variant="text"
          component="a"
          href={url}
          target="_blank"
          rel="noopener noreferrer"
        >
          📎 Télécharger
        </Button>
      )}

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6">{nom || "Aperçu"}</Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {isImage && (
            <Box
              component="img"
              src={url}
              alt={nom || "aperçu"}
              sx={{
                maxWidth: "90vw",
                maxHeight: "80vh",
                display: "block",
                margin: "0 auto",
              }}
            />
          )}
          {isPdf && (
            <Box
              component="iframe"
              src={url}
              title={nom || "aperçu PDF"}
              sx={{ width: "90vw", height: "80vh", border: "none" }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

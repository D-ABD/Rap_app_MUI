// src/components/SearchInput.tsx
import { TextField } from "@mui/material";
import type { TextFieldProps } from "@mui/material";

export default function SearchInput(props: TextFieldProps) {
  return (
    <TextField
      {...props}
      type="search"
      size="small"
      variant="outlined"
      placeholder={props.placeholder ?? "Rechercher..."}
      fullWidth={false}
      sx={{
        // largeur fluide desktop
        width: "clamp(240px, 40vw, 420px)",
        maxWidth: "100%",
        // focus ring accessible (utilise palette.primary)
        "& .MuiOutlinedInput-root.Mui-focused fieldset": {
          borderColor: (theme) => theme.palette.primary.main,
          boxShadow: (theme) =>
            `0 0 0 3px ${theme.palette.primary.main}33`, // 20% opacity
        },
        // placeholder lisible
        "& .MuiInputBase-input::placeholder": {
          color: (theme) => theme.palette.text.secondary,
          opacity: 1,
        },
        // mobile full width
        "@media (max-width:768px)": {
          width: "100%",
        },
      }}
    />
  );
}

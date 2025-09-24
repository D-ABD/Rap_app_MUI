// src/components/ui/CommentaireContent.tsx
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";

const StyledContent = styled(Box)(({ theme }) => ({
  fontSize: "1rem",
  lineHeight: 1.6,
  color: theme.palette.text.primary,
  "& b, & strong": { fontWeight: "bold" },
  "& i, & em": { fontStyle: "italic" },
  "& a": {
    color: theme.palette.primary.main,
    textDecoration: "underline",
  },
  "& ul, & ol": {
    paddingLeft: "1.5rem",
    marginTop: "0.5rem",
  },
  "& li": {
    marginBottom: "0.25rem",
  },
  "& p": {
    margin: "0.5rem 0",
  },
  "& span": {
    whiteSpace: "pre-line",
    "&[style]": {
      display: "inline",
      whiteSpace: "pre-wrap",
    },
  },
}));

interface Props {
  html: string;
}

export default function CommentaireContent({ html }: Props) {
  return <StyledContent dangerouslySetInnerHTML={{ __html: html }} />;
}

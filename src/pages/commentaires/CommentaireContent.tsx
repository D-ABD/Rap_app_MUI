// ======================================================
// src/pages/commentaires/CommentaireContent.tsx
// ✅ Affiche les couleurs + surlignages même dans une table MUI
// ======================================================

import DOMPurify from "dompurify";
import { Box } from "@mui/material";
import { useEffect, useRef } from "react";

interface Props {
  html: string;
}

export default function CommentaireContent({ html }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  // Sanitize : conserve les styles inline
  const sanitized = DOMPurify.sanitize(html || "<em>—</em>", {
    ALLOWED_TAGS: ["b", "i", "u", "em", "strong", "p", "br", "ul", "ol", "li", "span", "a"],
    ALLOWED_ATTR: ["href", "title", "target", "style"],
  } as DOMPurify.Config);

  // Force l'application des styles inline après rendu
  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    // Couleur du texte
    root.querySelectorAll<HTMLElement>("[style*='color:']").forEach((el) => {
      const style = el.getAttribute("style") || "";
      const m = style.match(/color\s*:\s*([^;]+)/i);
      if (m) el.style.setProperty("color", m[1].trim(), "important");
    });

    // Couleur de fond
    root.querySelectorAll<HTMLElement>("[style*='background-color']").forEach((el) => {
      const style = el.getAttribute("style") || "";
      const m = style.match(/background-color\s*:\s*([^;]+)/i);
      if (!m) return;

      const color = m[1].trim();
      el.style.setProperty("background-color", color, "important");

      // ✅ Règles pour que le surlignage soit visible même dans un TableCell MUI
      el.style.setProperty("display", "inline-block", "important");
      el.style.setProperty("box-decoration-break", "clone", "important");
      el.style.setProperty("-webkit-box-decoration-break", "clone", "important");
      el.style.setProperty("padding", "0 0.15em", "important");
      el.style.setProperty("border-radius", "2px", "important");
      el.style.setProperty("mix-blend-mode", "normal", "important");
      el.style.setProperty("isolation", "isolate", "important");
      el.style.setProperty("position", "relative", "important");
      el.style.setProperty("z-index", "1", "important");
    });
  }, [sanitized]);

  return (
    <Box
      ref={ref}
      sx={{
        lineHeight: 1.5,
        wordBreak: "break-word",
        "& p": { m: 0, mb: 0.5 },
        "& ul, & ol": { pl: 3, mb: 0.5 },
        "& a": { color: "primary.main", textDecoration: "underline" },
        // ✅ Empêche le parent MUI d’écraser le fond
        "& span, & strong, & em": {
          position: "relative",
          zIndex: 1,
        },
      }}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}

// src/pages/commentaires/CommentaireContent.tsx
import DOMPurify from "dompurify";
import "./commentaires.css";
interface Props {
  html: string;
}

export default function CommentaireContent({ html }: Props) {
  const sanitized = DOMPurify.sanitize(html || "<em>—</em>", {
    ALLOWED_TAGS: [
      "p",
      "b",
      "i",
      "u",
      "em",
      "strong",
      "ul",
      "ol",
      "li",
      "span",
      "a",
      "br",
    ],
    ALLOWED_ATTR: ["href", "title", "target", "style"], // ✅ tableau plat accepté
  });

  return (
    <div
      className="commentaire-content"
      dangerouslySetInnerHTML={{ __html: sanitized }}
      style={{
        lineHeight: 1.5,
        wordBreak: "break-word",
      }}
    />
  );
}

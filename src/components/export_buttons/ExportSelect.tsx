// src/components/export/ExportSelect.tsx
import { Select, MenuItem, SelectChangeEvent } from "@mui/material";

export type ExportFormat = "pdf" | "csv" | "word";

interface ExportSelectProps {
  value: ExportFormat;
  onChange: (value: ExportFormat) => void;
}

const OPTIONS: { value: ExportFormat; label: string }[] = [
  { value: "pdf", label: "📄 PDF" },
  { value: "csv", label: "📊 CSV" },
  { value: "word", label: "📝 Word" },
];

export default function ExportSelect({ value, onChange }: ExportSelectProps) {
  const handleChange = (e: SelectChangeEvent<ExportFormat>) => {
    onChange(e.target.value as ExportFormat);
  };

  return (
    <Select
      value={value}
      onChange={handleChange}
      aria-label="Format d’export"
      title="Choisir le format d’export"
      size="small"
      sx={{ minWidth: 180 }}
    >
      {OPTIONS.map((opt) => (
        <MenuItem key={opt.value} value={opt.value}>
          {opt.label}
        </MenuItem>
      ))}
    </Select>
  );
}

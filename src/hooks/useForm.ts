import { useState, type ChangeEvent } from "react";
import type { SelectChangeEvent } from "@mui/material/Select";

export default function useForm<T extends Record<string, unknown>>(
  initialValues: T
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  // 🔹 Gère input, textarea, checkbox, select natif ET MUI Select
  const handleChange = (
    e:
      | ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
      | SelectChangeEvent<string>
  ) => {
    const { name, id, type, value } = e.target as {
      name?: string;
      id?: string;
      type?: string;
      value: any;
      checked?: boolean;
    };

    const key = name || id; // support des deux conventions
    if (!key) return;

    const newValue =
      type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : value;

    setValues((prev) => ({ ...prev, [key]: newValue }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  // 🔹 Alias dédié pour les checkboxes (optionnel mais utile)
  const handleCheckbox = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, name, checked } = e.target;
    const key = name || id;
    if (!key) return;

    setValues((prev) => ({ ...prev, [key]: checked }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  // 🔹 Modifie une seule valeur proprement
  const setFieldValue = <K extends keyof T>(key: K, value: T[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  // 🔹 Réinitialise le formulaire
  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
  };

  return {
    values,
    errors,
    handleChange,
    handleCheckbox,
    setFieldValue,
    setErrors,
    setValues,
    resetForm,
  };
}

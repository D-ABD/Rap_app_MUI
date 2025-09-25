// ✅ Hook pour charger l’historique formation (et groupé) + exports CSV/PDF

import { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import api from "../api/axios";
import {
  HistoriqueFormation,
  HistoriqueParFormation,
  HistoriqueFormationFiltres,
} from "../types/historique";

// 🔁 Hook standard : liste historique
export function useHistoriqueFormation() {
  const [data, setData] = useState<HistoriqueFormation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    api
      .get("/formations/historique/")
      .then((res) => {
        const historique = res.data.data || [];
        setData(historique);
      })
      .catch((err) => {
        console.error("❌ Erreur lors du chargement de l'historique", err);
        toast.error("Erreur lors du chargement de l'historique");
      })
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}

// 🔁 Hook groupé par formation
export function useHistoriqueFormationGroupe(filtres: HistoriqueFormationFiltres = {}) {
  const [data, setData] = useState<HistoriqueParFormation[]>([]);
  const [loading, setLoading] = useState(true);

  const params = useMemo(() => ({ ...filtres }), [filtres]);

  useEffect(() => {
    setLoading(true);

    api
      .get("/formations/historique/grouped/", { params })
      .then((res) => {
        const groupe = res.data.data || [];
        setData(groupe);
      })
      .catch((err) => {
        console.error("❌ Erreur lors du chargement de l'historique groupé", err);
        toast.error("Erreur lors du chargement de l'historique groupé");
      })
      .finally(() => setLoading(false));
  }, [params]);

  return { data, loading };
}

// 🔁 Export CSV
export async function exportHistoriqueCSV(filtres: HistoriqueFormationFiltres = {}) {
  try {
    const response = await api.get("/formations/historique/export/csv/", {
      params: filtres,
      responseType: "blob",
    });

    const blob = new Blob([response.data], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "historique_formations.csv";
    link.click();
    window.URL.revokeObjectURL(url);
    toast.success("Export CSV réussi");
  } catch (error) {
    console.error("❌ Erreur export CSV :", error);
    toast.error("Erreur lors de l'export CSV");
  }
}

// 🔁 Export PDF
export async function exportHistoriquePDF(filtres: HistoriqueFormationFiltres = {}) {
  try {
    const response = await api.get("/formations/historique/export/pdf/", {
      params: filtres,
      responseType: "blob",
    });

    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "historique_formations.pdf";
    link.click();
    window.URL.revokeObjectURL(url);
    toast.success("Export PDF réussi");
  } catch (error) {
    console.error("❌ Erreur export PDF :", error);
    toast.error("Erreur lors de l'export PDF");
  }
}

// 🔁 Export PDF sélection
export async function exportHistoriquePDFSelection(historiqueIds: number[]) {
  if (historiqueIds.length === 0) {
    toast.error("Aucune ligne sélectionnée pour l'export PDF.");
    return;
  }

  try {
    const response = await api.post(
      "/formations/historique/export/pdf/",
      { ids: historiqueIds },
      { responseType: "blob" }
    );

    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "historique_formations_selection.pdf";
    link.click();
    window.URL.revokeObjectURL(url);
    toast.success("Export PDF sélection réussi");
  } catch (error) {
    console.error("❌ Erreur export PDF sélection :", error);
    toast.error("Erreur lors de l'export PDF sélection");
  }
}

// 🔁 Export CSV sélection
export async function exportHistoriqueCSVSelection(historiqueIds: number[]) {
  if (historiqueIds.length === 0) {
    toast.error("Aucune ligne sélectionnée pour l'export CSV.");
    return;
  }

  try {
    const response = await api.post(
      "/formations/historique/export/csv/",
      { ids: historiqueIds },
      { responseType: "blob" }
    );

    const blob = new Blob([response.data], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "historique_formations_selection.csv";
    link.click();
    window.URL.revokeObjectURL(url);
    toast.success("Export CSV sélection réussi");
  } catch (error) {
    console.error("❌ Erreur export CSV sélection :", error);
    toast.error("Erreur lors de l'export CSV sélection");
  }
}

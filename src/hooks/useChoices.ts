import { useEffect, useState } from 'react';
import api from '../api/axios';

export type ChoiceItem = {
  value: string;
  label: string;
  default_color: string;
};

export default function useChoices(resource: string) {
  const [choices, setChoices] = useState<Record<string, ChoiceItem>>({});

  useEffect(() => {
    const fetchChoices = async () => {
      try {
        const res = await api.get(`/${resource}/choices/`);
        const rawChoices = res.data.data as ChoiceItem[]; // ✅ typage explicite
        const mapped = rawChoices.reduce<Record<string, ChoiceItem>>((acc, item) => {
          acc[item.value] = item;
          return acc;
        }, {});
        setChoices(mapped);
      } catch (error) {
        console.error(`Erreur lors du chargement des choix pour ${resource}`, error);
      }
    };
    fetchChoices();
  }, [resource]);

  return choices;
}

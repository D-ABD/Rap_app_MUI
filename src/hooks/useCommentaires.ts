import { useState, useEffect } from 'react';
import { AxiosError } from 'axios';
import api from '../api/axios';
import type { Commentaire, CommentaireFormData } from '../types/commentaire';

// Réponse typique de l'API (wrapper DRF personnalisé)
interface WrappedResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// --- Hook pour charger les commentaires liés à une formation ---
export function useCommentaires(formationId?: number) {
  const [commentaires, setCommentaires] = useState<Commentaire[]>([]);
  const [loading, setLoading] = useState<boolean>(!!formationId);
  const [error, setError] = useState<AxiosError | null>(null);

  useEffect(() => {
    if (!formationId) {
      setCommentaires([]);
      setLoading(false);
      return;
    }

    const fetchCommentaires = async () => {
      setLoading(true);
      try {
        const res = await api.get<WrappedResponse<Commentaire[]>>(
          `/formations/${formationId}/commentaires/`
        );
        if (res.data?.data?.length > 0) {
        }
        setCommentaires(res.data.data);
        setError(null);
      } catch (err) {
        console.error("❌ Erreur lors du fetch des commentaires :", err);
        setError(err as AxiosError);
      } finally {
        setLoading(false);
      }
    };

    fetchCommentaires();
  }, [formationId]);

  return { commentaires, loading, error };
}

// --- Hook pour créer un commentaire ---
export function useCreateCommentaire() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AxiosError | null>(null);

  const createCommentaire = async (payload: CommentaireFormData): Promise<Commentaire> => {
    setLoading(true);
    try {
      const res = await api.post<WrappedResponse<Commentaire>>('/commentaires/', payload);
      setError(null);
      return res.data.data;
    } catch (err) {
      setError(err as AxiosError);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createCommentaire, loading, error };
}

// --- Hook pour mettre à jour un commentaire ---
export function useUpdateCommentaire(id: number) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AxiosError | null>(null);

  const updateCommentaire = async (
    payload: Partial<CommentaireFormData>
  ): Promise<Commentaire> => {
    setLoading(true);
    try {
      const res = await api.put<WrappedResponse<Commentaire>>(`/commentaires/${id}/`, payload);
      setError(null);
      return res.data.data;
    } catch (err) {
      setError(err as AxiosError);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateCommentaire, loading, error };
}

// --- Hook pour supprimer un commentaire ---
export function useDeleteCommentaire(id: number) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AxiosError | null>(null);

  const deleteCommentaire = async (): Promise<boolean> => {
    setLoading(true);
    try {
      await api.delete(`/commentaires/${id}/`);
      setError(null);
      return true;
    } catch (err) {
      setError(err as AxiosError);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { deleteCommentaire, loading, error };
}

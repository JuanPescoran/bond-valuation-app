import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth-store';
import type { HistoryItem } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// --- Función para obtener los datos ---
const fetchHistory = async (token: string, userId: number): Promise<HistoryItem[]> => {
  const response = await fetch(`${API_BASE_URL}/history/user/${userId}`, { // Endpoint de ejemplo
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('No se pudo cargar el historial');
  }
  return response.json();
};

// --- Hook personalizado para usar en los componentes ---
export function useHistory() {
  const { token, user } = useAuthStore.getState();

  return useQuery<HistoryItem[], Error>({
    queryKey: ['history', user?.id], // La clave de la query incluye el userId para que sea única por usuario
    queryFn: () => {
      if (!token || !user?.id) {
        return Promise.reject(new Error('No autenticado'));
      }
      return fetchHistory(token, user.id);
    },
    enabled: !!token && !!user?.id, // La query solo se ejecutará si el usuario está autenticado
  });
}

// --- Mutación para eliminar un ítem del historial ---
const deleteHistoryItem = async (id: number, token: string) => {
    // ... Lógica fetch para el endpoint DELETE /history/{id}
};

export function useDeleteHistoryItem() {
    const queryClient = useQueryClient();
    const { token } = useAuthStore.getState();

    return useMutation({
        mutationFn: (id: number) => {
            if (!token) return Promise.reject(new Error('No autenticado'));
            return deleteHistoryItem(id, token);
        },
        onSuccess: () => {
            // Cuando la mutación es exitosa, invalida la query del historial
            // para que se vuelva a cargar con los datos actualizados.
            queryClient.invalidateQueries({ queryKey: ['history'] });
        },
    });
}
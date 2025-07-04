// En: hooks/api/use-valuations.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth-store';
import type { ValuationResponse, HistoryItem } from '@/types'; // Asegúrate de que HistoryItem esté definido
import { toast } from 'sonner';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface SavePayload {
  valuationId: number;
  name: string;
}

// --- Funciones de Fetch (Lógica de la API) ---

const fetchValuationsByUserId = async (userId: number, token: string): Promise<HistoryItem[]> => {
  const response = await fetch(`${API_BASE_URL}/valuations/user/${userId}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error('No se pudo cargar el historial');
  }
  const valuations: ValuationResponse[] = await response.json();
  
  // Mapeamos la respuesta completa a un tipo más simple para la tabla
  return valuations.map(v => ({
    id: v.id,
    name: v.valuationName,
    createdAt: v.issueDate,
    faceValue: v.faceValue,
    tcea: v.tcea,
    valuation: v,
  }));
};

const deleteValuationById = async (valuationId: number, token: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/valuations/${valuationId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok && response.status !== 204) { // 204 No Content es una respuesta de éxito para DELETE
        throw new Error('No se pudo eliminar la valoración.');
    }
};

// --- Hooks Personalizados (para usar en los componentes) ---

export function useUserValuations() {
  const { user, token } = useAuthStore.getState();

  return useQuery<HistoryItem[], Error>({
    // La queryKey es como un ID para esta consulta. Incluye el user.id
    // para que si otro usuario inicia sesión, los datos se vuelvan a cargar.
    queryKey: ['valuations', user?.id], 
    
    // queryFn es la función que realmente obtiene los datos.
    queryFn: () => {
      if (!token || !user?.id) {
        return Promise.reject(new Error('Usuario no autenticado'));
      }
      return fetchValuationsByUserId(user.id, token);
    },
    
    // La query no se ejecutará si no hay token o user.id
    enabled: !!user?.id && !!token,
  });
}

export function useDeleteValuation() {
  const queryClient = useQueryClient();
  const { user, token } = useAuthStore.getState();

  return useMutation({
    mutationFn: (valuationId: number) => {
      if (!token) {
        return Promise.reject(new Error('No autenticado'));
      }
      return deleteValuationById(valuationId, token);
    },
    // onSuccess se ejecuta cuando la eliminación en el backend tiene éxito.
    onSuccess: () => {
      toast.success("Cálculo eliminado del historial.");
      // Invalidamos la query 'valuations' para que React Query la vuelva
      // a obtener automáticamente, actualizando la lista en la UI.
      queryClient.invalidateQueries({ queryKey: ['valuations', user?.id] });
    },
    onError: (error: Error) => {
        toast.error("Error al eliminar", { description: error.message });
    }
    
  });
}

const fetchValuationById = async (valuationId: number, token: string): Promise<ValuationResponse> => {
  const response = await fetch(`${API_BASE_URL}/valuations/${valuationId}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error('Valoración no encontrada o error en el servidor.');
  }
  return response.json();
};


// --- Nuevo Hook Personalizado para la página de detalle ---

export function useValuationById(valuationId: number) {
  const { token } = useAuthStore.getState();
  const queryClient = useQueryClient();

  return useQuery<ValuationResponse, Error>({
    // La queryKey es única para esta valoración específica.
    queryKey: ['valuation', valuationId], 
    
    queryFn: () => {
      if (!token || !valuationId) {
        return Promise.reject(new Error('ID de valoración o token inválido.'));
      }
      return fetchValuationById(valuationId, token);
    },
    
    // La query solo se ejecutará si hay un ID válido.
    enabled: !!valuationId && !!token,

    // Optimización: Usar datos de la caché como valor inicial si existen
    // Esto hace que la navegación desde la tabla del historial sea instantánea.
    initialData: () => {
      // Buscamos en la caché de la query 'valuations' (la lista del historial)
      const historyCache = queryClient.getQueryData<HistoryItem[]>(['valuations', useAuthStore.getState().user?.id]);
      // Si encontramos el item, usamos su objeto 'valuation' completo como dato inicial.
      return historyCache?.find(item => item.id === valuationId)?.valuation;
    }
  });
}

const saveValuationToHistory = async (payload: SavePayload, token: string): Promise<HistoryItem> => {
  // NOTA: El endpoint real puede variar. Asumimos un endpoint /history para guardar.
  // Es posible que tu backend simplemente requiera un "marcar como guardado" en el /valuations/{id}
  // En ese caso, el método sería PUT o PATCH. Usaremos POST a /history como ejemplo.
  const response = await fetch(`${API_BASE_URL}/history`, { // Endpoint de ejemplo
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('No se pudo guardar en el historial.');
  }
  return response.json(); // Asumimos que el backend devuelve el nuevo item del historial creado.
};


// --- Nuevo Hook de Mutación para Guardar ---

export function useSaveValuation() {
  const queryClient = useQueryClient();
  const { user, token } = useAuthStore.getState();

  return useMutation<HistoryItem, Error, SavePayload>({
    mutationFn: (payload: SavePayload) => {
      if (!token) {
        return Promise.reject(new Error('No autenticado'));
      }
      return saveValuationToHistory(payload, token);
    },
    // onSuccess se ejecuta cuando el guardado en el backend tiene éxito.
    onSuccess: (newItem) => {
      toast.success(`'${newItem.name}' ha sido guardado en tu historial.`);
      
      // Actualizamos la caché de la lista del historial para que el nuevo
      // item aparezca inmediatamente, sin necesidad de una recarga.
      queryClient.setQueryData(['valuations', user?.id], (oldData: HistoryItem[] | undefined) => {
        return oldData ? [newItem, ...oldData] : [newItem];
      });
      
      // Opcional: también podríamos invalidar la query para forzar una recarga completa.
      // queryClient.invalidateQueries({ queryKey: ['valuations', user?.id] });
    },
    onError: (error: Error) => {
      toast.error("Error al guardar", { description: error.message });
    },
  });
}
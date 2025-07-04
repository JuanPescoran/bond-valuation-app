'use client'; // Este es un componente de cliente

import { useAuthStore } from '@/stores/auth-store';
import { useEffect } from 'react';

/**
 * Este componente no renderiza nada visible. Su único propósito es
 * ejecutar lógica del lado del cliente una vez al cargar la aplicación.
 */
export function AppInitializer() {
  // Usamos useEffect con un array de dependencias vacío para que
  // se ejecute solo una vez cuando el componente se monta en el cliente.
  useEffect(() => {
    // Llama a la acción 'initialize' de nuestro store para leer la cookie
    // y restaurar el estado de autenticación.
    useAuthStore.getState().initialize();
  }, []);

  // No devuelve nada que renderizar.
  return null;
}
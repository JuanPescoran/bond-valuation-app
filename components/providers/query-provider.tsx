"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

// Este componente provee el contexto de React Query a toda la aplicación.
export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Usamos useState para crear una única instancia del QueryClient.
  // Esto previene que se recree en cada render, lo cual es importante.
  const [queryClient] = useState(() => 
    new QueryClient({
      defaultOptions: {
        queries: {
          // Opciones globales para todas las queries:
          staleTime: 1000 * 60 * 5, // 5 minutos: los datos se consideran "frescos" por 5 minutos
          refetchOnWindowFocus: true, // Vuelve a obtener los datos cuando el usuario vuelve a la pestaña
        },
      },
    })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
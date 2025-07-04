"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { Loader2 } from "lucide-react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAuthLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Si la carga ha terminado y el usuario NO está autenticado, lo redirigimos.
    if (!isAuthLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isAuthLoading, router]);

  // Mientras se verifica la autenticación, mostramos un spinner de página completa.
  if (isAuthLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Si la carga terminó y el usuario SÍ está autenticado, renderizamos la página.
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Si no se cumple ninguna condición, no renderizamos nada (la redirección ya está en curso).
  return null;
}
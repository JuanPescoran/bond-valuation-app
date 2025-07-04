"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const { isAuthenticated, isAuthLoading } = useAuthStore();
  const router = useRouter();
  
  useEffect(() => {
    // Solo redirigir cuando la carga de autenticación haya terminado
    if (!isAuthLoading) {
      if (isAuthenticated) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    }
  }, [isAuthenticated, isAuthLoading, router]);

  // Siempre mostrar un spinner mientras se determina el estado
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );
}
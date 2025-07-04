"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Calculator, History, TrendingUp } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";

export default function DashboardHomePage() {
  const router = useRouter();
  const { user } = useAuthStore();

  return (
    <div className="space-y-8 animate-in fade-in-50">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Bienvenido a BondCalc, {user?.username || 'Usuario'}!
        </h1>
        <p className="text-lg text-muted-foreground">
          Tu herramienta central para el análisis y valoración de bonos.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Card para la Calculadora */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Calculadora</CardTitle>
            <Calculator className="h-6 w-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">
              Valora un nuevo bono introduciendo todos sus parámetros financieros.
            </CardDescription>
            <Button onClick={() => router.push('/calculator')}>
              <TrendingUp className="mr-2 h-4 w-4" /> Ir a la Calculadora
            </Button>
          </CardContent>
        </Card>

        {/* Card para el Historial */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Historial</CardTitle>
            <History className="h-6 w-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">
              Revisa, gestiona y compara todas tus valoraciones guardadas.
            </CardDescription>
            <Button onClick={() => router.push('/history')}>
              <History className="mr-2 h-4 w-4" /> Ver Historial
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <div className="pt-8 text-center text-muted-foreground text-sm">
          <p>Selecciona una opción para comenzar tu análisis.</p>
      </div>
    </div>
  );
}
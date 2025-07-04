"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Calculator, History } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";

export default function DashboardHomePage() {
  const router = useRouter();
  const { user } = useAuthStore();

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">
          Bienvenido a tu Dashboard, {user?.username || 'Usuario'}!
        </h1>
        <p className="mt-2 text-muted-foreground">
          Desde aquí puedes acceder a todas las herramientas de valoración de bonos.
        </p>
      </header>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Calculadora de Bonos</CardTitle>
            <CardDescription>
              Valora un nuevo bono introduciendo todos sus parámetros financieros.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/calculator')}>
              <Calculator className="mr-2 h-4 w-4" /> Ir a la Calculadora
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Historial de Cálculos</CardTitle>
            <CardDescription>
              Revisa, gestiona y compara todas tus valoraciones guardadas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/history')}>
              <History className="mr-2 h-4 w-4" /> Ver Historial
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
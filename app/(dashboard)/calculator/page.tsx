"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useBondStore } from "@/stores/bond-store";
import { SaveValuationDialog } from "@/components/calculator/save-valuation-dialog";
import { Loader2, BarChart3, TrendingUp } from "lucide-react";
import type { CreateValuationRequest } from "@/types";
import { toast } from "sonner";
import BondInputForm from "@/components/calculator/bond-input-form";
import CashflowChart from "@/components/history/cashflow-chart";
import ResultsDisplay from "@/components/history/results-display";

export default function CalculatorPage() {
  const router = useRouter();
  
  const { isAuthenticated, user } = useAuthStore();
  const { 
    currentResult, 
    isCalculating, 
    calculateBond, 
    saveCurrentValuation,
    isSaving 
  } = useBondStore();

  useEffect(() => {
    if (typeof window !== 'undefined' && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  const handleCalculate = async (input: CreateValuationRequest) => {
    if (user?.id) {
        await calculateBond({ ...input, userId: user.id });
    } else {
        toast.error("Error de autenticación", {
            description: "No se pudo encontrar tu ID de usuario. Por favor, intenta iniciar sesión de nuevo."
        });
    }
  };

  if (!isAuthenticated) {
    return (
        <div className="flex h-full w-full items-center justify-center p-16">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="space-y-10">
      <header className="text-center">
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
          Calculadora de Valoración de Bonos
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Ingresa los parámetros del bono para obtener una valoración completa.
        </p>
      </header>

      <section>
        <BondInputForm action={handleCalculate} isLoading={isCalculating} />
      </section>

      {isCalculating && (
        <div className="flex flex-col items-center justify-center text-center p-8 bg-background rounded-lg shadow-md animate-in fade-in-50">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-lg font-medium">Calculando, por favor espera...</p>
        </div>
      )}

      {currentResult && !isCalculating && (
        <section className="space-y-8 animate-in fade-in-50 duration-500">
          <div className="text-center">
            <SaveValuationDialog action={saveCurrentValuation} isSaving={isSaving} />
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-center flex items-center justify-center gap-2">
              <TrendingUp /> Resultados de la Valoración
            </h2>
            <ResultsDisplay results={currentResult} />
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-center flex items-center justify-center gap-2">
              <BarChart3 /> Detalle del Flujo de Caja
            </h2>
            <CashflowChart cashflows={currentResult.cashFlow} />
          </div>
        </section>
      )}
    </div>
  );
}
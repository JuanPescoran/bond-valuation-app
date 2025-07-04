"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, DollarSign, Loader2, AlertCircle } from "lucide-react";
import { useValuationById } from "@/hooks/api/use-valuations";
import CashflowChart from "@/components/history/cashflow-chart";
import ResultsDisplay from "@/components/history/results-display";

export default function HistoryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated } = useAuthStore();

  const valuationId = parseInt(params.id as string, 10);
  const { data: valuation, isLoading, isError, error } = useValuationById(valuationId);

  useEffect(() => {
    if (typeof window !== 'undefined' && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);
  
  const formatCurrency = (value: number) => new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(value);
  const formatPercentage = (value: number) => `${(value).toFixed(4)}%`;

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-4 text-lg">Cargando detalles...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 text-destructive">
        <AlertCircle className="h-8 w-8 mb-4" />
        <p className="text-lg font-medium">Error al Cargar la Valoración</p>
        <p>{error.message}</p>
        <Button onClick={() => router.push('/history')} className="mt-4">Volver al Historial</Button>
      </div>
    );
  }
  
  if (!valuation) {
    return (
      <div className="text-center p-8">
        <p>No se encontró la valoración con el ID {valuationId}.</p>
        <Button onClick={() => router.push('/history')} className="mt-4">Volver al Historial</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in-50">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" onClick={() => router.push("/history")}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Volver</span>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{valuation.valuationName}</h1>
          <p className="text-muted-foreground flex items-center space-x-4 mt-1">
            <span className="flex items-center space-x-1"><Calendar className="h-4 w-4" /><span>{new Date(valuation.issueDate).toLocaleDateString("es-PE")}</span></span>
            <span className="flex items-center space-x-1"><DollarSign className="h-4 w-4" /><span>{formatCurrency(valuation.faceValue)}</span></span>
            <Badge variant="secondary">TCEA: {formatPercentage(valuation.tcea)}</Badge>
          </p>
        </div>
      </div>
      
      <Card>
        <CardHeader><CardTitle>Resumen de Parámetros de Entrada</CardTitle></CardHeader>
        <CardContent className="text-sm">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div><strong className="block text-muted-foreground">Valor Nominal:</strong> {formatCurrency(valuation.faceValue)}</div>
              <div><strong className="block text-muted-foreground">Precio de Compra:</strong> {formatCurrency(valuation.purchasePrice)}</div>
              <div><strong className="block text-muted-foreground">Comisión:</strong> {valuation.commission}%</div>
              <div><strong className="block text-muted-foreground">Tasa de Mercado (TEA):</strong> {valuation.marketRate}%</div>
              <div><strong className="block text-muted-foreground">Tasa Cupón:</strong> {valuation.rateValue}% ({valuation.rateType})</div>
              <div><strong className="block text-muted-foreground">Frecuencia:</strong> {valuation.frequency}</div>
              <div><strong className="block text-muted-foreground">Períodos Totales:</strong> {valuation.totalPeriods}</div>
              <div><strong className="block text-muted-foreground">Tipo de Gracia:</strong> {valuation.graceType}</div>
            </div>
        </CardContent>
      </Card>

      <ResultsDisplay results={valuation} />
      <CashflowChart cashflows={valuation.cashFlow} />
    </div>
  );
}
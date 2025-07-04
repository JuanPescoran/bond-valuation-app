"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign, Clock, Activity, ShieldCheck } from "lucide-react";
import type { ValuationResponse } from "@/types";
import { useSettingsStore } from "@/stores/settings-store";
import { useMemo } from "react";

/**
 * Props para el componente ResultsDisplay.
 * @param results - El objeto completo de ValuationResponse que viene de la API.
 */
interface ResultsDisplayProps {
  results: ValuationResponse;
}

export default function ResultsDisplay({ results }: ResultsDisplayProps) {
  // Obtenemos la moneda seleccionada por el usuario desde el store de configuración.
  const { currency } = useSettingsStore();

  // --- Funciones de Formato ---
  // Estas funciones ahora respetan la configuración del usuario.
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: currency,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${(value).toFixed(4)}%`;
  };

  const formatYears = (value: number) => {
    return `${value.toFixed(4)} años`;
  };
  
  // --- Cálculos de Totales ---
  // Usamos useMemo para evitar recalcular en cada render, aunque en este caso es una optimización menor.
  const summary = useMemo(() => {
    const totalCupones = results.cashFlow.reduce((acc, flow) => acc + flow.coupon, 0);
    const totalPrincipal = results.cashFlow.reduce((acc, flow) => acc + flow.amortization, 0);
    return {
      totalCupones,
      totalPrincipal,
      totalFlujos: totalCupones + totalPrincipal,
    };
  }, [results.cashFlow]);

  return (
    <div className="space-y-6">
      {/* Sección 1: Métricas Principales en Tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Precio (Sucio)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(results.dirtyPrice)}</div>
            <p className="text-xs text-muted-foreground">Valor Presente de Flujos Futuros</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">TREA (Rendimiento)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(results.trea)}</div>
            <p className="text-xs text-muted-foreground">Tasa de Rendimiento Efectiva Anual</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duración Modificada</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatYears(results.modifiedDurationInYears)}</div>
            <p className="text-xs text-muted-foreground">Sensibilidad a tasas de interés</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Convexidad</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{results.convexity.toFixed(4)}</div>
             <p className="text-xs text-muted-foreground">Medida de riesgo de segundo orden</p>
          </CardContent>
        </Card>
      </div>

      {/* Sección 2: Resumen de Flujos de Caja */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen de Totales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="text-sm text-muted-foreground">Total Cupones Pagados</div>
              <div className="text-xl font-semibold">{formatCurrency(summary.totalCupones)}</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="text-sm text-muted-foreground">Total Principal Devuelto</div>
              <div className="text-xl font-semibold">{formatCurrency(summary.totalPrincipal)}</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-primary/10">
              <div className="text-sm text-primary/80">Total Flujos Recibidos</div>
              <div className="text-xl font-semibold text-primary">{formatCurrency(summary.totalFlujos)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sección 3: Tabla detallada del Flujo de Caja */}
      <Card>
        <CardHeader>
          <CardTitle>Detalle de Flujos de Caja por Período</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">Período</TableHead>
                  <TableHead className="text-right">Saldo Inicial</TableHead>
                  <TableHead className="text-right">Interés</TableHead>
                  <TableHead className="text-right">Cupón</TableHead>
                  <TableHead className="text-right">Amortización</TableHead>
                  <TableHead className="text-right">Saldo Final</TableHead>
                  <TableHead className="text-right font-semibold">Flujo del Bonista</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.cashFlow.map((flujo) => (
                  <TableRow key={flujo.number}>
                    <TableCell className="text-center">
                      <div className="flex flex-col">
                        <span className="font-bold">{flujo.number}</span>
                        {flujo.gracePeriodState !== 'NONE' && (
                          <Badge variant="outline" className="mt-1 w-fit mx-auto">{flujo.gracePeriodState}</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(flujo.initialBalance)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(flujo.interest)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(flujo.coupon)}</TableCell>
                    <TableCell className="text-right text-destructive">{formatCurrency(flujo.amortization)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(flujo.finalBalance)}</TableCell>
                    <TableCell className="text-right font-semibold text-green-600">{formatCurrency(flujo.cashflow)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
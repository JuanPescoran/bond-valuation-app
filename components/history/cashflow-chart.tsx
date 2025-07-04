"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  Label
} from "recharts";
import type { CashflowPeriodResponse } from "@/types";
import { useSettingsStore } from "@/stores/settings-store";

interface CashflowChartProps {
  cashflows: CashflowPeriodResponse[];
}

export default function CashflowChart({ cashflows }: CashflowChartProps) {
  const { currency } = useSettingsStore(); // <-- Obtenemos la moneda

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: currency, // <-- Usamos la variable
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Preparamos los datos para que Recharts pueda consumirlos fácilmente.
  const chartData = cashflows.map((flow) => ({
    name: `P${flow.number}`, // Etiqueta para el eje X
    Cupón: flow.coupon,
    Principal: flow.amortization,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Composición del Flujo de Caja por Período</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={chartData} 
              margin={{ top: 5, right: 20, left: 30, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }} 
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis 
                tick={{ fontSize: 12 }} 
                tickFormatter={(value) => formatCurrency(value)} 
                stroke="hsl(var(--muted-foreground))"
              >
                <Label 
                  value="Monto (S/)" 
                  angle={-90} 
                  position="insideLeft" 
                  style={{ textAnchor: 'middle', fill: 'hsl(var(--muted-foreground))' }} 
                />
              </YAxis>
              <Tooltip
                cursor={{ fill: 'hsl(var(--accent))' }}
                formatter={(value: number, name: string) => [formatCurrency(value), name]}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))', 
                  borderColor: 'hsl(var(--border))',
                  borderRadius: 'var(--radius)'
                }}
              />
              <Legend />
              <Bar dataKey="Cupón" stackId="a" fill="hsl(var(--chart-1))" name="Cupón" />
              <Bar dataKey="Principal" stackId="a" fill="hsl(var(--chart-2))" name="Principal" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
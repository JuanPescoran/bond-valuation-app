"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RateType, useSettingsStore } from "@/stores/settings-store";

export default function SettingsPage() {
    const { 
        currency, 
        defaultRateType, 
        defaultCapitalization,
        setCurrency,
        setDefaultRateType,
        setDefaultCapitalization
    } = useSettingsStore();

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
                <p className="text-muted-foreground">Personaliza tus preferencias por defecto para los cálculos.</p>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle>Preferencias Generales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Configuración de Moneda */}
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label htmlFor="currency" className="text-base">Moneda por Defecto</Label>
                            <p className="text-sm text-muted-foreground">
                                Selecciona la moneda para los valores monetarios.
                            </p>
                        </div>
                        <Select onValueChange={(value) => setCurrency(value as "PEN" | "USD")} defaultValue={currency}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="PEN">Soles (PEN)</SelectItem>
                                <SelectItem value="USD">Dólares (USD)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Configuración de Tasa por Defecto */}
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label htmlFor="rateType" className="text-base">Tipo de Tasa por Defecto</Label>
                            <p className="text-sm text-muted-foreground">
                                Elige el tipo de tasa que usas más a menudo.
                            </p>
                        </div>
                         <Select onValueChange={(value) => setDefaultRateType(value as RateType)} defaultValue={defaultRateType}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="EFFECTIVE">Efectiva</SelectItem>
                                <SelectItem value="NOMINAL">Nominal</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
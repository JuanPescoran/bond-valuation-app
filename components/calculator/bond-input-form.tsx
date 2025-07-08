"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { CalendarIcon, Calculator, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

import { useAuthStore } from "@/stores/auth-store";
import { useSettingsStore } from "@/stores/settings-store";
import type { CreateValuationRequest } from "@/types";

// ===================================================================
// == 1. ESQUEMA DE VALIDACIÓN (ZOD) - CORREGIDO ==
// ===================================================================
const bondSchema = z.object({
  valuationName: z.string().min(3, "El nombre es requerido.").max(50, "Máximo 50 caracteres."),
  faceValue: z.number({ required_error: "Requerido." }).min(1000, "Mínimo 1000.").max(5000, "Máximo 5000."),
  marketPrice: z.number({ required_error: "Requerido." }).min(0.01, "Debe ser positivo."),
  issueDate: z.date({ required_error: "Requerido." }),
  maturityDate: z.date({ required_error: "Requerido." }),
  totalPeriods: z.number({ required_error: "Requerido." }).int("Debe ser entero.").min(1, "Mínimo 1."),
  rateType: z.enum(["EFFECTIVE", "NOMINAL"], { required_error: "Requerido." }),
  rateValue: z.number({ required_error: "Requerido." }).min(2, "Mínimo 2%.").max(10, "Máximo 10%."),
  capitalization: z.enum(["DAY", "MONTH", "QUARTER", "SEMESTER", "YEAR", "FORTNIGHT", "BIMONTHLY", "FOUR_MONTHLY"]).nullable().optional(),
  frequency: z.enum(["DAY", "MONTH", "QUARTER", "SEMESTER", "YEAR", "FORTNIGHT", "BIMONTHLY", "FOUR_MONTHLY"], { required_error: "Requerido." }),
  graceType: z.enum(["NONE", "PARTIAL", "TOTAL"], { required_error: "Requerido." }),
  graceCapital: z.number().int("Debe ser entero.").min(0, "No puede ser negativo.").nullable().optional(),
  marketRate: z.number({ required_error: "Requerido." }).min(0.0001, "Debe ser positivo."),
  issuerStructuringCost: z.number({ required_error: "Requerido." }).min(0, "No puede ser negativo."),
  issuerPlacementCost: z.number({ required_error: "Requerido." }).min(0, "No puede ser negativo."),
  issuerCavaliCost: z.number({ required_error: "Requerido." }).min(0, "No puede ser negativo."),
  investorSabCost: z.number({ required_error: "Requerido." }).min(0, "No puede ser negativo."),
  investorCavaliCost: z.number({ required_error: "Requerido." }).min(0, "No puede ser negativo.")
})
  .refine(data => data.maturityDate > data.issueDate, {
    message: "La fecha de vencimiento debe ser posterior a la de emisión.",
    path: ["maturityDate"],
  })
  .refine(data => {
    if (data.rateType === 'NOMINAL') return data.capitalization != null;
    return true;
  }, {
    message: "La capitalización es requerida para una tasa nominal.",
    path: ["capitalization"],
  })
  .refine(data => data.faceValue % 1000 === 0, {
    message: "Debe ser múltiplo de 1000.",
    path: ["faceValue"],
  })
  .refine(data => {
    if (data.graceType !== 'NONE') return (data.graceCapital ?? 0) < data.totalPeriods;
    return true;
  }, {
    message: "Debe ser menor a los períodos totales.",
    path: ["graceCapital"],
  })
  .refine(data => {
    if (data.graceType !== 'NONE') return data.graceCapital != null && data.graceCapital > 0;
    return true;
  }, {
    message: "Debe ser mayor a 0.",
    path: ["graceCapital"],
  });

type BondFormData = z.infer<typeof bondSchema>;

interface BondInputFormProps {
  action: (data: CreateValuationRequest) => void;
  isLoading?: boolean;
}

// ===================================================================
// == 2. COMPONENTE PRINCIPAL - CORREGIDO ==
// ===================================================================
export default function BondInputForm({ action, isLoading = false }: BondInputFormProps) {
  const { currency, defaultRateType } = useSettingsStore();

  const form = useForm<BondFormData>({
    resolver: zodResolver(bondSchema),
    defaultValues: {
      valuationName: "Mi Bono - " + new Date().toLocaleDateString('es-PE'),
      faceValue: 1000,
      marketPrice: 990,
      issueDate: new Date(),
      maturityDate: new Date(new Date().setFullYear(new Date().getFullYear() + 5)),
      totalPeriods: 10,
      rateType: defaultRateType,
      rateValue: 5.0,
      capitalization: null, // <-- Inicia en null para ser neutral
      frequency: "SEMESTER",
      graceType: "NONE",
      graceCapital: 0,
      marketRate: 6.0,
      issuerStructuringCost: 0.10,
      issuerPlacementCost: 0.15,
      issuerCavaliCost: 0.0525,
      investorSabCost: 1.00,
      investorCavaliCost: 0.0525,
    },
    mode: "onBlur",
  });

  const watchedRateType = form.watch("rateType");
  const watchedGraceType = form.watch("graceType");

  // --- Lógica de Efectos de Formulario Simplificada y Corregida ---
  useEffect(() => {
    if (watchedRateType === "EFFECTIVE") {
      form.setValue("capitalization", null, { shouldValidate: true });
    } else if (watchedRateType === "NOMINAL" && form.getValues("capitalization") === null) {
      // Opcional: Si cambias a NOMINAL y no hay nada seleccionado, puedes poner un valor por defecto.
      // form.setValue("capitalization", "MONTH", { shouldValidate: true });
    }
  }, [watchedRateType, form]);

  useEffect(() => {
    if (watchedGraceType === "NONE") {
      form.setValue("graceCapital", 0, { shouldValidate: true });
    }
  }, [watchedGraceType, form]);

  // --- Manejador de Envío Simplificado y Corregido ---
  const handleValidSubmit = (data: BondFormData) => {
    const user = useAuthStore.getState().user;
    if (!user) {
      toast.error("Usuario no autenticado.");
      return;
    }

    const requestData: CreateValuationRequest = {
      ...data,
      userId: user.id,
      issueDate: format(data.issueDate, "yyyy-MM-dd"),
      maturityDate: format(data.maturityDate, "yyyy-MM-dd"),
      capitalization: data.rateType === "NOMINAL" ? (data.capitalization ?? 'MONTH') : null,
      graceCapital: data.graceType === "NONE" ? 0 : data.graceCapital ?? 0,
      graceInterest: data.graceType === "NONE" ? 0 : data.graceCapital ?? 0,
    };

    console.log("Enviando datos al servidor:", requestData);
    action(requestData);
  };

  const handleInvalidSubmit = (errors: any) => {
    console.error("Errores de validación del formulario:", errors);
    toast.error("Formulario inválido", {
      description: "Por favor, revisa los campos marcados en rojo.",
    });
  };

  // ===================================================================
  // == 3. JSX - CORREGIDO ==
  // ===================================================================
  return (
    <Card className="w-full max-w-4xl shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-xl">
          <Calculator className="h-6 w-6" />
          <span>Parámetros del Bono</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleValidSubmit, handleInvalidSubmit)} className="space-y-8">

            {/* --- Sección de Nombre y Períodos --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField control={form.control} name="valuationName" render={({ field }) => (<FormItem><FormLabel>Nombre de la Valoración</FormLabel><FormControl><Input placeholder="Ej: Bono Corporativo XYZ" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="totalPeriods" render={({ field }) => (<FormItem><FormLabel>Nº de Períodos Totales</FormLabel><FormControl><Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)} /></FormControl><FormMessage /></FormItem>)} />
            </div>

            {/* --- Sección de Valores y Precios (CORREGIDA - SIN DUPLICADOS) --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField control={form.control} name="faceValue" render={({ field }) => (<FormItem><FormLabel>Valor Nominal ({currency})</FormLabel><FormControl><Input type="number" step="1000" min="1000" max="5000" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="marketPrice" render={({ field }) => (<FormItem><FormLabel>Valor Comercial</FormLabel><FormControl><Input type="number" step="0.01" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>)} />
            </div>

            {/* --- Sección de Fechas --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField control={form.control} name="issueDate" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Fecha de Emisión</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant="outline" className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}</Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="maturityDate" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Fecha de Vencimiento</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant="outline" className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}</Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>)} />
            </div>

            {/* --- Sección de Tasa Cupón (CORREGIDA) --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
              <FormField control={form.control} name="rateType" render={({ field }) => (<FormItem><FormLabel>Tipo de Tasa Cupón</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="EFFECTIVE">Efectiva</SelectItem><SelectItem value="NOMINAL">Nominal</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="capitalization" render={({ field }) => (<FormItem><FormLabel>Capitalización</FormLabel><Select onValueChange={field.onChange} value={field.value ?? ""} disabled={watchedRateType === 'EFFECTIVE'}><FormControl><SelectTrigger><SelectValue placeholder={watchedRateType === 'EFFECTIVE' ? "No aplica" : "Seleccionar..."} /></SelectTrigger></FormControl><SelectContent><SelectItem value="DAY">Diaria</SelectItem><SelectItem value="FORTNIGHT">Quincenal</SelectItem><SelectItem value="MONTH">Mensual</SelectItem><SelectItem value="BIMONTHLY">Bimestral</SelectItem><SelectItem value="QUARTER">Trimestral</SelectItem><SelectItem value="FOUR_MONTHLY">Cuatrimestral</SelectItem><SelectItem value="SEMESTER">Semestral</SelectItem><SelectItem value="YEAR">Anual</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="rateValue" render={({ field }) => (<FormItem><FormLabel>Tasa Cupón Anual (%)</FormLabel><FormControl><Input type="number" step="0.01" min="2" max="10" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>)} />
            </div>

            {/* --- Sección de Frecuencia y Gracia --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
              <FormField control={form.control} name="frequency" render={({ field }) => (<FormItem><FormLabel>Frecuencia de Pago</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="YEAR">Anual</SelectItem><SelectItem value="SEMESTER">Semestral</SelectItem><SelectItem value="QUARTER">Trimestral</SelectItem><SelectItem value="MONTH">Mensual</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="graceType" render={({ field }) => (<FormItem><FormLabel>Tipo de Gracia</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="NONE">Sin Gracia</SelectItem><SelectItem value="PARTIAL">Parcial</SelectItem><SelectItem value="TOTAL">Total</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
              {watchedGraceType !== 'NONE' && (
                <FormField control={form.control} name="graceCapital" render={({ field }) => (<FormItem><FormLabel>Períodos de Gracia</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ""} onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)} /></FormControl><FormMessage /></FormItem>)} />
              )}
            </div>

            {/* --- Sección de Tasa de Mercado y Costos --- */}
            <FormField control={form.control} name="marketRate" render={({ field }) => (<FormItem><FormLabel>Tasa de Mercado (TEA %)</FormLabel><FormControl><Input type="number" step="0.01" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>)} />
            <div className="space-y-2 rounded-md border p-4">
              <h3 className="text-md font-semibold">Costos y Comisiones (%)</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-8 pt-2">
                <FormField control={form.control} name="issuerStructuringCost" render={({ field }) => (<FormItem><FormLabel>Estruc. Emisor</FormLabel><FormControl><Input type="number" step="0.01" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="issuerPlacementCost" render={({ field }) => (<FormItem><FormLabel>Coloc. Emisor</FormLabel><FormControl><Input type="number" step="0.01" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="issuerCavaliCost" render={({ field }) => (<FormItem><FormLabel>CAVALI Emisor</FormLabel><FormControl><Input type="number" step="0.01" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="investorSabCost" render={({ field }) => (<FormItem><FormLabel>SAB Inversionista</FormLabel><FormControl><Input type="number" step="0.01" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="investorCavaliCost" render={({ field }) => (<FormItem><FormLabel>CAVALI Inversionista</FormLabel><FormControl><Input type="number" step="0.01" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>)} />
              </div>
            </div>

            <Button type="submit" className="w-full text-lg py-6" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              {isLoading ? "Calculando..." : "Calcular Valoración"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
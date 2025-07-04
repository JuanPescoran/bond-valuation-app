"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

// Importación de componentes de UI de shadcn
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// Importación de iconos y utilidades
import { CalendarIcon, Calculator, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Importación de stores y tipos
import { useAuthStore } from "@/stores/auth-store";
import { useSettingsStore } from "@/stores/settings-store";
import type { CreateValuationRequest } from "@/types";


// ===================================================================
// == 1. ESQUEMA DE VALIDACIÓN (ZOD) ==
// ===================================================================
const bondSchema = z.object({
  valuationName: z.string().min(3, "El nombre es requerido y debe tener al menos 3 caracteres.").max(50, "El nombre no puede exceder los 50 caracteres."),
  
  faceValue: z.number({ required_error: "El valor nominal es requerido." }).min(0.01, "El valor nominal debe ser positivo."),
  issuePrice: z.number({ required_error: "El precio de emisión es requerido." }).min(0.01, "El precio de emisión debe ser positivo."),
  purchasePrice: z.number({ required_error: "El precio de compra es requerido." }).min(0.01, "El precio de compra debe ser positivo."),

  issueDate: z.date({ required_error: "La fecha de emisión es requerida." }),
  maturityDate: z.date({ required_error: "La fecha de vencimiento es requerida." }),
  
  totalPeriods: z.number({ required_error: "El número de períodos es requerido." }).int("Debe ser un número entero.").min(1, "Debe haber al menos 1 período."),

  rateType: z.enum(["EFFECTIVE", "NOMINAL"], { required_error: "Selecciona un tipo de tasa." }),
  rateValue: z.number({ required_error: "La tasa cupón es requerida." }).min(0, "La tasa no puede ser negativa."),
  
  capitalization: z.enum(["DAY", "MONTH", "QUARTER", "SEMESTER", "YEAR", "FORTNIGHT", "BIMONTHLY", "FOUR_MONTHLY"]).nullable().optional(),
  
  frequency: z.enum(["YEAR", "SEMESTER", "QUARTER", "MONTH", "DAY", "FORTNIGHT", "BIMONTHLY", "FOUR_MONTHLY"], { required_error: "Selecciona una frecuencia." }),
  
  graceType: z.enum(["NONE", "PARTIAL", "TOTAL"], { required_error: "Selecciona un tipo de gracia." }),
  graceCapital: z.number().int("Debe ser un número entero.").min(0, "No puede ser negativo.").optional(),
  
  commission: z.number({ required_error: "La comisión es requerida." }).min(0, "La comisión no puede ser negativa.").max(100, "La comisión no puede ser mayor a 100."),
  marketRate: z.number({ required_error: "La tasa de mercado es requerida." }).min(0.0001, "La tasa de mercado debe ser positiva."),

}).refine(data => data.maturityDate > data.issueDate, {
  message: "La fecha de vencimiento debe ser posterior a la de emisión.",
  path: ["maturityDate"],
}).refine(data => data.rateType === 'EFFECTIVE' ? data.capitalization != null : true, {
  message: "La capitalización es requerida para una tasa efectiva.",
  path: ["capitalization"],
}).refine(data => data.graceType !== 'NONE' ? data.graceCapital != null && data.graceCapital >= 0 : true, {
  message: "El número de períodos de gracia es requerido.",
  path: ["graceCapital"],
});

type BondFormData = z.infer<typeof bondSchema>;

// ===================================================================
// == 2. INTERFAZ DE PROPS DEL COMPONENTE ==
// ===================================================================
interface BondInputFormProps {
  action: (data: CreateValuationRequest) => void;
  isLoading?: boolean;
}


// ===================================================================
// == 3. COMPONENTE PRINCIPAL ==
// ===================================================================
export default function BondInputForm({ action, isLoading = false }: BondInputFormProps) {
  
  const { currency, defaultRateType } = useSettingsStore();

  const form = useForm<BondFormData>({
    resolver: zodResolver(bondSchema),
    defaultValues: {
      valuationName: "Mi Bono - " + new Date().toLocaleDateString('es-PE'),
      faceValue: 1000,
      issuePrice: 1000,
      purchasePrice: 990,
      issueDate: new Date(),
      maturityDate: new Date(new Date().setFullYear(new Date().getFullYear() + 5)),
      totalPeriods: 10,
      rateType: defaultRateType,
      rateValue: 5.0,
      capitalization: defaultRateType === 'EFFECTIVE' ? 'MONTH' : null,
      frequency: "SEMESTER",
      graceType: "NONE",
      graceCapital: 0,
      commission: 0.5,
      marketRate: 6.0,
    },
    mode: "onBlur", // Validar cuando el usuario sale de un campo
  });

  // --- LÓGICA PARA FORMULARIO DINÁMICO ---
  const watchedRateType = form.watch("rateType");
  const watchedGraceType = form.watch("graceType");

  useEffect(() => {
    // Si el tipo de tasa cambia a Efectiva, reseteamos la capitalización
    if (watchedRateType === "NOMINAL") {
      form.setValue("capitalization", null, { shouldValidate: true });
    }
  }, [watchedRateType, form]);

  useEffect(() => {
    // Si el tipo de tasa cambia a Efectiva, reseteamos la capitalización
    if (watchedRateType === "EFFECTIVE") {
      form.setValue("capitalization", "MONTH", { shouldValidate: true });
    }
  }, [watchedRateType, form]);

  useEffect(() => {
    // Si no hay gracia, reseteamos los períodos de gracia
    if (watchedGraceType === "NONE") {
      form.setValue("graceCapital", 0, { shouldValidate: true });
    }
  }, [watchedGraceType, form]);


  // --- MANEJADORES DE ENVÍO ---
  const handleValidSubmit = (data: BondFormData) => {

    const user = useAuthStore.getState().user;

    if (!user) {
      toast.error("Usuario no autenticado", { 
        description: "Tu sesión puede haber expirado. Por favor, inicia sesión de nuevo." 
      });
      return;
    }

    const requestData: CreateValuationRequest = {
      ...data,
      userId: user.id,
      issueDate: format(data.issueDate, "yyyy-MM-dd"),
      maturityDate: format(data.maturityDate, "yyyy-MM-dd"),
      capitalization: data.rateType === "EFFECTIVE" ? null : (data.capitalization ?? null),
      graceCapital: data.graceType === "NONE" ? 0 : data.graceCapital ?? 0,
      graceInterest: data.graceType === "NONE" ? 0 : data.graceCapital ?? 0, // Asumimos que graceInterest es igual a graceCapital
    };
    action(requestData);
  };

  const handleInvalidSubmit = (errors: any) => {
    console.error("Errores de validación del formulario:", errors);
    toast.error("Formulario inválido", {
      description: "Por favor, revisa los campos marcados en rojo.",
    });
  };
  
  // --- JSX DEL COMPONENTE ---
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField control={form.control} name="valuationName" render={({ field }) => ( <FormItem><FormLabel>Nombre de la Valoración</FormLabel><FormControl><Input placeholder="Ej: Bono Corporativo XYZ" {...field} /></FormControl><FormMessage /></FormItem> )} />
              <FormField control={form.control} name="totalPeriods" render={({ field }) => ( <FormItem><FormLabel>Nº de Períodos Totales</FormLabel><FormControl><Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)} /></FormControl><FormMessage /></FormItem> )} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField control={form.control} name="faceValue" render={({ field }) => ( <FormItem><FormLabel>Valor Nominal ({currency})</FormLabel><FormControl><Input type="number" step="0.01" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem> )} />
              <FormField control={form.control} name="issuePrice" render={({ field }) => ( <FormItem><FormLabel>Precio de Emisión</FormLabel><FormControl><Input type="number" step="0.01" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem> )} />
              <FormField control={form.control} name="purchasePrice" render={({ field }) => ( <FormItem><FormLabel>Precio de Compra</FormLabel><FormControl><Input type="number" step="0.01" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem> )} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="issueDate" render={({ field }) => ( <FormItem className="flex flex-col"><FormLabel>Fecha de Emisión</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant="outline" className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}</Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="maturityDate" render={({ field }) => ( <FormItem className="flex flex-col"><FormLabel>Fecha de Vencimiento</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant="outline" className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}</Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem> )} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
              <FormField control={form.control} name="rateType" render={({ field }) => ( <FormItem><FormLabel>Tipo de Tasa Cupón</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="EFFECTIVE">Efectiva</SelectItem><SelectItem value="NOMINAL">Nominal</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
              
                {watchedRateType === 'EFFECTIVE' && (
                <FormField
                  control={form.control}
                  name="capitalization"
                  render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capitalización</FormLabel>
                    <Select
                    onValueChange={field.onChange}
                    value={field.value ?? ""}
                    >
                    <FormControl>
                      <SelectTrigger>
                      <SelectValue placeholder="Seleccionar..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="DAY">Diaria</SelectItem>
                      <SelectItem value="FORTNIGHT">Quincenal</SelectItem>
                      <SelectItem value="MONTH">Mensual</SelectItem>
                      <SelectItem value="BIMONTHLY">Bimestral</SelectItem>
                      <SelectItem value="QUARTER">Trimestral</SelectItem>
                      <SelectItem value="FOUR_MONTHLY">Cuatrimestral</SelectItem>
                      <SelectItem value="SEMESTER">Semestral</SelectItem>
                      <SelectItem value="YEAR">Anual</SelectItem>
                    </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                  )}
                />
                )}
              
              <FormField control={form.control} name="rateValue" render={({ field }) => ( <FormItem><FormLabel>Tasa Cupón Anual (%)</FormLabel><FormControl><Input type="number" step="0.01" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem> )} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
                <FormField control={form.control} name="frequency" render={({ field }) => ( <FormItem><FormLabel>Frecuencia de Pago</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="YEAR">Anual</SelectItem><SelectItem value="SEMESTER">Semestral</SelectItem><SelectItem value="QUARTER">Trimestral</SelectItem><SelectItem value="MONTH">Mensual</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="graceType" render={({ field }) => ( <FormItem><FormLabel>Tipo de Gracia</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="NONE">Sin Gracia</SelectItem><SelectItem value="PARTIAL">Parcial</SelectItem><SelectItem value="TOTAL">Total</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                
                {watchedGraceType !== 'NONE' && (
                    <FormField control={form.control} name="graceCapital" render={({ field }) => ( <FormItem><FormLabel>Períodos de Gracia</FormLabel><FormControl><Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)} /></FormControl><FormMessage /></FormItem> )} />
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="commission" render={({ field }) => ( <FormItem><FormLabel>Comisión de Emisión (%)</FormLabel><FormControl><Input type="number" step="0.01" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="marketRate" render={({ field }) => ( <FormItem><FormLabel>Tasa de Mercado (TEA %)</FormLabel><FormControl><Input type="number" step="0.01" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem> )} />
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
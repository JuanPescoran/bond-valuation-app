"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/auth-store";
import { Loader2, TrendingUp } from "lucide-react";
import { toast } from "sonner";

// Esquema de validación con Zod
const registerSchema = z
  .object({
    username: z.string().email("Por favor, introduce un email válido."),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"], // Asocia el error al campo de confirmación
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const register = useAuthStore((state) => state.register);
  const router = useRouter();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

    // La función onSubmit maneja la lógica de la UI (estado de carga, redirección).
  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      // Se delega toda la lógica de la API al store.
      // El componente solo sabe que debe llamar a 'register' con el email y la contraseña.
      await register(data.username, data.password);
      
      // Si la función 'register' se completa sin lanzar un error, la operación fue exitosa.
      // El componente se encarga de la retroalimentación de éxito y la navegación.
      toast.success("¡Cuenta creada con éxito!", {
        description: "Ahora serás redirigido para que inicies sesión.",
      });
      router.push("/login");

    } catch (err) {
      // Si 'register' lanzó un error, el 'catch' de aquí lo atrapa.
      // No necesitamos mostrar un toast de error aquí, porque el store ya lo hizo.
      // El único propósito de este bloque es permitir que el 'finally' se ejecute correctamente.
      console.error("Fallo el flujo de registro en el componente.");
    } finally {
      // Este bloque se ejecuta siempre, tanto en éxito como en fracaso.
      // Ideal para detener el estado de carga.
      setIsLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
                <TrendingUp className="h-10 w-10 text-primary" />
            </div>
          <CardTitle className="text-2xl">Crear una Cuenta</CardTitle>
          <CardDescription>
            Únete a BondCalc para empezar a valorar bonos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="tu@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar Contraseña</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Registrarse
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/login" className="underline">
              Inicia sesión
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
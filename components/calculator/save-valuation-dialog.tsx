"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Save, Loader2 } from "lucide-react";
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth-store';

interface SaveValuationDialogProps {
  action: (valuationName: string) => Promise<boolean>; // Recibe la función de guardado
  isSaving: boolean; // Recibe el estado de carga
}

export function SaveValuationDialog({ action, isSaving }: SaveValuationDialogProps) {
   const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [error, setError] = useState("");

  const handleSaveClick = async () => {
    if (!saveName.trim()) {
      setError("El nombre es requerido para guardar el cálculo.");
      return;
    }
    setError("");

    const success = await action(saveName.trim());

    // Si el guardado fue exitoso, cerramos el diálogo y limpiamos el estado.
    if (success) {
      queryClient.invalidateQueries({ queryKey: ['valuations', user?.id] });
      setIsOpen(false);
      setSaveName("");
    }
  };

  // Resetea el nombre cuando el diálogo se abre
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setSaveName("Mi Valoración - " + new Date().toLocaleDateString('es-PE'));
      setError("");
    }
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="lg">
          <Save className="mr-2 h-5 w-5" />
          Guardar Cálculo en Historial
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Guardar Cálculo en Historial</DialogTitle>
          <DialogDescription>
            Asigna un nombre descriptivo a esta valoración para poder consultarla más tarde.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="save-name" className="text-right">
              Nombre
            </Label>
            <Input
              id="save-name"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="Ej: Bono Corporativo ABC"
              className="col-span-3"
            />
          </div>
          {error && (
            <div className="col-span-4">
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={handleSaveClick} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSaving ? "Guardando..." : "Confirmar y Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
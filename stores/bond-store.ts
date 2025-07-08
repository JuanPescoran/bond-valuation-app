import { create } from "zustand";
import { useAuthStore } from "./auth-store";
import { toast } from "sonner";
import type { CreateValuationRequest, ValuationResponse, HistoryItem } from "@/types";

// --- Definición de la Interfaz del Estado (Store) ---
// Esta es la estructura que define nuestro store de Zustand.
interface BondState {
  // Estado para la calculadora
  currentInput: CreateValuationRequest | null;
  currentResult: ValuationResponse | null;
  isCalculating: boolean;
  isSaving: boolean; // Estado de carga para la acción de guardar

  // Acciones (Métodos que interactúan con la API o modifican el estado)
  calculateBond: (input: CreateValuationRequest) => Promise<ValuationResponse | null>;
  saveCurrentValuation: (customName: string) => Promise<boolean>; // Acción para guardar el resultado actual
  clearCurrent: () => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const useBondStore = create<BondState>((set, get) => ({
  // --- Estado Inicial ---
  currentInput: null,
  currentResult: null,
  isCalculating: false,
  isSaving: false,

  // ===============================================
  // == Implementación de las Acciones del Store ==
  // ===============================================

  /**
   * Acción para POST /api/v1/valuations
   * Envía los datos del formulario al backend, que calcula y guarda la valoración.
   * Devuelve la valoración completa.
   */
   calculateBond: async (input: CreateValuationRequest): Promise<ValuationResponse | null> => {
    set({ isCalculating: true, currentInput: input, currentResult: null });
    const token = useAuthStore.getState().token;

    if (!token) {
      toast.error("Error de Autenticación", { description: "Por favor, inicia sesión de nuevo." });
      set({ isCalculating: false });
      return null;
    }

    try {
      console.log("Enviando datos:", input); 
      const response = await fetch(`${API_BASE_URL}/valuations`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        
        let errorMessage = `Error ${response.status}`;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        console.log("Si, es el calculate xd");
        throw new Error(errorMessage);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const responseText = await response.text();
        console.error("Non-JSON response:", responseText);
        throw new Error("El servidor devolvió una respuesta no válida");
      }

      const result: ValuationResponse = await response.json();
      set({ currentResult: result });
      toast.success("Cálculo completado con éxito.", {
        description: `Se ha valorado el bono "${input.valuationName}".`
      });
      return result;

    } catch (error) {
      console.error("Error in calculateBond:", error);
      
      let errorMessage = "Ocurrió un error inesperado.";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast.error("Fallo en el cálculo", {
        description: errorMessage,
      });
      return null;
    } finally {
      set({ isCalculating: false });
    }
  },

  /**
   * Acción para guardar la valoración actual en el historial.
   * En nuestra arquitectura, el bono ya se creó con la acción anterior.
   * Esta función podría llamar a un endpoint para "marcar como guardado" o "renombrar".
   * Por simplicidad, asumiremos que solo necesitamos invalidar la caché del historial
   * para que se recargue y muestre la nueva valoración.
   * @param customName El nombre que el usuario le da a la valoración.
   * @returns Un booleano indicando si la operación fue exitosa.
   */
  saveCurrentValuation: async (customName: string): Promise<boolean> => {
    const { currentResult } = get();
    if (!currentResult) {
      toast.error("No hay resultado para guardar.");
      return false;
    }

    set({ isSaving: true });
    
    // NOTA: En una implementación real, aquí harías una llamada PATCH a
    // `/api/v1/valuations/{currentResult.id}` para actualizar su nombre.
    // Por ahora, solo simularemos el éxito y daremos feedback.

    try {
      // Simulación de una pequeña demora de red
      await new Promise(resolve => setTimeout(resolve, 500));

      // ¡Importante! Aquí es donde le decimos a React Query: "Los datos del historial
      // han cambiado. La próxima vez que alguien necesite el historial, búscalo de nuevo."
      // Para hacer esto, necesitamos acceso al queryClient, lo cual no es directo en Zustand.
      // La mejor práctica es manejar la invalidación en el propio componente después de que esta promesa se resuelva.
      
      toast.success(`'${customName}' ha sido guardado en tu historial.`);
      set({ isSaving: false });
      return true; // Éxito

    } catch (error) {
      console.error("Error in saveCurrentValuation:", error);
      toast.error("Error al guardar", {
        description: error instanceof Error ? error.message : "Ocurrió un error inesperado.",
      });
      set({ isSaving: false });
      return false; // Fracaso
    }
  },

  /**
   * Acción para limpiar los datos del cálculo actual de la UI.
   */
  clearCurrent: () => set({
    currentInput: null,
    currentResult: null,
  }),
}));
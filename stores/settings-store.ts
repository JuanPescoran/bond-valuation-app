import { create } from "zustand";
import { persist } from "zustand/middleware";

// Define RateType if not imported from elsewhere
export type RateType = "EFFECTIVE" | "NOMINAL";

// Define Capitalization if not imported from elsewhere
export type Capitalization = "ANNUAL" | "SEMIANNUAL" | "QUARTERLY" | "MONTHLY";

export interface SettingsState {
  currency: "PEN" | "USD";
  defaultRateType: RateType;
  defaultCapitalization: Capitalization | null;
  setCurrency: (currency: "PEN" | "USD") => void;
  setDefaultRateType: (rateType: RateType) => void;
  setDefaultCapitalization: (capitalization: Capitalization | null) => void;
}

export const useSettingsStore = create<SettingsState>()(
  // El middleware 'persist' guarda automáticamente el estado en localStorage.
  persist(
    (set, get) => ({
      // --- Valores por Defecto ---
      currency: "PEN",
      defaultRateType: "EFFECTIVE",
      defaultCapitalization: null,

      // --- Acciones para modificar el estado ---
      setCurrency: (currency) => set({ currency }),
      setDefaultRateType: (rateType) => {
        // Si el tipo de tasa es efectivo, la capitalización no aplica.
        const newCapitalization = rateType === "EFFECTIVE" ? null : get().defaultCapitalization;
        set({ defaultRateType: rateType, defaultCapitalization: newCapitalization });
      },
      setDefaultCapitalization: (capitalization) => set({ defaultCapitalization: capitalization }),
    }),
    {
      name: "bondcalc-settings-storage", // Nombre único para el almacenamiento local
    }
  )
);
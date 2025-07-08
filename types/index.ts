// En: types/index.ts

// ======================================================
// == Tipos para el Bounded Context de Autenticación (IAM) ==
// ======================================================

/**
 * Representa la estructura de datos del usuario que se recibe
 * del backend y se almacena en el auth-store.
 */
export interface User {
  id: number;
  username: string; // El backend devuelve 'username', que usamos como email.
  roles: string[];
}

/**
 * Representa la respuesta completa que el backend de Java devuelve
 * tras un inicio de sesión ('sign-in') exitoso.
 */
export interface AuthResponse {
  id: number;
  username: string;
  roles: string[];
  token: string;
}

/**
 * Representa la solicitud de creación de usuario que se envía al backend.
 * Coincide con el DTO `SignUpRequest` del backend.
 */
export interface UserCreationRequest {
  username: string; // El email del usuario
  password: string; // La contraseña del usuario
  roles: string[]; // Roles asignados, ej: ["ROLE_USER"]
}

/**
 * Representa la respuesta que el backend devuelve tras un
 * registro ('sign-up') exitoso. No incluye un token.
 */
export interface UserCreationResponse {
  id: number;
  username: string;
  roles: string[];
}

// =========================================================
// == Tipos para el Bounded Context de Estimación (Bonds) ==
// =========================================================

/**
 * El objeto que el frontend envía al backend para crear una valoración.
 * Coincide con el DTO `CreateValuationResource` del backend.
 */
export interface CreateValuationRequest {
  valuationName: string;
  userId: number;
  faceValue: number;
  marketPrice: number;
  issueDate: string;      // Formato "AAAA-MM-DD"
  maturityDate: string;   // Formato "AAAA-MM-DD"
  totalPeriods: number;
  rateType: "EFFECTIVE" | "NOMINAL";
  rateValue: number;
  capitalization: "DAY" | "MONTH" | "QUARTER" | "SEMESTER" | "YEAR" | "FORTNIGHT" | "BIMONTHLY" | "FOUR_MONTHLY" | null;
  frequency: "DAY" | "MONTH" | "QUARTER" | "SEMESTER" | "YEAR" | "FORTNIGHT" | "BIMONTHLY" | "FOUR_MONTHLY";
  graceType: "NONE" | "PARTIAL" | "TOTAL";
  graceCapital: number;
  graceInterest: number;
  marketRate: number;
  issuerStructuringCost: number;
  issuerPlacementCost: number;
  issuerCavaliCost: number;
  investorSabCost: number;
  investorCavaliCost: number;
}

/**
 * El objeto que representa un período en el flujo de caja en la respuesta.
 * Coincide con el DTO `CashflowPeriodResource` del backend.
 */
export interface CashflowPeriodResponse {
  number: number;
  gracePeriodState: string;
  initialBalance: number;
  interest: number;
  coupon: number;
  amortization: number;
  finalBalance: number;
  cashflow: number;
}

/**
 * El objeto completo que el backend devuelve tras un cálculo o al pedir detalles.
 * Coincide con el DTO `ValuationResource` del backend.
 */
export interface ValuationResponse {
  id: number;
  valuationName: string;
  userId: number;
  
  // Resultados
  tcea: number;
  trea: number;
  macaulayDurationInYears: number;
  modifiedDurationInYears: number;
  convexity: number;
  dirtyPrice: number;
  cleanPrice: number;
  
  // Parámetros de Entrada (AÑADIDOS)
  faceValue: number;
  issuePrice: number;
  purchasePrice: number;
  issueDate: string;
  maturityDate: string;
  totalPeriods: number;
  rateType: "EFFECTIVE" | "NOMINAL";
  rateValue: number;
  capitalization: string | null;
  frequency: string;
  graceType: string;
  graceCapital: number;
  graceInterest: number;
  commission: number;
  marketRate: number;

  cashFlow: CashflowPeriodResponse[];
}

/**
 * Representa un item en la lista del historial.
 * Este tipo puede evolucionar según lo que devuelva tu endpoint de historial.
 */
export interface HistoryItem {
  id: number;
  name: string;         // Nombre que el usuario le dio
  createdAt: string;    // Fecha en que se guardó
  faceValue: number;    // Datos rápidos para la tabla
  tcea: number;         // Datos rápidos para la tabla
  valuation: ValuationResponse; // El objeto completo para la vista de detalle
}
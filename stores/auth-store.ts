import { create } from "zustand"
import { persist } from "zustand/middleware"
import Cookies from "js-cookie"
import { AuthResponse, User } from "@/types";
import { toast } from "sonner";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (nombre: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  initialize: () => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isAuthLoading: true, // <-- El estado inicial es 'cargando'

      initialize: () => {
        try {
          const token = Cookies.get("auth-token");
          if (token) {
            // Aquí, en una app real, decodificarías el token para obtener datos del user
            // y también verificarías su expiración.
            // const userData = jwt_decode(token); 
            // set({ user: userData, token, isAuthenticated: true });
            set({ token, isAuthenticated: true });
          }
        } catch (error) {
          console.error("No se pudo inicializar la sesión:", error);
          // Si hay un error, nos aseguramos de que el estado sea no autenticado
          set({ user: null, token: null, isAuthenticated: false });
        } finally {
          // Ya sea que haya token o no, la comprobación ha terminado.
          set({ isAuthLoading: false }); // <-- Marcamos la carga como finalizada
        }
      },

      login: async (email, password) => {
        try {
          const response = await fetch(`${API_BASE_URL}/authentication/sign-in`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: email, password }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Credenciales inválidas");
          }

          const data: AuthResponse = await response.json();

          // --- CORRECCIÓN AQUÍ ---
          // Construimos el objeto 'user' a partir de los campos de la respuesta
          const user: User = {
            id: data.id,
            username: data.username,
            roles: data.roles,
          };
          
          Cookies.set("auth-token", data.token, { expires: 1 });
          
          // Guardamos el objeto 'user' construido y el token en el estado
          set({ user: user, token: data.token, isAuthenticated: true, isAuthLoading: false });
          
          // Ahora data.username existe y la notificación funcionará
          toast.success("Inicio de sesión exitoso", { description: `¡Bienvenido de nuevo, ${data.username}!` });

        } catch (error) {
          console.error("Login error:", error);
          toast.error("Fallo en inicio de sesión", { 
            description: error instanceof Error ? error.message : "Por favor, verifica tus credenciales."
          });
          throw error;
        }
      },
      register: async (username: string, password: string) => {
            try {
        // El endpoint correcto es /authentication/sign-up
          const response = await fetch(`${API_BASE_URL}/authentication/sign-up`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username,
              password,
              roles: ["ROLE_USER"], // Asumimos que un nuevo usuario siempre es ROLE_USER
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Error al crear la cuenta");
          }
          
          // Opcional: Después de registrarse, puedes hacer login automáticamente o redirigir a la página de login.
          // Aquí asumimos que no hace login automático.
          } catch (error) {
        // --- AÑADIMOS FEEDBACK DE ERROR ---
        console.error("Register error:", error);
        toast.error("Fallo en el registro", {
            description: error instanceof Error ? error.message : "Inténtalo de nuevo más tarde."
        });
        throw error;
    }

      },

      logout: () => {
        Cookies.remove("auth-token");
        set({ user: null, token: null, isAuthenticated: false, isAuthLoading: false });
        toast.info("Has cerrado sesión.");
      },

      setUser: (user: User, token: string) => {
        // Esta función podría ser útil si manejas la sesión de otra forma. Por ahora, no es necesaria.
        Cookies.set("auth-token", token, { expires: 1 });
        set({
          user,
          token,
          isAuthenticated: true,
        });
      },
    }),
    {
      name: "auth-storage", // Nombre para el almacenamiento local (localStorage)
    }
  )
);
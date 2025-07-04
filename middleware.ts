import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Definimos la página de inicio de sesión
  const loginPath = "/login";
  
  // Definimos la página principal a la que se redirige tras iniciar sesión
  const defaultDashboardPath = "/dashboard";

  // Rutas que requieren autenticación.
  // Cualquier ruta que comience con estos prefijos será protegida.
  const protectedRoutes = [
    "/home", 
    "/calculator", 
    "/history", 
    "/profile", 
    "/settings"
  ];
  
  // Rutas que son solo para usuarios no autenticados.
  const publicOnlyRoutes = ["/login", "/register"];

  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth-token")?.value;

  // Comprobar si la ruta actual está en la lista de protegidas
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  
  // Comprobar si la ruta actual es solo para usuarios no autenticados
  const isPublicOnlyRoute = publicOnlyRoutes.includes(pathname);

  // --- Lógica de Redirección ---

  // 1. Si el usuario intenta acceder a una ruta protegida y no tiene token,
  //    lo redirigimos a la página de inicio de sesión.
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL(loginPath, request.url));
  }

  // 2. Si el usuario ya está autenticado (tiene token) e intenta acceder
  //    a una ruta pública (como login o register), lo redirigimos
  //    a la página principal del dashboard para evitar redundancia.
  if (isPublicOnlyRoute && token) {
    return NextResponse.redirect(new URL(defaultDashboardPath, request.url));
  }
  
  // 3. Si no se cumple ninguna de las condiciones anteriores, se permite continuar.
  return NextResponse.next();
}

// El 'matcher' asegura que el middleware se ejecute en todas las rutas de la aplicación,
// excepto en las rutas de API, archivos estáticos, etc.
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
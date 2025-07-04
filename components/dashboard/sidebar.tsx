"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/stores/auth-store";
import {
  Calculator,
  History,
  LogOut,
  Settings,
  User as UserIcon,
  TrendingUp,
  LayoutDashboard
} from "lucide-react";

// Elemento de menú reutilizable
function SidebarNavItem({ href, label, icon: Icon }: { href: string; label: string; icon: React.ElementType }) {
  const pathname = usePathname();
  // Hacer la comparación más robusta (ej. /history/123 también activa el link /history)
  const isActive = pathname.startsWith(href);

  return (
    <Link href={href} passHref>
      <Button
        variant={isActive ? "secondary" : "ghost"}
        className="w-full justify-start"
      >
        <Icon className="mr-2 h-4 w-4" />
        {label}
      </Button>
    </Link>
  );
}

// Componente principal del Sidebar
export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const getInitials = (name: string | undefined) => {
    if (!name) return "?";
    // Usamos el username (email) para las iniciales si el nombre no está disponible
    const nameParts = name.split("@")[0].replace(/[._]/g, " ").split(" ");
    return nameParts.map(n => n[0]).slice(0, 2).join("").toUpperCase();
  };

  return (
    <aside className="hidden md:flex flex-col w-64 border-r bg-background p-4">
      <div className="flex flex-col h-full">
        {/* Sección del Logo/Título */}
        <div className="px-2 mb-6">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <TrendingUp className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold tracking-tight">BondCalc</span>
          </Link>
        </div>

        {/* Menú de Navegación Principal */}
        <nav className="flex-1 space-y-1">
          <SidebarNavItem href="/dashboard" label="Dashboard" icon={LayoutDashboard} />
          <SidebarNavItem href="/calculator" label="Calculadora" icon={Calculator} />
          <SidebarNavItem href="/history" label="Historial" icon={History} />
        </nav>

        {/* Sección del Perfil de Usuario en el Footer */}
        <div className="mt-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start h-auto p-2 text-left">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-9 w-9">
                    {/* <AvatarImage src={user?.imageUrl} /> */}
                    <AvatarFallback>{getInitials(user?.username)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-medium truncate">{user?.username}</span>
                    <span className="text-xs text-muted-foreground">
                      {user?.roles?.includes("ROLE_ADMIN") ? "Admin" : "Usuario"}
                    </span>
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/profile')}>
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Configuración</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar Sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </aside>
  );
}
"use client";

import { useAuthStore } from "@/stores/auth-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function ProfilePage() {
    const { user } = useAuthStore();

    const getInitials = (name: string | undefined) => {
        if (!name) return "?";
        const nameParts = name.split("@")[0].replace(/[._]/g, " ").split(" ");
        return nameParts.map(n => n[0]).slice(0, 2).join("").toUpperCase();
    };

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-bold tracking-tight">Mi Perfil</h1>
                <p className="text-muted-foreground">Gestiona la información de tu cuenta.</p>
            </header>
            
            <Card>
                <CardHeader>
                    <CardTitle>Información del Usuario</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center space-x-6">
                    <Avatar className="h-20 w-20 text-3xl">
                        <AvatarFallback>{getInitials(user?.username)}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                        <p><strong>ID de Usuario:</strong> {user?.id}</p>
                        <p><strong>Username (Email):</strong> {user?.username}</p>
                        <p><strong>Roles:</strong> {user?.roles?.join(', ')}</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Funcionalidad en Desarrollo</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        Aquí podrás cambiar tu contraseña y otros datos personales en el futuro.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
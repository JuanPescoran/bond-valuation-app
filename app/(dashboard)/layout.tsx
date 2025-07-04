"use client";

import Sidebar from "@/components/dashboard/sidebar";
import { AuthGuard } from "@/components/providers/auth-guard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen w-full bg-muted/40">
        <Sidebar />
        <div className="flex flex-col flex-1 sm:gap-4 sm:py-4 sm:pl-14">
            {/* Aquí podrías tener una cabecera para móvil si lo necesitas */}
            <main className="flex-1 p-4 sm:px-6 md:p-8 overflow-auto">
              {children}
            </main>
        </div>
      </div>
    </AuthGuard>
  );
}
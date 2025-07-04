"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { useUserValuations, useDeleteValuation } from "@/hooks/api/use-valuations";
import HistoryTable from "@/components/history/history-table";

export default function HistoryPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  
  const { data: history, isLoading, isError, error } = useUserValuations();
  const deleteMutation = useDeleteValuation();

  useEffect(() => {
    if (typeof window !== 'undefined' && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  if (!isAuthenticated) {
    return null;
  }
  
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
      );
    }

    if (isError) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-8 text-destructive border-2 border-dashed border-destructive/50 rounded-lg">
          <AlertCircle className="h-8 w-8 mb-4" />
          <p className="text-lg font-medium">Error al Cargar el Historial</p>
          <p>{error.message}</p>
        </div>
      );
    }
    
    return (
        <HistoryTable 
            history={history || []} 
            action={handleDelete}
            isDeletingId={deleteMutation.isPending ? deleteMutation.variables : null}
        />
    );
  };

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Historial de Cálculos</h1>
        <p className="text-muted-foreground">
          Revisa y gestiona tus valoraciones de bonos guardadas previamente.
        </p>
      </header>
      
      <div className="w-full">
        {renderContent()}
      </div>
    </div>
  );
}
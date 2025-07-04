"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Eye, Trash2, History, Loader2, Calculator } from "lucide-react"
import { useRouter } from "next/navigation"
import type { HistoryItem } from "@/types"

interface HistoryTableProps {
  history: HistoryItem[]
  action: (id: number) => void; // <-- CAMBIADO de 'action' a 'action' y Promise<void> a void
  isDeletingId: number | null; // <-- Prop para saber qué ID se está eliminando
}

export default function HistoryTable({ history, action, isDeletingId }: HistoryTableProps) {
  const router = useRouter()

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(4)}%`
  }

  const handleViewDetails = (id: number) => {
    router.push(`/history/${id}`)
  }
  
  // El estado de carga general (isLoading) y el de lista vacía se manejan en la página padre.
  // Este componente solo se preocupa de renderizar la tabla.
  if (history.length === 0) {
    return (
      <Card className="flex items-center justify-center p-12 border-2 border-dashed">
        <div className="text-center">
          <History className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Tu historial está vacío</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Aún no has guardado ninguna valoración de bonos.
          </p>
          <Button onClick={() => router.push('/calculator')} className="mt-6">
            <Calculator className="mr-2 h-4 w-4" />
            Ir a la Calculadora
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <History className="h-5 w-5" />
          <span>Historial de Cálculos</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0"> {/* Quitamos padding para que la tabla ocupe todo el espacio */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">Nombre</th>
                <th className="text-left p-3">Fecha</th>
                <th className="text-right p-3">Valor Nominal</th>
                <th className="text-right p-3">TCEA</th>
                <th className="text-center p-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.id} className="border-b hover:bg-muted/50">
                  <td className="p-3 font-medium">{item.name}</td>
                  <td className="p-3">
                    <Badge variant="outline">{new Date(item.createdAt).toLocaleDateString("es-PE")}</Badge>
                  </td>
                  <td className="p-3 text-right">{formatCurrency(item.faceValue)}</td>
                  <td className="p-3 text-right">
                    <Badge variant="secondary">{formatPercentage(item.tcea)}</Badge>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(item.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={isDeletingId === item.id}
                          >
                            {isDeletingId === item.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Eliminar
                                </>
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. Se eliminará permanentemente el cálculo &#39;{item.name}&#39;.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => action(item.id)} // <-- Ahora llama a action
                            >
                              Confirmar Eliminación
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
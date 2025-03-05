'use client'

import { useState, useEffect } from 'react'
import { useTransaccionesRecurrentesStore } from '@/store/useStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Search, Filter, HelpCircle, Info, Download } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export default function TransaccionesRecurrentesPage() {
  const { transacciones, loading, error, fetchTransacciones } = useTransaccionesRecurrentesStore()
  const [filtroEstado, setFiltroEstado] = useState<string | null>(null)
  const [showInfo, setShowInfo] = useState(false)

  useEffect(() => {
    fetchTransacciones()
  }, [fetchTransacciones])

  const formatFecha = (fechaStr: string) => {
    return new Date(fechaStr).toLocaleDateString('es-ES')
  }

  const getEstadoClass = (estado: string) => {
    switch (estado) {
      case 'ACT':
        return 'bg-green-100 text-green-800'
      case 'CAN':
        return 'bg-red-100 text-red-800'
      case 'PEN':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getEstadoTexto = (estado: string) => {
    switch (estado) {
      case 'ACT':
        return 'Activa'
      case 'CAN':
        return 'Cancelada'
      case 'PEN':
        return 'Pendiente'
      default:
        return estado
    }
  }

  const transaccionesFiltradas = filtroEstado
    ? transacciones.filter(t => t.estado === filtroEstado)
    : transacciones

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-violet-600 text-transparent bg-clip-text">
            Transacciones Recurrentes
          </h1>
          <p className="text-muted-foreground mt-2">
            Monitoreo de las transacciones recurrentes de la pasarela de pagos
          </p>
        </div>
        <Popover open={showInfo} onOpenChange={setShowInfo}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Info className="h-4 w-4" />
              <span>Información</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4">
            <div className="space-y-2">
              <h4 className="font-medium">Sobre las transacciones recurrentes</h4>
              <p className="text-sm text-neutral-600">
                Las transacciones recurrentes son generadas automáticamente por el sistema.
                Desde aquí puedes monitorear su estado y filtrarlas.
              </p>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Card className="w-full sm:w-64 border border-neutral-200/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Filtrar por Estado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-2">
              <Button 
                variant={filtroEstado === null ? "default" : "outline"} 
                className="w-full justify-start" 
                onClick={() => setFiltroEstado(null)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Todos
              </Button>
              <Button 
                variant={filtroEstado === 'ACT' ? "default" : "outline"} 
                className="w-full justify-start" 
                onClick={() => setFiltroEstado('ACT')}
              >
                <span className="h-3 w-3 rounded-full bg-green-500 mr-2" />
                Activas
              </Button>
              <Button 
                variant={filtroEstado === 'CAN' ? "default" : "outline"} 
                className="w-full justify-start" 
                onClick={() => setFiltroEstado('CAN')}
              >
                <span className="h-3 w-3 rounded-full bg-red-500 mr-2" />
                Canceladas
              </Button>
              <Button 
                variant={filtroEstado === 'PEN' ? "default" : "outline"} 
                className="w-full justify-start" 
                onClick={() => setFiltroEstado('PEN')}
              >
                <span className="h-3 w-3 rounded-full bg-yellow-500 mr-2" />
                Pendientes
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex-1">
          <Card className="border border-neutral-200/60 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>Listado de Transacciones</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                      type="search"
                      placeholder="Buscar transacción..."
                      className="pl-8 h-9 w-64 rounded-md border border-input bg-background px-3 py-1 text-sm text-muted-foreground"
                    />
                  </div>
                  <Button variant="outline" size="sm" className="h-9">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-40 flex items-center justify-center">
                  <div className="text-center">
                    <div className="h-8 w-8 border-4 border-t-indigo-600 border-indigo-200 rounded-full animate-spin mx-auto"></div>
                    <div className="mt-2 text-sm text-muted-foreground">Cargando transacciones</div>
                  </div>
                </div>
              ) : error ? (
                <div className="h-40 flex items-center justify-center">
                  <div className="text-center text-red-500">
                    {error}
                  </div>
                </div>
              ) : transaccionesFiltradas.length === 0 ? (
                <div className="h-40 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    No hay transacciones recurrentes disponibles
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-neutral-50">
                      <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Monto</TableHead>
                        <TableHead>Marca</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Fecha Inicio</TableHead>
                        <TableHead>Fecha Fin</TableHead>
                        <TableHead>Día Pago</TableHead>
                        <TableHead>Frecuencia</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transaccionesFiltradas.map((tx) => (
                        <TableRow key={tx.codigo}>
                          <TableCell className="font-medium">{tx.codigo}</TableCell>
                          <TableCell>
                            {tx.monto.toFixed(2)} {tx.moneda}
                          </TableCell>
                          <TableCell>{tx.marca}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${getEstadoClass(tx.estado)}`}>
                              {getEstadoTexto(tx.estado)}
                            </span>
                          </TableCell>
                          <TableCell>{formatFecha(tx.fechaInicio)}</TableCell>
                          <TableCell>{formatFecha(tx.fechaFin)}</TableCell>
                          <TableCell>{tx.diaMesPago}</TableCell>
                          <TableCell>Cada {tx.frecuenciaDias} día(s)</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 
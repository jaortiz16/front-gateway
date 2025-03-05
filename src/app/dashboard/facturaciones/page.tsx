'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { FilePlus, Search, Calendar, Filter, Receipt, ArrowUpDown, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// Datos de ejemplo - estos vendrían de la API real
const facturacionesData = [
  {
    id: "67c74de428c4bc30e0ce56cb",
    codFacturacionComercio: "67c74de428c4bc30e0ce56cb",
    codComercio: "COM1",
    fechaInicio: "2024-08-12",
    fechaFin: "2024-09-18",
    transaccionesProcesadas: 50,
    codComision: "67c74637",
    valor: 5.00,
    estado: "PAG",
    fechaFacturacion: "2025-03-04",
    fechaPago: "2025-03-04"
  },
  {
    id: "67c74d5828c4bc30e0ce56c9",
    codFacturacionComercio: "67c74d5828c4bc30e0ce56c9",
    codComercio: "COM1",
    fechaInicio: "2024-08-12",
    fechaFin: "2024-09-18",
    transaccionesProcesadas: 50,
    codComision: "67c74637",
    valor: 5.00,
    estado: "PEN",
    fechaFacturacion: "2025-03-04",
    fechaPago: null
  },
  {
    id: "67c7466828c4bc30e0ce56c6",
    codFacturacionComercio: "67c7466828c4bc30e0ce56c6",
    codComercio: "COM1",
    fechaInicio: "2024-03-03",
    fechaFin: "2024-03-03",
    transaccionesProcesadas: 150,
    codComision: "67c74637",
    valor: 50.00,
    estado: "PEN",
    fechaFacturacion: "2025-03-04",
    fechaPago: null
  },
  {
    id: "67c7539728c4bc30e0ce56cf",
    codFacturacionComercio: "67c7539728c4bc30e0ce56cf",
    codComercio: "COM4",
    fechaInicio: "2023-03-12",
    fechaFin: "2024-10-08",
    transaccionesProcesadas: 50,
    codComision: "67c74847",
    valor: 4.00,
    estado: "PAG",
    fechaFacturacion: "2025-03-04",
    fechaPago: "2025-03-04"
  }
]

// Datos de ejemplo para comercios
const comercios = [
  { id: "COM1", nombre: "Farmacia Moderna" },
  { id: "COM2", nombre: "Restaurante El Sabor" },
  { id: "COM3", nombre: "Tienda Deportiva Run" },
  { id: "COM4", nombre: "Supermercado Express" }
]

// Datos de ejemplo para comisiones
const comisiones = [
  { id: "67c74637", nombre: "Comisión Estándar", valor: "1.2%" },
  { id: "67c74847", nombre: "Comisión Premium", valor: "0.9%" },
  { id: "67c74947", nombre: "Comisión Básica", valor: "1.5%" }
]

export default function FacturacionesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<string | null>(null)
  const [ordenacion, setOrdenacion] = useState({ campo: 'fechaFacturacion', direccion: 'desc' })
  const [modalAbierto, setModalAbierto] = useState(false)
  
  // Estado para el formulario de nueva facturación
  const [nuevaFacturacion, setNuevaFacturacion] = useState({
    codComercio: '',
    fechaInicio: '',
    fechaFin: '',
    codComision: '',
    valor: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNuevaFacturacion({
      ...nuevaFacturacion,
      [name]: value
    })
  }

  const handleSelectChange = (name: string, value: string) => {
    setNuevaFacturacion({
      ...nuevaFacturacion,
      [name]: value
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Aquí iría la lógica para guardar la nueva facturación
    console.log('Nueva facturación:', nuevaFacturacion)
    setModalAbierto(false)
    setNuevaFacturacion({
      codComercio: '',
      fechaInicio: '',
      fechaFin: '',
      codComision: '',
      valor: ''
    })
  }

  const formatFecha = (fechaStr: string) => {
    if (!fechaStr) return '—'
    return new Date(fechaStr).toLocaleDateString('es-ES')
  }

  const getEstadoClass = (estado: string) => {
    switch (estado) {
      case 'PAG':
        return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
      case 'PEN':
        return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
      default:
        return 'bg-gradient-to-r from-neutral-500 to-slate-500 text-white'
    }
  }

  const getEstadoTexto = (estado: string) => {
    switch (estado) {
      case 'PAG':
        return 'Pagado'
      case 'PEN':
        return 'Pendiente'
      default:
        return estado
    }
  }

  const ordenarFacturaciones = (facturaciones) => {
    return [...facturaciones].sort((a, b) => {
      const aValue = a[ordenacion.campo]
      const bValue = b[ordenacion.campo]
      
      if (aValue === null) return ordenacion.direccion === 'asc' ? 1 : -1
      if (bValue === null) return ordenacion.direccion === 'asc' ? -1 : 1
      
      if (ordenacion.direccion === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0
      }
    })
  }

  const actualizarOrdenacion = (campo) => {
    setOrdenacion(prev => ({
      campo,
      direccion: prev.campo === campo && prev.direccion === 'asc' ? 'desc' : 'asc'
    }))
  }

  const facturacionesFiltradas = facturacionesData
    .filter(f => filtroEstado ? f.estado === filtroEstado : true)
    .filter(f => 
      f.codFacturacionComercio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.codComercio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.valor.toString().includes(searchTerm)
    )

  const facturacionesOrdenadas = ordenarFacturaciones(facturacionesFiltradas)

  const totalPagado = facturacionesData
    .filter(f => f.estado === 'PAG')
    .reduce((sum, f) => sum + f.valor, 0)

  const totalPendiente = facturacionesData
    .filter(f => f.estado === 'PEN')
    .reduce((sum, f) => sum + f.valor, 0)

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text">
            Facturaciones
          </h1>
          <p className="text-muted-foreground mt-2">
            Gestiona las facturaciones de los comercios
          </p>
        </div>

        <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
          <DialogTrigger asChild>
            <Button className="gap-2 self-start bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 shadow-md">
              <FilePlus className="h-4 w-4" />
              <span>Nueva Facturación</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Crear Nueva Facturación</DialogTitle>
              <DialogDescription>
                Ingresa los datos para generar una nueva facturación a un comercio.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="codComercio" className="text-right">
                    Comercio
                  </Label>
                  <div className="col-span-3">
                    <Select 
                      value={nuevaFacturacion.codComercio} 
                      onValueChange={(value) => handleSelectChange('codComercio', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un comercio" />
                      </SelectTrigger>
                      <SelectContent>
                        {comercios.map(comercio => (
                          <SelectItem key={comercio.id} value={comercio.id}>
                            {comercio.nombre} ({comercio.id})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="fechaInicio" className="text-right">
                    Fecha Inicio
                  </Label>
                  <Input
                    id="fechaInicio"
                    name="fechaInicio"
                    type="date"
                    value={nuevaFacturacion.fechaInicio}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="fechaFin" className="text-right">
                    Fecha Fin
                  </Label>
                  <Input
                    id="fechaFin"
                    name="fechaFin"
                    type="date"
                    value={nuevaFacturacion.fechaFin}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="codComision" className="text-right">
                    Comisión
                  </Label>
                  <div className="col-span-3">
                    <Select 
                      value={nuevaFacturacion.codComision} 
                      onValueChange={(value) => handleSelectChange('codComision', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una comisión" />
                      </SelectTrigger>
                      <SelectContent>
                        {comisiones.map(comision => (
                          <SelectItem key={comision.id} value={comision.id}>
                            {comision.nombre} ({comision.valor})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="valor" className="text-right">
                    Valor ($)
                  </Label>
                  <Input
                    id="valor"
                    name="valor"
                    type="number"
                    step="0.01"
                    value={nuevaFacturacion.valor}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancelar</Button>
                </DialogClose>
                <Button type="submit" className="bg-gradient-to-r from-purple-500 to-indigo-500">Crear Facturación</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <motion.div variants={item}>
          <Card className="overflow-hidden bg-gradient-to-br from-indigo-50 to-purple-50 border-0 shadow-md">
            <CardHeader className="pb-2 border-b border-neutral-100">
              <CardTitle className="flex items-center gap-2 text-lg font-medium text-indigo-700">
                <Receipt className="h-5 w-5" />
                Total Facturaciones
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-3xl font-bold text-indigo-700">
                {facturacionesData.length}
              </div>
              <div className="mt-1 text-sm text-indigo-600/70">
                Facturaciones totales
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50 border-0 shadow-md">
            <CardHeader className="pb-2 border-b border-neutral-100">
              <CardTitle className="flex items-center gap-2 text-lg font-medium text-green-700">
                <Receipt className="h-5 w-5" />
                Total Pagado
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-3xl font-bold text-green-700">
                ${totalPagado.toFixed(2)}
              </div>
              <div className="mt-1 text-sm text-green-600/70">
                Valor total facturaciones pagadas
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 border-0 shadow-md">
            <CardHeader className="pb-2 border-b border-neutral-100">
              <CardTitle className="flex items-center gap-2 text-lg font-medium text-amber-700">
                <Receipt className="h-5 w-5" />
                Total Pendiente
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-3xl font-bold text-amber-700">
                ${totalPendiente.toFixed(2)}
              </div>
              <div className="mt-1 text-sm text-amber-600/70">
                Valor total facturaciones pendientes
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Card className="w-full sm:w-64 bg-gradient-to-br from-violet-50 to-indigo-50 shadow-md border-0">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-violet-700">Filtrar por Estado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-2">
              <Button 
                variant={filtroEstado === null ? "default" : "outline"} 
                className="w-full justify-start bg-gradient-to-r from-violet-500 to-indigo-500 text-white" 
                onClick={() => setFiltroEstado(null)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Todos
              </Button>
              <Button 
                variant={filtroEstado === 'PAG' ? "default" : "outline"} 
                className={`w-full justify-start ${filtroEstado === 'PAG' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' : ''}`}
                onClick={() => setFiltroEstado('PAG')}
              >
                <span className="h-3 w-3 rounded-full bg-green-500 mr-2" />
                Pagados
              </Button>
              <Button 
                variant={filtroEstado === 'PEN' ? "default" : "outline"} 
                className={`w-full justify-start ${filtroEstado === 'PEN' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' : ''}`}
                onClick={() => setFiltroEstado('PEN')}
              >
                <span className="h-3 w-3 rounded-full bg-amber-500 mr-2" />
                Pendientes
              </Button>
            </div>

            <div className="mt-4 pt-4 border-t">
              <CardTitle className="text-sm font-medium mb-2 text-violet-700">Periodo</CardTitle>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2 text-violet-500" />
                  <span>Seleccionar fechas</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="flex-1 backdrop-blur-sm bg-white/90 border border-neutral-100 shadow-xl">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle className="text-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text font-bold">
                Listado de Facturaciones
              </CardTitle>
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Buscar facturación..."
                  className="pl-8 w-full sm:w-64 h-9 rounded-md border border-input bg-background/50 backdrop-blur-sm px-3 py-1 text-sm shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-md backdrop-filter backdrop-blur-sm">
              <Table>
                <TableHeader className="bg-gradient-to-r from-violet-50 to-indigo-50">
                  <TableRow>
                    <TableHead className="font-medium">
                      <button 
                        className="flex items-center gap-1 hover:text-indigo-600 transition-colors"
                        onClick={() => actualizarOrdenacion('codFacturacionComercio')}
                      >
                        Código 
                        {ordenacion.campo === 'codFacturacionComercio' && (
                          <ArrowUpDown className="h-3 w-3" />
                        )}
                      </button>
                    </TableHead>
                    <TableHead className="font-medium">
                      <button 
                        className="flex items-center gap-1 hover:text-indigo-600 transition-colors"
                        onClick={() => actualizarOrdenacion('codComercio')}
                      >
                        Comercio
                        {ordenacion.campo === 'codComercio' && (
                          <ArrowUpDown className="h-3 w-3" />
                        )}
                      </button>
                    </TableHead>
                    <TableHead className="font-medium">
                      <button 
                        className="flex items-center gap-1 hover:text-indigo-600 transition-colors"
                        onClick={() => actualizarOrdenacion('fechaFacturacion')}
                      >
                        Fecha
                        {ordenacion.campo === 'fechaFacturacion' && (
                          <ArrowUpDown className="h-3 w-3" />
                        )}
                      </button>
                    </TableHead>
                    <TableHead className="font-medium">
                      <button 
                        className="flex items-center gap-1 hover:text-indigo-600 transition-colors"
                        onClick={() => actualizarOrdenacion('transaccionesProcesadas')}
                      >
                        Transacciones
                        {ordenacion.campo === 'transaccionesProcesadas' && (
                          <ArrowUpDown className="h-3 w-3" />
                        )}
                      </button>
                    </TableHead>
                    <TableHead className="font-medium">
                      <button 
                        className="flex items-center gap-1 hover:text-indigo-600 transition-colors"
                        onClick={() => actualizarOrdenacion('valor')}
                      >
                        Valor
                        {ordenacion.campo === 'valor' && (
                          <ArrowUpDown className="h-3 w-3" />
                        )}
                      </button>
                    </TableHead>
                    <TableHead className="font-medium">
                      <button 
                        className="flex items-center gap-1 hover:text-indigo-600 transition-colors"
                        onClick={() => actualizarOrdenacion('estado')}
                      >
                        Estado
                        {ordenacion.campo === 'estado' && (
                          <ArrowUpDown className="h-3 w-3" />
                        )}
                      </button>
                    </TableHead>
                    <TableHead className="font-medium">
                      <button 
                        className="flex items-center gap-1 hover:text-indigo-600 transition-colors"
                        onClick={() => actualizarOrdenacion('fechaPago')}
                      >
                        Fecha de Pago
                        {ordenacion.campo === 'fechaPago' && (
                          <ArrowUpDown className="h-3 w-3" />
                        )}
                      </button>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {facturacionesOrdenadas.map((facturacion, index) => (
                    <motion.tr 
                      key={facturacion.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="border-b border-neutral-100 hover:bg-violet-50/30"
                    >
                      <TableCell className="font-medium">{facturacion.codFacturacionComercio.substring(0, 8)}</TableCell>
                      <TableCell>{facturacion.codComercio}</TableCell>
                      <TableCell>{formatFecha(facturacion.fechaFacturacion)}</TableCell>
                      <TableCell>{facturacion.transaccionesProcesadas}</TableCell>
                      <TableCell className="font-semibold">${facturacion.valor.toFixed(2)}</TableCell>
                      <TableCell>
                        <span className={`px-3 py-1 rounded-full text-xs ${getEstadoClass(facturacion.estado)}`}>
                          {getEstadoTexto(facturacion.estado)}
                        </span>
                      </TableCell>
                      <TableCell>{formatFecha(facturacion.fechaPago)}</TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 
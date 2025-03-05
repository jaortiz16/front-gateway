'use client'

import { useState, useEffect } from 'react'
import { useComerciosStore } from '@/store/useStore'
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
import { 
  FilePlus, 
  Search, 
  Building, 
  CircleCheck, 
  CircleSlash, 
  BarChart3, 
  ShoppingBag,
  X,
  Plus,
  CreditCard,
  Check
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

// Definición de interfaces
interface Comercio {
  codigoComercio: string;
  nombreComercial: string;
  razonSocial: string;
  ruc: string;
  cuentaIban: string;
  estado: string;
}

interface PosTerminal {
  id: string;
  nombre: string;
  tipo: string;
}

// Datos de ejemplo para POS disponibles
const posDisponibles: PosTerminal[] = [
  { id: 'POS001', nombre: 'POS Terminal 1', tipo: 'Físico' },
  { id: 'POS002', nombre: 'POS Terminal 2', tipo: 'Físico' },
  { id: 'POS003', nombre: 'POS Web', tipo: 'Virtual' },
  { id: 'POS004', nombre: 'POS Móvil', tipo: 'Virtual' },
];

export default function ComerciosPage() {
  const { comercios, loading, error, fetchComercios } = useComerciosStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [modalPosAbierto, setModalPosAbierto] = useState(false)
  const [comercioSeleccionado, setComercioSeleccionado] = useState<Comercio | null>(null)
  const [posAsignados, setPosAsignados] = useState<Record<string, string[]>>({})

  // Estado para el formulario de nuevo comercio
  const [nuevoComercio, setNuevoComercio] = useState({
    nombreComercial: '',
    razonSocial: '',
    ruc: '',
    cuentaIban: '',
    estado: 'ACT'
  })

  useEffect(() => {
    fetchComercios()
  }, [fetchComercios])

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNuevoComercio({
      ...nuevoComercio,
      [name]: value
    })
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // Aquí iría la lógica para guardar el nuevo comercio
    console.log('Nuevo comercio:', nuevoComercio)
    setModalAbierto(false)
    setNuevoComercio({
      nombreComercial: '',
      razonSocial: '',
      ruc: '',
      cuentaIban: '',
      estado: 'ACT'
    })
  }

  const abrirModalPos = (comercio: Comercio) => {
    setComercioSeleccionado(comercio)
    setModalPosAbierto(true)
  }

  const togglePosAsignado = (posId: string) => {
    setPosAsignados(prev => {
      if (!comercioSeleccionado) return prev;
      
      const posActuales = prev[comercioSeleccionado.codigoComercio] || []
      const nuevosPosAsignados = posActuales.includes(posId)
        ? posActuales.filter(id => id !== posId)
        : [...posActuales, posId]
      
      return {
        ...prev,
        [comercioSeleccionado.codigoComercio]: nuevosPosAsignados
      }
    })
  }

  const guardarAsignacionPos = () => {
    // Aquí iría la lógica para guardar la asignación de POS
    console.log('POS asignados:', posAsignados)
    setModalPosAbierto(false)
  }

  const comerciosFiltrados = comercios.filter(comercio => 
    comercio.nombreComercial.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comercio.codigoComercio.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comercio.ruc.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comercio.razonSocial.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-teal-600 text-transparent bg-clip-text">
            Gestión de Comercios
          </h1>
          <p className="text-muted-foreground mt-2">
            Gestiona los comercios afiliados a la pasarela de pagos y asigna puntos de venta
          </p>
        </div>
        
        <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
          <DialogTrigger asChild>
            <Button className="gap-2 self-start bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 shadow-md">
              <FilePlus className="h-4 w-4" />
              <span>Nuevo Comercio</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Comercio</DialogTitle>
              <DialogDescription>
                Ingresa los datos del nuevo comercio a registrar en la plataforma.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="nombreComercial" className="text-right">
                    Nombre Comercial
                  </Label>
                  <Input
                    id="nombreComercial"
                    name="nombreComercial"
                    value={nuevoComercio.nombreComercial}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="razonSocial" className="text-right">
                    Razón Social
                  </Label>
                  <Input
                    id="razonSocial"
                    name="razonSocial"
                    value={nuevoComercio.razonSocial}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="ruc" className="text-right">
                    RUC
                  </Label>
                  <Input
                    id="ruc"
                    name="ruc"
                    value={nuevoComercio.ruc}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="cuentaIban" className="text-right">
                    Cuenta IBAN
                  </Label>
                  <Input
                    id="cuentaIban"
                    name="cuentaIban"
                    value={nuevoComercio.cuentaIban}
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
                <Button type="submit" className="bg-gradient-to-r from-blue-500 to-teal-500">Crear Comercio</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={modalPosAbierto} onOpenChange={setModalPosAbierto}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Asignar POS a Comercio</DialogTitle>
              <DialogDescription>
                {comercioSeleccionado ? `Selecciona los POS para asignar a ${comercioSeleccionado.nombreComercial}` : 'Selecciona los POS para asignar al comercio'}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <h4 className="font-medium mb-3 text-sm">Puntos de Venta Disponibles:</h4>
              <div className="space-y-2 max-h-[300px] overflow-y-auto p-1">
                {posDisponibles.map((pos) => {
                  const codigoComercio = comercioSeleccionado?.codigoComercio || '';
                  const estaAsignado = codigoComercio ? (posAsignados[codigoComercio] || []).includes(pos.id) : false;
                  return (
                    <div 
                      key={pos.id} 
                      className={`p-3 border rounded-md cursor-pointer transition-colors flex justify-between items-center ${estaAsignado ? 'bg-blue-50 border-blue-200' : 'hover:bg-neutral-50'}`}
                      onClick={() => togglePosAsignado(pos.id)}
                    >
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-blue-500" />
                        <div>
                          <div className="font-medium">{pos.nombre}</div>
                          <div className="text-xs text-neutral-500">ID: {pos.id}</div>
                        </div>
                      </div>
                      <Badge variant={pos.tipo === 'Físico' ? 'default' : 'secondary'} className="ml-2">
                        {pos.tipo}
                      </Badge>
                      <div className={`h-5 w-5 rounded-full flex items-center justify-center ${estaAsignado ? 'bg-blue-500 text-white' : 'border border-neutral-300'}`}>
                        {estaAsignado && <Check className="h-3 w-3" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancelar</Button>
              </DialogClose>
              <Button 
                onClick={guardarAsignacionPos}
                className="bg-gradient-to-r from-blue-500 to-teal-500"
              >
                Guardar Asignación
              </Button>
            </DialogFooter>
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
          <Card className="overflow-hidden bg-gradient-to-br from-blue-50 to-teal-50 border-0 shadow-md">
            <CardHeader className="pb-2 border-b border-neutral-100">
              <CardTitle className="flex items-center gap-2 text-lg font-medium text-blue-700">
                <Building className="h-5 w-5" />
                Comercios Activos
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-3xl font-bold text-blue-700">
                {comercios.filter(c => c.estado === 'ACT').length}
              </div>
              <div className="mt-1 text-sm text-blue-600/70">
                Comercios con estado activo
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50 border-0 shadow-md">
            <CardHeader className="pb-2 border-b border-neutral-100">
              <CardTitle className="flex items-center gap-2 text-lg font-medium text-purple-700">
                <CircleSlash className="h-5 w-5" />
                Comercios Inactivos
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-3xl font-bold text-purple-700">
                {comercios.filter(c => c.estado === 'INA').length}
              </div>
              <div className="mt-1 text-sm text-purple-600/70">
                Comercios con estado inactivo
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 border-0 shadow-md">
            <CardHeader className="pb-2 border-b border-neutral-100">
              <CardTitle className="flex items-center gap-2 text-lg font-medium text-amber-700">
                <BarChart3 className="h-5 w-5" />
                Total Comercios
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-3xl font-bold text-amber-700">
                {comercios.length}
              </div>
              <div className="mt-1 text-sm text-amber-600/70">
                Total de comercios registrados
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <Card className="backdrop-blur-sm bg-white/90 border border-neutral-100 shadow-xl">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-2xl bg-gradient-to-r from-blue-600 to-teal-600 text-transparent bg-clip-text font-bold">
              Listado de Comercios
            </CardTitle>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Buscar comercio por nombre, código o RUC..."
                className="pl-8 w-full sm:w-80 h-9 rounded-md border border-input bg-background/50 backdrop-blur-sm px-3 py-1 text-sm shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-40 flex items-center justify-center">
              <div className="relative h-12 w-12">
                <div className="absolute animate-ping h-full w-full rounded-full bg-blue-400 opacity-75"></div>
                <div className="relative rounded-full h-12 w-12 bg-gradient-to-r from-blue-500 to-teal-500"></div>
              </div>
            </div>
          ) : error ? (
            <div className="h-40 flex items-center justify-center">
              <div className="text-center text-red-500">
                {error}
              </div>
            </div>
          ) : comerciosFiltrados.length === 0 ? (
            <div className="h-40 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                No hay comercios disponibles
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md backdrop-filter backdrop-blur-sm">
              <Table>
                <TableHeader className="bg-gradient-to-r from-blue-50 to-teal-50">
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nombre Comercial</TableHead>
                    <TableHead>RUC</TableHead>
                    <TableHead>Razón Social</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Cuenta IBAN</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comerciosFiltrados.map((comercio, index) => (
                    <motion.tr 
                      key={comercio.codigoComercio}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="border-b border-neutral-100 hover:bg-neutral-50"
                    >
                      <TableCell className="font-medium">{comercio.codigoComercio}</TableCell>
                      <TableCell>{comercio.nombreComercial}</TableCell>
                      <TableCell>{comercio.ruc}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{comercio.razonSocial}</TableCell>
                      <TableCell>
                        {comercio.estado === 'ACT' ? (
                          <div className="flex items-center gap-1 text-green-700">
                            <CircleCheck className="h-4 w-4" />
                            <span>Activo</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-red-700">
                            <CircleSlash className="h-4 w-4" />
                            <span>Inactivo</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {comercio.cuentaIban}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => abrirModalPos(comercio)}
                        >
                          <ShoppingBag className="h-4 w-4 mr-1" />
                          <span>Asignar POS</span>
                        </Button>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 
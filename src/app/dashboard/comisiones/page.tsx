'use client'

import { useState, useEffect } from 'react'
import { useComisionesStore } from '@/store/useStore'
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
  Pencil, 
  Trash2, 
  Search, 
  X, 
  Plus, 
  BadgeDollarSign, 
  Info,
  CheckCircle2
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface ComisionForm {
  tipo: string;
  montoBase: string;
  transaccionesBase: string;
}

export default function ComisionesPage() {
  const { comisiones, loading, error, fetchComisiones, deleteComision, createComision } = useComisionesStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [formData, setFormData] = useState<ComisionForm>({
    tipo: 'POR',
    montoBase: '',
    transaccionesBase: '0'
  })
  const [formErrors, setFormErrors] = useState<Partial<ComisionForm>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    fetchComisiones()
  }, [fetchComisiones])

  const comisionesFiltradas = comisiones.filter(comision => 
    comision.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comision.codComision?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comision.montoBase.toString().includes(searchTerm)
  )

  const handleModalClose = () => {
    setModalAbierto(false)
    // Resetear form al cerrar
    setTimeout(() => {
      setFormData({
        tipo: 'POR',
        montoBase: '',
        transaccionesBase: '0'
      })
      setFormErrors({})
      setIsSubmitting(false)
      setShowSuccess(false)
    }, 200)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Limpiar error al cambiar valor
    if (formErrors[name as keyof ComisionForm]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const validarForm = (): boolean => {
    const errors: Partial<ComisionForm> = {}
    
    if (!formData.tipo) {
      errors.tipo = 'El tipo es requerido'
    }
    
    if (!formData.montoBase) {
      errors.montoBase = 'El monto base es requerido'
    } else if (isNaN(parseFloat(formData.montoBase)) || parseFloat(formData.montoBase) < 0) {
      errors.montoBase = 'Debe ser un número válido mayor o igual a 0'
    }
    
    if (!formData.transaccionesBase) {
      errors.transaccionesBase = 'El número de transacciones es requerido'
    } else if (isNaN(parseInt(formData.transaccionesBase)) || parseInt(formData.transaccionesBase) < 0) {
      errors.transaccionesBase = 'Debe ser un número entero mayor o igual a 0'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validarForm()) {
      return
    }
    
    setIsSubmitting(true)
    
    try {
      await createComision({
        tipo: formData.tipo,
        montoBase: parseFloat(formData.montoBase),
        transaccionesBase: parseInt(formData.transaccionesBase)
      })
      
      setShowSuccess(true)
      
      // Cerrar modal después de mostrar éxito
      setTimeout(() => {
        handleModalClose()
      }, 2000)
      
    } catch (error) {
      console.error('Error al crear comisión:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } }
  }

  const tipoToText = (tipo: string) => {
    switch (tipo) {
      case 'POR':
        return 'Porcentaje'
      case 'FIJ':
        return 'Fijo'
      default:
        return tipo
    }
  }

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'POR':
        return 'bg-gradient-to-r from-purple-500 to-indigo-500'
      case 'FIJ':
        return 'bg-gradient-to-r from-emerald-500 to-teal-500'
      default:
        return 'bg-gradient-to-r from-blue-500 to-cyan-500'
    }
  }

  return (
    <div className="space-y-6">
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-violet-600 text-transparent bg-clip-text">
            Comisiones
          </h1>
          <p className="text-muted-foreground mt-2">
            Administra las comisiones de la pasarela de pagos
          </p>
        </div>
        <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-md">
              <FilePlus className="h-4 w-4" />
              <span>Nueva Comisión</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Crear Nueva Comisión</DialogTitle>
              <DialogDescription>
                Configura los detalles para la nueva comisión
              </DialogDescription>
            </DialogHeader>
            <AnimatePresence>
              {showSuccess ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-6"
                >
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-center">¡Comisión creada con éxito!</h3>
                  <p className="text-neutral-500 text-center text-sm mt-1">
                    La comisión ha sido registrada correctamente
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="tipo">
                        Tipo de Comisión
                      </label>
                      <select
                        id="tipo"
                        name="tipo"
                        value={formData.tipo}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md text-sm ${
                          formErrors.tipo ? 'border-red-500' : 'border-neutral-200'
                        }`}
                      >
                        <option value="POR">Porcentaje</option>
                        <option value="FIJ">Fijo</option>
                      </select>
                      {formErrors.tipo && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.tipo}</p>
                      )}
                      {formData.tipo === 'POR' && (
                        <p className="text-xs text-neutral-500 flex items-center mt-1">
                          <Info className="h-3 w-3 mr-1" />
                          El valor se interpretará como un porcentaje
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="montoBase">
                        {formData.tipo === 'POR' ? 'Porcentaje (%)' : 'Monto Base ($)'}
                      </label>
                      <Input
                        id="montoBase"
                        name="montoBase"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder={formData.tipo === 'POR' ? 'Ej: 2.5' : 'Ej: 10.00'}
                        value={formData.montoBase}
                        onChange={handleInputChange}
                        className={formErrors.montoBase ? 'border-red-500' : ''}
                      />
                      {formErrors.montoBase && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.montoBase}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="transaccionesBase">
                        Transacciones Base
                      </label>
                      <Input
                        id="transaccionesBase"
                        name="transaccionesBase"
                        type="number"
                        min="0"
                        step="1"
                        placeholder="Ej: 100"
                        value={formData.transaccionesBase}
                        onChange={handleInputChange}
                        className={formErrors.transaccionesBase ? 'border-red-500' : ''}
                      />
                      {formErrors.transaccionesBase && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.transaccionesBase}</p>
                      )}
                      <p className="text-xs text-neutral-500 flex items-center mt-1">
                        <Info className="h-3 w-3 mr-1" />
                        Cantidad de transacciones antes de aplicar la comisión
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleModalClose}
                      disabled={isSubmitting}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="bg-gradient-to-r from-indigo-500 to-purple-600"
                    >
                      {isSubmitting ? 'Creando...' : 'Crear Comisión'}
                    </Button>
                  </DialogFooter>
                </form>
              )}
            </AnimatePresence>
          </DialogContent>
        </Dialog>
      </motion.div>

      <Card className="backdrop-blur-sm bg-white/90 border border-neutral-200 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-transparent bg-clip-text font-bold">
              Listado de Comisiones
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Buscar comisión..."
                className="pl-8 h-9 w-64 rounded-md border border-input bg-background/50 backdrop-blur-sm px-3 py-1 text-sm shadow-sm"
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
                <div className="absolute animate-ping h-full w-full rounded-full bg-indigo-400 opacity-75"></div>
                <div className="relative rounded-full h-12 w-12 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
              </div>
            </div>
          ) : error ? (
            <div className="h-40 flex items-center justify-center">
              <div className="text-center text-red-500">
                {error}
              </div>
            </div>
          ) : comisionesFiltradas.length === 0 ? (
            <div className="h-40 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                No hay comisiones disponibles
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md backdrop-filter backdrop-blur-sm">
              <Table>
                <TableHeader className="bg-gradient-to-r from-neutral-50 to-neutral-100">
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Monto Base</TableHead>
                    <TableHead>Transacciones Base</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comisionesFiltradas.map((comision, index) => (
                    <motion.tr 
                      key={comision.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="border-b border-neutral-100"
                    >
                      <TableCell className="font-medium">{comision.codComision}</TableCell>
                      <TableCell>
                        <span className={`px-3 py-1 rounded-full text-xs text-white ${getTipoColor(comision.tipo)}`}>
                          {tipoToText(comision.tipo)}
                        </span>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {comision.tipo === 'POR' ? (
                          `${comision.montoBase.toFixed(2)}%`
                        ) : (
                          `$${comision.montoBase.toFixed(2)}`
                        )}
                      </TableCell>
                      <TableCell>{comision.transaccionesBase}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 hover:bg-indigo-50">
                            <Pencil className="h-4 w-4 text-indigo-600" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="rounded-full h-8 w-8 hover:bg-red-50"
                            onClick={() => comision.id && deleteComision(comision.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
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
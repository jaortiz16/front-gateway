'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, CreditCard, QrCode, Smartphone, Clock, Download, Filter, ArrowUpDown, Plus, LineChart, BarChart3, Info, ExternalLink } from 'lucide-react'

// Datos de ejemplo para POS
const transactions = [
  { id: 'TRX-0001', comercio: 'Farmacia Moderna', monto: 45.99, metodo: 'Tarjeta', estado: 'Completada', fecha: '2023-10-15 14:30:25' },
  { id: 'TRX-0002', comercio: 'Restaurante El Sabor', monto: 89.50, metodo: 'QR', estado: 'Completada', fecha: '2023-10-15 13:22:10' },
  { id: 'TRX-0003', comercio: 'Tienda Deportiva Run', monto: 125.75, metodo: 'Tarjeta', estado: 'Completada', fecha: '2023-10-15 11:45:32' },
  { id: 'TRX-0004', comercio: 'Cine City', monto: 35.00, metodo: 'Móvil', estado: 'Pendiente', fecha: '2023-10-15 10:15:43' },
  { id: 'TRX-0005', comercio: 'Supermercado Express', monto: 145.30, metodo: 'QR', estado: 'Rechazada', fecha: '2023-10-14 19:32:17' },
  { id: 'TRX-0006', comercio: 'Librería Central', monto: 56.25, metodo: 'Tarjeta', estado: 'Completada', fecha: '2023-10-14 16:11:05' },
  { id: 'TRX-0007', comercio: 'Café del Parque', monto: 12.75, metodo: 'Móvil', estado: 'Completada', fecha: '2023-10-14 14:22:38' },
]

export default function PointsOfSalesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredTransactions, setFilteredTransactions] = useState(transactions)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value
    setSearchTerm(term)
    
    if (!term.trim()) {
      setFilteredTransactions(transactions)
      return
    }
    
    const filtered = transactions.filter(trx => 
      trx.id.toLowerCase().includes(term.toLowerCase()) ||
      trx.comercio.toLowerCase().includes(term.toLowerCase())
    )
    setFilteredTransactions(filtered)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completada':
        return 'bg-green-100 text-green-800 hover:bg-green-200'
      case 'Pendiente':
        return 'bg-amber-100 text-amber-800 hover:bg-amber-200'
      case 'Rechazada':
        return 'bg-red-100 text-red-800 hover:bg-red-200'
      default:
        return 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200'
    }
  }

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'Tarjeta':
        return <CreditCard className="h-4 w-4 mr-1" />
      case 'QR':
        return <QrCode className="h-4 w-4 mr-1" />
      case 'Móvil':
        return <Smartphone className="h-4 w-4 mr-1" />
      default:
        return <CreditCard className="h-4 w-4 mr-1" />
    }
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  }

  const item = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0 }
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">
          Points of Sales
        </h1>
        <p className="text-neutral-500 mt-2">
          Monitorea las transacciones de puntos de venta de todos tus comercios
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-6">
        <motion.div 
          className="col-span-1 space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Tabs defaultValue="all" className="w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <TabsList className="mb-2 md:mb-0">
                <TabsTrigger value="all">Todas</TabsTrigger>
                <TabsTrigger value="completed">Completadas</TabsTrigger>
                <TabsTrigger value="pending">Pendientes</TabsTrigger>
              </TabsList>
              
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
                  <Input
                    type="search"
                    placeholder="Buscar transacción..."
                    className="pl-8 w-full md:w-[280px]"
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </div>
                
                <Button variant="outline" size="icon" className="rounded-md">
                  <Filter className="h-4 w-4" />
                </Button>
                
                <Button variant="outline" size="icon" className="rounded-md">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <TabsContent value="all">
              <Card className="border border-neutral-200 backdrop-blur-sm overflow-hidden">
                <CardHeader className="bg-neutral-50 px-6 py-4 border-b">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Transacciones Recientes</CardTitle>
                    <Button variant="outline" size="sm" className="h-8">
                      <ArrowUpDown className="h-3.5 w-3.5 mr-1.5" />
                      Ordenar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-6 py-3">ID</th>
                          <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-6 py-3">Comercio</th>
                          <th className="text-right text-xs font-medium text-neutral-500 uppercase tracking-wider px-6 py-3">Monto</th>
                          <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-6 py-3">Método</th>
                          <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-6 py-3">Estado</th>
                          <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-6 py-3">Fecha</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {filteredTransactions.length > 0 ? (
                          <motion.div variants={container} initial="hidden" animate="show" className="contents">
                            {filteredTransactions.map((trx, index) => (
                              <motion.tr key={trx.id} variants={item} className="hover:bg-neutral-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{trx.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{trx.comercio}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                                  ${trx.monto.toFixed(2)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  <div className="flex items-center">
                                    {getPaymentIcon(trx.metodo)}
                                    {trx.metodo}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <Badge variant="secondary" className={getStatusColor(trx.estado)}>
                                    {trx.estado}
                                  </Badge>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                                  <div className="flex items-center">
                                    <Clock className="h-3.5 w-3.5 mr-1.5" />
                                    {trx.fecha}
                                  </div>
                                </td>
                              </motion.tr>
                            ))}
                          </motion.div>
                        ) : (
                          <tr>
                            <td colSpan={6} className="px-6 py-10 text-center text-neutral-500">
                              No se encontraron transacciones
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t p-4 bg-neutral-50">
                  <div className="text-xs text-neutral-500">
                    Mostrando {filteredTransactions.length} de {transactions.length} transacciones
                  </div>
                  <Button variant="outline" size="sm">
                    Ver todas
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="completed">
              <Card>
                <CardHeader>
                  <CardTitle>Transacciones Completadas</CardTitle>
                  <CardDescription>Lista de transacciones finalizadas con éxito</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-neutral-500">
                    Contenido de transacciones completadas
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="pending">
              <Card>
                <CardHeader>
                  <CardTitle>Transacciones Pendientes</CardTitle>
                  <CardDescription>Lista de transacciones en proceso</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-neutral-500">
                    Contenido de transacciones pendientes
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
} 
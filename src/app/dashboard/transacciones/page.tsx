'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart, 
  Pie
} from 'recharts'
import { 
  Search, 
  CreditCard, 
  ArrowDown, 
  ArrowUp, 
  Calendar, 
  Filter, 
  Download, 
  RefreshCw,
  TrendingUp,
  Clock,
  Wallet,
  DollarSign,
  ArrowUpRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useTransaccionesStore, TransaccionDTO, TransaccionFiltros } from '@/store/useTransaccionesStore'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

type ChartDataItem = {
  name: string;
  value: number;
}

type PieDataItem = {
  name: string;
  value: number;
  color: string;
}

type StatsData = {
  totalTransacciones: number;
  valorTotal: number;
  tasaCompletadas: number;
}

export default function TransaccionesPage() {
  const { 
    transacciones, 
    loading, 
    error, 
    paginacion, 
    filtros,
    fetchTransacciones,
    setFiltros
  } = useTransaccionesStore()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [filteredTransactions, setFilteredTransactions] = useState<TransaccionDTO[]>([])
  const [chartData, setChartData] = useState<ChartDataItem[]>([])
  const [pieData, setPieData] = useState<PieDataItem[]>([])
  const [statsData, setStatsData] = useState<StatsData>({
    totalTransacciones: 0,
    valorTotal: 0,
    tasaCompletadas: 0
  })

  useEffect(() => {
    // Cargar transacciones al montar el componente
    fetchTransacciones()
  }, [fetchTransacciones])

  useEffect(() => {
    if (transacciones.length > 0) {
      // Filtrar transacciones según el término de búsqueda
      if (searchTerm.trim()) {
        const filtered = transacciones.filter(tx => 
          (tx.codTransaccion?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
          (tx.marca?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
        )
        setFilteredTransactions(filtered)
      } else {
        setFilteredTransactions(transacciones)
      }

      // Generar datos para gráficos
      generateChartData(transacciones)

      // Calcular estadísticas
      calculateStats(transacciones)
    } else {
      setFilteredTransactions([])
    }
  }, [transacciones, searchTerm])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    
    if (value === 'all') {
      fetchTransacciones({ estado: undefined })
    } else if (value === 'completed') {
      fetchTransacciones({ estado: 'ACT' })
    } else if (value === 'pending') {
      fetchTransacciones({ estado: 'PEN' })
    } else if (value === 'failed') {
      fetchTransacciones({ estado: 'REC' })
    }
  }

  const handlePageChange = (page: number) => {
    fetchTransacciones({ page })
  }

  const handleFilterChange = (key: string, value: string) => {
    // Si el valor es 'all', considerarlo como no filtrar por este campo (undefined)
    const filterValue = value === 'all' ? undefined : value;
    
    setFiltros({ [key]: filterValue } as Partial<TransaccionFiltros>)
    fetchTransacciones({ [key]: filterValue, page: 0 } as Partial<TransaccionFiltros>)
  }

  const handleRefresh = () => {
    fetchTransacciones()
  }

  const handleDateRangeChange = (range: { from: Date, to: Date }) => {
    const fechaInicio = range.from ? format(range.from, 'yyyy-MM-dd') : undefined
    const fechaFin = range.to ? format(range.to, 'yyyy-MM-dd') : undefined
    
    fetchTransacciones({ 
      fechaInicio,
      fechaFin,
      page: 0
    })
  }

  const generateChartData = (data: TransaccionDTO[]) => {
    // Convertir transacciones en datos para gráficos
    // Podríamos agrupar por hora del día, por ejemplo
    const hourlyData: ChartDataItem[] = Array(24).fill(0).map((_, i) => ({ 
      name: `${i.toString().padStart(2, '0')}:00`, 
      value: 0 
    }))

    // Agrupar transacciones por hora para el gráfico de área
    data.forEach(tx => {
      if (tx.fecha) {
        const date = new Date(tx.fecha)
        const hour = date.getHours()
        hourlyData[hour].value += 1
      }
    })

    setChartData(hourlyData)

    // Generar datos para el gráfico de torta por estado
    const estadosCounts = data.reduce((acc: Record<string, number>, tx) => {
      const estado = tx.estado || 'UNKNOWN'
      acc[estado] = (acc[estado] || 0) + 1
      return acc
    }, {})

    const pieColors: Record<string, string> = {
      'ACT': "#22c55e", // Activa/Completada
      'INA': "#ef4444", // Inactiva/Fallida
      'PEN': "#f59e0b", // Pendiente
      'REC': "#6b7280"  // Rechazada
    }

    const pieDataGenerated: PieDataItem[] = Object.entries(estadosCounts).map(([estado, count]) => ({
      name: getEstadoTexto(estado),
      value: count,
      color: pieColors[estado] || "#6b7280"
    }))

    setPieData(pieDataGenerated)
  }

  const calculateStats = (data: TransaccionDTO[]) => {
    const totalTransacciones = data.length
    const valorTotal = data.reduce((sum, tx) => sum + (tx.monto || 0), 0)
    const completadas = data.filter(tx => tx.estado === 'ACT').length
    const tasaCompletadas = totalTransacciones > 0 ? (completadas / totalTransacciones) * 100 : 0

    setStatsData({
      totalTransacciones,
      valorTotal,
      tasaCompletadas
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACT':
        return <CheckCircle className="h-4 w-4 text-green-600 mr-1.5" />
      case 'INA':
      case 'REC':
        return <XCircle className="h-4 w-4 text-red-600 mr-1.5" />
      case 'PEN':
        return <AlertCircle className="h-4 w-4 text-amber-600 mr-1.5" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACT':
        return 'bg-green-100 text-green-800 hover:bg-green-200'
      case 'PEN':
        return 'bg-amber-100 text-amber-800 hover:bg-amber-200'
      case 'INA':
      case 'REC':
        return 'bg-red-100 text-red-800 hover:bg-red-200'
      default:
        return 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200'
    }
  }

  const getEstadoTexto = (estado: string) => {
    switch (estado) {
      case 'ACT':
        return 'Completada'
      case 'INA':
        return 'Inactiva'
      case 'PEN':
        return 'Pendiente'
      case 'REC':
        return 'Rechazada'
      default:
        return estado
    }
  }

  const formatMoney = (amount: number | undefined) => {
    if (amount === undefined) return '$0.00'
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount)
  }
  
  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return format(date, 'dd/MM/yyyy HH:mm:ss', { locale: es })
  }
  
  // Stats cards data
  const statsCards = [
    {
      title: 'Total Transacciones',
      value: statsData.totalTransacciones.toString(),
      change: '+12%',
      icon: <Wallet className="h-5 w-5 text-white" />,
      color: 'from-blue-600 to-indigo-700'
    },
    {
      title: 'Valor Total',
      value: formatMoney(statsData.valorTotal),
      change: '+8%',
      icon: <DollarSign className="h-5 w-5 text-white" />,
      color: 'from-emerald-600 to-teal-700'
    },
    {
      title: 'Conversión',
      value: `${statsData.tasaCompletadas.toFixed(1)}%`,
      change: '+2%',
      icon: <TrendingUp className="h-5 w-5 text-white" />,
      color: 'from-indigo-600 to-purple-700'
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">
          Transacciones
        </h1>
        <p className="text-neutral-500 mt-2">
          Gestiona y monitorea todas las transacciones de la pasarela de pago
        </p>
      </motion.div>

      <motion.div 
        className="grid grid-cols-1 gap-4 md:grid-cols-3"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {statsCards.map((card, index) => (
          <motion.div key={index} variants={itemVariants}>
            <Card className="overflow-hidden h-full backdrop-blur-sm hover:shadow-md transition-all">
              <div className={`absolute inset-0 opacity-90 bg-gradient-to-br ${card.color} -z-10 rounded-lg`}></div>
              <div className="absolute inset-0 bg-white/80 dark:bg-black/20 z-0"></div>
              <CardHeader className="pb-2 relative z-10">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                  <div className="p-1.5 rounded-full bg-white/20 backdrop-blur-sm">
                    {card.icon}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-2xl font-bold">{card.value}</div>
                <div className="flex items-center gap-1 mt-1">
                  <div className="text-xs px-1 py-0.5 rounded-sm flex items-center bg-green-100 text-green-700">
                    <ArrowUpRight className="h-3 w-3 mr-0.5" />
                    {card.change}
                  </div>
                  <CardDescription>vs. mes anterior</CardDescription>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 backdrop-blur-md border border-neutral-200/50 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-white -z-10 opacity-50"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Actividad de Transacciones</CardTitle>
              <CardDescription>Últimas 24 horas</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-8" onClick={handleRefresh}>
                <RefreshCw className="h-3.5 w-3.5 mr-1" />
                Actualizar
              </Button>
              <DateRangePicker 
                initialDateFrom={new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)}
                initialDateTo={new Date()}
                onUpdate={handleDateRangeChange}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '8px', 
                      border: 'none', 
                      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                      fontSize: '12px' 
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#6366f1" 
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                    activeDot={{ r: 6 }} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-md border border-neutral-200/50 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-50 to-white -z-10 opacity-50"></div>
          <CardHeader>
            <CardTitle>Estado de Transacciones</CardTitle>
            <CardDescription>Distribución por estado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    labelLine={false}
                    label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value} transacciones`, 'Cantidad']}
                    contentStyle={{ 
                      borderRadius: '8px', 
                      border: 'none', 
                      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                      fontSize: '12px' 
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="backdrop-blur-md border border-neutral-200/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-white -z-10 opacity-50"></div>
        
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-xl bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent font-bold">
              Listado de Transacciones
            </CardTitle>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
                <Input
                  type="search"
                  placeholder="Buscar transacción..."
                  className="pl-8 w-full sm:w-[280px]"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-9">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
                <Button variant="outline" size="sm" className="h-9" onClick={handleRefresh}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Actualizar
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>

        <div className="px-4 pb-2 flex flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Select 
              value={filtros.tipo || 'all'} 
              onValueChange={(value) => handleFilterChange('tipo', value)}
            >
              <SelectTrigger className="h-8 w-[180px]">
                <SelectValue placeholder="Tipo de Transacción" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="PAG">Pago</SelectItem>
                <SelectItem value="RET">Retiro</SelectItem>
                <SelectItem value="TRA">Transferencia</SelectItem>
                <SelectItem value="DEV">Devolución</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Select 
              value={filtros.marca || 'all'} 
              onValueChange={(value) => handleFilterChange('marca', value)}
            >
              <SelectTrigger className="h-8 w-[180px]">
                <SelectValue placeholder="Marca de Tarjeta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las marcas</SelectItem>
                <SelectItem value="VISA">VISA</SelectItem>
                <SelectItem value="MAST">Mastercard</SelectItem>
                <SelectItem value="AMEX">American Express</SelectItem>
                <SelectItem value="DISC">Discover</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Select 
              value={filtros.moneda || 'all'} 
              onValueChange={(value) => handleFilterChange('moneda', value)}
            >
              <SelectTrigger className="h-8 w-[180px]">
                <SelectValue placeholder="Moneda" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las monedas</SelectItem>
                <SelectItem value="USD">USD - Dólar Americano</SelectItem>
                <SelectItem value="EUR">EUR - Euro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange} className="px-4">
          <TabsList className="mb-4">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="completed">Completadas</TabsTrigger>
            <TabsTrigger value="pending">Pendientes</TabsTrigger>
            <TabsTrigger value="failed">Rechazadas</TabsTrigger>
          </TabsList>

          <CardContent className="p-0 pb-4">
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
            ) : filteredTransactions.length === 0 ? (
              <div className="h-40 flex items-center justify-center">
                <div className="text-center text-neutral-500">
                  No se encontraron transacciones
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-6 py-3">ID</th>
                      <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-6 py-3">Marca</th>
                      <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-6 py-3">Tipo</th>
                      <th className="text-right text-xs font-medium text-neutral-500 uppercase tracking-wider px-6 py-3">Monto</th>
                      <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-6 py-3">Estado</th>
                      <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-6 py-3">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <motion.div variants={containerVariants} initial="hidden" animate="show" className="contents">
                      {filteredTransactions.map((tx, index) => (
                        <motion.tr key={tx.codTransaccion || index} variants={itemVariants} className="hover:bg-neutral-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{tx.codTransaccion}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">{tx.marca}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">{tx.tipo}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                            {formatMoney(tx.monto)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant="secondary" className={getStatusColor(tx.estado || '')}>
                              <div className="flex items-center">
                                {getStatusIcon(tx.estado || '')}
                                {getEstadoTexto(tx.estado || '')}
                              </div>
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                            <div className="flex items-center">
                              <Clock className="h-3.5 w-3.5 mr-1.5" />
                              {formatDate(tx.fecha)}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </motion.div>
                  </tbody>
                </table>
              </div>
            )}

            {/* Paginación */}
            {!loading && !error && paginacion.totalPages > 0 && (
              <div className="flex justify-between items-center px-6 py-3 border-t">
                <div className="text-sm text-neutral-500">
                  Mostrando página {paginacion.pageNumber + 1} de {paginacion.totalPages}
                </div>
                <div className="flex items-center gap-1">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handlePageChange(paginacion.pageNumber - 1)}
                    disabled={paginacion.pageNumber === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handlePageChange(paginacion.pageNumber + 1)}
                    disabled={paginacion.pageNumber === paginacion.totalPages - 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Tabs>
      </Card>
    </div>
  )
} 
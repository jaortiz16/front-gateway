'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CreditCard, DollarSign, FileText, Store, Repeat, TrendingUp, Calendar, ChevronUp, ChevronDown, ArrowUpRight, Activity, Download } from 'lucide-react'
import { useComerciosStore, useComisionesStore, useTransaccionesRecurrentesStore } from '@/store/useStore'
import { motion } from 'framer-motion'
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
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Datos de ejemplo para los gráficos
const transactionData = [
  { name: 'Ene', amount: 2400 },
  { name: 'Feb', amount: 1398 },
  { name: 'Mar', amount: 9800 },
  { name: 'Abr', amount: 3908 },
  { name: 'May', amount: 4800 },
  { name: 'Jun', amount: 3800 },
  { name: 'Jul', amount: 4300 },
]

const pieData = [
  { name: 'Tarjetas', value: 540 },
  { name: 'Transferencias', value: 320 },
  { name: 'Débito', value: 210 },
  { name: 'Otros', value: 120 }
]

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#14b8a6']

export default function DashboardPage() {
  const { comercios, fetchComercios } = useComerciosStore()
  const { comisiones, fetchComisiones } = useComisionesStore()
  const { transacciones, fetchTransacciones } = useTransaccionesRecurrentesStore()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          fetchComercios(),
          fetchComisiones(),
          fetchTransacciones()
        ])
      } catch (error) {
        console.error('Error al cargar los datos:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [fetchComercios, fetchComisiones, fetchTransacciones])

  const resumenCards = [
    {
      title: 'Comercios',
      value: comercios.length,
      change: '+12%',
      changeUp: true,
      description: 'vs. mes anterior',
      icon: <Store className="h-5 w-5 text-white" />,
      link: '/dashboard/comercios',
      color: 'from-blue-600 to-indigo-700'
    },
    {
      title: 'Transacciones Recurrentes',
      value: transacciones.length,
      change: '+8%',
      changeUp: true,
      description: 'vs. mes anterior',
      icon: <Repeat className="h-5 w-5 text-white" />,
      link: '/dashboard/transacciones-recurrentes',
      color: 'from-purple-600 to-indigo-800'
    },
    {
      title: 'Comisiones',
      value: comisiones.length,
      change: '-3%',
      changeUp: false,
      description: 'vs. mes anterior',
      icon: <DollarSign className="h-5 w-5 text-white" />,
      link: '/dashboard/comisiones',
      color: 'from-pink-500 to-purple-700'
    },
    {
      title: 'Facturaciones',
      value: '18',
      change: '+5%',
      changeUp: true,
      description: 'vs. mes anterior',
      icon: <FileText className="h-5 w-5 text-white" />,
      link: '/dashboard/facturaciones',
      color: 'from-teal-500 to-emerald-600'
    }
  ]

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
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  }

  return (
    <div className="space-y-8">
      <div>
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">
            Panel de Control
          </h1>
          <p className="text-neutral-500 mt-2">
            Bienvenido al sistema de administración de la pasarela de pagos
          </p>
        </motion.div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-2 w-[300px]">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="analytics">Estadísticas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="pb-2">
                    <div className="h-5 w-24 bg-neutral-200 rounded"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-8 w-16 bg-neutral-200 rounded mb-1"></div>
                    <div className="h-4 w-40 bg-neutral-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
              variants={container}
              initial="hidden"
              animate="show"
            >
              {resumenCards.map((card, index) => (
                <motion.div key={index} variants={item}>
                  <Link href={card.link}>
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
                          <div className={`text-xs px-1 py-0.5 rounded-sm flex items-center ${card.changeUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {card.changeUp ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                            {card.change}
                          </div>
                          <CardDescription>{card.description}</CardDescription>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2 group backdrop-blur-md border border-neutral-200/50 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-white -z-10 opacity-50"></div>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Transacciones</CardTitle>
                  <CardDescription>Últimos 7 días</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-green-600 flex items-center">
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    +12.5%
                  </span>
                  <Button variant="outline" size="sm" className="h-8">
                    <Download className="h-3.5 w-3.5 mr-1" />
                    Exportar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[240px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={transactionData}
                      margin={{ top: 5, right: 0, left: 0, bottom: 5 }}
                    >
                      <defs>
                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ 
                          background: 'white', 
                          border: 'none', 
                          borderRadius: '8px', 
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' 
                        }} 
                      />
                      <CartesianGrid vertical={false} stroke="#f0f0f0" />
                      <Area 
                        type="monotone" 
                        dataKey="amount" 
                        stroke="#6366f1" 
                        strokeWidth={2} 
                        fillOpacity={1} 
                        fill="url(#colorAmount)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-md border border-neutral-200/50 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-white -z-10 opacity-50"></div>
              <CardHeader>
                <CardTitle>Métodos de Pago</CardTitle>
                <CardDescription>Distribución por tipo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[240px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          background: 'white', 
                          border: 'none', 
                          borderRadius: '8px', 
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' 
                        }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {pieData.map((entry, index) => (
                    <div key={index} className="flex items-center text-xs">
                      <div className="w-3 h-3 mr-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                      <span className="font-medium">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="border border-neutral-200/50 backdrop-blur-md relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-white -z-10 opacity-50"></div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-indigo-600" />
                  Actividad Reciente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="p-2 rounded-full bg-indigo-100">
                        <Activity className="h-4 w-4 text-indigo-600" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          {['Nueva transacción', 'Comercio actualizado', 'Comisión modificada', 'Factura generada', 'Alerta de sistema'][i]}
                        </p>
                        <div className="flex gap-2 text-xs text-neutral-500">
                          <span>Hace {i + 1} {i === 0 ? 'hora' : 'horas'}</span>
                          <span>•</span>
                          <span>{['#TRX-2023', '#COM-1039', '#FEE-3921', '#INV-5302', '#ALT-0193'][i]}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="border border-neutral-200/50 backdrop-blur-md relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-rose-50 to-white -z-10 opacity-50"></div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5 text-indigo-600" />
                  Comercios Recientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {comercios.length > 0 ? (
                  <div className="space-y-4">
                    {comercios.slice(0, 5).map((comercio) => (
                      <div key={comercio.codigoComercio} className="flex items-center justify-between p-3 rounded-lg hover:bg-neutral-50 transition-colors">
                        <div>
                          <div className="font-medium">{comercio.nombreComercial}</div>
                          <div className="text-xs text-neutral-500">{comercio.ruc}</div>
                        </div>
                        <div className={`text-xs rounded-full px-2 py-1 ${
                          comercio.estado === 'ACT' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-neutral-100 text-neutral-700'
                        }`}>
                          {comercio.estado === 'ACT' ? 'Activo' : 'Inactivo'}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-neutral-500 py-8 text-center">
                    No hay comercios registrados.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-6">
          <Card className="border border-neutral-200/50 backdrop-blur-md relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-white -z-10 opacity-50"></div>
            <CardHeader>
              <CardTitle>Tendencias de Transacciones</CardTitle>
              <CardDescription>Análisis por tipo de transacción</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: 'Lun', debito: 300, credito: 400, efectivo: 200 },
                      { name: 'Mar', debito: 500, credito: 600, efectivo: 300 },
                      { name: 'Mie', debito: 700, credito: 800, efectivo: 400 },
                      { name: 'Jue', debito: 400, credito: 500, efectivo: 230 },
                      { name: 'Vie', debito: 600, credito: 700, efectivo: 350 },
                      { name: 'Sab', debito: 800, credito: 900, efectivo: 450 },
                      { name: 'Dom', debito: 200, credito: 300, efectivo: 150 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{ 
                        background: 'white', 
                        border: 'none', 
                        borderRadius: '8px', 
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' 
                      }}
                    />
                    <Bar dataKey="debito" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="credito" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="efectivo" fill="#d946ef" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 
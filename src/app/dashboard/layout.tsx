'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/common/Sidebar'
import { Button } from '@/components/ui/button'
import { useSidebarStore } from '@/store/useStore'
import { cn } from '@/lib/utils'
import { Bell, Menu, User, X, ChevronDown, Settings, LogOut, ExternalLink } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface DashboardLayoutProps {
  children: React.ReactNode
}

// Notificaciones de ejemplo
const notificaciones = [
  {
    id: 1,
    titulo: 'Nueva transacción recibida',
    mensaje: 'Se ha registrado una nueva transacción por $124.99',
    fecha: '10 min',
    leida: false,
    tipo: 'transaccion'
  },
  {
    id: 2,
    titulo: 'Facturación completada',
    mensaje: 'La facturación del período actual se ha completado correctamente',
    fecha: '2 horas',
    leida: false,
    tipo: 'facturacion'
  },
  {
    id: 3,
    titulo: 'Nuevo comercio registrado',
    mensaje: 'Tienda El Barrio se ha registrado en la plataforma',
    fecha: '1 día',
    leida: true,
    tipo: 'comercio'
  },
  {
    id: 4,
    titulo: 'Alerta de seguridad',
    mensaje: 'Se ha detectado un intento de acceso inusual a tu cuenta',
    fecha: '3 días',
    leida: true,
    tipo: 'alerta'
  }
]

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { toggleSidebar, isCollapsed } = useSidebarStore()
  const [notificacionesState, setNotificacionesState] = useState(notificaciones)
  const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false)

  const notificacionesSinLeer = notificacionesState.filter(n => !n.leida).length

  const marcarComoLeida = (id: number) => {
    setNotificacionesState(notificacionesState.map(n => 
      n.id === id ? { ...n, leida: true } : n
    ))
  }

  const marcarTodasComoLeidas = () => {
    setNotificacionesState(notificacionesState.map(n => ({ ...n, leida: true })))
  }

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'transaccion':
        return <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
      case 'facturacion':
        return <div className="w-2 h-2 rounded-full bg-green-500"></div>
      case 'comercio':
        return <div className="w-2 h-2 rounded-full bg-amber-500"></div>
      case 'alerta':
        return <div className="w-2 h-2 rounded-full bg-red-500"></div>
      default:
        return <div className="w-2 h-2 rounded-full bg-neutral-500"></div>
    }
  }

  return (
    <div className="flex h-full bg-neutral-50">
      <Sidebar />
      <div 
        className="flex-1 flex flex-col"
        style={{
          marginLeft: isCollapsed ? '80px' : '256px',
          transition: 'margin-left 0.3s ease-in-out'
        }}
      >
        <header className="h-16 border-b flex items-center justify-between px-4 bg-white backdrop-blur-sm shadow-sm z-10">
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              className="md:hidden p-0 w-10 h-10 rounded-full"
              onClick={toggleSidebar}
            >
              <Menu className="h-6 w-6" />
            </Button>
            <div className="md:hidden bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-semibold">
              Payment Gateway
            </div>
          </div>
          
          <div className="text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hidden md:flex items-center">
            <Badge variant="outline" className="mr-2 border-indigo-200 bg-indigo-50 text-indigo-700">
              Admin
            </Badge>
            Panel de Administración
          </div>
          
          <div className="flex items-center gap-3">
            <Popover open={mostrarNotificaciones} onOpenChange={setMostrarNotificaciones}>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full relative hover:bg-indigo-50"
                >
                  <Bell className="h-5 w-5 text-neutral-600" />
                  {notificacionesSinLeer > 0 && (
                    <span className="absolute top-1 right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent 
                side="bottom" 
                align="end" 
                className="w-80 p-0 backdrop-blur-lg bg-white/95 border-neutral-200/80 shadow-xl"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
                  <h3 className="font-semibold text-sm">Notificaciones</h3>
                  {notificacionesSinLeer > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 text-xs"
                      onClick={marcarTodasComoLeidas}
                    >
                      Marcar todas como leídas
                    </Button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto py-1">
                  {notificacionesState.length > 0 ? (
                    <AnimatePresence>
                      {notificacionesState.map((notificacion) => (
                        <motion.div
                          key={notificacion.id}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className={cn(
                            "px-4 py-2.5 border-b border-neutral-100 last:border-0 cursor-pointer transition-colors hover:bg-neutral-50",
                            !notificacion.leida && "bg-indigo-50/40"
                          )}
                          onClick={() => marcarComoLeida(notificacion.id)}
                        >
                          <div className="flex items-start gap-2">
                            <div className="mt-0.5">
                              {getTipoIcon(notificacion.tipo)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className={cn(
                                  "text-sm",
                                  !notificacion.leida && "font-medium"
                                )}>
                                  {notificacion.titulo}
                                </h4>
                                <span className="text-xs text-neutral-500 whitespace-nowrap ml-2">
                                  {notificacion.fecha}
                                </span>
                              </div>
                              <p className="text-xs text-neutral-600 mt-0.5 line-clamp-2">{notificacion.mensaje}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  ) : (
                    <div className="p-4 text-center text-sm text-neutral-500">
                      No tienes notificaciones
                    </div>
                  )}
                </div>
                <div className="px-4 py-2 border-t border-neutral-100">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full text-xs text-indigo-600 hover:text-indigo-700 justify-center"
                    onClick={() => setMostrarNotificaciones(false)}
                  >
                    Ver todas las notificaciones
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="rounded-full h-10 p-1 hover:bg-neutral-100">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/images/avatar.png" alt="User" />
                      <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:flex flex-col items-start">
                      <span className="text-xs font-medium">Administrador</span>
                      <span className="text-xs text-neutral-500">admin@example.com</span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-neutral-400 hidden md:block" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 backdrop-blur-md bg-white/95">
                <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <User className="h-4 w-4 mr-2" />
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="h-4 w-4 mr-2" />
                  Configuración
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-500 cursor-pointer">
                  <LogOut className="h-4 w-4 mr-2" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        
        <motion.main 
          className="flex-1 overflow-auto p-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </motion.main>
      </div>
    </div>
  )
} 
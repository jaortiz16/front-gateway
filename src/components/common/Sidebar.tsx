'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useSidebarStore } from '@/store/useStore'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { 
  CreditCard, 
  DollarSign, 
  FileText, 
  LayoutDashboard, 
  Menu, 
  ShoppingBag, 
  Store, 
  Repeat,
  X,
  ChevronLeft,
  ChevronRight,
  CreditCardIcon
} from 'lucide-react'

interface SidebarItemProps {
  href: string
  icon: React.ReactNode
  label: string
  active?: boolean
  onClick?: () => void
  collapsed?: boolean
}

const SidebarItem = ({ 
  href, 
  icon, 
  label, 
  active,
  onClick,
  collapsed = false
}: SidebarItemProps) => {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
        active 
          ? 'bg-gradient-to-r from-indigo-500/90 to-purple-600/90 text-white shadow-md' 
          : 'text-neutral-600 hover:bg-indigo-50/80 hover:text-indigo-700',
        collapsed && 'justify-center px-2'
      )}
    >
      <div className={active ? 'text-white' : 'text-neutral-500'}>
        {icon}
      </div>
      {!collapsed && (
        <span className={cn(
          'transition-opacity duration-200',
          collapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'
        )}>
          {label}
        </span>
      )}
      {active && !collapsed && (
        <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white/80"></div>
      )}
    </Link>
  )
}

export const Sidebar = () => {
  const pathname = usePathname()
  const { isOpen, toggleSidebar, closeSidebar, isCollapsed, toggleCollapsed } = useSidebarStore()
  
  const routes = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />
    },
    {
      href: '/dashboard/transacciones',
      label: 'Transacciones',
      icon: <CreditCard className="h-5 w-5" />
    },
    {
      href: '/dashboard/transacciones-recurrentes',
      label: 'Trans. Recurrentes',
      icon: <Repeat className="h-5 w-5" />
    },
    {
      href: '/dashboard/comisiones',
      label: 'Comisiones',
      icon: <DollarSign className="h-5 w-5" />
    },
    {
      href: '/dashboard/facturaciones',
      label: 'Facturaciones',
      icon: <FileText className="h-5 w-5" />
    },
    {
      href: '/dashboard/comercios',
      label: 'Gestión de Comercios',
      icon: <Store className="h-5 w-5" />
    },
    {
      href: '/dashboard/pos-comercio',
      label: 'Points of Sales',
      icon: <ShoppingBag className="h-5 w-5" />
    }
  ]

  // Sidebar móvil
  const MobileSidebar = () => {
    return (
      <Sheet open={isOpen} onOpenChange={toggleSidebar}>
        <SheetTrigger asChild>
          <Button 
            variant="ghost" 
            className="md:hidden p-0 w-10 h-10 rounded-full"
            onClick={toggleSidebar}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-72 bg-gradient-to-b from-white to-neutral-50">
          <div className="flex flex-col h-full pt-5">
            <div className="px-4 flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-md bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-md">
                  <CreditCard className="h-4 w-4 text-white" />
                </div>
                <div className="font-bold text-lg bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Payment Gateway
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleSidebar} 
                className="rounded-full hover:bg-red-50"
              >
                <X className="h-4 w-4 text-red-500" />
              </Button>
            </div>
            <div className="flex-1 px-2 space-y-1">
              {routes.map((route) => (
                <motion.div
                  key={route.href}
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <SidebarItem
                    href={route.href}
                    icon={route.icon}
                    label={route.label}
                    active={pathname === route.href}
                    onClick={closeSidebar}
                  />
                </motion.div>
              ))}
            </div>
            <div className="p-4 text-xs text-neutral-500 border-t border-neutral-100">
              <p>© 2025 Payment Gateway</p>
              <p>versión 1.0.0</p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  // Sidebar desktop
  const DesktopSidebar = () => {
    return (
      <motion.div 
        className={cn(
          "hidden md:flex flex-col h-full bg-gradient-to-b from-white to-neutral-50 border-r shadow-sm relative",
          isCollapsed ? "w-20" : "w-64"
        )}
        initial={false}
        animate={{ width: isCollapsed ? 80 : 256 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className={cn(
          "h-16 border-b flex items-center px-4",
          isCollapsed ? "justify-center" : "justify-start"
        )}>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-md bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
              <CreditCard className="h-5 w-5 text-white" />
            </div>
            {!isCollapsed && (
              <div className="font-bold text-xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                PayGateway
              </div>
            )}
          </div>
          
          {/* Botón flotante para colapsar */}
          <Button
            variant="default"
            size="icon"
            onClick={toggleCollapsed}
            className="absolute -right-3 top-12 h-7 w-7 rounded-full shadow-md bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 flex items-center justify-center border border-white"
          >
            {isCollapsed ? (
              <ChevronRight className="h-3.5 w-3.5 text-white" />
            ) : (
              <ChevronLeft className="h-3.5 w-3.5 text-white" />
            )}
          </Button>
        </div>
        
        <div className="flex-1 py-5 px-3 space-y-2 overflow-y-auto">
          {routes.map((route) => (
            <SidebarItem
              key={route.href}
              href={route.href}
              icon={route.icon}
              label={route.label}
              active={pathname === route.href}
              collapsed={isCollapsed}
            />
          ))}
        </div>
        
        <div className="p-3 border-t text-xs text-center text-neutral-500">
          <p>© 2025 PayGateway</p>
        </div>
      </motion.div>
    )
  }

  return (
    <>
      <MobileSidebar />
      <DesktopSidebar />
    </>
  )
} 
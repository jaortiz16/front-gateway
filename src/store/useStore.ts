import { create } from 'zustand';

interface SidebarState {
  isOpen: boolean;
  isCollapsed: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  toggleCollapsed: () => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isOpen: false,
  isCollapsed: false,
  toggleSidebar: () => set((state) => ({ isOpen: !state.isOpen })),
  closeSidebar: () => set({ isOpen: false }),
  toggleCollapsed: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
}));

// Store para transacciones recurrentes
interface TransaccionRecurrente {
  codigo?: string;
  monto: number;
  marca: string;
  estado: string;
  fechaInicio: string;
  fechaFin: string;
  diaMesPago: number;
  swiftBanco: string;
  cuentaIban: string;
  moneda: string;
  pais: string;
  tarjeta: number;
  fechaCaducidad: string;
  cvv: string;
  frecuenciaDias: number;
}

interface TransaccionesRecurrentesState {
  transacciones: TransaccionRecurrente[];
  loading: boolean;
  error: string | null;
  fetchTransacciones: () => Promise<void>;
  createTransaccion: (data: TransaccionRecurrente) => Promise<void>;
}

export const useTransaccionesRecurrentesStore = create<TransaccionesRecurrentesState>((set) => ({
  transacciones: [],
  loading: false,
  error: null,
  fetchTransacciones: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('http://localhost:8080/v1/transacciones-recurrentes');
      const data = await response.json();
      set({ transacciones: data, loading: false });
    } catch (error) {
      set({ error: 'Error al cargar las transacciones recurrentes', loading: false });
    }
  },
  createTransaccion: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('http://localhost:8080/v1/transacciones-recurrentes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Error al crear la transacción recurrente');
      }
      const createdData = await response.json();
      set((state) => ({
        transacciones: [...state.transacciones, createdData],
        loading: false,
      }));
    } catch (error) {
      set({ error: 'Error al crear la transacción recurrente', loading: false });
    }
  },
}));

// Store para comisiones
interface Comision {
  id?: string;
  codComision?: string;
  tipo: string;
  montoBase: number;
  transaccionesBase: number;
}

interface ComisionesState {
  comisiones: Comision[];
  loading: boolean;
  error: string | null;
  fetchComisiones: () => Promise<void>;
  createComision: (data: Comision) => Promise<void>;
  updateComision: (id: string, data: Comision) => Promise<void>;
  deleteComision: (id: string) => Promise<void>;
}

export const useComisionesStore = create<ComisionesState>((set) => ({
  comisiones: [],
  loading: false,
  error: null,
  fetchComisiones: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('http://localhost:8083/v1/comisiones');
      const data = await response.json();
      set({ comisiones: data, loading: false });
    } catch (error) {
      set({ error: 'Error al cargar las comisiones', loading: false });
    }
  },
  createComision: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('http://localhost:8083/v1/comisiones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Error al crear la comisión');
      }
      const createdData = await response.json();
      set((state) => ({
        comisiones: [...state.comisiones, createdData],
        loading: false,
      }));
    } catch (error) {
      set({ error: 'Error al crear la comisión', loading: false });
    }
  },
  updateComision: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`http://localhost:8083/v1/comisiones/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Error al actualizar la comisión');
      }
      const updatedData = await response.json();
      set((state) => ({
        comisiones: state.comisiones.map((c) => (c.id === id ? updatedData : c)),
        loading: false,
      }));
    } catch (error) {
      set({ error: 'Error al actualizar la comisión', loading: false });
    }
  },
  deleteComision: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`http://localhost:8083/v1/comisiones/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Error al eliminar la comisión');
      }
      set((state) => ({
        comisiones: state.comisiones.filter((c) => c.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({ error: 'Error al eliminar la comisión', loading: false });
    }
  },
}));

// Store para comercios
interface Comercio {
  codigoComercio: string;
  codigoInterno: string;
  ruc: string;
  razonSocial: string;
  nombreComercial: string;
  fechaCreacion?: string;
  codigoComision: number;
  estado: string;
  swiftBanco: string;
  cuentaIban: string;
  fechaActivacion?: string;
  fechaSuspension?: string | null;
}

interface ComerciosState {
  comercios: Comercio[];
  loading: boolean;
  error: string | null;
  fetchComercios: () => Promise<void>;
  createComercio: (data: Comercio) => Promise<void>;
}

export const useComerciosStore = create<ComerciosState>((set) => ({
  comercios: [],
  loading: false,
  error: null,
  fetchComercios: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('http://localhost:8080/v1/comercios');
      const data = await response.json();
      set({ comercios: data.content || [], loading: false });
    } catch (error) {
      set({ error: 'Error al cargar los comercios', loading: false });
    }
  },
  createComercio: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('http://localhost:8080/v1/comercios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Error al crear el comercio');
      }
      const createdData = await response.json();
      set((state) => ({
        comercios: [...state.comercios, createdData],
        loading: false,
      }));
    } catch (error) {
      set({ error: 'Error al crear el comercio', loading: false });
    }
  },
})); 
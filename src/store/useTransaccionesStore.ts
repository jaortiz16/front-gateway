import { create } from 'zustand';
import axios from 'axios';

// Base URL para la API de transacciones
const API_URL = 'http://transaccionsimple-alb-705840120.us-east-2.elb.amazonaws.com/api/v1/transacciones';

// Interfaces
export interface TransaccionDTO {
  codTransaccion?: string;
  codigoUnico?: string;
  numeroCuenta?: string;
  numeroTarjeta?: string;
  tipo?: string;
  monto?: number;
  moneda?: string;
  tasaCambio?: number;
  montoOrigen?: number;
  monedaOrigen?: string;
  marca?: string;
  estado?: string;
  descripcion?: string;
  pais?: string;
  comercio?: string;
  sede?: string;
  terminal?: string;
  fecha?: string;
  fechaActualizacion?: string;
}

export interface TransaccionFiltros {
  page?: number;
  size?: number;
  sort?: string;
  codigoUnico?: string;
  numeroTarjeta?: string;
  tipo?: string;
  moneda?: string;
  marca?: string;
  estado?: string;
  pais?: string;
  comercio?: string;
  montoMin?: number;
  montoMax?: number;
  fechaInicio?: string;
  fechaFin?: string;
}

export interface PageResponseDTO<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    unpaged: boolean;
    paged: boolean;
  };
  last: boolean;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

// Estado del store
interface TransaccionesState {
  transacciones: TransaccionDTO[];
  transaccionActual: TransaccionDTO | null;
  loading: boolean;
  error: string | null;
  paginacion: {
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
  };
  filtros: TransaccionFiltros;

  // Métodos
  fetchTransacciones: (filtros?: Partial<TransaccionFiltros>) => Promise<void>;
  fetchTransaccionPorId: (id: string) => Promise<void>;
  fetchTransaccionPorCodigoUnico: (codigoUnico: string) => Promise<void>;
  fetchTransaccionesPorTarjeta: (numeroTarjeta: string) => Promise<void>;
  fetchTransaccionesPorMoneda: (moneda: string) => Promise<void>;
  fetchTransaccionesPorPais: (pais: string) => Promise<void>;
  fetchTransaccionesPorMonto: (montoMin: number, montoMax: number) => Promise<void>;
  setFiltros: (filtros: Partial<TransaccionFiltros>) => void;
  resetTransaccionActual: () => void;
}

export const useTransaccionesStore = create<TransaccionesState>((set, get) => ({
  transacciones: [],
  transaccionActual: null,
  loading: false,
  error: null,
  paginacion: {
    pageNumber: 0,
    pageSize: 10,
    totalPages: 0,
    totalElements: 0
  },
  filtros: {
    page: 0,
    size: 10,
    sort: 'fecha,desc'
  },

  // Método para establecer filtros
  setFiltros: (filtros: Partial<TransaccionFiltros>) => {
    set((state) => ({
      filtros: {
        ...state.filtros,
        ...filtros
      }
    }));
  },

  // Método para buscar transacciones con filtros y paginación
  fetchTransacciones: async (filtros?: Partial<TransaccionFiltros>) => {
    set({ loading: true, error: null });
    
    try {
      const currentFiltros = get().filtros;
      const aplicarFiltros = { ...currentFiltros, ...filtros };
      
      // Construir query params
      const params = new URLSearchParams();
      
      // Añadir parámetros de paginación y ordenamiento
      if (aplicarFiltros.page !== undefined) params.append('page', aplicarFiltros.page.toString());
      if (aplicarFiltros.size !== undefined) params.append('size', aplicarFiltros.size.toString());
      if (aplicarFiltros.sort) params.append('sort', aplicarFiltros.sort);
      
      // Añadir filtros
      if (aplicarFiltros.codigoUnico) params.append('codigoUnico', aplicarFiltros.codigoUnico);
      if (aplicarFiltros.numeroTarjeta) params.append('numeroTarjeta', aplicarFiltros.numeroTarjeta);
      if (aplicarFiltros.tipo) params.append('tipo', aplicarFiltros.tipo);
      if (aplicarFiltros.moneda) params.append('moneda', aplicarFiltros.moneda);
      if (aplicarFiltros.marca) params.append('marca', aplicarFiltros.marca);
      if (aplicarFiltros.estado) params.append('estado', aplicarFiltros.estado);
      if (aplicarFiltros.pais) params.append('pais', aplicarFiltros.pais);
      if (aplicarFiltros.comercio) params.append('comercio', aplicarFiltros.comercio);
      if (aplicarFiltros.montoMin !== undefined) params.append('montoMin', aplicarFiltros.montoMin.toString());
      if (aplicarFiltros.montoMax !== undefined) params.append('montoMax', aplicarFiltros.montoMax.toString());
      if (aplicarFiltros.fechaInicio) params.append('fechaInicio', aplicarFiltros.fechaInicio);
      if (aplicarFiltros.fechaFin) params.append('fechaFin', aplicarFiltros.fechaFin);
      
      const response = await axios.get<PageResponseDTO<TransaccionDTO>>(`${API_URL}?${params.toString()}`);
      
      set({
        transacciones: response.data.content,
        paginacion: {
          pageNumber: response.data.number,
          pageSize: response.data.size,
          totalPages: response.data.totalPages,
          totalElements: response.data.totalElements
        },
        loading: false,
        filtros: aplicarFiltros
      });
    } catch (error) {
      console.error('Error al obtener transacciones:', error);
      set({ 
        loading: false, 
        error: error instanceof Error ? error.message : 'Error al obtener transacciones' 
      });
    }
  },

  // Método para buscar una transacción por ID
  fetchTransaccionPorId: async (id: string) => {
    set({ loading: true, error: null, transaccionActual: null });
    
    try {
      const response = await axios.get<TransaccionDTO>(`${API_URL}/${id}`);
      set({ transaccionActual: response.data, loading: false });
    } catch (error) {
      console.error(`Error al obtener transacción con ID ${id}:`, error);
      set({ 
        loading: false, 
        error: error instanceof Error ? error.message : `Error al obtener transacción con ID ${id}` 
      });
    }
  },

  // Método para buscar una transacción por código único
  fetchTransaccionPorCodigoUnico: async (codigoUnico: string) => {
    set({ loading: true, error: null, transaccionActual: null });
    
    try {
      const response = await axios.get<TransaccionDTO>(`${API_URL}/codigo-unico/${codigoUnico}`);
      set({ transaccionActual: response.data, loading: false });
    } catch (error) {
      console.error(`Error al obtener transacción con código único ${codigoUnico}:`, error);
      set({ 
        loading: false, 
        error: error instanceof Error ? error.message : `Error al obtener transacción con código único ${codigoUnico}` 
      });
    }
  },

  // Método para buscar transacciones por número de tarjeta
  fetchTransaccionesPorTarjeta: async (numeroTarjeta: string) => {
    set({ loading: true, error: null });
    
    try {
      const response = await axios.get<PageResponseDTO<TransaccionDTO>>(`${API_URL}/tarjeta/${numeroTarjeta}`);
      
      set({
        transacciones: response.data.content,
        paginacion: {
          pageNumber: response.data.number,
          pageSize: response.data.size,
          totalPages: response.data.totalPages,
          totalElements: response.data.totalElements
        },
        loading: false
      });
    } catch (error) {
      console.error(`Error al obtener transacciones por tarjeta ${numeroTarjeta}:`, error);
      set({ 
        loading: false, 
        error: error instanceof Error ? error.message : `Error al obtener transacciones por tarjeta ${numeroTarjeta}` 
      });
    }
  },

  // Método para buscar transacciones por moneda
  fetchTransaccionesPorMoneda: async (moneda: string) => {
    set({ loading: true, error: null });
    
    try {
      const response = await axios.get<PageResponseDTO<TransaccionDTO>>(`${API_URL}/moneda/${moneda}`);
      
      set({
        transacciones: response.data.content,
        paginacion: {
          pageNumber: response.data.number,
          pageSize: response.data.size,
          totalPages: response.data.totalPages,
          totalElements: response.data.totalElements
        },
        loading: false
      });
    } catch (error) {
      console.error(`Error al obtener transacciones por moneda ${moneda}:`, error);
      set({ 
        loading: false, 
        error: error instanceof Error ? error.message : `Error al obtener transacciones por moneda ${moneda}` 
      });
    }
  },

  // Método para buscar transacciones por país
  fetchTransaccionesPorPais: async (pais: string) => {
    set({ loading: true, error: null });
    
    try {
      const response = await axios.get<PageResponseDTO<TransaccionDTO>>(`${API_URL}/pais/${pais}`);
      
      set({
        transacciones: response.data.content,
        paginacion: {
          pageNumber: response.data.number,
          pageSize: response.data.size,
          totalPages: response.data.totalPages,
          totalElements: response.data.totalElements
        },
        loading: false
      });
    } catch (error) {
      console.error(`Error al obtener transacciones por país ${pais}:`, error);
      set({ 
        loading: false, 
        error: error instanceof Error ? error.message : `Error al obtener transacciones por país ${pais}` 
      });
    }
  },

  // Método para buscar transacciones por rango de monto
  fetchTransaccionesPorMonto: async (montoMin: number, montoMax: number) => {
    set({ loading: true, error: null });
    
    try {
      // Construir query params
      const params = new URLSearchParams();
      params.append('montoMin', montoMin.toString());
      params.append('montoMax', montoMax.toString());
      
      const response = await axios.get<PageResponseDTO<TransaccionDTO>>(`${API_URL}/monto?${params.toString()}`);
      
      set({
        transacciones: response.data.content,
        paginacion: {
          pageNumber: response.data.number,
          pageSize: response.data.size,
          totalPages: response.data.totalPages,
          totalElements: response.data.totalElements
        },
        loading: false
      });
    } catch (error) {
      console.error(`Error al obtener transacciones por monto entre ${montoMin} y ${montoMax}:`, error);
      set({ 
        loading: false, 
        error: error instanceof Error ? error.message : `Error al obtener transacciones por monto entre ${montoMin} y ${montoMax}` 
      });
    }
  },

  // Método para resetear la transacción actual
  resetTransaccionActual: () => {
    set({ transaccionActual: null });
  }
})); 
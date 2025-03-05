import { create } from 'zustand';
import axios from 'axios';

// Base URL para la API de transacciones
const API_BASE_URL = 'http://transaccionsimple-alb-705840120.us-east-2.elb.amazonaws.com/api/v1/transacciones';

// Función para determinar si es necesario utilizar un proxy CORS
// Nota: En producción, se recomienda configurar el servidor para permitir CORS en lugar de usar un proxy
const useCorsProxy = false; // Cambiar a true solo para desarrollo/pruebas si es necesario
const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';

// URL final con o sin proxy según sea necesario
const API_URL = useCorsProxy ? `${CORS_PROXY}${API_BASE_URL}` : API_BASE_URL;

// Configuración global de axios
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Si estamos en desarrollo, podemos desactivar temporalmente la verificación de certificados SSL
if (process.env.NODE_ENV === 'development') {
  // Solo para desarrollo - NO usar en producción
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

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
  direction?: string;
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
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  firstPage: boolean;
  lastPage: boolean;
  
  // Mantenemos estas propiedades para compatibilidad con versiones anteriores
  number?: number;
  size?: number;
  pageable?: {
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
  sort?: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first?: boolean;
  numberOfElements?: number;
  empty?: boolean;
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
    sort: 'fecha',
    direction: 'DESC',
    tipo: 'PAG'
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
      
      // Construir objeto de parámetros para axios
      const axiosParams: Record<string, string> = {};
      
      // Añadir parámetros de paginación y ordenamiento
      if (aplicarFiltros.page !== undefined) axiosParams.page = aplicarFiltros.page.toString();
      if (aplicarFiltros.size !== undefined) axiosParams.size = aplicarFiltros.size.toString();
      if (aplicarFiltros.sort) {
        // Extraer solo el nombre del campo si viene con orden
        const sortField = aplicarFiltros.sort.split(',')[0];
        axiosParams.sort = sortField;
      }
      if (aplicarFiltros.direction) axiosParams.direction = aplicarFiltros.direction.toUpperCase();
      
      // Añadir filtros
      let hasRequiredFilter = false;
      
      if (aplicarFiltros.estado) {
        axiosParams.estado = aplicarFiltros.estado;
        hasRequiredFilter = true;
      }
      
      if (aplicarFiltros.tipo) {
        axiosParams.tipo = aplicarFiltros.tipo;
        hasRequiredFilter = true;
      }
      
      if (aplicarFiltros.marca) {
        axiosParams.marca = aplicarFiltros.marca;
        hasRequiredFilter = true;
      }
      
      if (aplicarFiltros.fechaInicio && aplicarFiltros.fechaFin) {
        axiosParams.fechaInicio = aplicarFiltros.fechaInicio;
        axiosParams.fechaFin = aplicarFiltros.fechaFin;
        hasRequiredFilter = true;
      }
      
      // Si no hay filtros especificados, usar tipo=PAG como filtro predeterminado
      if (!hasRequiredFilter) {
        axiosParams.tipo = 'PAG';
      }
      
      // El resto de los filtros que no son obligatorios según el backend
      if (aplicarFiltros.codigoUnico) axiosParams.codigoUnico = aplicarFiltros.codigoUnico;
      if (aplicarFiltros.numeroTarjeta) axiosParams.numeroTarjeta = aplicarFiltros.numeroTarjeta;
      if (aplicarFiltros.moneda) axiosParams.moneda = aplicarFiltros.moneda;
      if (aplicarFiltros.pais) axiosParams.pais = aplicarFiltros.pais;
      if (aplicarFiltros.comercio) axiosParams.comercio = aplicarFiltros.comercio;
      if (aplicarFiltros.montoMin !== undefined) axiosParams.montoMin = aplicarFiltros.montoMin.toString();
      if (aplicarFiltros.montoMax !== undefined) axiosParams.montoMax = aplicarFiltros.montoMax.toString();
      
      // Configuración de la solicitud con headers explícitos
      const config = {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        params: axiosParams,
        validateStatus: (status: number) => true, // Acepta cualquier código de estado para manejar errores manualmente
        timeout: 10000 // 10 segundos de timeout
      };
      
      console.log('Realizando petición con parámetros:', axiosParams);
      
      // Construir la URL manualmente para ver si hay algún problema con la construcción automática
      const urlParams = new URLSearchParams();
      Object.entries(axiosParams).forEach(([key, value]) => {
        urlParams.append(key, value);
      });
      
      const urlString = `${API_URL}?${urlParams.toString()}`;
      console.log('URL construida manualmente:', urlString);
      
      // Realizar la solicitud con fetch para mayor control
      const fetchResponse = await fetch(urlString, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        mode: 'cors',
        credentials: 'omit' // No enviar cookies
      });
      
      // Convertir la respuesta a texto primero para depuración
      const responseText = await fetchResponse.text();
      console.log('Respuesta como texto:', responseText);
      
      // Intentar convertir el texto a JSON
      let data;
      try {
        data = responseText ? JSON.parse(responseText) : null;
        console.log('Respuesta parseada a JSON:', data);
      } catch (e) {
        console.error('Error al parsear respuesta JSON:', e);
        throw new Error(`Error al parsear respuesta: ${responseText}`);
      }
      
      // Si no hay datos, asumir que es un array vacío
      if (!data) {
        set({
          transacciones: [],
          paginacion: {
            pageNumber: 0,
            pageSize: 10,
            totalPages: 0,
            totalElements: 0
          },
          loading: false,
          filtros: aplicarFiltros
        });
        return;
      }
      
      // Si la respuesta es un array, no hay paginación
      if (Array.isArray(data)) {
        set({
          transacciones: data,
          paginacion: {
            pageNumber: 0,
            pageSize: data.length,
            totalPages: 1,
            totalElements: data.length
          },
          loading: false,
          filtros: aplicarFiltros
        });
      } else {
        // Si la respuesta es un objeto paginado
        // Verificamos la estructura exacta para determinar cómo acceder a los datos
        const content = data.content || [];
        const pageNumber = data.pageNumber ?? data.number ?? 0;
        const pageSize = data.pageSize ?? data.size ?? 10;
        const totalPages = data.totalPages ?? 0;
        const totalElements = data.totalElements ?? data.numberOfElements ?? 0;
        
        set({
          transacciones: content,
          paginacion: {
            pageNumber,
            pageSize,
            totalPages,
            totalElements
          },
          loading: false,
          filtros: aplicarFiltros
        });
      }
    } catch (error: any) {
      console.error('Error al obtener transacciones:', error);
      
      // Log detallado del error
      let errorMessage = 'Error desconocido al obtener transacciones';
      if (error instanceof Error) {
        errorMessage = error.message;
        console.error('Stack trace:', error.stack);
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object') {
        console.error('Detalles del error:', JSON.stringify(error, null, 2));
      }
      
      set({ 
        loading: false, 
        error: errorMessage
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
      // Configuración de la solicitud con headers explícitos
      const config = {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        validateStatus: (status: number) => true // Acepta cualquier código de estado para manejar errores manualmente
      };
      
      const requestUrl = `${API_URL}/tarjeta/${numeroTarjeta}`;
      console.log('URL de consulta por tarjeta:', requestUrl);
      
      const response = await axios.get<TransaccionDTO[]>(requestUrl, config);
      
      // Verificar el código de estado
      if (response.status >= 400) {
        throw new Error(`Error del servidor: ${response.status} - ${JSON.stringify(response.data)}`);
      }
      
      console.log('Respuesta recibida por tarjeta:', response.data);
      
      // Si la respuesta es un array, no hay paginación
      if (Array.isArray(response.data)) {
        set({
          transacciones: response.data,
          paginacion: {
            pageNumber: 0,
            pageSize: response.data.length,
            totalPages: 1,
            totalElements: response.data.length
          },
          loading: false
        });
      } else {
        // Si la respuesta es un objeto paginado
        const paginatedResponse = response.data as unknown as PageResponseDTO<TransaccionDTO>;
        set({
          transacciones: paginatedResponse.content || [],
          paginacion: {
            pageNumber: paginatedResponse.pageNumber || paginatedResponse.number || 0,
            pageSize: paginatedResponse.pageSize || paginatedResponse.size || 10,
            totalPages: paginatedResponse.totalPages || 0,
            totalElements: paginatedResponse.totalElements || 0
          },
          loading: false
        });
      }
    } catch (error: any) {
      console.error(`Error al obtener transacciones por tarjeta ${numeroTarjeta}:`, error);
      if (axios.isAxiosError(error)) {
        const axiosError = error as any;
        console.error('Detalles del error:', {
          status: axiosError.response?.status,
          statusText: axiosError.response?.statusText,
          data: axiosError.response?.data
        });
        set({ 
          loading: false, 
          error: `Error HTTP ${axiosError.response?.status || 'desconocido'}: ${axiosError.response?.statusText || error.message}`
        });
      } else {
        set({ 
          loading: false, 
          error: error instanceof Error ? error.message : `Error desconocido al obtener transacciones por tarjeta ${numeroTarjeta}`
        });
      }
    }
  },

  // Método para buscar transacciones por moneda
  fetchTransaccionesPorMoneda: async (moneda: string) => {
    set({ loading: true, error: null });
    
    try {
      const response = await axios.get<TransaccionDTO[]>(`${API_URL}/moneda/${moneda}`);
      
      // Si la respuesta es un array, no hay paginación
      if (Array.isArray(response.data)) {
        set({
          transacciones: response.data,
          paginacion: {
            pageNumber: 0,
            pageSize: response.data.length,
            totalPages: 1,
            totalElements: response.data.length
          },
          loading: false
        });
      } else {
        // Si la respuesta es un objeto paginado
        const paginatedResponse = response.data as unknown as PageResponseDTO<TransaccionDTO>;
        set({
          transacciones: paginatedResponse.content,
          paginacion: {
            pageNumber: paginatedResponse.pageNumber || paginatedResponse.number || 0,
            pageSize: paginatedResponse.pageSize || paginatedResponse.size || 10,
            totalPages: paginatedResponse.totalPages || 0,
            totalElements: paginatedResponse.totalElements || 0
          },
          loading: false
        });
      }
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
      const response = await axios.get<TransaccionDTO[]>(`${API_URL}/pais/${pais}`);
      
      // Si la respuesta es un array, no hay paginación
      if (Array.isArray(response.data)) {
        set({
          transacciones: response.data,
          paginacion: {
            pageNumber: 0,
            pageSize: response.data.length,
            totalPages: 1,
            totalElements: response.data.length
          },
          loading: false
        });
      } else {
        // Si la respuesta es un objeto paginado
        const paginatedResponse = response.data as unknown as PageResponseDTO<TransaccionDTO>;
        set({
          transacciones: paginatedResponse.content,
          paginacion: {
            pageNumber: paginatedResponse.pageNumber || paginatedResponse.number || 0,
            pageSize: paginatedResponse.pageSize || paginatedResponse.size || 10,
            totalPages: paginatedResponse.totalPages || 0,
            totalElements: paginatedResponse.totalElements || 0
          },
          loading: false
        });
      }
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
      params.append('minimo', montoMin.toString());
      params.append('maximo', montoMax.toString());
      
      const response = await axios.get<TransaccionDTO[]>(`${API_URL}/monto?${params.toString()}`);
      
      // Si la respuesta es un array, no hay paginación
      if (Array.isArray(response.data)) {
        set({
          transacciones: response.data,
          paginacion: {
            pageNumber: 0,
            pageSize: response.data.length,
            totalPages: 1,
            totalElements: response.data.length
          },
          loading: false
        });
      } else {
        // Si la respuesta es un objeto paginado
        const paginatedResponse = response.data as unknown as PageResponseDTO<TransaccionDTO>;
        set({
          transacciones: paginatedResponse.content,
          paginacion: {
            pageNumber: paginatedResponse.pageNumber || paginatedResponse.number || 0,
            pageSize: paginatedResponse.pageSize || paginatedResponse.size || 10,
            totalPages: paginatedResponse.totalPages || 0,
            totalElements: paginatedResponse.totalElements || 0
          },
          loading: false
        });
      }
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
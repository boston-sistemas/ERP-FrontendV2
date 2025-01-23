import { Fibra, Categoria, Color, FibraResponse, MecsaColor } from "../../models/models";
import instance from "@/infrastructure/config/AxiosConfig";

// Manejo de errores centralizado
export const handleError = (error: any): string => {
  if (error.response) {
    const { status, data } = error.response;
    if (status === 409) {
      return 'Conflicto: Verifica si los datos de la fibra ya existen.';
    } else if (status === 500) {
      return 'Error interno del servidor. Intenta más tarde.';
    } else {
      return `Error ${status}: ${data?.message || 'Error desconocido.'}`;
    }
  } else if (error.request) {
    return 'El servidor no respondió. Verifica tu conexión.';
  } else {
    return `Error desconocido: ${error.message}`;
  }
};

// Obtener lista de fibras (incluyendo o excluyendo las inactivas)
export const fetchFibras = async (include_inactive: boolean): Promise<FibraResponse> => {
  try {
    const response = await instance.get<FibraResponse>(
      `/operations/v1/fibers/?includeInactives=${include_inactive}`
    );
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

// Actualizar el estado (activo/inactivo) de una fibra
export const updateFiberStatus = async (fiberId: string, isActive: boolean): Promise<void> => {
  try {
    const payload = { is_active: isActive };
    await instance.put(`/operations/v1/fibers/${fiberId}/status`, payload);
  } catch (error) {
    handleError(error);
    throw error;
  }
};

// Actualizar información de una fibra
export const updateFiber = async (fiberId: string, payload: any): Promise<void> => {
  try {
    await instance.patch(`/operations/v1/fibers/${fiberId}`, payload);
  } catch (error: any) {
    const errorMessage = handleError(error);
    throw new Error(errorMessage); // Lanza el error con el mensaje personalizado
  }
};

// Obtener categorías de fibras
export const fetchFiberCategories = async (): Promise<Categoria[]> => {
  try {
    const response = await instance.get("/security/v1/parameters/public/fiber-categories");
    return response.data.fiberCategories;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

// Obtener lista de países
export const fetchCountries = async (): Promise<string[]> => {
  try {
    const response = await instance.get("/resources/v1/locations/countries");
    return response.data.countries;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

// Crear una nueva fibra
export const createFiber = async (payload: Partial<Fibra>): Promise<void> => {
  try {
    await instance.post("/operations/v1/fibers", payload);
  } catch (error) {
    handleError(error);
    throw error;
  }
};

// Obtener colores MECsa
export const fetchMecsaColors = async (): Promise<MecsaColor[]> => {
  try {
    const response = await instance.get("/operations/v1/mecsa-colors");
    return response.data.mecsaColors;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

// Obtener Denomination de Fibras
export const fetchDenominationFibers = async (): Promise<string[]> => {
  try {
    const response = await instance.get("/security/v1/parameters/public/fiber-denominations");
    return response.data.fiberDenominations;
  } catch (error) {
    handleError(error);
    throw error;
  }
}

//verificar si la fibra es actualizable
export type FiberUpdatableCheck = {
  updatable: boolean;
  is_partial: boolean;
  message: string;
};

export const checkIfFiberIsUpdatable = async (fiberId: string): Promise<FiberUpdatableCheck> => {
  try {
    const response = await instance.get(`/operations/v1/fibers/${fiberId}/is-updatable`);
    return response.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

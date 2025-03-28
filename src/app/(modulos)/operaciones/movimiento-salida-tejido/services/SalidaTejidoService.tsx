import instance from "@/infrastructure/config/AxiosConfig";

// Interfaces
interface DyeingServiceDispatchResponse {
  dyeingServiceDispatches: DyeingServiceDispatch[];
  total: number;
}

export interface DyeingServiceDispatch {
  dispatchNumber: string;
  period: number;
  creationDate: string;
  creationTime: string;
  supplierCode: string;
  statusFlag: string;
  documentNote: string;
  tintSupplierColorId: string;
  prodId: string;
  userId: string;
  nrodir: string;
  detail: DyeingServiceDispatchDetail[];
}

interface DyeingServiceDispatchDetail {
  id: number;
  // Agregar más campos según la API
}

export interface Supplier {
  code: string;
  name: string;
  ruc: string;
  isActive: string;
  storageCode: string;
  initials: string;
  emails: string[];
  addresses: {
    [key: string]: string;
  };
}

interface SuppliersResponse {
  suppliers: Supplier[];
  total: number;
}

// Función para obtener las salidas de tejido
export const fetchDyeingServiceDispatches = async (
  period: number,
  page: number,
  includeAnnulled: boolean
): Promise<DyeingServiceDispatchResponse> => {
  const response = await instance.get<DyeingServiceDispatchResponse>(
    `/operations/v1/dyeing-service-dispatches/`, {
      params: {
        period,
        page,
        includeAnnulled
      }
    }
  );
  return response.data;
};

// Función para obtener una salida de tejido específica
export const fetchDyeingServiceDispatchByNumber = async (
  dyeing_service_dispatch_number: string,
  period: number
): Promise<DyeingServiceDispatch> => {
  const response = await instance.get<DyeingServiceDispatch>(
    `/operations/v1/dyeing-service-dispatches/${dyeing_service_dispatch_number}?period=${period}`
  );
  return response.data;
};

// Función para verificar si una salida es actualizable
export const checkIfDyeingServiceDispatchIsUpdatable = async (
  dyeing_service_dispatch_number: string,
  period: number
) => {
  const response = await instance.get(
    `/operations/v1/dyeing-service-dispatches/${dyeing_service_dispatch_number}/is-updatable?period=${period}`
  );
  return response.data;
};

// Función para anular una salida
export const anulateDyeingServiceDispatch = async (
  dyeing_service_dispatch_number: string,
  period: number
) => {
  await instance.put(
    `/operations/v1/dyeing-service-dispatches/${dyeing_service_dispatch_number}/anulate?period=${period}`
  );
};

// Función para obtener los proveedores de tintorería
export const fetchDyeingSuppliers = async (): Promise<SuppliersResponse> => {
  const response = await instance.get<SuppliersResponse>(
    `/operations/v1/suppliers/004`, {
      params: {
        includeInactives: false,
        page: 1,
        includeOtherAddresses: true
      }
    }
  );
  return response.data;
};

// Función para crear una nueva salida de tejido
export const createDyeingServiceDispatch = async (payload: Partial<DyeingServiceDispatch>) => {
  const response = await instance.post(
    `/operations/v1/dyeing-service-dispatches/`,
    payload
  );
  return response.data;
};

// Función para actualizar una salida de tejido
export const updateDyeingServiceDispatch = async (
  dyeing_service_dispatch_number: string,
  period: number,
  payload: Partial<DyeingServiceDispatch>
) => {
  const response = await instance.put(
    `/operations/v1/dyeing-service-dispatches/${dyeing_service_dispatch_number}?period=${period}`,
    payload
  );
  return response.data;
};
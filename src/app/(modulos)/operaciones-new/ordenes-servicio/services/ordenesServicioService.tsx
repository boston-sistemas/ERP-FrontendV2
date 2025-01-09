import instance from "@/infrastructure/config/AxiosConfig";
import { ServiceOrder, ServiceOrderDetail, ServiceOrderResponse, Supplier } from "../../models/models";

export const fetchServiceOrders = async (
    limit: number,
    offset: number,
    includeInactive: boolean
  ): Promise<ServiceOrderResponse> => {
    const response = await instance.get<ServiceOrderResponse>(
      `/operations/v1/service-orders/?limit=${limit}&offset=${offset}&include_inactive=${includeInactive}`
    );
    return response.data;
  };
  
export const fetchServiceOrderById = async (orderId: string) => {
  const response = await instance.get<ServiceOrder>(`/operations/v1/service-orders/${orderId}`);
  return response.data;
};
  
export const updateServiceOrder = async (
  orderId: string,
  payload: {
    statusParamId: number;  // <--- Requerido a nivel raíz
    detail: Array<{
      fabricId: string;
      quantityOrdered: number;
      price: number;
      statusParamId: number;
    }>
  }
): Promise<void> => {
  await instance.patch(`/operations/v1/service-orders/${orderId}`, payload);
};

export const fetchSuppliers = async (
  limit = 10,
  offset = 0,
  includeInactive = false
): Promise<Supplier[]> => {
  const response = await instance.get<{ suppliers: Supplier[] }>(
    `/operations/v1/suppliers/003`,
    {
      params: { limit, offset, include_inactive: includeInactive },
    }
  );
  return response.data.suppliers; // Devuelve solo el array de suppliers
};

export const createServiceOrder = async (data: {
  supplierId: string;
  detail: {
    fabricId: string;
    quantityOrdered: number;
    price: number;
  }[];
}) => {
  const response = await instance.post("/operations/v1/service-orders/", data);
  return response.data;
};

export const anulateServiceOrder = async (orderId: string) => {
  await instance.put(`/operations/v1/service-orders/${orderId}/anulate`);
}

export const checkIfServiceOrderIsUpdatable = async (orderId: string) => {
  const response = await instance.get(`/operations/v1/service-orders/${orderId}/is-updatable`);
  return response.data;
}

// services/ordenesServicioService.ts (o donde definas)
export const fetchServiceOrderStatus = async () => {
  // Suponiendo que el backend responde con:
  // {
  //   "serviceOrderStatus": [
  //       { "id": 1028, "value": "NO INICIADO" },
  //       { "id": 1029, "value": "EN PROCESO" },
  //       ...
  //   ]
  // }
  const response = await instance.get<{
    serviceOrderStatus: Array<{ id: number; value: string }>;
  }>("/security/v1/parameters/public/service-order-status");
  return response.data; 
};

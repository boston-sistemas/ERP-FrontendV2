import instance from "@/infrastructure/config/AxiosConfig";
import { ServiceOrder, ServiceOrderDetail, ServiceOrderResponse, Supplier } from "../../models/models";

export const fetchServiceOrders = async (
  period: number,
  includeAnnulled: boolean = false,
  includeDetail: boolean = true,
  supplierIds?: string[]
): Promise<{ serviceOrders: ServiceOrder[] }> => {
  const response = await instance.get<{ serviceOrders: ServiceOrder[] }>(
    `/operations/v1/service-orders/`,
    {
      params: {
        period,
        includeAnnulled,
        includeDetail,
        supplierIds
      }
    }
  );
  return response.data;
};
  
export const fetchServiceOrderById = async (orderId: string) => {
  const response = await instance.get<ServiceOrder>(`/operations/v1/service-orders/${orderId}`);
  return response.data;
};

export const fetchServiceOrderBySupplier = async (
  supplierId: string,
  period: number,
  limit: number = 10,
  offset: number = 0,
  includeAnnulled: boolean = false,
  includeDetail: boolean = false
): Promise<ServiceOrderResponse> => {
  const response = await instance.get<ServiceOrderResponse>(
    `/operations/v1/service-orders/`,
    {
      params: { 
        supplierIds: supplierId, 
        period, 
        limit, 
        offset, 
        includeAnnulled, 
        includeDetail 
      },
    }
  );
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

export const fetchServiceOrderStatus = async () => {
  const response = await instance.get<{
    serviceOrderStatus: Array<{ id: number; value: string }>;
  }>("/security/v1/parameters/public/service-order-status");
  return response.data; 
};

export const fetchFabricById = async (fabricId: string) => {
  const response = await instance.get(`/operations/v1/fabrics/${fabricId}`);
  return response.data;
};

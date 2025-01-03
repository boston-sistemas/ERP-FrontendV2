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
  
export const updateServiceOrder = async (orderId: string, details: { detail: ServiceOrderDetail[] }): Promise<void> => {
  await instance.patch(`/operations/v1/service-orders/${orderId}`, details);
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
    tissueId: string;
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
import instance from "@/infrastructure/config/AxiosConfig";
import { PurchaseOrderResponse, YarnPurchaseEntry, YarnPurchaseEntryResponse } from "../../../models/models";

export const fetchOrdenCompras = async (period: number): Promise<PurchaseOrderResponse> => {
  try {
    //console.log("fetchOrdenCompras() invocado con period:", period);
    const response = await instance.get<PurchaseOrderResponse>(
      `/operations/v1/orden-compra/yarns?period=${period}&includeDetail=true`
    );
    //console.log("Órdenes recibidas:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching purchase orders:", error?.response?.data || error.message);
    throw new Error(
      error?.response?.data?.message || "Error fetching purchase orders."
    );
  }
};

export const createYarnPurchaseEntry = async (payload: any): Promise<{ entryNumber: string }> => {
  try {
    const response = await instance.post("/operations/v1/yarn-purchase-entries/", payload);
    console.log("Movimiento creado exitosamente");
    return response.data;
  } catch (error: any) {
    console.error("Error al crear el movimiento:", error?.response?.data || error.message);
    throw new Error(
      error?.response?.data?.message || "Error al crear el movimiento."
    );
  }
};
  
export const fetchPurchaseOrderById = async (id: string): Promise<PurchaseOrderResponse> => {
  const response = await instance.get<PurchaseOrderResponse>(`/operations/v1/orden-compra/yarns/${id}`);
  return response.data;
};
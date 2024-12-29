import instance from "@/infrastructure/config/AxiosConfig";
import { PurchaseOrderResponse, YarnPurchaseEntry, YarnPurchaseEntryResponse } from "../../../models/models";

export const fetchOrdenCompras = async (): Promise<PurchaseOrderResponse> => {
  const response = await instance.get<PurchaseOrderResponse>("/operations/v1/orden-compra/yarns");
  return response.data;
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
  


import instance from "@/infrastructure/config/AxiosConfig";
import { YarnPurchaseEntryResponse, YarnPurchaseEntry } from "../../models/models";

export const fetchYarnPurchaseEntries = async (period: number, limit: number, offset: number, include_inactive:boolean): Promise<YarnPurchaseEntryResponse> => {
    const response = await instance.get<YarnPurchaseEntryResponse>(`/operations/v1/yarn-purchase-entries/?period=${period}&limit=${limit}&offset=${offset}&include_inactive=${include_inactive}`);
    return response.data;
}

export const fetchYarnPurchaseEntryDetails = async (
    entryNumber: string,
    period: number
  ): Promise<YarnPurchaseEntry> => {
    const response = await instance.get<YarnPurchaseEntry>(
      `/operations/v1/yarn-purchase-entries/${entryNumber}?period=${period}`
    );
    return response.data;
  };

  export const updateYarnPurchaseEntry = async (
    entryNumber: string,
    period: number,
    data: Partial<YarnPurchaseEntry>
  ): Promise<void> => {
    await instance.patch(
      `/operations/v1/yarn-purchase-entries/${entryNumber}?period=${period}`,
      data
    );
  };

  export const anulateYarnPurchaseEntry = async (entryNumber: string) => {
    await instance.put(`/operations/v1/yarn-purchase-entries/${entryNumber}/anulate?period=2024`);
  };
  
  // Servicio para verificar si el movimiento de ingreso de hilado es actualizable
  export const checkIfYarnPurchaseEntryIsUpdatable = async (entryNumber: string, period: number) => {
    const response = await instance.get(
      `/operations/v1/yarn-purchase-entries/${entryNumber}/is-updatable?period=${period}`
    );
    return response.data; // Devuelve la respuesta del API
  };
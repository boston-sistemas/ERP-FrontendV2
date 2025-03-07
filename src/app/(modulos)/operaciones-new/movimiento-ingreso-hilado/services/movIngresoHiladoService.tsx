import instance from "@/infrastructure/config/AxiosConfig";
import { YarnPurchaseEntryResponse, YarnPurchaseEntry, Fabric } from "../../models/models";

export const fetchYarnPurchaseEntries = async (
  period: number,
  limit: number,
  offset: number,
  include_inactive: boolean,
  startDate?: string,
  endDate?: string
): Promise<YarnPurchaseEntryResponse> => {
  const response = await instance.get<YarnPurchaseEntryResponse>(
    `/operations/v1/yarn-purchase-entries/`, {
      params: {
        period,
        limit,
        offset,
        include_inactive,
        startDate,
        endDate
      }
    }
  );
  return response.data;
};

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

  export const anulateYarnPurchaseEntry = async (entryNumber: string, period: number) => {
    await instance.put(`/operations/v1/yarn-purchase-entries/${entryNumber}/anulate?period=${period}`);
  };
  
  // Servicio para verificar si el movimiento de ingreso de hilado es actualizable
  export const checkIfYarnPurchaseEntryIsUpdatable = async (entryNumber: string, period: number) => {
    const response = await instance.get(
      `/operations/v1/yarn-purchase-entries/${entryNumber}/is-updatable?period=${period}`
    );
    return response.data; // Devuelve la respuesta del API
  };

  export const fetchSuppliersHil = async () => {
    const response = await instance.get(`operations/v1/suppliers/hil?limit=100&offset=0&include_annulled=false`);
    return response.data;
  }

  export const fetchPurchaseOrderbyId = async (id: string) => {
    const response = await instance.get(`operations/v1/orden-compra/yarns/${id}`);  
    return response.data;
  }

  export const fetchFabricTypes = async () => {
    const response = await instance.get(`security/v1/parameters/public/fabric-types`);
    return response.data;
  }

  export const fetchFabricSearchId = async (
    id: number
  ): Promise<Fabric> => {
    const response = await instance.get<Fabric>(
      `/operations/v1/fabrics/${id}`
    );
    return response.data;
  }
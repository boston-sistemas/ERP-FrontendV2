import instance from "@/infrastructure/config/AxiosConfig";
import { Fabric, Supplier, WeavingServiceEntry } from "../../models/models";

export const fetchWeavingServiceEntries = async (
    period: number,
    includeAnnulled: boolean = false,
    page: number = 1,
    entryNumber?: string,
    serviceOrderId?: string,
    supplierIds?: string[],
    startDate?: string,
    endDate?: string
): Promise<WeavingServiceEntryResponse> => {
    const response = await instance.get<WeavingServiceEntryResponse>(
        `/operations/v1/weaving-service-entries/`, {
            params: {
                period,
                includeAnnulled,
                page,
                entryNumber,
                serviceOrderId,
                supplierIds,
                startDate,
                endDate
            }
        }
    );
    return response.data;
};

export const fetchFabricById = async (fabricId: string): Promise<Fabric> => {
    const response = await instance.get<Fabric>(`/operations/v1/fabrics/${fabricId}`);
    return response.data;
};

export const fetchWeavingServiceEntryById = async (
    entryNumber: string | string[],
    period: number
): Promise<WeavingServiceEntry> => {
    const response = await instance.get<WeavingServiceEntry>(
        `/operations/v1/weaving-service-entries/${entryNumber}?period=${period}`
    );
    return response.data;
};

export const createWeavingServiceEntry = async (payload: any): Promise<{ entryNumber: string }> => {
    try {
        const response = await instance.post(
            "/operations/v1/weaving-service-entries/",
            payload
        );
        console.log("Movimiento creado exitosamente:", response.data);
        return response.data;
    } catch (error: any) {
        console.error("Error al crear el movimiento:", error?.response?.data || error.message);
        console.error("Payload fallido:", JSON.stringify(payload, null, 2));
        throw new Error(
            error?.response?.data?.message || "Error al crear el movimiento."
        );
    }
};

export const annulWeavingServiceEntry = async (
    entryNumber: string,
    period: number
): Promise<void> => {
    try {
        const response = await instance.put(
            `/operations/v1/weaving-service-entries/${entryNumber}/anulate?period=${period}`
        );
        console.log("Movimiento anulado exitosamente:", response.data);
    } catch (error: any) {
        console.error("Error al anular el movimiento:", error?.response?.data || error.message);
        throw new Error(
            error?.response?.data?.message || "Error al anular el movimiento."
        );
    }
};

interface IsUpdatableResponse {
    updatable: boolean;
    message: string;
}

export const checkWeavingServiceEntryIsUpdatable = async (
    entryNumber: string | string[],
    period: number
): Promise<IsUpdatableResponse> => {
    try {
        const response = await instance.get<IsUpdatableResponse>(
            `/operations/v1/weaving-service-entries/${entryNumber}/is-updatable?period=${period}`
        );
        return response.data;
    } catch (error: any) {
        console.error(
            "Error al verificar si el movimiento es actualizable:",
            error?.response?.data || error.message
        );
        throw new Error(
            error?.response?.data?.message ||
            "Error al verificar si el movimiento es actualizable."
        );
    }
};

export const updateWeavingServiceEntry = async (
    entryNumber: string,
    period: number,
    payload: {
        supplierCode: string;
        documentNote: string | null;
        detail: Array<{
            itemNumber: number;
            fabricId: string;
            netWeight: number;
            cardType: string;
            supplierWeavingTej: string;
        }>;
    }
): Promise<void> => {
    try {
        await instance.patch(
            `/operations/v1/weaving-service-entries/${entryNumber}?period=${period}`,
            payload
        );
        console.log("Movimiento actualizado exitosamente.");
    } catch (error: any) {
        console.error("Error al actualizar el movimiento:", error?.response?.data || error.message);
        throw new Error(
            error?.response?.data?.message || "Error al actualizar el movimiento."
        );
    }
};

export const fetchSuppliersT = async (
    includeInactives = false,
    includeOtherAddresses = true,
    page = 1,
  ): Promise<Supplier[]> => {
    const response = await instance.get<{ suppliers: Supplier[] }>(
      `/operations/v1/suppliers/003`,
      {
        params: { include_inactives: includeInactives, page, include_other_addresses: includeOtherAddresses },
      }
    );
    return response.data.suppliers; // Devuelve solo el array de suppliers
  };


export const fetchSuppliersTintoreria = async (): Promise<Supplier[]> => {
    const response = await instance.get<{ suppliers: Supplier[] }>(
        `/operations/v1/suppliers/004?includeInactives=false&page=1&includeOtherAddresses=true`
    );
    return response.data.suppliers;
};

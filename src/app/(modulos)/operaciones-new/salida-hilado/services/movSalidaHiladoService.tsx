import instance from "@/infrastructure/config/AxiosConfig";
import { YarnDispatch, YarnDispatchDetail, YarnDispatchResponse } from "../../models/models";

export const fetchYarnDispatches = async (
    period: number,
    limit: number,
    offset: number,
    include_inactive: boolean,
    ): Promise<YarnDispatchResponse> => {
    const response = await instance.get<YarnDispatchResponse>(
        `/operations/v1/yarn-weaving-dispatches/?period=${period}&limit=${limit}&offset=${offset}&includeAnnulled=${include_inactive}`
    );
    console.log(response.data);
    return response.data;
    }

export const fetchYarnDispatchByNumber = async (
        exitNumber: string,
        period: number
      ): Promise<YarnDispatch> => {
        const response = await instance.get<YarnDispatch>(
          `/operations/v1/yarn-weaving-dispatches/${exitNumber}?period=${period}`
        );
        return response.data;
      };

export const createYarnDispatch = async (payload: any): Promise<{ exitNumber: string }> => {
try {
    const response = await instance.post("/operations/v1/yarn-weaving-dispatches/", payload);
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

export const anulateYarnDispatch = async (exitNumber: string, period: number): Promise<void> => {
try {
    const response = await instance.put(
    `/operations/v1/yarn-weaving-dispatches/${exitNumber}/anulate?period=${period}`
    );
    console.log("Movimiento anulado exitosamente:", response.data);
  } catch (error: any) {
    console.error("Error al anular el movimiento:", error?.response?.data || error.message);
    throw new Error(
      error?.response?.data?.message || "Error al anular el movimiento."
    );
  }
}

// 1) Define un tipo de respuesta
interface IsUpdatableResponse {
  updatable: boolean;
  message: string;
}

// 2) Cambia la firma para que devuelva ese objeto
export const checkIsDispatchUpdatable = async (
  exitNumber: string,
  period: number
): Promise<IsUpdatableResponse> => {
  try {
    // Observa que la ruta real es /is-updatable o /isupdatable, asegúrate de usar la correcta
    const response = await instance.get<IsUpdatableResponse>(
      `/operations/v1/yarn-weaving-dispatches/${exitNumber}/is-updatable?period=${period}`
    );
    // Retorna el objeto con { updatable, message }
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


export const updateYarnDispatch = async (
  exitNumber: string,
  period: number,
  payload: {
    documentNote: string | null;
    nrodir: string;
    detail: Array<{
      itemNumber: number;
      entryNumber: string;
      entryGroupNumber: number;
      entryItemNumber: number;
      entryPeriod: number;
      coneCount: number;
      packageCount: number;
      netWeight: number;
      grossWeight: number;
      fabricId: string;
    }>;
  }
): Promise<void> => {
  try {
    await instance.patch(
      `/operations/v1/yarn-weaving-dispatches/${exitNumber}?period=${period}`,
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

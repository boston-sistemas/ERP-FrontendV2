import { YarnResponse } from "../../models/models";
import instance from "@/infrastructure/config/AxiosConfig";

export const fetchHilados = async (include_inactive: boolean): Promise<YarnResponse> => {
  try {
    const response = await instance.get<YarnResponse>(`/operations/v1/yarns/?include_inactives=${include_inactive}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || "Error al obtener los hilados.");
  }
};

export const updateYarnStatus = async (yarnId: string, isActive: boolean): Promise<void> => {
  try {
    const payload = { is_active: isActive };
    await instance.put(`/operations/v1/yarns/${yarnId}/status`, payload);
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || "Error al actualizar el estado del hilado.");
  }
};

export const updateYarn = async (yarnId: string, payload: any): Promise<void> => {
  try {
    await instance.patch(`/operations/v1/yarns/${yarnId}`, payload);
  } catch (error: any) {
    const detail = error.response?.data?.detail || "Error al actualizar el hilado.";
    if (error.response?.status === 409) {
      throw new Error("El hilado ya está registrado en el sistema.");
    }
    throw new Error(detail);
  }
};

export const fetchSpinningMethods = async () => {
  try {
    const response = await instance.get("/security/v1/parameters/public/spinning-methods");
    return response.data.spinningMethods;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || "Error al obtener los métodos de hilado.");
  }
};

export const createYarn = async (payload: any): Promise<void> => {
  try {
    await instance.post("/operations/v1/yarns", payload);
  } catch (error: any) {
    const detail = error.response?.data?.detail || "Error al crear el hilado.";
    if (error.response?.status === 409) {
      throw new Error("El hilado ya está registrado en el sistema.");
    }
    throw new Error(detail);
  }
};

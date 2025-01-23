// src/services/hiladoService.ts

import instance from "@/infrastructure/config/AxiosConfig";

// ---------------- Tipos mínimos ----------------
export interface YarnUpdateCheck {
  updatable: boolean;
  is_partial: boolean;
  message: string;
  fields: string[];
}

// Estructuras para spinner methods, yarn counts, etc.
export interface ParameterOption {
  id: number;
  value: string;
}

// Llamadas a API:

// 1) Listar hilados (con filtro de inactivos y opcionalmente fiberIds)
export const fetchHilados = async (
  include_inactive: boolean,
  fiberIds?: string
) => {
  try {
    let url = `/operations/v1/yarns/?includeInactives=${include_inactive}`;
    if (fiberIds) {
      url += `&fiberIds=${fiberIds}`;
    }
    const response = await instance.get(url);
    return response.data; // { yarns: [...] }
  } catch (error: any) {
    throw new Error(
      error.response?.data?.detail || "Error al obtener los hilados."
    );
  }
};

// 2) Verificar si un hilado es actualizable
export const checkYarnUpdateStatus = async (
  yarnId: string
): Promise<YarnUpdateCheck> => {
  try {
    const response = await instance.get(
      `/operations/v1/yarns/${yarnId}/is-updatable`
    );
    return response.data;
  } catch (error: any) {
    const detail =
      error.response?.data?.detail ||
      "Error verificando si el hilado se puede actualizar.";
    throw new Error(detail);
  }
};

// 3) Actualizar estado (activar/desactivar)
export const updateYarnStatus = async (yarnId: string, isActive: boolean) => {
  try {
    const payload = { is_active: isActive };
    await instance.put(`/operations/v1/yarns/${yarnId}/status`, payload);
  } catch (error: any) {
    throw new Error(
      error.response?.data?.detail ||
        "Error al actualizar el estado del hilado."
    );
  }
};

// 4) Actualizar un hilado (PATCH)
export const updateYarn = async (yarnId: string, payload: any) => {
  try {
    await instance.patch(`/operations/v1/yarns/${yarnId}`, payload);
  } catch (error: any) {
    const detail =
      error.response?.data?.detail || "Error al actualizar el hilado.";
    if (error.response?.status === 409) {
      throw new Error("El hilado ya está registrado en el sistema.");
    }
    throw new Error(detail);
  }
};

// 5) Crear un hilado
export const createYarn = async (payload: any) => {
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

// 6) Leer métodos de hilado (Spinning Methods)
export const fetchSpinningMethods = async (): Promise<ParameterOption[]> => {
  try {
    const response = await instance.get(
      "/security/v1/parameters/public/spinning-methods"
    );
    return response.data.spinningMethods; // [ {id, value}, ... ]
  } catch (error: any) {
    throw new Error(
      error.response?.data?.detail || "Error al obtener los métodos de hilado."
    );
  }
};

// 7) Leer títulos de hilado (Yarn Counts)
export const fetchYarnCounts = async (): Promise<ParameterOption[]> => {
  try {
    const response = await instance.get(
      "/security/v1/parameters/public/yarn-counts"
    );
    return response.data.yarnCounts; // [ {id, value}, ... ]
  } catch (error: any) {
    throw new Error(
      error.response?.data?.detail || "Error al obtener los títulos de hilado."
    );
  }
};

// 8) Leer lugares de fabricación
export const fetchManufacturingSites = async (): Promise<ParameterOption[]> => {
  try {
    const response = await instance.get(
      "/security/v1/parameters/public/yarn-manufacturing-sites"
    );
    return response.data.yarnManufacturingSites;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.detail ||
        "Error al obtener los lugares de fabricación de hilado."
    );
  }
};

// 9) Leer distinciones de hilado
export const fetchYarnDistinctions = async (): Promise<ParameterOption[]> => {
  try {
    const response = await instance.get(
      "/security/v1/parameters/public/yarn-distinctions"
    );
    return response.data.yarnDistinctions;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.detail ||
        "Error al obtener las distinciones de hilado."
    );
  }
};

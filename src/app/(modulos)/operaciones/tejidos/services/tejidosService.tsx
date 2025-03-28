import { FabricResponse, FabricRecipe, YarnResponse, MecsaColorResponse } from "../../models/models";
import instance from "@/infrastructure/config/AxiosConfig";

export interface FabricType {
    id: number;
    value: string;
  }
  export interface FabricTypeResponse {
    fabricTypes: FabricType[];
  }

export const fetchTejidos = async (): Promise<FabricResponse> => {
    const response = await instance.get<FabricResponse>("/operations/v1/fabrics");
    return response.data;
};
  
  // 2) Crear tejido
  export const createFabric = async (payload: {
    fabricTypeId: number;
    density: number;
    width: number;
    colorId: string;
    structurePattern: string;
    description: string;
    recipe: FabricRecipe[];
  }): Promise<void> => {
    await instance.post("/operations/v1/fabrics", payload);
  };
  
  // 3) Editar tejido (PATCH)
  export const updateFabric = async (
    fabricId: string,
    payload: Partial<{
      fabricTypeId: number;
      density: number;
      width: number;
      colorId: string;
      structurePattern: string;
      description: string;
      recipe: FabricRecipe[];
    }>
  ): Promise<void> => {
    await instance.patch(`/operations/v1/fabrics/${fabricId}`, payload);
  };
  
  // 4) Cambiar estado (PUT /status)
  export const updateFabricStatus = async (
    fabricId: string,
    isActive: boolean
  ): Promise<void> => {
    const body = { is_active: isActive };
    await instance.put(`/operations/v1/fabrics/${fabricId}/status`, body);
  };
  
  // ============= Apis para SELECTS =============
  
  // GET /security/v1/parameters/public/fabric-types
  export const fetchFabricTypes = async (): Promise<FabricTypeResponse> => {
    const resp = await instance.get<FabricTypeResponse>(
      "/security/v1/parameters/public/fabric-types"
    );
    return resp.data;
  };
  
  // GET /operations/v1/mecsa-colors/
  export const fetchMecsaColors = async (): Promise<MecsaColorResponse> => {
    const resp = await instance.get<MecsaColorResponse>("/operations/v1/mecsa-colors");
    return resp.data;
  };
  
  // GET /operations/v1/yarns/
  export const fetchHilados = async (): Promise<YarnResponse> => {
    const resp = await instance.get<YarnResponse>("/operations/v1/yarns");
    return resp.data;
  };

  export const fetchFabricById = async (fabricId: string): Promise<FabricResponse> => {
    const resp = await instance.get<FabricResponse>(`/operations/v1/fabrics/${fabricId}`);
    return resp.data;
  };
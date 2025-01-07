import { FabricResponse } from "../../models/models";
import instance from "@/infrastructure/config/AxiosConfig";


export const fetchTejidos = async (): Promise<FabricResponse> => {
    const response = await instance.get<FabricResponse>('/operations/v1/fabrics');
    return response.data;
}

export const createFabric = async (payload: any): Promise<void> => {
    await instance.post("/operations/v1/fabrics", payload);
}

export const updateFabric = async (fabricId: string, payload: any): Promise<void> => {
    await instance.patch(`/operations/v1/fabrics/${fabricId}`, payload);
}

export const updateFabricStatus = async (fabricId: string, isActive: boolean): Promise<void> => {
    const payload = { is_active: isActive };
    await instance.put(`/operations/v1/fabrics/${fabricId}/status`, payload);
}
import { YarnResponse } from "../../models/models";
import instance from "@/infrastructure/config/AxiosConfig";

export const fetchHilados = async (): Promise<YarnResponse> => {
    const response = await instance.get<YarnResponse>('/operations/v1/yarns');
    return response.data;
}

export const updateYarnStatus = async (yarnId: string, isActive: boolean): Promise<void> => {
    const payload = { is_active: isActive };
    await instance.put(`/operations/v1/yarns/${yarnId}/status`, payload);
}

export const updateYarn = async (yarnId: string, payload: any): Promise<void> => {
    await instance.patch(`/operations/v1/yarns/${yarnId}`, payload);
}
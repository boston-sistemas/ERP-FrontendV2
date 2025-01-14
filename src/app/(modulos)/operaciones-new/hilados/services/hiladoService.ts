import { YarnResponse } from "../../models/models";
import instance from "@/infrastructure/config/AxiosConfig";

export const fetchHilados = async (include_inactive:boolean): Promise<YarnResponse> => {
    const response = await instance.get<YarnResponse>(`/operations/v1/yarns/?include_inactives=${include_inactive}`);
    return response.data;
}

export const updateYarnStatus = async (yarnId: string, isActive: boolean): Promise<void> => {
    const payload = { is_active: isActive };
    await instance.put(`/operations/v1/yarns/${yarnId}/status`, payload);
}

export const updateYarn = async (yarnId: string, payload: any): Promise<void> => {
    await instance.patch(`/operations/v1/yarns/${yarnId}`, payload);
}

export const fetchSpinningMethods = async () => {
    const response = await instance.get("/security/v1/parameters/public/spinning-methods");
    return response.data.spinningMethods;
}

export const createYarn = async (payload: any): Promise<void> => {
    await instance.post("/operations/v1/yarns", payload);
}
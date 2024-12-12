import { Fibra, Categoria, Color, FibraResponse } from "../../models/models";
import instance from "@/infrastructure/config/AxiosConfig";

export const fetchFibras = async (): Promise<FibraResponse> => {
  const response = await instance.get<FibraResponse>('/operations/v1/fibers');
  return response.data;
};

export const updateFiberStatus = async (fiberId: string, isActive: boolean): Promise<void> => {
  const payload = { is_active: isActive };
  await instance.put(`/operations/v1/fibers/${fiberId}/status`, payload);
};

export const updateFiber = async (fiberId: string, payload: any): Promise<void> => {
  await instance.patch(`/operations/v1/fibers/${fiberId}`, payload);
}

export const fetchFiberCategories = async () => {
  const response = await instance.get("/security/v1/parameters/public/fiber-categories");
  return response.data.fiberCategories; 
};

export const fetchCountries = async () => {
  const response = await instance.get("/resources/v1/locations/countries/");
  return response.data.countries; 
};
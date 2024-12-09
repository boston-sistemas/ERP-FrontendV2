import { Fibra, Categoria, Color } from "../../models/models";
import instance from "@/infrastructure/config/AxiosConfig";

export const fetchFibras = async (): Promise<Fibra[]> => {
  const response = await instance.get('/operations/v1/fibers/');
  return response.data.fibras;
};

export const fetchCategorias = async (): Promise<Categoria[]> => {
  const response = await instance.get('/security/v1/parameters/public/fiber-categories/');
  return response.data.categories;
};

export const fetchColores = async (): Promise<Color[]> => {
  const response = await instance.get('/security/v1/parameters/public/colors/');
  return response.data.colors;
};

export const createFibra = async (fibra: Partial<Fibra>) => {
  await instance.post('/operations/v1/fibers/', fibra);
};

export const actualizarFibra = async (fibraId: number, updatedFibra: Partial<Fibra>) => {
  await instance.patch(`/operations/v1/fibers/${fibraId}`, updatedFibra);
};
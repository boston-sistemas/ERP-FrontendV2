import instance from "@/infrastructure/config/AxiosConfig";
import { Rol } from "@/app/(modulos)/seguridad/models/models";

export const crearRolService = async (newRol: Partial<Rol>) => {
  return await instance.post('/security/v1/roles/', newRol);
};

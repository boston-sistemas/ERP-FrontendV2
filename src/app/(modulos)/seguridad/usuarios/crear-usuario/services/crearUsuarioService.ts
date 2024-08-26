import instance from "@/infrastructure/config/AxiosConfig";
import { Usuario } from "../../../models/models";

export const crearUsuarioService = async (nuevoUsuario: Partial<Usuario>) => {
  const response = await instance.post('/security/v1/usuarios/', nuevoUsuario);
  return response.data;
};

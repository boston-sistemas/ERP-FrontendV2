import instance from "@/infrastructure/config/AxiosConfig";
import { Usuario, Rol } from "../../models/usuario";

export const crearUsuarioService = async (nuevoUsuario: Partial<Usuario>) => {
  const response = await instance.post('/security/v1/usuarios/', nuevoUsuario);
  return response.data;
};

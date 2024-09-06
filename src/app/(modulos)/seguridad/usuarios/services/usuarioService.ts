
import instance from "@/infrastructure/config/AxiosConfig";
import { Usuario, Rol } from "../../models/models";

export const fetchUsuarios = async (): Promise<Usuario[]> => {
  const response = await instance.get('/security/v1/usuarios/');
  return response.data.usuarios;
};

export const fetchRoles = async (): Promise<Rol[]> => {
  const response = await instance.get('/security/v1/roles/');
  return response.data.roles;
};

export const actualizarUsuarioService = async (usuarioId: number, updatedUser: Partial<Usuario>) => {
  await instance.patch(`/security/v1/usuarios/${usuarioId}`, updatedUser);
};

export const cambiarEstadoUsuarioService = async (usuarioId: number, isActive: boolean) => {
  await instance.patch(`/security/v1/usuarios/${usuarioId}`, { is_active: isActive });
};

export const resetearPasswordUsuarioService = async (usuarioId: number) => {
  await instance.put(`/security/v1/usuarios/${usuarioId}/reset-password`);
};

export const agregarRolesAUsuarioService = async (usuarioId: number, rolesToAdd: number[]) => {
  await instance.post(`/security/v1/usuarios/${usuarioId}/roles/`, { rol_ids: rolesToAdd });
};

export const eliminarRolesDeUsuarioService = async (usuarioId: number, rolesToRemove: number[]) => {
  await instance.delete(`/security/v1/usuarios/${usuarioId}/roles/`, { data: { rol_ids: rolesToRemove } });
};

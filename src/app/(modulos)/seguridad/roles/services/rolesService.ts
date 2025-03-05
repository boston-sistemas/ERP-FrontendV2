import instance from "@/infrastructure/config/AxiosConfig";
import { Rol, Acceso } from "@/app/(modulos)/seguridad/models/models";

export const fetchRoles = async (): Promise<Rol[]> => {
  const response = await instance.get('/security/v1/roles/');
  return response.data.roles;
};

export const fetchAccesos = async (): Promise<Acceso[]> => {
  const response = await instance.get('/security/v1/accesos/');
  return response.data.accesos;
};

export const actualizarRolService = async (rolId: number, updatedRole: Partial<Rol>) => {
  await instance.patch(`/security/v1/roles/${rolId}`, updatedRole);
};

export const eliminarRolService = async (rolId: number) => {
  await instance.delete(`/security/v1/roles/${rolId}`);
};

export const agregarAccesoARolService = async (rolId: number, accesoIds: number[]) => {
  await instance.post(`/security/v1/roles/${rolId}/accesos/`, { acceso_ids: accesoIds });
};

export const eliminarAccesoDeRolService = async (rolId: number, accesoIds: number[]) => {
  await instance.delete(`/security/v1/roles/${rolId}/accesos/`, {
    data: { acceso_ids: accesoIds },
  });
};

export const cambiarEstadoRolService = async (rolId: number, isActive: boolean) => {
  await instance.patch(`/security/v1/roles/${rolId}`, {
    is_active: isActive,
  });
};

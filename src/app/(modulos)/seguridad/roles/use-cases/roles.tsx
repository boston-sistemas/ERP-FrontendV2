import {
    fetchRoles,
    fetchAccesos,
    actualizarRolService,
    eliminarRolService,
    agregarAccesoARolService,
    eliminarAccesoDeRolService,
    cambiarEstadoRolService
  } from "@/app/(modulos)/seguridad/roles/services/rolesService";
  import { Rol, Acceso } from "@/app/(modulos)/seguridad/models/models";
  
  export const obtenerRoles = async (setRoles: Function, setLoading: Function, setError: Function) => {
    try {
      setLoading(true);
      const rolesData = await fetchRoles();
      setRoles(rolesData);
    } catch (error) {
      console.error('Error fetching roles', error);
      setError('Error fetching roles');
    } finally {
      setLoading(false);
    }
  };
  
  export const obtenerAccesos = async (setAccesos: Function, setError: Function) => {
    try {
      const accesosData = await fetchAccesos();
      setAccesos(accesosData);
    } catch (error) {
      console.error('Error fetching accesos', error);
      setError('Error fetching accesos');
    }
  };
  
  export const actualizarRol = async (rol: Rol, setRoles: Function, fetchRolesCallback: Function, handleCloseDialog: Function) => {
    if (!rol) return;
    try {
      await actualizarRolService(rol.rol_id, rol);
      fetchRolesCallback();
      handleCloseDialog();
    } catch (error) {
      console.error('Error updating role', error);
    }
  };
  
  export const eliminarRol = async (rolId: number, fetchRolesCallback: Function) => {
    try {
      await eliminarRolService(rolId);
      fetchRolesCallback();
    } catch (error) {
      console.error('Error deleting role', error);
    }
  };
  
  export const agregarAccesoARol = async (rol: Rol, accesoIds: number[], setSelectedRole: Function, fetchRolesCallback: Function, handleCloseDialog: Function) => {
    try {
      await agregarAccesoARolService(rol.rol_id, accesoIds);
      fetchRolesCallback();
      handleCloseDialog();
    } catch (error) {
      console.error('Error adding access', error);
    }
  };
  
  export const eliminarAccesoDeRol = async (rol: Rol, accesoIds: number[], setSelectedRole: Function, fetchRolesCallback: Function, handleCloseDialog: Function) => {
    try {
      await eliminarAccesoDeRolService(rol.rol_id, accesoIds);
      fetchRolesCallback();
      handleCloseDialog();
    } catch (error) {
      console.error('Error removing access', error);
    }
  };
  
  export const cambiarEstadoRol = async (rol: Rol, fetchRolesCallback: Function) => {
    try {
      await cambiarEstadoRolService(rol.rol_id, !rol.is_active);
      fetchRolesCallback();
    } catch (error) {
      console.error('Error toggling role status', error);
    }
  };
  
import { Usuario, Rol } from "../../models/models";
import {
    fetchUsuarios,
    fetchRoles,
    actualizarUsuarioService,
    cambiarEstadoUsuarioService,
    resetearPasswordUsuarioService,
    agregarRolesAUsuarioService,
    eliminarRolesDeUsuarioService
  } from "@/app/(modulos)/seguridad/usuarios/services/usuarioService";
  
  export const handleFetchUsuarios = async (setUsuarios: Function, setLoading: Function, setError: Function) => {
    try {
      setLoading(true);
      const usuariosData = await fetchUsuarios();
      setUsuarios(usuariosData);
    } catch (error) {
      console.error('Error fetching users', error);
      setError('Error fetching users');
    } finally {
      setLoading(false);
    }
  };
  
  export const handleFetchRoles = async (setAllRoles: Function, setError: Function) => {
    try {
      const rolesData = await fetchRoles();
      setAllRoles(rolesData);
    } catch (error) {
      console.error('Error fetching roles', error);
      setError('Error fetching roles');
    }
  };
  
  export const handleUpdateUser = async (selectedUser: Usuario, originalUser: Usuario | null, setUsuarios: Function, fetchUsuariosCallback: Function, handleCloseEditDialog: Function) => {
    if (!selectedUser || !originalUser) return;
    try {
      const updatedUser: Partial<Usuario> = {};
      if (selectedUser.username !== originalUser.username) updatedUser.username = selectedUser.username;
      if (selectedUser.email !== originalUser.email) updatedUser.email = selectedUser.email;
      if (selectedUser.display_name !== originalUser.display_name) updatedUser.display_name = selectedUser.display_name;
  
      if (Object.keys(updatedUser).length > 0) {
        await actualizarUsuarioService(selectedUser.usuario_id, updatedUser);
      }
      fetchUsuariosCallback();
      handleCloseEditDialog();
    } catch (error) {
      console.error('Error updating user', error);
    }
  };
  
  export const handleToggleUserStatus = async (usuario: Usuario, fetchUsuariosCallback: Function) => {
    try {
      await cambiarEstadoUsuarioService(usuario.usuario_id, !usuario.is_active);
      fetchUsuariosCallback();
    } catch (error) {
      console.error('Error toggling user status', error);
    }
  };
  
  export const handleResetPassword = async (usuarioId: number, setSnackbarSeverity: Function, setSnackbarMessage: Function, setSnackbarOpen: Function) => {
    try {
      await resetearPasswordUsuarioService(usuarioId);
      setSnackbarSeverity("success");
      setSnackbarMessage("Contraseña reseteada exitosamente");
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error reseteando contraseña', error);
      setSnackbarSeverity("error");
      setSnackbarMessage("Error reseteando contraseña");
      setSnackbarOpen(true);
    }
  };
  
  export const handleAddRolesToUser = async (usuario: Usuario, rolesToAdd: number[], setSelectedUser: Function, setOpenAddRoleDialog: Function, allRoles: Rol[]) => {
    try {
      await agregarRolesAUsuarioService(usuario.usuario_id, rolesToAdd);
      const updatedRoles = [...usuario.roles, ...allRoles.filter(role => rolesToAdd.includes(role.rol_id))];
      setSelectedUser({ ...usuario, roles: updatedRoles });
      setOpenAddRoleDialog(false);
    } catch (error) {
      console.error('Error adding roles to user', error);
    }
  };
  
  export const handleRemoveRolesFromUser = async (usuario: Usuario, rolesToRemove: number[], setSelectedUser: Function, setOpenRemoveRoleDialog: Function) => {
    try {
      await eliminarRolesDeUsuarioService(usuario.usuario_id, rolesToRemove);
      const updatedRoles = usuario.roles.filter(role => !rolesToRemove.includes(role.rol_id));
      setSelectedUser({ ...usuario, roles: updatedRoles });
      setOpenRemoveRoleDialog(false);
    } catch (error) {
      console.error('Error removing roles from user', error);
    }
  };
  
  
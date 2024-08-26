import { crearUsuarioService } from "../services/crearUsuarioService";
import { fetchRoles } from "../../services/usuarioService";
import { Usuario, Rol } from "../../../models/models";

export const obtenerRoles = async (setRoles: Function, setError: Function) => {
  try {
    const rolesData = await fetchRoles();
    setRoles(rolesData);
  } catch (error) {
    console.error('Error fetching roles', error);
    setError('Error fetching roles');
  }
};

export const crearUsuario = async (
  newUser: Partial<Usuario>,
  router: any,
  setError: Function,
  setSubmitting: Function
) => {
  try {
    setSubmitting(true);
    await crearUsuarioService(newUser);
    router.push('/seguridad/usuarios');
  } catch (error) {
    console.error('Error creating user', error);
    setError('Error creating user');
  } finally {
    setSubmitting(false);
  }
};

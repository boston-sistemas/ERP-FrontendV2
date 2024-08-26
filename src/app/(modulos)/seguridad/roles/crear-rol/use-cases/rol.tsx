import { crearRolService } from "../services/crearRolService";
import { Rol } from "@/app/(modulos)/seguridad/models/models";

export const crearRol = async (newRol: Partial<Rol>, setLoading: Function, setError: Function, router: any) => {
  try {
    setLoading(true);
    await crearRolService(newRol);
    router.push('/seguridad/roles');
  } catch (error) {
    console.error('Error creando el rol:', error);
    setError('Error creando el rol');
  } finally {
    setLoading(false);
  }
};

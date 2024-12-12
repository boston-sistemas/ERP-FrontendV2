import { Fibra } from "../../models/models";
import {
  fetchFibras,
  updateFiberStatus as updateFiberStatusService,
  updateFiber,
  fetchFiberCategories,
  fetchCountries,
  createFiber,
} from "../services/fibraService";

export const handleFetchFibras = async (
  setFibras: (fibras: Fibra[]) => void,
  setLoading: (loading: boolean) => void,
  setError: (error: string | null) => void
): Promise<void> => {
  try {
    setLoading(true);
    const response = await fetchFibras();
    setFibras(response.fibers || []); 
  } catch (error) {
    console.error("Error fetching fibers:", error);
    setError("Error al obtener las fibras");
  } finally {
    setLoading(false);
  }
};

export const updateFiberStatus = async (
  fiberId: string,
  isActive: boolean,
  setFibras: Function,
  setSnackbarMessage: Function,
  setSnackbarSeverity: Function,
  setSnackbarOpen: Function
): Promise<void> => {
  try {
    await updateFiberStatusService(fiberId, isActive);
    setFibras((prevFibras: any[]) =>
      prevFibras.map((f) => (f.id === fiberId ? { ...f, isActive } : f))
    );
    setSnackbarMessage(`Fibra ${isActive ? "habilitada" : "deshabilitada"} correctamente`);
    setSnackbarSeverity("success");
  } catch (error) {
    console.error("Error actualizando el estado de la fibra:", error);
    setSnackbarMessage("Error al actualizar el estado de la fibra");
    setSnackbarSeverity("error");
  } finally {
    setSnackbarOpen(true);
  }
};

export const handleUpdateFiber = async (
  fiberId: string,
  payload: any,
  setFibras: Function,
  setSnackbarMessage: Function,
  setSnackbarSeverity: Function,
  setSnackbarOpen: Function
): Promise<void> => {
  try {
    await updateFiber(fiberId, payload);
    setSnackbarMessage("Fibra actualizada correctamente");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);

    setFibras((prevFibras: any[]) =>
      prevFibras.map((fiber) =>
        fiber.id === fiberId ? { ...fiber, ...payload } : fiber
      )
    );
  } catch (error) {
    setSnackbarMessage("Error al actualizar la fibra");
    setSnackbarSeverity("error");
    setSnackbarOpen(true);
    console.error("Error en handleUpdateFiber:", error);
  }
};

export const handleFetchFiberCategories = async (
  setCategories: (categories: { id: number; value: string }[]) => void,
  setError: (error: string | null) => void
): Promise<void> => {
  try {
    const categories = await fetchFiberCategories();
    setCategories(categories || []);
  } catch (error) {
    console.error("Error fetching fiber categories:", error);
    setError("Error al obtener las categorías de fibras");
  }
};

export const handleFetchCountries = async (
  setCountries: (countries: { id: string; name: string }[]) => void,
  setError: (error: string | null) => void
): Promise<void> => {
  try {
    const countries = await fetchCountries();
    setCountries(countries || []);
  } catch (error) {
    console.error("Error fetching countries:", error);
    setError("Error al obtener los países de origen");
  }
};

export const handleCreateFiber = async (
  payload: any,
  setSnackbarMessage: Function,
  setSnackbarSeverity: Function,
  setSnackbarOpen: Function
): Promise<void> => {
  try {
    await createFiber(payload);
    setSnackbarMessage("Fibra creada exitosamente");
    setSnackbarSeverity("success");
  } catch (error) {
    console.error("Error creando fibra:", error);
    setSnackbarMessage("Error al crear la fibra");
    setSnackbarSeverity("error");
  } finally {
    setSnackbarOpen(true);
  }
};

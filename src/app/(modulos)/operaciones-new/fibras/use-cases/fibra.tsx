import { Fiber, MecsaColor } from "../../models/models";
import {
  fetchFibras,
  updateFiberStatus as updateFiberStatusService,
  updateFiber,
  fetchFiberCategories,
  fetchCountries,
  createFiber,
  fetchMecsaColors,
  // IMPORTAR la función de servicio que obtendrá las denominaciones
  fetchDenominationFibers,
} from "../services/fibraService";

export const handleFetchFibras = async (
  setFibras: (fibras: Fiber[]) => void,
  setLoading: (loading: boolean) => void,
  include_inactive: boolean
): Promise<void> => {
  setLoading(true);
  try {
    const response = await fetchFibras(include_inactive);
    setFibras(response.fibers || []);
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
    setFibras((prevFibras: any[]) =>
      prevFibras.map((fiber) =>
        fiber.id === fiberId ? { ...fiber, ...payload } : fiber
      )
    );
  } finally {
    setSnackbarOpen(true);
  }
};

export const handleFetchFiberCategories = async (
  setCategories: (categories: { id: number; value: string }[]) => void
): Promise<void> => {
  const categories = await fetchFiberCategories();
  setCategories(categories || []);
};

export const handleFetchCountries = async (
  setCountries: (countries: { id: string; name: string }[]) => void
): Promise<void> => {
  const countries = await fetchCountries();
  setCountries(countries || []);
};

export const handleCreateFiber = async (payload: any): Promise<void> => {
  await createFiber(payload);
};

export const handleFetchColors = async (
  setColors: (colors: MecsaColor[]) => void
): Promise<void> => {
  const colors = await fetchMecsaColors();
  setColors(colors || []);
};

/** 
 * NUEVA FUNCIÓN: Obtiene las denominaciones de fibras y setea en el estado
 */
export const handleFetchDenominationFibers = async (
  setDenominations: (denominations: { id: number; value: string }[]) => void
): Promise<void> => {
  try {
    const denominations = await fetchDenominationFibers();
    setDenominations(denominations || []);
  } catch (error) {
    console.error("Error al obtener denominaciones de fibra", error);
  }
};

import { Fibra, Categoria, Color } from "../../models/models";
import { fetchFibras } from "../services/fibraService";

export const handleFetchFibras = async (setFibras: Function, setLoading: Function, setError: Function) => {
  try {
    setLoading(true);
    const fibrasData = await fetchFibras();
    setFibras(fibrasData);
  } catch (error) {
    console.error('Error fetching fibers', error);
    setError('Error fetching fibers');
  } finally {
    setLoading(false);
  }
};

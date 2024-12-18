import { Yarn } from "../../models/models";
import { updateYarn } from "../services/hiladoService";

import instance from "@/infrastructure/config/AxiosConfig";

export const handleUpdateYarn = async (
    yarnId: string,
    payload: any,
    setHilados: (hilados: Yarn[]) => void,
    setSnackbarMessage: (message: string) => void,
    setSnackbarSeverity: (severity: "success" | "error") => void,
    setSnackbarOpen: (open: boolean) => void
  ): Promise<void> => {
    try {
      await updateYarn(yarnId, payload);
      setSnackbarMessage("Hilado actualizado correctamente");
      setSnackbarSeverity("success");
    } catch (error) {
      console.error("Error actualizando el hilado:", error);
      setSnackbarMessage("Error al actualizar el hilado");
      setSnackbarSeverity("error");
    } finally {
      setSnackbarOpen(true);
    }
  };
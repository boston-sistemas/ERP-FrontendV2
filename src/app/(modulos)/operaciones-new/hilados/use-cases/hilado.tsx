import { Yarn } from "../../models/models";
import { updateYarn } from "../services/hiladoService";

import instance from "@/infrastructure/config/AxiosConfig";

export const handleUpdateYarn = async (
  yarnId: string,
  payload: any,
  setHilados: React.Dispatch<React.SetStateAction<Yarn[]>>,
  setSnackbarMessage: React.Dispatch<React.SetStateAction<string>>,
  setSnackbarSeverity: React.Dispatch<React.SetStateAction<"success" | "error">>,
  setSnackbarOpen: React.Dispatch<React.SetStateAction<boolean>>
) => {
  try {
    const updatedYarn = await updateYarn(yarnId, payload);
    // Actualizar el estado de los hilados para reflejar los cambios
    setHilados((prev) =>
      prev.map((yarn) =>
        yarn.id === yarnId
          ? { ...yarn, ...payload, recipe: payload.recipe }
          : yarn
      )
    );
    setSnackbarMessage("Hilado actualizado correctamente.");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
  } catch (error) {
    setSnackbarMessage("Error al actualizar el hilado.");
    setSnackbarSeverity("error");
    setSnackbarOpen(true);
  }
};

import { changeUserPassword } from "../services/changePasswordService";

export const handleChangePassword = async (
  newPassword: string,
  setSnackbarMessage: Function,
  setSnackbarSeverity: Function,
  setOpenSnackbar: Function,
  setIsLoading: Function,
  router: any
) => {
  try {
    const response = await changeUserPassword(newPassword);
    if (response.status === 200) {
      localStorage.removeItem("reset_password_at");
      setSnackbarMessage("Contraseña cambiada correctamente.");
      setSnackbarSeverity("success");
      setOpenSnackbar(true);
      setTimeout(() => {
        router.push("/inicio");
      }, 2000);
    } else {
      throw new Error("Error al cambiar la contraseña.");
    }
  } catch (error) {
    setSnackbarMessage("Error al cambiar la contraseña.");
    setSnackbarSeverity("error");
    setOpenSnackbar(true);
    setIsLoading(false);
  }
};

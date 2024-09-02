import { loginUser, resendAuthToken } from "../services/authService";

export const handleLogin = async (username: string, password: string, token: string, setSnackbarMessage: Function, setOpenSnackbar: Function) => {
  try {
    const response = await loginUser(username, password, token);
    if (response.status === 200) {
      const { usuario } = response.data;
      localStorage.setItem('user_display_name', usuario.display_name);
      localStorage.setItem('user_email', usuario.email);
      localStorage.setItem('reset_password_at', usuario.reset_password_at);
      sessionStorage.removeItem('auth_data');
      return true; // Indica éxito
    } else {
      setSnackbarMessage('Error al verificar el código. Inténtelo de nuevo.');
      setOpenSnackbar(true);
      return false; // Indica fallo
    }
  } catch (error) {
    setSnackbarMessage('Error verificando el código de autenticación.');
    setOpenSnackbar(true);
    return false; // Indica fallo
  }
};

export const handleResendToken = async (username: string, password: string, setTimeLeft: Function, setResendVisible: Function, setSnackbarMessage: Function, setOpenSnackbar: Function) => {
  try {
    const response = await resendAuthToken(username, password);
    if (response.status === 200) {
      sessionStorage.setItem('auth_data', JSON.stringify({
        username,
        password,
        token_expiration_minutes: response.data.token_expiration_minutes,
        token_expiration_at: response.data.token_expiration_at,
        email_send_to: response.data.email_send_to,
      }));
      setTimeLeft(response.data.token_expiration_minutes * 60);
      setResendVisible(false);
      return true; // Indica éxito
    } else {
      setSnackbarMessage('Error al reenviar el token. Inténtelo de nuevo.');
      setOpenSnackbar(true);
      return false; // Indica fallo
    }
  } catch (error) {
    setSnackbarMessage('Error al reenviar el token.');
    setOpenSnackbar(true);
    return false; // Indica fallo
  }
};

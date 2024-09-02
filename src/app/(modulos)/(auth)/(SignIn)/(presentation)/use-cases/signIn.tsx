import { sendAuthToken, verifyRecaptcha } from "../services/signInService";

export const handleLogin = async (
  username: string,
  password: string,
  recaptchaToken: string | null,
  setSnackbarMessage: Function,
  setOpenSnackbar: Function,
  router: any,
  setLoading: Function
) => {
  if (!username || !password) {
    setSnackbarMessage('Por favor, complete todos los campos.');
    setOpenSnackbar(true);
    return;
  }

  if (!recaptchaToken) {
    setSnackbarMessage('Por favor, complete el reCAPTCHA.');
    setOpenSnackbar(true);
    return;
  }

  setLoading(true);

  try {
    // Verifica el token de reCAPTCHA
    const recaptchaResponse = await verifyRecaptcha(recaptchaToken);
    const recaptchaData = recaptchaResponse.data;
    if (!recaptchaData.success) {
      throw new Error('Invalid reCAPTCHA');
    }

    // Procede con el login
    const response = await sendAuthToken(username, password);
    if (response.status === 200) {
      sessionStorage.setItem('auth_data', JSON.stringify({
        username,
        password,
        token_expiration_minutes: response.data.token_expiration_minutes,
        token_expiration_at: response.data.token_expiration_at,
        email_send_to: response.data.email_send_to,
      }));
      router.push('/auth-token');
    } else {
      setSnackbarMessage('Error al iniciar sesión. Credenciales inválidas.');
      setOpenSnackbar(true);
    }
  } catch (error) {
    setSnackbarMessage('Error al iniciar sesión. Inténtelo de nuevo.');
    setOpenSnackbar(true);
  } finally {
    setLoading(false);
  }
};

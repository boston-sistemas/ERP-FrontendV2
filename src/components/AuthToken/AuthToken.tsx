"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import TextField from '@mui/material/TextField';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import instance from '@/config/AxiosConfig';
import { IconButton } from '@mui/material';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import LanguageIcon from '@mui/icons-material/Language';
import jwtDecode from 'jwt-decode';
import Cookies from 'js-cookie';

declare global {
  interface Window {
    grecaptcha: any;
  }
}

interface SystemModule {
  nombre: string;
  path: string;
}

interface DecodedToken {
  sub: number;
  username: string;
  system_modules: {
    [key: string]: SystemModule[];
  };
  aud: string;
  type: string;
  exp: number;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const AuthToken: React.FC = () => {
  const [code, setCode] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [resendVisible, setResendVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const authData = JSON.parse(sessionStorage.getItem('auth_data') || '{}');
    if (!authData.username || !authData.password) {
      sessionStorage.removeItem('auth_data');
      router.push('/');
      return;
    }
    
    const expirationMinutes = authData.token_expiration_minutes || 0;
    setTimeLeft(expirationMinutes * 60);

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          setResendVisible(true);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const authData = JSON.parse(sessionStorage.getItem('auth_data') || '{}');
    const { username, password } = authData;

    if (!code) {
      setSnackbarMessage('Por favor, ingrese el código de autenticación.');
      setOpenSnackbar(true);
      return;
    }

    try {
      const response = await instance.post('/security/v1/auth/login', { username, password, token: code });
      if (response.status === 200) {
        const { access_token, usuario } = response.data;
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('user_display_name', usuario.display_name);
        localStorage.setItem('user_email', usuario.email);

        // Almacenar el token completo en una cookie
        Cookies.set('accesos', access_token, { secure: true, sameSite: 'strict' });

        sessionStorage.removeItem('auth_data');
        router.push('/inicio');
      } else {
        setSnackbarMessage('Error al verificar el código. Inténtelo de nuevo.');
        setOpenSnackbar(true);
      }
    } catch (error) {
      setSnackbarMessage('Error verificando el código de autenticación.');
      setOpenSnackbar(true);
    }
  };

  const handleResendToken = async () => {
    const authData = JSON.parse(sessionStorage.getItem('auth_data') || '{}');
    const { username, password } = authData;

    try {
      const response = await instance.post('/security/v1/auth/send-token', { username, password });
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
      } else {
        setSnackbarMessage('Error al reenviar el token. Inténtelo de nuevo.');
        setOpenSnackbar(true);
      }
    } catch (error) {
      setSnackbarMessage('Error al reenviar el token.');
      setOpenSnackbar(true);
    }
  };

  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const authData = JSON.parse(sessionStorage.getItem('auth_data') || '{}');
  const emailSendTo = authData.email_send_to;

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-wrap flex-1">
        <div className="md:w-1/2 w-full bg-blue-900 p-4 md:order-1 flex items-center justify-center">
          <div className="flex flex-col items-center max-w-md text-center">
            <div style={{ width: 200, height: 200, position: 'relative' }}>
              <Image
                src="/images/email.png"
                alt="Logo de Email"
                fill
                priority
                placeholder="blur"
                blurDataURL="/images/email.png"
              />
            </div>
            <p className="text-white mt-4 text-2xl font-bold">
              Revisa tu correo
            </p>
            <p className="text-white mt-2 text-lg">
              Hemos enviado un código de autenticación a <strong>{emailSendTo}</strong>
            </p>
          </div>
        </div>
        <div className="flex flex-col justify-center items-center w-full bg-white p-4 md:w-1/2 md:order-2">
          <div className="w-full max-w-md px-2 sm:px-6">
            <div className="flex flex-col items-center">
              <form className="w-full" onSubmit={handleSubmit}>
                <TextField
                  type="text" id="code" label="Código de Autenticación" variant="standard" margin="normal" fullWidth value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
                <button
                  type="submit"
                  className="mt-4 w-full bg-red-600 text-white py-2 rounded hover:bg-red-500 transition duration-300 ease-in-out flex justify-center items-center"
                >
                  Verificar Código
                </button>
              </form>
              <p className="text-black mt-4 text-lg">
                {`El código expira en: ${formatTime(timeLeft)} minutos`}
              </p>
              {resendVisible && (
                <button
                  onClick={handleResendToken}
                  className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-500 transition duration-300 ease-in-out flex justify-center items-center"
                >
                  Volver a Enviar Token
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <footer className="w-full p-1 bg-zinc-800 text-white flex justify-center items-center mt-auto">
        <span>© {new Date().getFullYear()} MECSA. Todos los derechos reservados.</span>
        <div className="ml-4 mr-4"></div>
        <div className="flex space-x-4">
          <a href="https://www.instagram.com/bostonropainterior/" target="_blank" rel="noopener noreferrer">
            <IconButton aria-label="Instagram" color="inherit">
              <InstagramIcon />
            </IconButton>
          </a>
          <a href="https://www.facebook.com/BostonOficial/" target="_blank" rel="noopener noreferrer">
            <IconButton aria-label="Facebook" color="inherit">
              <FacebookIcon />
            </IconButton>
          </a>
          <a href="https://www.boston.com.pe/" target="_blank" rel="noopener noreferrer">
            <IconButton aria-label="Web page" color="inherit">
              <LanguageIcon />
            </IconButton>
          </a>
        </div>
      </footer>
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%', alignItems: 'center' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default AuthToken;

"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '../../context/AuthContext';
import Image from 'next/image';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import LanguageIcon from '@mui/icons-material/Language';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import axios from 'axios';

declare global {
  interface Window {
    grecaptcha: any;
  }
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const SignIn: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const { login } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=6LdqRw0qAAAAADHZQrRe1MoZRXn7NVG6IG5aFu2H`;
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.grecaptcha) {
        window.grecaptcha.ready(() => {
          window.grecaptcha.execute('6LdqRw0qAAAAADHZQrRe1MoZRXn7NVG6IG5aFu2H', { action: 'login' }).then((token: string) => {
            setRecaptchaToken(token);
          });
        });
      } else {
        console.error('grecaptcha not loaded');
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleRecaptcha = async () => {
    return new Promise<string>((resolve) => {
      window.grecaptcha.ready(() => {
        window.grecaptcha.execute('6LdqRw0qAAAAADHZQrRe1MoZRXn7NVG6IG5aFu2H', { action: 'submit' }).then((token: string) => {
          resolve(token);
        });
      });
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setSnackbarMessage('Por favor, complete todos los campos.');
      setOpenSnackbar(true);
      return;
    }

    try {
      const token = await handleRecaptcha();
      setRecaptchaToken(token);

      const recaptchaResponse = await axios.post('/api/verifyRecaptcha', { token });
      if (recaptchaResponse.data.message === 'Token is valid') {
        const success = await login(username, password);
        if (success) {
          router.push('/panel');
        } else {
          setSnackbarMessage('Error al iniciar sesión. Credenciales inválidas.');
          setOpenSnackbar(true);
        }
      } else {
        setSnackbarMessage('Error de reCAPTCHA. Inténtalo de nuevo.');
        setOpenSnackbar(true);
      }
    } catch (error) {
      setSnackbarMessage('Error verificando reCAPTCHA.');
      setOpenSnackbar(true);
    }
  };

  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-wrap flex-1">
        <div className="md:w-1/2 w-full bg-blue-900 p-4 md:order-1 flex items-center justify-center">
          <div className="flex flex-col items-start max-w-md">
            <div style={{ width: 150, height: 30, position: 'relative' }}>
              <Image
                src="/images/boston/logo-boston-color.png"
                alt="Logo de Boston"
                fill
                priority
                placeholder="blur"
                blurDataURL="/images/boston/logo-boston-color.png"
              />
            </div>
            <p className="text-white mt-4 text-xl">
              UN <span className="font-bold">PRODUCTO</span> ORIGINAL <br /><span className="font-bold">DEJA</span> <span className="font-bold">HUELLA</span>
            </p>
          </div>
        </div>
        <div className="flex flex-col justify-center items-center w-full bg-white p-4 md:w-1/2 md:order-2">
          <div className="w-full max-w-md px-2 sm:px-6">
            <div className="flex flex-col items-center">
              <form className="w-full" onSubmit={handleSubmit}>
                <TextField
                  type="text" id="username" label="Usuario" variant="standard" margin="normal" fullWidth value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <TextField
                  type={showPassword ? 'text' : 'password'} id="password" label="Contraseña" variant="standard" margin="normal" fullWidth
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton aria-label="toggle password visibility" onClick={toggleShowPassword}>
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <button
                  type="submit"
                  className="mt-4 w-full bg-red-600 text-white py-2 rounded hover:bg-red-500 transition duration-300 ease-in-out flex justify-center items-center"
                >
                  Ingresar
                </button>
              </form>
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

export default SignIn;

// src/components/SignIn/SignIn.tsx
"use client";

import React, { useState } from 'react';
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

const SignIn: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuthContext();
  const router = useRouter();

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(username, password);
      router.push('/panel');
    } catch (error) {
      console.error(error);
      alert('Error al iniciar sesión');
    }
  };

  return (
    <div className="flex flex-wrap min-h-screen">
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
              <div className="flex justify-around mt-4">
                <a href="https://www.instagram.com/bostonropainterior/" target="_blank" rel="noopener noreferrer">
                  <IconButton aria-label="Instagram" color="primary">
                    <InstagramIcon />
                  </IconButton>
                </a>
                <a href="https://www.facebook.com/BostonOficial/" target="_blank" rel="noopener noreferrer">
                  <IconButton aria-label="Facebook" color="primary">
                    <FacebookIcon />
                  </IconButton>
                </a>
                <a href="https://www.boston.com.pe/" target="_blank" rel="noopener noreferrer">
                  <IconButton aria-label="Web page" color="primary">
                    <LanguageIcon />
                  </IconButton>
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;

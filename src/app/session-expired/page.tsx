"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LuTimerOff } from "react-icons/lu";

const SessionExpired = () => {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    // Eliminar tokens
    localStorage.removeItem('access_token');
     

    const timer = setInterval(() => {
      setCountdown((prevCountdown) => prevCountdown - 1);
    }, 1000);

    const redirectTimeout = setTimeout(() => {
      router.push('/');
    }, 10000); // Redirigir después de 11 segundos

    return () => {
      clearInterval(timer);
      clearTimeout(redirectTimeout);
    };
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="text-center p-6 bg-white shadow-md rounded-lg">
        <LuTimerOff 
          size={150}
          className="mx-auto mb-4"
        />
        <h1 className="text-2xl font-bold mb-2">Tu sesión ha expirado</h1>
        <p className="mb-4">Serás redirigido al inicio de sesión en <span className="font-bold">{countdown}</span> segundos.</p>
      </div>
    </div>
  );
};

export default SessionExpired;

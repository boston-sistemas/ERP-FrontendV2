"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const Inicio: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    const resetPasswordAt = localStorage.getItem('reset_password_at');
    
    if (resetPasswordAt) {
      const resetTime = new Date(resetPasswordAt).getTime();
      const currentTime = new Date().getTime();
      if (currentTime > resetTime) {
        router.push('/change-password');
      }
    }
  }, [router]);

  return (
    <p>Hola</p>
  );
};

export default Inicio;
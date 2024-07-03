"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const NotFound: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleGoBack = () => {
    if (mounted) {
      router.back();
    }
  };

  if (!mounted) {
    return null; 
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-800">
      <div className="max-w-md text-center">
        <h1 className="text-6xl font-bold text-blue-900 dark:text-white">404</h1>
        <p className="mt-4 text-2xl text-gray-700 dark:text-gray-300">
          Página no encontrada
        </p>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
        </p>
        <button
          onClick={handleGoBack}
          className="mt-6 px-4 py-2 text-white bg-blue-800 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded"
        >
          Volver atrás
        </button>
      </div>
    </div>
  );
};

export default NotFound;

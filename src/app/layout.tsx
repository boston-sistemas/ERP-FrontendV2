// src/app/layout.tsx
"use client";
import "jsvectormap/dist/css/jsvectormap.css";
import "flatpickr/dist/flatpickr.min.css";
import "@/css/satoshi.css";
import "@/css/style.css";
import React, { useEffect, useState } from "react";
import Loader from "@/components/common/Loader";
import { AuthProvider } from '../context/AuthContext'; // Asegúrate de importar el AuthProvider
import { AxiosInterceptor } from '../config/AxiosConfig'; // Importa el AxiosInterceptor

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 4500);
  }, []);

  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <div className="dark:bg-boxdark-2 dark:text-bodydark">
          <Loader loading={loading} />
          <AuthProvider>
            <AxiosInterceptor />
            <div className={`${loading ? "hidden" : "block"} relative`}>
              {children}
            </div>
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}

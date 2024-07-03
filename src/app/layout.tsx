"use client";
import "jsvectormap/dist/css/jsvectormap.css";
import "flatpickr/dist/flatpickr.min.css";
import "@/css/satoshi.css";
import "@/css/style.css";
import React, { useEffect, useState } from "react";
import Loader from "@/components/common/Loader";
import { AuthProvider, useAuthContext } from '../context/AuthContext';
import { AxiosInterceptor } from '../config/AxiosConfig';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert, { AlertProps } from '@mui/material/Alert';

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

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
            <SessionExpiredHandler />
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}

const SessionExpiredHandler = () => {
  const { sessionExpired } = useAuthContext();

  return (
    <Snackbar
      open={sessionExpired}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert severity="warning">Su sesión ha expirado. Redirigiendo al inicio de sesión...</Alert>
    </Snackbar>
  );
};

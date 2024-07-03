import React, { createContext, useState, useContext, ReactNode, Dispatch, SetStateAction } from 'react';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert, { AlertProps } from '@mui/material/Alert';

interface SessionExpiredContextType {
  sessionExpired: boolean;
  setSessionExpired: Dispatch<SetStateAction<boolean>>;
}

const SessionExpiredContext = createContext<SessionExpiredContextType | null>(null);

export const useSessionExpiredContext = () => {
  const context = useContext(SessionExpiredContext);
  if (!context) {
    throw new Error('useSessionExpiredContext must be used within a SessionExpiredProvider');
  }
  return context;
};

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export const SessionExpiredProvider = ({ children }: { children: ReactNode }) => {
  const [sessionExpired, setSessionExpired] = useState(false);

  return (
    <SessionExpiredContext.Provider value={{ sessionExpired, setSessionExpired }}>
      {children}
      <Snackbar
        open={sessionExpired}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        onClose={() => setSessionExpired(false)}
        autoHideDuration={3000}
      >
        <Alert severity="warning">Su sesión ha expirado. Redirigiendo al inicio de sesión...</Alert>
      </Snackbar>
    </SessionExpiredContext.Provider>
  );
};

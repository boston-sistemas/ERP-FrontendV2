import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import axios from '../config/AxiosConfig';
import jwt from 'jsonwebtoken';
import { useRouter } from 'next/navigation';
import { User } from '../types/user';

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  sessionExpired: boolean;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Nuevo estado
  const router = useRouter();

  const isTokenExpired = (token: string) => {
    try {
      const decodedToken = jwt.decode(token) as any;
      const currentTime = Date.now() / 1000;
      return decodedToken.exp < currentTime;
    } catch (error) {
      console.error('Error decoding token:', error);
      return true;
    }
  };

  const refreshAccessToken = useCallback(async () => {
    console.log('Intentando refrescar el access token...');
    const refreshToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('refresh_token='))
      ?.split('=')[1];

    if (!refreshToken || isTokenExpired(refreshToken)) {
      console.log('Refresh token no existe o ha expirado.');
      throw new Error('Refresh token expirado o no existe.');
    }

    try {
      const response = await axios.post('security/v1/auth/refresh');
      const newAccessToken = response.data.access_token;
      localStorage.setItem('access_token', newAccessToken);
      const decodedToken = jwt.decode(newAccessToken) as User;
      setUser({
        id: decodedToken.id,
        username: decodedToken.username,
        accesos: decodedToken.accesos,
      });
      console.log('Access token refrescado exitosamente.');
    } catch (error) {
      console.error('Error refrescando el access token:', error);
      throw error; // Lanzar el error para que el interceptor lo maneje
    }
  }, []);

  const checkAuth = useCallback(async () => {
    console.log('Verificando autenticación...');
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      console.log('No se encontró access token.');
      setUser(null);
    } else if (isTokenExpired(accessToken)) {
      console.log('El access token ha expirado.');
      try {
        await refreshAccessToken();
      } catch (error) {
        console.error('Error refrescando el access token:', error);
        setUser(null);
      }
    } else {
      console.log('El access token es válido.');
      const decodedToken = jwt.decode(accessToken) as User;
      setUser({
        id: decodedToken.id,
        username: decodedToken.username,
        accesos: decodedToken.accesos,
      });
      setIsAuthenticated(true); // Marcar como autenticado
    }
  }, [refreshAccessToken]);

  const login = useCallback(async (username: string, password: string) => {
    console.log('Intentando iniciar sesión...');
    if (!username || !password) {
      alert('Por favor, complete todos los campos.');
      return false;
    }
    try {
      const response = await axios.post('security/v1/auth/login', { username, password });
      const { access_token, refresh_token, usuario } = response.data;
      localStorage.setItem('access_token', access_token);
      document.cookie = `refresh_token=${refresh_token}; Path=/; HttpOnly`;
      setUser(usuario);
      setIsAuthenticated(true); // Marcar como autenticado
      console.log('Inicio de sesión exitoso.');
      return true;
    } catch (error) {
      console.error('Error iniciando sesión:', error);
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    console.log('Intentando cerrar sesión...');
    try {
      await axios.post('security/v1/auth/logout');
      localStorage.removeItem('access_token');
      document.cookie = 'refresh_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      setUser(null);
      setIsAuthenticated(false); // Marcar como no autenticado
      console.log('Cierre de sesión exitoso.');
    } catch (error) {
      console.error('Error cerrando sesión:', error);
      throw error;
    }
  }, []);

  useEffect(() => {
    const authenticate = async () => {
      console.log('Autenticando...');
      const accessToken = localStorage.getItem('access_token');
      if (accessToken && isTokenExpired(accessToken)) {
        console.log('El access token ha expirado.');
        try {
          await refreshAccessToken();
        } catch (error) {
          console.error('Error refrescando el access token:', error);
          setSessionExpired(true);
          setTimeout(() => {
            setSessionExpired(false);
          }, 0);
        }
      } else if (accessToken) {
        console.log('El access token es válido.');
        const decodedToken = jwt.decode(accessToken) as User;
        setUser({
          id: decodedToken.id,
          username: decodedToken.username,
          accesos: decodedToken.accesos,
        });
      } else {
        console.log('No se encontró access token.');
        router.push('/');
      }
      setLoading(false);
    };
    authenticate();
  }, [router, refreshAccessToken, isAuthenticated]);

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, checkAuth, refreshAccessToken, sessionExpired, loading, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

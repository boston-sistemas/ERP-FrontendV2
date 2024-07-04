import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import axios from '../config/AxiosConfig';
import jwt from 'jsonwebtoken';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

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
    const allCookies = Cookies.get();
    console.log('Todas las cookies:', allCookies);
  
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
      throw error;
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
        router.push('/session-expired');
      }
    } else {
      console.log('El access token es válido.');
      const decodedToken = jwt.decode(accessToken) as User;
      setUser({
        id: decodedToken.id,
        username: decodedToken.username,
        accesos: decodedToken.accesos,
      });
      setIsAuthenticated(true);
    }
  }, [refreshAccessToken, router]);

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
      Cookies.set('refresh_token', refresh_token, { path: '/', secure: true, sameSite: 'Lax' });
      setUser(usuario);
      setIsAuthenticated(true);
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
      Cookies.remove('refresh_token', { path: '/' });
      setUser(null);
      setIsAuthenticated(false);
      console.log('Cierre de sesión exitoso.');
    } catch (error) {
      console.error('Error cerrando sesión:', error);
      throw error;
    }
  }, []);

  useEffect(() => {
    const authenticate = async () => {
      await checkAuth();
      setLoading(false);
    };

    authenticate();
  }, [pathname, checkAuth]); // Re-check auth on pathname change

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, checkAuth, refreshAccessToken, sessionExpired, loading, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

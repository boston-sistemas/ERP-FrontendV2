import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import axios from '../config/AxiosConfig';
import { jwtDecode } from 'jwt-decode'; // Importa correctamente jwtDecode
import { User } from '../types/user'; // Importar el tipo User

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
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

  const isTokenExpired = (token: string) => {
    const decodedToken: any = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decodedToken.exp < currentTime;
  };

  const refreshAccessToken = useCallback(async () => {
    console.log('refreshAccessToken: Attempting to refresh access token.');
    try {
      const response = await axios.post('security/v1/auth/refresh');
      const newAccessToken = response.data.access_token;
      localStorage.setItem('access_token', newAccessToken);
      const decodedToken: User = jwtDecode(newAccessToken);
      setUser({ 
        id: decodedToken.id, 
        username: decodedToken.username, 
        accesos: decodedToken.accesos 
      });
      console.log('refreshAccessToken: Access token refreshed successfully.');
    } catch (error) {
      console.error('refreshAccessToken: Failed to refresh access token.', error);
      localStorage.removeItem('access_token');
      document.cookie = 'refresh_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      setUser(null);
      throw error;
    }
  }, []);

  const checkAuth = useCallback(async () => {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      try {
        await refreshAccessToken();
      } catch (error) {
        console.error('context/AuthContext checkAuth: No access token found and refresh token failed.');
        setUser(null);
      }
    } else if (isTokenExpired(accessToken)) {
      console.log('context/AuthContext checkAuth: Access token is expired, attempting to refresh.');
      try {
        await refreshAccessToken();
      } catch (error) {
        console.error('context/AuthContext checkAuth: Refresh token failed.', error);
        setUser(null);
      }
    } else {
      try {
        const decodedToken: User = jwtDecode(accessToken);
        setUser({ 
          id: decodedToken.id, 
          username: decodedToken.username, 
          accesos: decodedToken.accesos 
        });
      } catch (error) {
        localStorage.removeItem('access_token');
        console.error('context/AuthContext checkAuth: Invalid access token.', error);
        setUser(null);
      }
    }
  }, [refreshAccessToken]);

  const login = useCallback(async (username: string, password: string) => {
    console.log('login: Attempting to log in.');
    try {
      const response = await axios.post('security/v1/auth/login', { username, password });
      const { access_token, usuario } = response.data;
      localStorage.setItem('access_token', access_token);
      console.log('login: Logged in successfully.');
      setUser(usuario);
    } catch (error) {
      console.error('login: Failed to log in.', error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    console.log('logout: Attempting to log out.');
    try {
      await axios.post('security/v1/auth/logout');
      localStorage.removeItem('access_token');
      document.cookie = 'refresh_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      setUser(null);
      console.log('logout: Logged out successfully.');
    } catch (error) {
      console.error('logout: Failed to log out.', error);
      throw error;
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, checkAuth, refreshAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

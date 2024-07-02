// src/context/AuthContext.tsx
import React, { createContext, useState, useContext, ReactNode } from 'react';
import axios from '../config/AxiosConfig';
import { jwtDecode } from 'jwt-decode';
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

  const checkAuth = async () => {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      try {
        await refreshAccessToken();
      } catch (error) {
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
        setUser(null);
      }
    }
  };

  const refreshAccessToken = async () => {
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
    } catch (error) {
      throw error;
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const response = await axios.post('security/v1/auth/login', { username, password });
      const { access_token, usuario } = response.data;
      localStorage.setItem('access_token', access_token);
      setUser(usuario);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await axios.post('security/v1/auth/logout');
      localStorage.removeItem('access_token');
      setUser(null);
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, checkAuth, refreshAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

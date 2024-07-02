import axios from 'axios';
import React, { useEffect } from 'react';
import { useAuthContext } from '../context/AuthContext'; // Importa el hook useAuthContext

const server = 'http://localhost:8000'; // Local
// const server ='http://10.0.1.9:8000/'; // Producción

const instance = axios.create({
  baseURL: server,
  withCredentials: true,
});

const AxiosInterceptor = () => {
  const { refreshAccessToken, logout } = useAuthContext();

  useEffect(() => {
    const interceptor = instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          console.log('config/AxiosConfig Interceptor: Access token expired, attempting to refresh.');
          originalRequest._retry = true;
          try {
            await refreshAccessToken();
            originalRequest.headers['Authorization'] = `Bearer ${localStorage.getItem('access_token')}`;
            return instance(originalRequest);
          } catch (err) {
            console.error('config/AxiosConfig Interceptor: Refresh token failed, logging out.');
            localStorage.removeItem('access_token');
            document.cookie = 'refresh_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            await logout();
            window.location.href = '/';
            return Promise.reject(err);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      instance.interceptors.response.eject(interceptor);
    };
  }, [refreshAccessToken, logout]);

  return null;
};

export { AxiosInterceptor };
export default instance; // Exportar axiosInstance por defecto

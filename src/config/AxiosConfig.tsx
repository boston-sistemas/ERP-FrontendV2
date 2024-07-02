// src/config/AxiosConfig.ts
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useAuthContext } from '../context/AuthContext';

const server = 'http://localhost:8000'; // Local
// const server ='http://10.0.1.9:8000/'; // Producción

const instance = axios.create({
  baseURL: server,
  withCredentials: true,
});

// Añadir un interceptor de respuesta
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { refreshAccessToken } = useAuthContext();
        await refreshAccessToken();
        originalRequest.headers['Authorization'] = `Bearer ${localStorage.getItem('access_token')}`;
        return instance(originalRequest);
      } catch (err) {
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

export default instance;

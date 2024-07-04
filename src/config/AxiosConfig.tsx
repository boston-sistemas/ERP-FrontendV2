import axios from 'axios';
import { useAuthContext } from '../context/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const server = 'http://localhost:8000'; // Local

const instance = axios.create({
  baseURL: server,
  withCredentials: true,
});

const AxiosInterceptor = () => {
  const { refreshAccessToken } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    const interceptor = instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('login')) {
          originalRequest._retry = true;
          try {
            await refreshAccessToken();
            originalRequest.headers['Authorization'] = `Bearer ${localStorage.getItem('access_token')}`;
            return instance(originalRequest);
          } catch (err) {
            console.log('Refresh token expirado o inválido:', err);
            router.push('/session-expired');
            return Promise.reject(err);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      instance.interceptors.response.eject(interceptor);
    };
  }, [refreshAccessToken, router]);

  return null;
};

export { AxiosInterceptor };
export default instance;

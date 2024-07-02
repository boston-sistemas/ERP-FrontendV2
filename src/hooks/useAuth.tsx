// src/hooks/useAuth.ts
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from '../config/AxiosConfig';
import { jwtDecode } from 'jwt-decode'; // Importa correctamente jwtDecode
import { useAuthContext } from '../context/AuthContext';
import { User } from '../types/user'; // Importar el tipo User

const useAuth = () => {
  const { user, setUser, login, logout, checkAuth } = useAuthContext();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const authenticate = async () => {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
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
          console.error('Error refreshing token', error);
          router.push('/');
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
          console.error('Invalid access token', error);
          router.push('/');
        }
      }
      setLoading(false);
    };
    authenticate();
  }, [router, setUser]);

  return { user, loading, login, logout, checkAuth };
};

export default useAuth;

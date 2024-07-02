import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from '../config/AxiosConfig';
import { jwtDecode } from 'jwt-decode'; // Importa correctamente jwtDecode
import { useAuthContext } from '../context/AuthContext';
import { User } from '../types/user'; // Importar el tipo User

const useAuth = () => {
  const { user, setUser, login, logout, checkAuth, refreshAccessToken } = useAuthContext();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isTokenExpired = (token: string) => {
      const decodedToken: any = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decodedToken.exp < currentTime;
    };

    const authenticate = async () => {
      console.log('useAuth: Checking authentication status.');
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        try {
          console.log('useAuth: No access token found, attempting to refresh.');
          await refreshAccessToken();
          console.log('useAuth: Access token refreshed and user authenticated.');
        } catch (error) {
          console.error('useAuth: Error refreshing token', error);
          router.push('/');
        }
      } else if (isTokenExpired(accessToken)) {
        try {
          console.log('useAuth: Access token expired, attempting to refresh.');
          await refreshAccessToken();
          console.log('useAuth: Access token refreshed and user authenticated.');
        } catch (error) {
          console.error('useAuth: Error refreshing token', error);
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
          console.log('useAuth: User authenticated with existing access token.');
        } catch (error) {
          localStorage.removeItem('access_token');
          console.error('useAuth: Invalid access token', error);
          router.push('/');
        }
      }
      setLoading(false);
    };
    authenticate();
  }, [router, setUser, refreshAccessToken]);

  return { user, loading, login, logout, checkAuth };
};

export default useAuth;

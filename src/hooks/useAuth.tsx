import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { useAuthContext } from '../context/AuthContext';
import { User } from '../types/user';

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
      if (accessToken && isTokenExpired(accessToken)) {
        try {
          console.log('useAuth: Access token expired, attempting to refresh.');
          await refreshAccessToken();
          console.log('useAuth: Access token refreshed and user authenticated.');
        } catch (error) {
          console.error('useAuth: Error refreshing token', error);
          localStorage.removeItem('access_token');
          document.cookie = 'refresh_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
          router.push('/');
        }
      } else if (accessToken) {
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
          document.cookie = 'refresh_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
          console.error('useAuth: Invalid access token', error);
          router.push('/');
        }
      } else {
        console.error('useAuth: No access token found.');
        router.push('/');
      }
      setLoading(false);
    };
    authenticate();
  }, [router, setUser, refreshAccessToken]);

  useEffect(() => {
    if (user) {
      router.push('/panel');
    }
  }, [user, router]);

  return { user, loading, login, logout, checkAuth };
};

export default useAuth;

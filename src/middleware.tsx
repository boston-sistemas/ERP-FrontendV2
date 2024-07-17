import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';
import instance from '@/config/AxiosConfig';

interface SystemModule {
  nombre: string;
  path: string;
}

interface DecodedToken {
  sub: number;
  username: string;
  system_modules: {
    [key: string]: SystemModule[];
  };
  aud: string;
  type: string;
  exp: number;
}

function redirectTo(baseUrl: string, path: string) {
  return NextResponse.redirect(new URL(path, baseUrl));
}

async function refreshAccessToken(refreshToken: string, response: NextResponse) {
  console.log("refreshing");
  const refresh_response = await instance.post('/security/v1/auth/refresh', null, {
    headers: {
      'Cookie': `refresh_token=${refreshToken}`
    }
  });

  const accessToken = refresh_response.data.access_token;
  const expirationAt = new Date(refresh_response.data.access_token_expiration_at);

  response.cookies.set("access_token", accessToken, {
    httpOnly: false,
    secure: false, // true en produccion
    expires: expirationAt,
    sameSite: "lax",
  });

  return accessToken;
}

function decodeToken(accessToken: string): DecodedToken {
  return jwtDecode<DecodedToken>(accessToken);
}

function isAccessAllowed(decoded: DecodedToken, urlPath: string): boolean {
  return Object.values(decoded.system_modules).some((system_module) =>
    system_module.some((acceso) => urlPath === acceso.path)
  );
}

export async function middleware(request: NextRequest) {
  const refreshToken = request.cookies.get('refresh_token')?.value; 
  let accessToken = request.cookies.get('access_token')?.value;
  
  const baseUrl = request.nextUrl.origin;
  const urlPath = request.nextUrl.pathname;
  const response = NextResponse.next();
  // console.log({request})
  if (refreshToken && (urlPath === "/" || urlPath === "/auth-token"))
    return redirectTo(baseUrl, '/inicio');

  if (!refreshToken) {
    console.log('No se encontró el refresh token, redirigiendo al login.');
    return redirectTo(baseUrl, '/');
  }

  if (!accessToken) {
    accessToken = await refreshAccessToken(refreshToken, response);
  }

  try {
    if (!accessToken || typeof accessToken !== "string")
      return redirectTo(baseUrl, '/access-denied');
    
    const decoded = decodeToken(accessToken);
    if (!isAccessAllowed(decoded, urlPath)) {
      console.log(`Acceso denegado para la ruta: ${urlPath}`);
      return redirectTo(baseUrl, '/access-denied');
    }
    console.log('Token encontrado y acceso permitido.');
    return response;
  } catch (error) {
    console.error("Error decoding token:", error);
    return redirectTo(baseUrl, '/session-expired');
  }
}

export const config = {
  matcher: [
    // '/',
    '/operaciones/panel/',
    '/operaciones/revision-stock/',
    '/operaciones/programacion-tintoreria/',
    '/tejeduria/reporte-stock/',
    '/seguridad/usuarios/',
    '/seguridad/usuarios/crear-usuario/',
    '/seguridad/roles/',
    '/seguridad/roles/crear-rol/'
  ],
};

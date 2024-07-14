import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';

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

const dev = true;

export function middleware(request: NextRequest) {
  const token = request.cookies.get('accesos')?.value;

  if (!token && !dev) {
    console.log('No se encontró el token, redirigiendo al login.');
    return NextResponse.redirect(new URL('/session-expired', request.url));
  }

  if (token) {
    try {
      const decoded: DecodedToken = jwtDecode<DecodedToken>(token);
      const urlPath = request.nextUrl.pathname;
      const allowedPaths: { [key: string]: SystemModule[] } = decoded.system_modules;
      const isPathAllowed = Object.values(allowedPaths).some((modules) =>
        modules.some((module) => urlPath.startsWith(module.path))
      );

      if (!isPathAllowed) {
        console.log(`Acceso denegado para la ruta: ${urlPath}`);
        return NextResponse.redirect(new URL('/access-denied', request.url));
      }

      console.log('Token encontrado y acceso permitido.');
      return NextResponse.next();
    } catch (error) {
      console.error("Error decoding token:", error);
      return NextResponse.redirect(new URL('/session-expired', request.url));
    }
  }

  console.log('Token encontrado, permitiendo el acceso.');
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/operaciones/panel/',
    '/operaciones/revision-stock/',
    '/operaciones/programacion-tintoreria/',
    '/tejeduria/reporte-stock/',
    '/seguridad/usuarios',
    '/seguridad/usuarios/crear-usuario',
    '/seguridad/roles/',
  ],
};

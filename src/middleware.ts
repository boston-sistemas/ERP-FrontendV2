import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('refresh_token')?.value;

  if (!token) {
    console.log('No se encontró el token, redirigiendo al login.');
    return NextResponse.redirect(new URL('/session-expired', request.url));
  }

  console.log('Token encontrado, permitiendo el acceso.');
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/panel/',
    '/operaciones/revision-stock/',
    '/operaciones/programacion-tintoreria/',
    '/tejeduria/reporte-stock/',
    '/seguridad/usuarios',
    '/seguridad/usuarios/crear-usuario',
    '/seguridad/roles/',
  ],
};

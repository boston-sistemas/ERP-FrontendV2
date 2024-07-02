// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('refresh_token');

  if (!token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/panel/',
    '/operaciones/revision-stock/',
    '/operaciones/programacion-tintoreria/',
    '/tejeduria/reporte-stock/',
    '/seguridad/usuarios',
    '/seguridad/usuarios/crear-usuario',
    '/seguridad/roles/'],
};
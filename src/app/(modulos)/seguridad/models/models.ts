﻿export interface Acceso {
    acceso_id: number;
    nombre: string;
    is_active: boolean;
  }
  
export interface Rol {
    rol_id: number;
    nombre: string;
    is_active: boolean;
    rol_color: string;
    accesos: Acceso[];
}

export interface Usuario {
    usuario_id: number;
    username: string;
    email: string;
    display_name: string;
    is_active: boolean;
    blocked_until: string | null;
    roles: Rol[];
}
export interface Acceso {
    acceso_id: number;
    nombre: string;
    is_active: boolean;
  }
  
  export interface Rol {
    rol_id: number;
    nombre: string;
    is_active: boolean;
    accesos: Acceso[];
  }
  
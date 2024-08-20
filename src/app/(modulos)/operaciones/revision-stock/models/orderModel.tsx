export interface Detalle {
    tejido: string;
    ancho: string;
    programado: number;
    consumido: number;
    restante: number;
    merma: string;
    progreso: string;
    estado: string;
  }
  
  export interface Orden {
    orden: string;
    fecha: string;
    tejeduria: string;
    programado: number;
    consumido: number;
    restante: number;
    merma: string;
    progreso: string;
    estado: string;
    expandida: Detalle[];
  }
  
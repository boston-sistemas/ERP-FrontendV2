export interface Categoria {
    id: number; 
    value: string;
  }
  
export interface Color {
id: string; 
name: string;
sku: string;
hexadecimal: string;
isActive: boolean;
}

export interface Fibra {
id: string; 
categoryId: number; 
denomination: string;
origin: string;
colorId: string; 
isActive: boolean;
category: Categoria; 
color: Color | null; 
}

export interface MecsaColor {
id: string;
name: string;
sku: string;
hexadecimal: string;
isActive: boolean;
}

export interface FiberCategory {
id: number;
value: string;
}

export interface FibraResponse {
    fibers: Fibra[];
  }
  
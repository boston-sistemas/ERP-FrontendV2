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
denomination: string | null;
origin: string | null;
colorId: string | null; 
isActive: boolean;
category: Categoria; 
color: MecsaColor | null; 
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

export interface Fiber {
  id: string;
  denomination: string;
  origin: string | null;
  isActive: boolean;
  category: Categoria;
  color: Color | null;
}

export interface Recipe {
  proportion: number;
  fiber: Fiber;
}

export interface SpinningMethod {
  id: number;
  value: string;
}

export interface Yarn {
  id: string;
  inventoryUnitCode: string;
  purchaseUnitCode: string;
  description: string;
  purchaseDescription: string;
  barcode: number;
  isActive: boolean;
  spinningMethod: SpinningMethod;
  color: Color | null;
  recipe: Recipe[];
  yarnCount: string;
  numberingSystem: string;
}

export interface YarnResponse {
  yarns: Yarn[];
}
  
export interface Recipe {
  proportion: number;
  fiber: {
    id: string;
    denomination: string;
    origin: string | null;
    isActive: boolean;
    category: {
      id: number;
      value: string;
    };
    color: {
      id: string;
      name: string;
      sku: string;
      hexadecimal: string;
      isActive: boolean;
    } | null;
  };
}

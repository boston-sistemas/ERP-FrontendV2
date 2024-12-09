export interface Categoria{
    categoryId: number;
    name: string;
}

export interface Color{
    colorId: number;
    name: string;
    sku: string;
    hexadecimal: string;
    isActive: boolean;
}

export interface Fibra{
    procedencia: unknown;
    variedad: unknown;
    fibra_id: number;
    categoryId: number;
    denomination: string;
    origin: string;
    ColorId: number;
    isActive: boolean;
    category: Categoria[];
    color: Color[];
}
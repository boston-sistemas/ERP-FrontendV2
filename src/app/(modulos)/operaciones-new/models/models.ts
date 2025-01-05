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

export interface MecsaColor {
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

export interface FiberCategory {
  id: number;
  value: string;
}

export interface FibraResponse {
  fibers: Fiber[];
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
  fiber: Fiber; // Se reutiliza la interfaz Fiber
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
  recipe: Recipe[]; // Reutiliza la interfaz Recipe
  yarnCount: string;
  numberingSystem: string;
}

export interface YarnResponse {
  yarns: Yarn[];
}

// Yarn Purchase Entry models
export interface YarnPurchaseEntryDetail {
  itemNumber: number;
  yarnId: string;
  guideGrossWeight: number;
  guideNetWeight: number;
  guidePackageCount: number;
  guideConeCount: number;
  detailHeavy: {
    packagesLeft: number;
    groupNumber: number;
    coneCount: number;
    packageCount: number;
    grossWeight: number;
    netWeight: number;
  }[];
  isWeighted: boolean;
  statusFlag: string;
}


export interface YarnPurchaseEntry {
  entryNumber: string;
  period: number;
  creationDate: string;
  creationTime: string;
  supplierCode: string;
  statusFlag: string;
  purchaseOrderNumber: string;
  flgtras: boolean;
  supplierBatch: string;
  mecsaBatch: string;
  documentNote: string;
  currencyCode: number;
  exchangeRate: number;
  supplierPoCorrelative: string;
  supplierPoSeries: string;
  fecgf: string;
  voucherNumber: string;
  fchcp: string; 
  flgcbd: string;
  serialNumberPo: string;
  printedFlag: string;
  detail: YarnPurchaseEntryDetail[];
}

export interface YarnPurchaseEntryResponse {
  yarnPurchaseEntries: YarnPurchaseEntry[];
}

export interface PurchaseOrderDetail {
  quantityOrdered: number;
  quantitySupplied: number;
  unitCode: string;
  precto: number; // Precio unitario
  impcto: number; // Importe total
  yarn: Yarn; // Reutiliza la interfaz Yarn
  statusFlag: string;
}

export interface PurchaseOrder {
  companyCode: string;
  purchaseOrderType: string;
  purchaseOrderNumber: string;
  supplierCode: string;
  issueDate: string;
  dueDate: string;
  paymentMethod: string;
  statusFlag: string;
  currencyCode: number;
  detail: PurchaseOrderDetail[];
}

export interface PurchaseOrderResponse {
  ordenes: PurchaseOrder[];
}

export interface YarnDispatchDetail {
  itemNumber: number; // Número del ítem
  entryNumber: string; // Número de entrada
  entryGroupNumber: number; // Grupo de entrada
  entryItemNumber: number; // Número de ítem en la entrada
  creationDate: string; // Fecha de creación
  creationTime: string; // Hora de creación
  netWeight: number; // Peso neto
  grossWeight: number; // Peso bruto
  coneCount: number; // Cantidad de conos
  packageCount: number; // Cantidad de paquetes
  yarnId: string; // ID del hilado
}

export interface YarnDispatch {
  exitNumber: string; // Número de salida
  period: number; // Período
  creationDate: string; // Fecha de creación
  creationTime: string; // Hora de creación
  supplierCode: string; // Código del proveedor
  supplierYarnEtryNumber: string; // Número de entrada del hilado del proveedor
  statusFlag: string; // Indicador de estado
  documentNote: string; // Nota del documento
  printedFlag: string; // Indicador si está impreso
  detail: YarnDispatchDetail[]; // Detalle de la salida
}

export interface YarnDispatchResponse {
  yarnWeavingDispatches: YarnDispatch[];
}

export interface Status {
  id: number; // Identificador del estado
  value: string; // Descripción del estado
}

export interface ServiceOrderDetail {
  tissueId: string; // Identificador único del tejido
  quantityOrdered: number; // Cantidad solicitada
  quantitySupplied?: number; // Cantidad suministrada (opcional)
  price: number; // Precio unitario
  statusParamId?: number; // ID del parámetro de estado (opcional)
  status?: { id: number; value: string }; // Información del estado (opcional)
}

export interface ServiceOrder {
  id: string; // Identificador único de la orden de servicio
  supplierId: string; // Identificador del proveedor
  issueDate: string; // Fecha de emisión de la orden (formato ISO)
  dueDate: string | null; // Fecha de vencimiento de la orden, puede ser nulo
  storageCode: string; // Código del almacén asociado
  statusFlag: string; // Indicador de estado de la orden
  statusParamId: number; // ID del parámetro de estado
  status: Status; // Información detallada del estado de la orden
  detail: ServiceOrderDetail[]; // Lista de detalles de la orden
}

export interface ServiceOrderResponse {
  serviceOrders: ServiceOrder[]; // Lista de órdenes de servicio
}

export interface Supplier {
  code: string;
  name: string;
  ruc: string;
  isActive: string;
  storageCode: string;
  initials: string;
  emails: string[];
  addresses: Record<string, string>;
}

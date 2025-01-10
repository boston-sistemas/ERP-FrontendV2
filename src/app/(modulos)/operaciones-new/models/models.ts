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

export interface MecsaColorResponse {
  mecsaColors: MecsaColor[];
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
export interface YarnPurchaseEntryDetailHeavy {
  groupNumber: number;
  coneCount: number;
  packageCount: number;
  grossWeight: number;
  netWeight: number;
}

export interface YarnPurchaseEntryDetail {
  itemNumber: number;
  yarnId: string;
  guideGrossWeight: number;
  guideNetWeight: number;
  guidePackageCount: number;
  guideConeCount: number;
  detailHeavy: YarnPurchaseEntryDetailHeavy[];
  isWeighted: boolean;
}

export interface YarnPurchaseEntry {
  period: number;
  supplierPoCorrelative: string;
  supplierPoSeries: string;
  fecgf: string;
  purchaseOrderNumber: string;
  documentNote: string;
  supplierBatch: string;
  detail: YarnPurchaseEntryDetail[];
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
  entryPeriod: number; // Período de la entrada
  netWeight: number; // Peso neto
  grossWeight: number; // Peso bruto
  coneCount: number; // Cantidad de conos
  packageCount: number; // Cantidad de paquetes
}

export interface YarnDispatch {
  period: number; // Período
  supplierCode: string; // Código del proveedor
  documentNote: string | null; // Nota del documento
  nrodir: string; // Dirección seleccionada
  serviceOrderId: string; // Identificador de la orden de servicio
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

export interface FabricType {
  id: number;
  value: string;
}

export interface FabricRecipe {
  yarnId: string; 
  proportion: number; 
  numPlies: number; 
  gauge: number; 
  diameter: number; 
  stitchLength: number;
}

export interface Fabric {
  id: string;
  fabricTypeId: number;
  density: number;
  width: number;
  colorId: string | null;
  structurePattern: string;
  description: string;
  isActive: boolean;
  recipe: FabricRecipe[];
  fabricType: {
    id: number;
    value: string;
  };
}

// Para la respuesta de GET /operations/v1/fabrics
export interface FabricResponse {
  fabrics: Fabric[];
}
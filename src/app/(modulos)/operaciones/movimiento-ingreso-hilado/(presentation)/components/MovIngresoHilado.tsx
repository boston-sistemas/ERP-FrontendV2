"use client";

import React, { useState, useEffect } from "react";
import useSWR from "swr";
import {
  TablePagination,
  IconButton,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  Typography,
  Dialog,
  DialogContent,
  DialogActions,
  Menu,
} from "@mui/material";
import { Visibility, Add, Search, FilterList } from "@mui/icons-material";
import { useRouter, useSearchParams } from "next/navigation";
import { YarnPurchaseEntry } from "../../../models/models";
import {
  fetchYarnPurchaseEntries,
  fetchSuppliersHil,
  fetchPurchaseOrderbyId,
} from "@/app/(modulos)/operaciones/movimiento-ingreso-hilado/services/movIngresoHiladoService";
import { fetchYarnbyId } from "../../../hilados/services/hiladoService";
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';

const PRIMARY_COLOR = "#1976d2";
const ERROR_COLOR = "#d32f2f";

const getCurrentYear = () => new Date().getFullYear();
const generateYearOptions = (startYear: number) => {
  const currentYear = getCurrentYear();
  return Array.from({ length: currentYear - startYear + 1 }, (_, i) => startYear + i);
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const MovIngresoHilado: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  //const [hilados, setHilados] = useState<YarnPurchaseEntry[]>([]);
  const [pagina, setPagina] = useState(0);
  const [filasPorPagina, setFilasPorPagina] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [period, setPeriod] = useState(() => {
    const savedPeriod = localStorage.getItem("selectedPeriod");
    return savedPeriod ? JSON.parse(savedPeriod) : getCurrentYear();
  });
  //const [suppliers, setSuppliers] = useState([]);
  const [openPurchaseOrderDialog, setOpenPurchaseOrderDialog] = useState(false);
  const [selectedPurchaseOrder, setSelectedPurchaseOrder] = useState(null);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [isMediumScreen, setIsMediumScreen] = useState(false);
  const [openYarnDialog, setOpenYarnDialog] = useState(false);
  const [selectedYarn, setSelectedYarn] = useState(null);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [showDateFilters, setShowDateFilters] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Nuevos estados para los datos de los gráficos
  const [estadisticasGenerales, setEstadisticasGenerales] = useState({
    totalIngresos: 0,
    ingresosPendientes: 0,
    ingresosAnulados: 0
  });

  // Agregar el estado para la paginación de la leyenda si no existe
  const [currentPage, setCurrentPage] = useState(0);
  const ITEMS_PER_PAGE = 4;

  const {
    data: dataPurchaseEntries,
    error: errorPurchaseEntries,
    isLoading: isLoadingPurchaseEntries,
  } = useSWR(
    [
      "yarn-purchase-entries",
      period,
      filasPorPagina,
      pagina,
      includeInactive,
      startDate,
      endDate,
    ],
    async ([, _period, limit, page, includeAnnulled, sDate, eDate]) => {
      const offset = page * limit;
      const response = await fetchYarnPurchaseEntries(
        _period,
        limit,
        offset,
        includeAnnulled,
        sDate || undefined,
        eDate || undefined
      );
      return response;
    },
    {
      refreshInterval: 0,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  const {
    data: dataSuppliers,
    error: errorSuppliers,
    isLoading: isLoadingSuppliers,
  } = useSWR("suppliers-hil", async () => {
    const suppliersResponse = await fetchSuppliersHil();
    return suppliersResponse;
  },
  {
    refreshInterval: 0,
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
  }
);

  const hilados = dataPurchaseEntries?.yarnPurchaseEntries || [];
  const suppliers = dataSuppliers?.suppliers || [];

  useEffect(() => {
    if (errorPurchaseEntries) {
      console.error("Error al cargar los movimientos de hilado:", errorPurchaseEntries);
      alert("Hubo un error al cargar los datos de hilados. Por favor, inténtelo de nuevo.");
    }
  }, [errorPurchaseEntries]);

  useEffect(() => {
    if (errorSuppliers) {
      console.error("Error al cargar los proveedores:", errorSuppliers);
      alert("Hubo un error al cargar los proveedores. Por favor, inténtelo de nuevo.");
    }
  }, [errorSuppliers]);

  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIncludeInactive(event.target.checked);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleCreateMovIngresoHilado = () => {
    router.push("/operaciones/movimiento-ingreso-hilado/crear-movimiento-ingreso-hilado");
  };

  const handleDetailsClick = (entryNumber: string) => {
    localStorage.setItem("selectedPeriod", JSON.stringify(period)); // Guarda el periodo en localStorage
    router.push(`/operaciones/movimiento-ingreso-hilado/detalle-movimiento-ingreso-por-orden-compra/${entryNumber}`); // Redirige al componente de detalles
  };

  const fetchOCbyId = async (purchaseOrderNumber: string) => {
    try {
      const data = await fetchPurchaseOrderbyId(purchaseOrderNumber);
      setSelectedPurchaseOrder(data);
    } catch (error) {
      console.error("Error al obtener la orden de compra:", error);
    }
  };

  const handlePurchaseOrderClick = async (purchaseOrderNumber: string) => {
    setOpenPurchaseOrderDialog(true); // Abre el diálogo
    setSelectedPurchaseOrder(null); // Limpia datos previos
    try {
      const data = await fetchPurchaseOrderbyId(purchaseOrderNumber); // Llama a la función API
      setSelectedPurchaseOrder(data); // Guarda los datos en el estado
    } catch (error) {
      console.error("Error al cargar la orden de compra:", error);
    }
  };

  const handleClosePurchaseOrderDialog = () => {
    setOpenPurchaseOrderDialog(false);
  };

  const handleOpenYarnDialog = async (yarnId: string) => {
    try {
      const data = await fetchYarnbyId(yarnId);
      console.log(data);
      setSelectedYarn(data);
      setOpenYarnDialog(true);
    } catch (error) {
      console.error("Error fetching yarn data:", error);
    }
  };

  const handleCloseYarnDialog = () => {
    setOpenYarnDialog(false);
    setSelectedYarn(null);
  };

  const handleAdvancedSearchClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleAdvancedSearchClose = () => {
    setAnchorEl(null);
  };

  const filteredHilados = hilados.filter((hilado) =>
    Object.values(hilado).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Función para procesar datos para los gráficos
  const procesarDatosEstadisticas = () => {
    if (!hilados.length) return;

    const estadisticas = {
      totalIngresos: hilados.length,
      ingresosPendientes: hilados.filter(h => h.promecStatus.statusId === 'P').length,
      ingresosAnulados: hilados.filter(h => h.promecStatus.statusId !== 'P').length
    };

    setEstadisticasGenerales(estadisticas);
  };

  // Procesar datos cuando cambian los hilados
  useEffect(() => {
    procesarDatosEstadisticas();
  }, [hilados]);

  // Datos para el gráfico circular
  const dataPie = [
    { name: 'Pendientes', value: estadisticasGenerales.ingresosPendientes },
    { name: 'Anulados', value: estadisticasGenerales.ingresosAnulados },
  ];

  // Agregar esta función para procesar datos de proveedores
  const procesarDatosProveedores = () => {
    if (!hilados.length || !suppliers.length) return [];

    const proveedorCount = hilados.reduce((acc, hilado) => {
      acc[hilado.supplierCode] = (acc[hilado.supplierCode] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(proveedorCount).map(([code, count]) => ({
      name: suppliers.find(s => s.code === code)?.name || code,
      value: count
    })).sort((a, b) => b.value - a.value); // Ordenar de mayor a menor
  };

  // Agregar el componente CustomLegend
  const CustomLegend = ({ payload }) => {
    const totalPages = Math.ceil(payload.length / ITEMS_PER_PAGE);
    const startIndex = currentPage * ITEMS_PER_PAGE;
    const visibleItems = payload.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    // Calcular el total para los porcentajes
    const total = payload.reduce((sum, entry) => sum + entry.payload.value, 0);

    return (
      <div className="flex flex-col items-center w-full">
        <div className="flex flex-col items-start w-full mb-2">
          {visibleItems.map((entry, index) => (
            <div key={`legend-item-${index}`} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span>
                {entry.value.length > 25 
                  ? `${entry.value.substring(0, 25)}...` 
                  : entry.value} ({((entry.payload.value / total) * 100).toFixed(0)}%)
              </span>
            </div>
          ))}
        </div>
        {totalPages > 1 && (
          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
              className={`p-1 rounded ${currentPage === 0 ? 'text-gray-400' : 'text-blue-600 hover:text-blue-800'}`}
            >
              ←
            </button>
            <span className="text-sm">
              {currentPage + 1} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
              disabled={currentPage === totalPages - 1}
              className={`p-1 rounded ${currentPage === totalPages - 1 ? 'text-gray-400' : 'text-blue-600 hover:text-blue-800'}`}
            >
              →
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <div className="max-w-full overflow-x-auto">
          <div className="flex items-center justify-start gap-2 mb-4">
            {/* Botón de Búsqueda Avanzada */}
            <Button
              startIcon={<FilterList />}
              variant="outlined"
              onClick={handleAdvancedSearchClick}
            >
              Filtrar por fecha
            </Button>

            <FormControlLabel
              control={
                <Switch
                  checked={includeInactive}
                  onChange={handleSwitchChange}
                  color="primary"
                />
              }
              label="Mostrar anulados"
            />
            <Typography variant="body2" className="font-semibold">
              Período:
            </Typography>
            <Select
              value={period}
              onChange={(e) => setPeriod(Number(e.target.value))}
              displayEmpty
              variant="outlined"
              size="small"
              style={{ width: "120px", backgroundColor: "#fff" }}
            >
              {generateYearOptions(2023).map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>

            {/* Botón Crear */}
            <Button
              startIcon={<Add />}
              variant="contained"
              style={{ backgroundColor: PRIMARY_COLOR, color: "#fff", marginLeft: 'auto' }}
              onClick={handleCreateMovIngresoHilado}
            >
              CREAR
            </Button>
          </div>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleAdvancedSearchClose}
          >
            <div className="p-4 space-y-2" style={{ maxWidth: "300px" }}>
              <TextField
                label="Fecha Inicio"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
                fullWidth
              />
              <TextField
                label="Fecha Fin"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
                fullWidth
              />
            </div>
          </Menu>

          {/* Sección de gráficos modificada */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            {/* Gráfico de Estados - Con leyenda normal */}
            <div className="bg-white p-4 rounded-lg shadow flex-1">
              <h3 className="text-lg font-semibold mb-4">Estado de Ingresos</h3>
              <div className="w-full" style={{ height: '280px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dataPie}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    >
                      {dataPie.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => [`${value} ingresos`, name]}
                    />
                    <Legend 
                      verticalAlign="bottom"
                      height={24}
                      layout="horizontal"
                      align="center"
                      wrapperStyle={{
                        paddingTop: '5px',
                        width: '100%'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gráfico de Proveedores - Con leyenda paginada */}
            <div className="bg-white p-4 rounded-lg shadow flex-1">
              <h3 className="text-lg font-semibold mb-4">Ingresos por Proveedor</h3>
              <div className="w-full" style={{ minHeight: '400px', height: 'auto' }}>
                <ResponsiveContainer width="100%" aspect={1}>
                  <PieChart>
                    <Pie
                      data={procesarDatosProveedores()}
                      cx="50%"
                      cy="40%"
                      labelLine={false}
                      outerRadius={90}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                      isAnimationActive={false}
                    >
                      {procesarDatosProveedores().map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => [`${value} ingresos`, name]}
                    />
                    <Legend 
                      content={<CustomLegend />}
                      verticalAlign="bottom"
                      align="center"
                      wrapperStyle={{
                        paddingTop: '10px',
                        width: '100%'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Panel de Resumen */}
            <div className="bg-white p-4 rounded-lg shadow h-[300px]">
              <h3 className="text-lg font-semibold mb-4">Resumen General</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                  <span>Total de Ingresos:</span>
                  <span className="font-bold">{estadisticasGenerales.totalIngresos}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded">
                  <span>Ingresos Pendientes:</span>
                  <span className="font-bold">{estadisticasGenerales.ingresosPendientes}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded">
                  <span>Ingresos Anulados:</span>
                  <span className="font-bold">{estadisticasGenerales.ingresosAnulados}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                  <span>Total Proveedores:</span>
                  <span className="font-bold">{procesarDatosProveedores().length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabla de Movimientos ----------------------------------------------------------------*/}
          <div className="max-w-full overflow-x-auto">
            <table className="w-full table-auto ">
              <thead>
                <tr className="bg-blue-900 uppercase text-center">
                  {[
                    "Nro Ingreso",
                    "Periodo",
                    "Fecha",
                    "Proveedor",
                    "Estado",
                    "Nro O/C",
                    "Lote Proveedor",
                    "Lote Mecsa",
                    "Detalles/Edición",
                  ].map((col, index) => (
                    <th
                      key={index}
                      className="px-4 py-4 text-center font-normal text-white" 
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={10} className="text-center py-4">
                      Cargando datos...
                    </td>
                  </tr>
                ) : filteredHilados.length > 0 ? (
                  filteredHilados.map((hilado, index) => (
                    <tr key={index} className="text-center text-black">
                      <td className="border-b border-[#eee] px-4 py-5">
                        {hilado.entryNumber}
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5">
                        {hilado.period}
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5">
                        {hilado.creationDate}
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5" style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                        {suppliers.map((supplier) =>
                          supplier.code === hilado.supplierCode
                            ? supplier.name
                            : ""
                        )}
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5">
                        {hilado.promecStatus.name}
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5">
                        {hilado.purchaseOrderNumber}
                        <IconButton
                          color="primary"
                          onClick={() =>
                            handlePurchaseOrderClick(
                              hilado.purchaseOrderNumber
                            )
                          }
                        >
                          <Visibility />
                        </IconButton>
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5">
                        {hilado.supplierBatch}
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5">
                        {hilado.mecsaBatch}
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5">
                        <IconButton
                          color="primary"
                          onClick={() => handleDetailsClick(hilado.entryNumber)}
                        >
                          <Visibility />
                        </IconButton>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="text-center py-4">
                      No se encontraron resultados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dialogo de Orden de Compra */}
        <Dialog
          open={openPurchaseOrderDialog}
          onClose={handleClosePurchaseOrderDialog}
          fullScreen={isSmallScreen}
          maxWidth="md"
          PaperProps={{
            sx: {
              ...( !isSmallScreen && !isMediumScreen && {
                marginLeft: "280px", 
                maxWidth: "calc(100% - 280px)", 
              }),
              maxHeight: "calc(100% - 64px)",
              overflowY: "auto",
            },
          }}
        >
          <DialogContent>
            <h3 className="text-lg font-semibold text-black mb-4">
              Información de la Orden de Compra
            </h3>
            {selectedPurchaseOrder ? (
              <div className="mb-4 text-black">
                <p className="mb-2"><strong>Nro O/C:</strong> {selectedPurchaseOrder.purchaseOrderNumber}</p>
                <p className="mb-2"><strong>Proveedor:</strong> {suppliers.find(supplier => supplier.code === selectedPurchaseOrder.supplierCode)?.name || "Desconocido"}</p>
                <p className="mb-2"><strong>Fecha de Emisión:</strong> {selectedPurchaseOrder.issueDate}</p>
                <p className="mb-2"><strong>Fecha de Vencimiento:</strong> {selectedPurchaseOrder.dueDate}</p>
                <p className="mb-2"><strong>Método de Pago:</strong> {selectedPurchaseOrder.paymentMethod}</p>
                <p className="mb-2"><strong>Estado:</strong> {selectedPurchaseOrder.promecStatus.name}</p>
                <p className="mb-2"><strong>Moneda:</strong> {selectedPurchaseOrder.promecCurrency.name}</p>
              </div>
            ) : (
              <p>Cargando información...</p>
            )}
            <div className="max-w-full overflow-x-auto">
              <table className="w-full table-auto border-collapse">
                <thead>
                  <tr className="bg-blue-900 uppercase text-center text-white">
                    <th className="px-4 py-4 text-center font-normal">Descripción</th>
                    <th className="px-4 py-4 text-center font-normal">Cantidad</th>
                    <th className="px-4 py-4 text-center font-normal">Avance</th>
                    <th className="px-4 py-4 text-center font-normal">Precio</th>
                    <th className="px-4 py-4 text-center font-normal">Importe</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPurchaseOrder?.detail.map((item, index) => (
                    <tr key={index} className="text-center text-black">
                      <td className="border-b border-gray-300 px-4 py-5 mb-2">
                        {item.yarn.description}
                        <IconButton onClick={() => handleOpenYarnDialog(item.yarn.id)}>
                          <VisibilityIcon 
                          style={{ color: "#1976d2" }}
                          />
                        </IconButton>
                      </td>
                      <td className="border-b border-gray-300 px-4 py-5 mb-2">{item.quantityOrdered} {item.unitCode}</td>
                      <td className="border-b border-gray-300 px-4 py-5 mb-2">{item.quantitySupplied} {item.unitCode}</td>
                      <td className="border-b border-gray-300 px-4 py-5 mb-2">{selectedPurchaseOrder.promecCurrency.symbol}{item.precto}</td>
                      <td className="border-b border-gray-300 px-4 py-5 mb-2">{selectedPurchaseOrder.promecCurrency.symbol}{item.impcto}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleClosePurchaseOrderDialog}
              variant="contained"
              style={{ backgroundColor: ERROR_COLOR, color: "#fff" }}
            >
              Cerrar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialogo de Hilado */}
        <Dialog
          open={openYarnDialog}
          onClose={handleCloseYarnDialog}
          fullScreen={isSmallScreen}
          maxWidth="md"
          PaperProps={{
            sx: {
              ...( !isSmallScreen && !isMediumScreen && {
                marginLeft: "200px", 
                maxWidth: "calc(100% - 280px)", 
              }),
              maxHeight: "calc(100% - 64px)",
              overflowY: "auto",
            },
          }}
        >
          <DialogContent>
            <h3 className="text-lg font-semibold text-black mb-4">
              Información del Hilado
            </h3>
            {selectedYarn ? (
              <div className="mb-4 text-black">
                <p className="mb-2"><strong>Descripción:</strong> {selectedYarn.description}</p>
                <p className="mb-2"><strong>Título:</strong> {selectedYarn.yarnCount?.value || "--"}</p>
                <p className="mb-2"><strong>Acabado:</strong> {selectedYarn.spinningMethod?.value || "--"}</p>
                <p className="mb-2"><strong>Barcode:</strong> {selectedYarn.barcode}</p>
                <p className="mb-2"><strong>Color:</strong> {selectedYarn.color?.name || "No teñido"}</p>
                <p className="mb-2"><strong>Fabricado en:</strong> {selectedYarn.manufacturedIn?.value || "--"}</p>
                <p className="mb-2"><strong>Distinciones:</strong>{" "}
                  {selectedYarn.distinctions && selectedYarn.distinctions.length > 0
                    ? selectedYarn.distinctions.map((dist) => dist.value).join(", ")
                    : "--"
                  }
                </p>
              </div>
            ) : (
              <p>Cargando información del hilado...</p>
            )}
            <h3 className="text-lg font-semibold text-black mb-2 mt-4">Receta</h3>
            <div className="max-w-full overflow-x-auto">
              <table className="w-full table-auto border-collapse">
                <thead>
                  <tr className="bg-blue-900 uppercase text-center text-white">
                    <th className="px-4 py-4 text-center font-normal">Categoría</th>
                    <th className="px-4 py-4 text-center font-normal">Denominación</th>
                    <th className="px-4 py-4 text-center font-normal">Procedencia</th>
                    <th className="px-4 py-4 text-center font-normal">Color</th>
                    <th className="px-4 py-4 text-center font-normal">Proporción (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedYarn?.recipe?.length > 0 ? (
                    selectedYarn.recipe.map((item, index) => (
                      <tr key={index} className="text-center text-black">
                        <td className="border-b border-gray-300 px-4 py-5">
                          {item.fiber?.category?.value || "-"}
                        </td>
                        <td className="border-b border-gray-300 px-4 py-5">
                          {item.fiber?.denomination?.value || "-"}
                        </td>
                        <td className="border-b border-gray-300 px-4 py-5">
                          {item.fiber?.origin || "-"}
                        </td>
                        <td className="border-b border-gray-300 px-4 py-5">
                          {item.fiber?.color?.name || "Crudo"}
                        </td>
                        <td className="border-b border-gray-300 px-4 py-5">
                          {item.proportion}%
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-gray-500">
                        No hay datos disponibles.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleCloseYarnDialog}
              variant="contained"
              style={{ backgroundColor: ERROR_COLOR, color: "#fff" }}
            >
              Cerrar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Paginación */}
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={hilados.length}
          rowsPerPage={filasPorPagina}
          page={pagina}
          onPageChange={(_, newPage) => setPagina(newPage)}
          onRowsPerPageChange={(e) =>
            setFilasPorPagina(parseInt(e.target.value, 10))
          }
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
          }
        />
      </div>
    </div>
  );
};

export default MovIngresoHilado;

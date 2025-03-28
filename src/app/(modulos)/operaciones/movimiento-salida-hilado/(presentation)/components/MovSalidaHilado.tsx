"use client";

import React, { useState, useEffect } from "react";
import {
  TablePagination,
  IconButton,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { Visibility, Add, Close, Search } from "@mui/icons-material";
import { useRouter, useSearchParams } from "next/navigation";
import { YarnDispatch } from "../../../models/models";
import { fetchSuppliers } from "../../../ordenes-servicio/services/ordenesServicioService";
import { fetchYarnDispatches } from "../../services/movSalidaHiladoService";
import { Supplier } from "../../../models/models";
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
  ResponsiveContainer
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

// Agregar estas constantes para la animación
const ANIMATION_DURATION = 1000;
const ANIMATION_EASING = "ease-in-out";

const MovSalidaHilado: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [dispatches, setDispatches] = useState<YarnDispatch[]>([]);
  const [pagina, setPagina] = useState(0);
  const [filasPorPagina, setFilasPorPagina] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [period, setPeriod] = useState(2025);

  // Estado para manejar el diálogo
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogContent, setDialogContent] = useState<string>("");

  // Nuevo estado para estadísticas
  const [estadisticasGenerales, setEstadisticasGenerales] = useState({
    totalSalidas: 0,
    salidasPendientes: 0,
    salidasAnuladas: 0
  });

  // Agregar estos estados para la paginación de la leyenda
  const [currentPage, setCurrentPage] = useState(0);
  const ITEMS_PER_PAGE = 4; // Número de items por página en la leyenda

  // Cargar datos del servicio
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetchYarnDispatches(
          period, // Usar el período seleccionado
          filasPorPagina,
          pagina * filasPorPagina,
          includeInactive
        );
        const suppliers = await fetchSuppliers();
        setSuppliers(suppliers);
        setDispatches(response.yarnWeavingDispatches || []);
      } catch (error) {
        console.error("Error al cargar los datos:", error);
      } finally {
        setIsLoading(false);
      }
    };
    

    fetchData();
  }, [pagina, filasPorPagina, includeInactive, period]); // Actualizar cuando cambie el período

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleCreateMovSalidaHilado = () => {
    localStorage.removeItem("entryNumber");
    router.push("/operaciones/movimiento-salida-hilado/crear-mov-salida-hilado");
  };

  const handleDetailsClick = (exitNumber: string, period: number) => {
    // En este caso, como query param
    router.push(
      `/operaciones/movimiento-salida-hilado/detalles-mov-salida-hilado/${exitNumber}?period=${period}`
    );
  };

  const handleDialogOpen = (documentNote: string | null) => {
    setDialogContent(
      documentNote && documentNote.trim()
        ? documentNote
        : "No existe Nota de documento"
    );
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIncludeInactive(event.target.checked);
  };

  const filteredDispatches = dispatches.filter((dispatch) =>
    Object.values(dispatch).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Función para procesar datos para los gráficos
  const procesarDatosEstadisticas = () => {
    if (!dispatches.length) return;

    const estadisticas = {
      totalSalidas: dispatches.length,
      salidasPendientes: dispatches.filter(d => d.promecStatus.statusId === 'P').length,
      salidasAnuladas: dispatches.filter(d => d.promecStatus.statusId !== 'P').length
    };

    setEstadisticasGenerales(estadisticas);
  };

  // Función para procesar datos de proveedores
  const procesarDatosProveedores = () => {
    if (!dispatches.length || !suppliers.length) return [];

    const proveedorCount = dispatches.reduce((acc, dispatch) => {
      acc[dispatch.supplierCode] = (acc[dispatch.supplierCode] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(proveedorCount).map(([code, count]) => ({
      name: suppliers.find(s => s.code === code)?.name || code,
      value: count
    })).sort((a, b) => b.value - a.value);
  };

  // Actualizar estadísticas cuando cambian los datos
  useEffect(() => {
    procesarDatosEstadisticas();
  }, [dispatches]);

  // Datos para el gráfico circular de estados
  const dataPie = [
    { name: 'Pendientes', value: estadisticasGenerales.salidasPendientes },
    { name: 'Anulados', value: estadisticasGenerales.salidasAnuladas },
  ];

  // Función para manejar la paginación de la leyenda
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
          <div className="flex items-center justify-between gap-2 mb-4">
            {/* Contenedor de Período, Búsqueda y Switch */}
            <div className="flex items-center gap-2">
              <div className="flex items-center border border-gray-300 rounded-md px-2">
                <Search />
                <TextField
                  variant="standard"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={handleSearch}
                  InputProps={{
                    disableUnderline: true,
                  }}
                />
              </div>
              <FormControlLabel
                control={
                  <Switch
                    checked={includeInactive}
                    onChange={handleSwitchChange}
                    color="primary"
                  />
                }
                label="Mostrar inactivos"
              />
              <div className="flex items-center gap-2">
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
                  {[2023, 2024, 2025].map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </div>
            </div>

            {/* Botón Crear */}
            <div className="flex items-center gap-2">
              <Button
                startIcon={<Add />}
                variant="contained"
                style={{ backgroundColor: "#1976d2", color: "#fff" }}
                onClick={handleCreateMovSalidaHilado}
              >
                CREAR
              </Button>
            </div>
          </div>

          {/* Sección de gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6 min-h-[400px]">
            {/* Gráfico de Estados - Con leyenda normal */}
            <div className="bg-white p-4 rounded-lg shadow flex-1">
              <h3 className="text-lg font-semibold mb-4">Estado de Salidas</h3>
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
                      formatter={(value, name) => [`${value} salidas`, name]}
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
              <h3 className="text-lg font-semibold mb-4">Salidas por Proveedor</h3>
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
                      label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                      isAnimationActive={false} // Desactivar animación para mantener las etiquetas
                    >
                      {procesarDatosProveedores().map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => [`${value} salidas`, name]}
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
                  <span>Total de Salidas:</span>
                  <span className="font-bold">{estadisticasGenerales.totalSalidas}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded">
                  <span>Salidas Pendientes:</span>
                  <span className="font-bold">{estadisticasGenerales.salidasPendientes}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded">
                  <span>Salidas Anuladas:</span>
                  <span className="font-bold">{estadisticasGenerales.salidasAnuladas}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                  <span>Total Proveedores:</span>
                  <span className="font-bold">{procesarDatosProveedores().length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabla de Movimientos */}
          <table className="w-full h-full border-collapse table-auto">
            <thead>
              <tr className="bg-blue-900 uppercase text-center">
                {[
                  "Nro Salida",
                  "Periodo",
                  "Fecha",
                  "Hora",
                  "Proveedor",
                  "Estado",
                  "Nota Documento",
                  "Detalles",
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
                  <td colSpan={8} className="text-center py-4">
                    Cargando datos...
                  </td>
                </tr>
              ) : filteredDispatches.length > 0 ? (
                filteredDispatches.map((dispatch, index) => (
                  <tr key={index} className="text-center">
                    <td className="border-b border-[#eee] px-4 py-5">
                      {dispatch.exitNumber}
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5">
                      {dispatch.period}
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5">
                      {dispatch.creationDate}
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5">
                      {dispatch.creationTime}
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5">
                        {suppliers.map((supplier) =>
                          supplier.code === dispatch.supplierCode
                            ? supplier.name
                            : ""
                        )}
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5">
                      {dispatch.promecStatus.name}
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5">
                      <IconButton
                        color="primary"
                        onClick={() =>
                          handleDialogOpen(dispatch.documentNote)
                        }
                      >
                        <Visibility />
                      </IconButton>
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5">
                      <IconButton
                        color="primary"
                        onClick={() =>
                          handleDetailsClick(dispatch.exitNumber, dispatch.period)
                        }
                      >
                        <Visibility />
                      </IconButton>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-4">
                    No se encontraron resultados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={dispatches.length}
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

      {/* Dialog para mostrar la Nota del Documento */}
      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>
          Nota del Documento
          <IconButton
            aria-label="close"
            onClick={handleDialogClose}
            style={{ position: "absolute", right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <p>{dialogContent}</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Agregar estos estilos CSS globalmente o en tu archivo de estilos */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default MovSalidaHilado;
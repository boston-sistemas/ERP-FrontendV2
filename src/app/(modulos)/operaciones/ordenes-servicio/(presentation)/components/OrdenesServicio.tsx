"use client";
import React, { useState, useEffect } from "react";
import {
  TablePagination,
  IconButton,
  Button,
  TextField,
  Menu,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  useMediaQuery,
  useTheme,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { Search, Visibility, Add, Delete, Close } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import {
  fetchServiceOrders,
  fetchSuppliers,
  createServiceOrder,
  fetchFabricById,
} from "../../services/ordenesServicioService";

import { fetchTejidos } from "../../../tejidos/services/tejidosService"; 

import { ServiceOrder, Supplier } from "../../../models/models";

const OrdenesServicio: React.FC = () => {
  const router = useRouter();
  const [ordenesServicio, setOrdenesServicio] = useState<ServiceOrder[]>([]);
  const [pagina, setPagina] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [filasPorPagina, setFilasPorPagina] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [includeInactive, setIncludeInactive] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  // Para crear la OS
  const [openDialog, setOpenDialog] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  //  Tejidos
  const [fabrics, setFabrics] = useState<any[]>([]);
  const [isFabricDialogOpen, setIsFabricDialogOpen] = useState(false);

  // Estructura de la nueva OS
  const [newOrder, setNewOrder] = useState<{
    supplierId: string;
    detail: Array<{
      fabricId: string;
      quantityOrdered: number;
      price: number;
    }>;
  }>({
    supplierId: "",
    detail: [
      { fabricId: "", quantityOrdered: 0, price: 0 },
    ],
  });

  // Estado para el período
  const [period, setPeriod] = useState(() => new Date().getFullYear());

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  // ================== New states for snackbar ==================
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

  // ================== New functions for snackbar ==================
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  // Cargar OS
  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const resp = await fetchServiceOrders(
        period,
        includeInactive, // includeAnnulled
        true, // includeDetail
        undefined // supplierIds opcional
      );
      setOrdenesServicio(resp.serviceOrders || []);
      setTotalItems(resp.total || resp.serviceOrders.length); // Por si el backend devuelve total
    } catch (e) {
      console.error("Error al cargar órdenes:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [period, includeInactive]); // Ya no depende de pagina y filasPorPagina

  // Cargar suppliers
  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        const resp = await fetchSuppliers();
        setSuppliers(resp);
      } catch (e) {
        console.error("Error al cargar proveedores:", e);
      }
    };
    loadSuppliers();
  }, []);

  const handleOpenFabricDialog = async (index: number) => {
    setSelectedDetailIndex(index);
    try {
      const data = await fetchTejidos(); // GET /operations/v1/fabrics
      setFabrics(data.fabrics || []); // asume "data.fabrics"
      setIsFabricDialogOpen(true);
    } catch (e) {
      console.error("Error al cargar tejidos:", e);
    }
  };
  const handleCloseFabricDialog = () => {
    setIsFabricDialogOpen(false);
  };

  const [selectedDetailIndex, setSelectedDetailIndex] = useState<number>(0);
  const handleSelectFabric = (fabricId: string) => {
    const updated = [...newOrder.detail];
    updated[selectedDetailIndex].fabricId = fabricId;
    setNewOrder((prev) => ({ ...prev, detail: updated }));
    setIsFabricDialogOpen(false);
  };

  // Creación
  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);

  const handleAddDetailRow = () => {
    setNewOrder((prev) => ({
      ...prev,
      detail: [...prev.detail, { fabricId: "", quantityOrdered: 0, price: 0 }],
    }));
  };

  const handleDeleteDetailRow = (idx: number) => {
    setNewOrder((prev) => ({
      ...prev,
      detail: prev.detail.filter((_, i) => i !== idx),
    }));
  };

  const handleDetailChange = (idx: number, field: string, value: string | number) => {
    const updated = [...newOrder.detail];
    (updated[idx] as any)[field] = value;
    setNewOrder((prev) => ({ ...prev, detail: updated }));
  };

  // ================== Crear Orden de Servicio ==================
  const handleCreateOrder = async () => {
    try {
      const resp = await createServiceOrder(newOrder);
      setOpenDialog(false);

      // Redirigir a detalles
      router.push(`/operaciones/ordenes-servicio/detalles/${resp.id}`);

      // Mostrar snackbar de éxito
      setSnackbarMessage("Orden de servicio creada con éxito.");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (err) {
      console.error("Error al crear la orden de servicio", err);
      setSnackbarMessage("No se pudo crear la orden. Verifica los datos e intenta nuevamente.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  // Helpers
  const getSupplierName = (supplierId: string) => {
    const sup = suppliers.find((s) => s.code === supplierId);
    return sup ? sup.name : supplierId;
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  const filteredOrders = ordenesServicio.filter((o) =>
    Object.values(o).some((val) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleDetailsClick = (orderId: string) => {
    router.push(`/operaciones/ordenes-servicio/detalles/${orderId}`);
  };

  // Actualizar handlers de paginación
  const handleChangePage = (event: unknown, newPage: number) => {
    setPagina(newPage + 1); // Ajustar a base 1
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilasPorPagina(parseInt(event.target.value, 10));
    setPagina(1); // Reset a primera página
  };

  const [selectedFabric, setSelectedFabric] = useState<any>(null);
  const [isFabricDetailsDialogOpen, setIsFabricDetailsDialogOpen] = useState(false);
  const [isYarnDetailsDialogOpen, setIsYarnDetailsDialogOpen] = useState(false);
  const [selectedYarn, setSelectedYarn] = useState<any>(null);

  const handleOpenFabricDetailsDialog = async (fabricId: string) => {
    try {
      const fabric = await fetchFabricById(fabricId);
      setSelectedFabric(fabric);
      setIsFabricDetailsDialogOpen(true);
    } catch (err) {
      console.error("Error al cargar detalles del tejido:", err);
    }
  };

  const handleCloseFabricDetailsDialog = () => {
    setIsFabricDetailsDialogOpen(false);
    setSelectedFabric(null);
  };

  const handleOpenYarnDetails = (yarn: any) => {
    setSelectedYarn(yarn);
    setIsYarnDetailsDialogOpen(true);
  };

  const handleCloseYarnDetails = () => setIsYarnDetailsDialogOpen(false);

  return (
    <div className="space-y-5">
      <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default">
        {/* Encabezado */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-gray-300 rounded-md px-2">
              <Search />
              <TextField
                variant="standard"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={handleSearch}
                InputProps={{ disableUnderline: true }}
              />
            </div>
            <FormControlLabel
              control={
                <Switch
                  checked={includeInactive}
                  onChange={() => setIncludeInactive((prev) => !prev)}
                  color="primary"
                />
              }
              label="Incluir Inactivas"
            />
            {/* Selector de Período */}
            <FormControl variant="outlined" sx={{ minWidth: 120 }}>
              <InputLabel id="period-select-label">Período</InputLabel>
              <Select
                labelId="period-select-label"
                value={period}
                onChange={(e) => setPeriod(Number(e.target.value))}
                label="Período"
              >
                {Array.from({ length: new Date().getFullYear() - 2022 }, (_, i) => 2023 + i).map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          <Button
            startIcon={<Add />}
            variant="contained"
            style={{ backgroundColor: "#1976d2", color: "#fff" }}
            onClick={handleOpenDialog}
          >
            CREAR
          </Button>
        </div>

        {/* Tabla */}
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-blue-900 uppercase text-center text-white">
              <th className="px-4 py-4 font-normal">No. Servicio</th>
              <th className="px-4 py-4 font-normal">Proveedor</th>
              <th className="px-4 py-4 font-normal">Fecha Emisión</th>
              <th className="px-4 py-4 font-normal">Estado</th>
              <th className="px-4 py-4 font-normal">Detalles</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="text-center py-4">
                  Cargando...
                </td>
              </tr>
            ) : filteredOrders.length > 0 ? (
              filteredOrders.map((o) => (
                <tr key={o.id} className="text-center text-black">
                  <td className="border-b border-[#eee] px-4 py-4">{o.id}</td>
                  <td className="border-b border-[#eee] px-4 py-4">
                    {getSupplierName(o.supplierId)}
                  </td>
                  <td className="border-b border-[#eee] px-4 py-4">{o.issueDate}</td>
                  <td className="border-b border-[#eee] px-4 py-4">
                    {o.status?.value || '---'}
                  </td>
                  <td className="border-b border-[#eee] px-4 py-4">
                    <IconButton onClick={() => handleDetailsClick(o.id)}>
                      <Visibility />
                    </IconButton>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-4">
                  No se encontraron resultados.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Paginación */}
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={totalItems}
          rowsPerPage={filasPorPagina}
          page={pagina - 1} // Convertir a base 0 para MUI
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
          }
        />
      </div>

      {/* Diálogo Crear OS */}
      <Dialog open={openDialog} onClose={handleCloseDialog} 
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
        }}>
        <DialogTitle>Crear Nueva Orden de Servicio</DialogTitle>
        <DialogContent>
          <div className="space-y-4">
            <FormControl fullWidth>
              <InputLabel id="proveedor-label">Seleccione un proveedor</InputLabel>
              <Select
                labelId="proveedor-label"
                value={newOrder.supplierId}
                label="Seleccione un proveedor"
                onChange={(e) =>
                  setNewOrder({ ...newOrder, supplierId: e.target.value as string })
                }
              >
                <MenuItem value="" disabled>
                  -- Seleccione un proveedor --
                </MenuItem>
                {suppliers.map((sup) => (
                  <MenuItem key={sup.code} value={sup.code}>
                    {sup.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {newOrder.detail.map((detail, index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <TextField
                  label="Tejido"
                  value={detail.fabricId}
                  onChange={(e) =>
                    handleDetailChange(index, "fabricId", e.target.value)
                  }
                  // Se oculta, y mejor se usa la selección via tabla:
                  style={{ display: "none" }}
                />
                <Button
                  variant="outlined"
                  onClick={() => handleOpenFabricDialog(index)}
                  startIcon={<Search />}
                >
                  {detail.fabricId ? `Tejido: ${detail.fabricId}` : "Seleccionar Tejido"}
                </Button>
                <IconButton
                  color="primary"
                  onClick={() => detail.fabricId && handleOpenFabricDetailsDialog(detail.fabricId)}
                  disabled={!detail.fabricId}
                >
                  <Visibility />
                </IconButton>

                <div className="grid grid-cols-2 gap-4">
                  <TextField
                    label="Cantidad"
                    value={detail.quantityOrdered || ""}
                    onChange={(e) => handleDetailChange(index, "quantityOrdered", Number(e.target.value) || 0)}
                    fullWidth
                    variant="outlined"
                    size="small"
                  />
                  <TextField
                    label="Precio"
                    value={detail.price || ""}
                    onChange={(e) => handleDetailChange(index, "price", Number(e.target.value) || 0)}
                    fullWidth
                    variant="outlined"
                    size="small"
                  />
                </div>
                <IconButton onClick={() => handleDeleteDetailRow(index)} color="error">
                  <Delete />
                </IconButton>
              </div>
            ))}

            <Button
              onClick={handleAddDetailRow}
              variant="contained"
              style={{ backgroundColor: "#1976d2", color: "#fff" }}
            >
              Agregar Detalle
            </Button>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} style={{ backgroundColor: "#d32f2f", color: "#fff" }}>
            Cancelar
          </Button>
          <Button
            onClick={handleCreateOrder}
            variant="contained"
            style={{ backgroundColor: "#1976d2", color: "#fff" }}
          >
            Crear
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para seleccionar tejido */}
      <Dialog
        open={isFabricDialogOpen}
        onClose={handleCloseFabricDialog}
        fullScreen={isSmallScreen}
        maxWidth="lg"
        PaperProps={{
          sx: {
            ...(!isSmallScreen && !isMediumScreen && {
              marginLeft: "280px",
              maxWidth: "calc(100% - 280px)",
            }),
            maxHeight: "calc(100% - 64px)",
            overflowY: "auto",
          },
        }}
      >
        <DialogTitle>
          Seleccionar Tejido
          <IconButton
            aria-label="close"
            onClick={handleCloseFabricDialog}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <div style={{ overflowX: "auto", border: "1px solid #ddd", borderRadius: "8px" }}>
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="bg-blue-900 uppercase text-center text-white">
                  <th className="px-4 py-4 font-normal">ID</th>
                  <th className="px-4 py-4 font-normal">Descripción</th>
                  <th className="px-4 py-4 font-normal">Información</th>
                  <th className="px-4 py-4 font-normal">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {fabrics.map((fabric) => (
                  <tr key={fabric.id} className="text-center text-black">
                    <td className="border-b border-[#eee] px-4 py-4">{fabric.id}</td>
                    <td className="border-b border-[#eee] px-4 py-4">{fabric.description}</td>
                    <td className="border-b border-[#eee] px-4 py-4">
                      <IconButton
                        onClick={() => handleOpenFabricDetailsDialog(fabric.id)}
                        size="small"
                        color="primary"
                      >
                        <Visibility />
                      </IconButton>
                    </td>
                    <td className="border-b border-[#eee] px-4 py-4">
                      <Button
                        variant="contained"
                        style={{ backgroundColor: "#1976d2", color: "#fff" }}
                        size="small"
                        onClick={() => handleSelectFabric(fabric.id)}
                      >
                        Seleccionar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseFabricDialog} style={{ backgroundColor: "#d32f2f", color: "#fff" }}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de detalles del tejido */}
      <Dialog
        open={isFabricDetailsDialogOpen}
        onClose={handleCloseFabricDetailsDialog}
        fullScreen={isSmallScreen}
        maxWidth="md"
        PaperProps={{
          sx: {
            ...(!isSmallScreen && !isMediumScreen && {
              marginLeft: "280px",
              maxWidth: "calc(100% - 280px)",
            }),
            maxHeight: "calc(100% - 64px)",
            overflowY: "auto",
          },
        }}
      >
        <DialogTitle>
          <h1 className="text-lg font-semibold text-black mb-2">
            Detalles del Tejido
          </h1>
          <IconButton
            aria-label="close"
            onClick={handleCloseFabricDetailsDialog}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedFabric ? (
            <div className="mb-4 text-black">
              <p className="mb-2"><strong>ID:</strong> {selectedFabric.id}</p>
              <p className="mb-2"><strong>Descripción:</strong> {selectedFabric.description}</p>
              <p className="mb-2"><strong>Barcode:</strong> {selectedFabric.barcode}</p>
              <p className="mb-2"><strong>Tipo de Tejido:</strong> {selectedFabric.fabricType?.value || "--"}</p>
              <p className="mb-2"><strong>Densidad:</strong> {selectedFabric.density || "--"}</p>
              <p className="mb-2"><strong>Ancho:</strong> {selectedFabric.width || "--"}</p>
              <p className="mb-2"><strong>Patrón de Estructura:</strong> {selectedFabric.structurePattern || "--"}</p>
              <p className="mb-2"><strong>Unidad de Inventario:</strong> {selectedFabric.inventoryUnitCode || "--"}</p>
              <p className="mb-2"><strong>Unidad de Compra:</strong> {selectedFabric.purchaseUnitCode || "--"}</p>
              <p className="mb-2"><strong>Activo:</strong> {selectedFabric.isActive ? "Sí" : "No"}</p>
              <h3 className="text-lg font-semibold text-black mb-2">Receta</h3>
              <div className="max-w-full overflow-x-auto">
                <table className="w-full table-auto border-collapse">
                  <thead>
                    <tr className="bg-blue-900 uppercase text-center text-white">
                      <th className="px-4 py-4 font-normal">Hilado</th>
                      <th className="px-4 py-4 font-normal">Proporción</th>
                      <th className="px-4 py-4 font-normal">Diametro</th>
                      <th className="px-4 py-4 font-normal">Galga</th>
                      <th className="px-4 py-4 font-normal">Pliegues</th>
                      <th className="px-4 py-4 font-normal">Longitud de Malla</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedFabric.recipe.map((item: any, index: number) => (
                      <tr key={index} className="text-center text-black">
                        <td className="border-b border-[#eee] px-4 py-5">
                          {item.yarn.description}
                          <IconButton color="primary" onClick={() => handleOpenYarnDetails(item.yarn)}>
                            <Visibility />
                          </IconButton>
                        </td>
                        <td className="border-b border-[#eee] px-4 py-5">
                          {item.proportion}%
                        </td>
                        <td className="border-b border-[#eee] px-4 py-5">
                          {item.diameter}
                        </td>
                        <td className="border-b border-[#eee] px-4 py-5">
                          {item.galgue}
                        </td>
                        <td className="border-b border-[#eee] px-4 py-5">
                          {item.numPlies}
                        </td>
                        <td className="border-b border-[#eee] px-4 py-5">
                          {item.stitchLength}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="flex justify-center items-center p-4">
              <CircularProgress />
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseFabricDetailsDialog} style={{ backgroundColor: "#d32f2f", color: "#fff" }}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para detalles del hilado */}
      <Dialog
        open={isYarnDetailsDialogOpen}
        onClose={handleCloseYarnDetails}
        fullScreen={isSmallScreen}
        maxWidth="md"
        PaperProps={{
          sx: {
            ...(!isSmallScreen && !isMediumScreen && {
              marginLeft: "280px",
              maxWidth: "calc(100% - 280px)",
            }),
            maxHeight: "calc(100% - 64px)",
            overflowY: "auto",
          },
        }}
      >
        <DialogTitle>
          <h1 className="text-lg font-semibold text-black mb-2">
            Información del Hilado
          </h1>
          <IconButton
            aria-label="close"
            onClick={handleCloseYarnDetails}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedYarn ? (
            <div className="mb-4 text-black">
              <p className="mb-2"><strong>ID:</strong> {selectedYarn.id || "--"}</p>
              <p className="mb-2"><strong>Descripción:</strong> {selectedYarn.description}</p>
              <p className="mb-2"><strong>Título:</strong> {selectedYarn.yarnCount?.value || "--"}</p>
              <p className="mb-2"><strong>Acabado:</strong> {selectedYarn.spinningMethod?.value || "--"}</p>
              <p className="mb-2"><strong>Código de barras:</strong> {selectedYarn.barcode}</p>
              <p className="mb-2"><strong>Color:</strong> {selectedYarn.color?.name || "No teñido"}</p>
              <p className="mb-2"><strong>Fabricado en:</strong> {selectedYarn.manufacturedIn?.value || "--"}</p>
              <p className="mb-2"><strong>Distinciones:</strong>{" "}
                {selectedYarn.distinctions && selectedYarn.distinctions.length > 0
                  ? selectedYarn.distinctions.map((dist) => dist.value).join(", ")
                  : "--"
                }
              </p>
              <h3 className="text-lg font-semibold text-black mb-2">Receta</h3>
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
                    {selectedYarn.recipe?.length > 0 ? (
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
            </div>
          ) : (
            <div className="flex justify-center items-center p-4">
              <CircularProgress />
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseYarnDetails}
            variant="contained"
            style={{ backgroundColor: "#d32f2f", color: "#fff" }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>


      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: "100%", alignItems: "center" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default OrdenesServicio;

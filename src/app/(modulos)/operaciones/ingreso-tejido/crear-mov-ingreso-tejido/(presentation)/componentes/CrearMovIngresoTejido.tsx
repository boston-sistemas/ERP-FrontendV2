"use client";

import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Snackbar,
  Alert,
  Switch,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TablePagination,
  useTheme,
  useMediaQuery,
  FormControlLabel,
} from "@mui/material";
import { Add, Visibility, Delete } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import {
  fetchServiceOrders,
  fetchServiceOrderById,
} from "@/app/(modulos)/operaciones/ordenes-servicio/services/ordenesServicioService";
import { fetchFabricById } from "@/app/(modulos)/operaciones/tejidos/services/tejidosService";
import { fetchSuppliersT } from "../../../services/IngresoTejidoService";
import { ServiceOrder, Supplier } from "@/app/(modulos)/operaciones/models/models";
import VisibilityIcon from '@mui/icons-material/Visibility';
import { createWeavingServiceEntry } from "@/app/(modulos)/operaciones/ingreso-tejido/services/IngresoTejidoService";

interface DetailEntry {
  itemNumber: number;
  fabricId: string;
  fabricDescription: string;
  guideNetWeight: number;
  rollCount: number;
  generateCards: boolean;
  serviceOrderId: string;
}

interface ServiceOrderDetail {
  fabricId: string;
  quantityOrdered: number;
  quantitySupplied: number;
  price: number;
  status?: { value: string };
}

interface FabricDetail extends ServiceOrderDetail {
  fabricDescription?: string;
}

const CrearIngresoTejido: React.FC = () => {
  const router = useRouter();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isMediumScreen = useMediaQuery(theme.breakpoints.between("sm", "md"));

  // Estados para el diálogo de órdenes de servicio
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  const [ordenesServicio, setOrdenesServicio] = useState<ServiceOrder[]>([]);
  const [selectedServiceOrder, setSelectedServiceOrder] = useState<ServiceOrder | null>(null);
  const [pagina, setPagina] = useState(0);
  const [filasPorPagina, setFilasPorPagina] = useState(10);
  const [period, setPeriod] = useState<number>(new Date().getFullYear());

  // Estados para el diálogo de detalles
  const [openOSDetail, setOpenOSDetail] = useState(false);
  const [OSDetail, setOSDetail] = useState<ServiceOrder | null>(null);

  // Otros estados
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

  // Nuevos estados para guía y factura
  const [guia, setGuia] = useState("");
  const [factura, setFactura] = useState("");

  // Nuevos estados para el detalle
  const [details, setDetails] = useState<DetailEntry[]>([]);
  const [currentGuideNetWeight, setCurrentGuideNetWeight] = useState<number>(0);
  const [currentRollCount, setCurrentRollCount] = useState<number>(0);
  const [generateCards, setGenerateCards] = useState<boolean>(false);

  // Agregar este estado
  const [selectedDetail, setSelectedDetail] = useState<ServiceOrderDetail | null>(null);

  // Agregar estado para almacenar los detalles con la descripción del tejido
  const [fabricDetails, setFabricDetails] = useState<FabricDetail[]>([]);

  // Agregar estado para el proveedor seleccionado
  const [selectedSupplier, setSelectedSupplier] = useState<string>("");

  // Agregar estado para la fecha G/F
  const [fechaGF, setFechaGF] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const suppliersResp = await fetchSuppliersT();
        setSuppliers(suppliersResp);

        const serviceOrdersResp = await fetchServiceOrders(period, false, true, undefined);
        setOrdenesServicio(serviceOrdersResp.serviceOrders || []);
      } catch (error) {
        console.error("Error al cargar datos:", error);
        showSnackbar("Error al cargar datos iniciales.", "error");
      }
    };
    fetchData();
  }, [period]);

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleOpenServiceDialog = () => {
    setIsServiceDialogOpen(true);
  };

  const handleCloseServiceDialog = () => {
    setIsServiceDialogOpen(false);
  };

  const handleOpenOSDetails = async (orderId: string) => {
    try {
      const orderDetails = await fetchServiceOrderById(orderId);
      setOSDetail(orderDetails);
      setOpenOSDetail(true);
    } catch (error) {
      console.error("Error al cargar detalles:", error);
      showSnackbar("Error al cargar detalles de la orden.", "error");
    }
  };

  const handleCloseOSDetail = () => {
    setOpenOSDetail(false);
    setOSDetail(null);
  };

  const handleSelectServiceOrder = async (orderId: string) => {
    try {
      const orderDetails = await fetchServiceOrderById(orderId);
      setSelectedServiceOrder(orderDetails);

      // Obtener la descripción de cada tejido
      const detailsWithDescription = await Promise.all(
        orderDetails.detail.map(async (detail) => {
          try {
            const fabricData = await fetchFabricById(detail.fabricId);
            return {
              ...detail,
              fabricDescription: fabricData.description
            };
          } catch (error) {
            console.error(`Error fetching fabric details for ${detail.fabricId}:`, error);
            return {
              ...detail,
              fabricDescription: 'Error al cargar descripción'
            };
          }
        })
      );

      setFabricDetails(detailsWithDescription);
      setIsServiceDialogOpen(false);
      showSnackbar("Orden de servicio seleccionada correctamente.", "success");
    } catch (error) {
      console.error("Error al seleccionar orden:", error);
      showSnackbar("Error al seleccionar la orden.", "error");
    }
  };

  const handleAddDetail = (detail: FabricDetail) => {
    // Validar que los valores sean mayores a 0
    if (currentGuideNetWeight <= 0) {
      showSnackbar("El peso neto debe ser mayor a 0", "error");
      return;
    }

    if (currentRollCount <= 0) {
      showSnackbar("La cantidad de rollos debe ser mayor a 0", "error");
      return;
    }

    const newDetail: DetailEntry = {
      itemNumber: details.length + 1,
      fabricId: detail.fabricId,
      fabricDescription: detail.fabricDescription || detail.fabricId,
      guideNetWeight: currentGuideNetWeight,
      rollCount: currentRollCount,
      generateCards: generateCards,
      serviceOrderId: selectedServiceOrder?.id || ''
    };

    setDetails([...details, newDetail]);
    setCurrentGuideNetWeight(0);
    setCurrentRollCount(0);
    setGenerateCards(false);
    setSelectedDetail(null);
    showSnackbar("Tejido agregado al detalle", "success");
  };

  // Agregar esta función para manejar cuando se hace click en el botón Add
  const handleDetailClick = (detail: ServiceOrderDetail) => {
    setSelectedDetail(detail);
  };

  // Agregar función para manejar la cancelación
  const handleCancel = () => {
    router.push("/operaciones/ingreso-tejido");
  };

  // Agregar función para manejar la creación
  const handleCreate = async () => {
    try {
      // Validaciones
      if (!selectedServiceOrder) {
        showSnackbar("Debe seleccionar una orden de servicio", "error");
        return;
      }

      if (!selectedSupplier) {
        showSnackbar("Debe seleccionar un proveedor", "error");
        return;
      }

      if (!guia || !factura) {
        showSnackbar("Debe ingresar guía y factura", "error");
        return;
      }

      if (details.length === 0) {
        showSnackbar("Debe agregar al menos un detalle", "error");
        return;
      }

      const payload = {
        supplierPoCorrelative: guia,
        supplierPoSeries: factura,
        supplierId: selectedSupplier,
        fecgf: fechaGF,
        detail: details.map(detail => ({
          itemNumber: detail.itemNumber,
          fabricId: detail.fabricId,
          guideNetWeight: detail.guideNetWeight,
          rollCount: detail.rollCount,
          generateCards: detail.generateCards,
          serviceOrderId: detail.serviceOrderId
        }))
      };

      const response = await createWeavingServiceEntry(payload);
      showSnackbar(`Ingreso de tejido creado exitosamente. Número: ${response.entryNumber}`, "success");
      
      // Redireccionar después de crear exitosamente
      setTimeout(() => {
        router.push("/operaciones/ingreso-tejido");
      }, 2000);

    } catch (error) {
      console.error("Error al crear el ingreso de tejido:", error);
      showSnackbar("Error al crear el ingreso de tejido", "error");
    }
  };

  return (
    <div className="flex justify-center items-start min-h-screen bg-gray-100 py-10">
      <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-6 w-full max-w-4xl">
        <h2 className="text-2xl font-semibold text-center text-blue-800 mb-6">
          Crear Movimiento de Ingreso de Tejido
        </h2>

        {/* Sección de Orden de Servicio */}
        <div className="mb-6">
          <Typography variant="subtitle1" className="font-semibold mb-2" style={{ color: "#000" }}>
            Seleccionar Orden de Servicio
          </Typography>
          <div className="flex items-center gap-4 mb-4">
            {selectedServiceOrder ? (
              <div className="flex items-center gap-2">
                <Typography variant="body1" style={{ color: "#000" }}>
                  Número de O/S: {selectedServiceOrder.id}
                </Typography>
                <IconButton onClick={() => handleOpenOSDetails(selectedServiceOrder.id)}>
                  <Visibility style={{ color: "#1976d2" }} />
                </IconButton>
              </div>
            ) : (
              <Typography variant="body2" color="textSecondary">
                No se ha seleccionado ninguna orden
              </Typography>
            )}
            <Button variant="outlined" onClick={handleOpenServiceDialog}>
              Seleccionar O/S
            </Button>
          </div>
        </div>

        {/* Nueva sección de Fecha G/F */}
        <div className="mb-4">
          <Typography variant="subtitle1" className="font-semibold mb-2" style={{ color: "#000" }}>
            Fecha G/F
          </Typography>
          <TextField
            type="date"
            value={fechaGF}
            onChange={(e) => setFechaGF(e.target.value)}
            variant="outlined"
            size="small"
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
            style={{ backgroundColor: "#fff" }}
          />
        </div>

        {/* Sección de Guía/Factura */}
        <div className="mb-4" style={{ display: 'flex', gap: '16px' }}>
          <div style={{ flex: 1 }}>
            <Typography variant="subtitle1" className="font-semibold mb-2" style={{ color: "#000" }}>
              Guía/Factura
            </Typography>
            <div style={{ display: 'flex', width: '100%' }}>
              <TextField
                label="Guía"
                value={guia}
                onChange={(e) => setGuia(e.target.value)}
                variant="outlined"
                size="small"
                style={{ flex: 1 }}
                InputProps={{ style: { borderRadius: 0 } }}
              />
              <TextField
                label="Factura"
                value={factura}
                onChange={(e) => setFactura(e.target.value)}
                variant="outlined"
                size="small"
                style={{ flex: 1 }}
                InputProps={{ style: { borderRadius: 0 } }}
              />
            </div>
          </div>
        </div>

        {/* Nueva sección de Proveedor */}
        <div className="mb-4">
          <Typography variant="subtitle1" className="font-semibold mb-2" style={{ color: "#000" }}>
            Proveedor
          </Typography>
          <Select
            value={selectedSupplier}
            onChange={(e) => setSelectedSupplier(e.target.value)}
            variant="outlined"
            size="small"
            fullWidth
            displayEmpty
            style={{ backgroundColor: "#fff" }}
          >
            <MenuItem value="" disabled>
              Seleccione un proveedor
            </MenuItem>
            {suppliers
              .filter(supplier => supplier.isActive === "A") // Solo mostrar proveedores activos
              .map((supplier) => (
                <MenuItem key={supplier.code} value={supplier.code}>
                  {supplier.name}
                </MenuItem>
              ))}
          </Select>
        </div>

        {/* Sección de Tejidos de la OS */}
        {selectedServiceOrder && (
          <>
            <div className="mb-6">
              <Typography variant="subtitle1" className="font-semibold mb-4" style={{ color: "#000" }}>
                Tejidos de la Orden de Servicio
              </Typography>
              <div className="max-w-full overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-blue-900 text-white">
                      <th className="px-4 py-4 font-normal">Tejido</th>
                      <th className="px-4 py-4 font-normal">Cantidad Ordenada</th>
                      <th className="px-4 py-4 font-normal">Cantidad Enviada</th>
                      <th className="px-4 py-4 font-normal">Precio</th>
                      <th className="px-4 py-4 font-normal">Estado</th>
                      <th className="px-4 py-4 font-normal">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fabricDetails.map((detail, index) => (
                      <tr key={index} className="text-center">
                        <td className="border-b border-gray-300 px-4 py-5">
                          {detail.fabricDescription || detail.fabricId}
                        </td>
                        <td className="border-b border-gray-300 px-4 py-5">
                          {detail.quantityOrdered}
                        </td>
                        <td className="border-b border-gray-300 px-4 py-5">
                          {detail.quantitySupplied || 0}
                        </td>
                        <td className="border-b border-gray-300 px-4 py-5">
                          {detail.price || 'Pendiente'}
                        </td>
                        <td className="border-b border-gray-300 px-4 py-5">
                          {detail.status?.value || 'Pendiente'}
                        </td>
                        <td className="border-b border-gray-300 px-4 py-5">
                          <IconButton 
                            color="primary" 
                            onClick={() => handleDetailClick(detail)}
                          >
                            <Add />
                          </IconButton>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Nueva sección de Detalles */}
            <div className="mb-6">
              <Typography variant="subtitle1" className="font-semibold mb-4" style={{ color: "#000" }}>
                Detalle
              </Typography>
              <div className="max-w-full overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-blue-900 text-white">
                      <th className="px-4 py-4 font-normal">Tejido</th>
                      <th className="px-4 py-4 font-normal">Peso Neto</th>
                      <th className="px-4 py-4 font-normal">Cantidad de Rollos</th>
                      <th className="px-4 py-4 font-normal">Generar Tarjetas</th>
                      <th className="px-4 py-4 font-normal">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {details.map((detail, index) => (
                      <tr key={index} className="text-center">
                        <td className="border-b border-gray-300 px-4 py-5">
                          {detail.fabricDescription}
                        </td>
                        <td className="border-b border-gray-300 px-4 py-5">
                          {detail.guideNetWeight}
                        </td>
                        <td className="border-b border-gray-300 px-4 py-5">
                          {detail.rollCount}
                        </td>
                        <td className="border-b border-gray-300 px-4 py-5">
                          {detail.generateCards ? 'Sí' : 'No'}
                        </td>
                        <td className="border-b border-gray-300 px-4 py-5">
                          <IconButton 
                            color="error" 
                            onClick={() => {
                              setDetails(details.filter((_, i) => i !== index));
                            }}
                          >
                            <Delete />
                          </IconButton>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Dialog para agregar detalle */}
            <Dialog
              open={Boolean(selectedDetail)}
              onClose={() => setSelectedDetail(null)}
              maxWidth="sm"
              fullWidth
            >
              <DialogTitle>Agregar Detalle de Tejido</DialogTitle>
              <DialogContent>
                <div className="space-y-4 mt-2">
                  <TextField
                    label="Peso Neto"
                    type="number"
                    fullWidth
                    value={currentGuideNetWeight}
                    onChange={(e) => setCurrentGuideNetWeight(Number(e.target.value))}
                    error={currentGuideNetWeight <= 0}
                    helperText={currentGuideNetWeight <= 0 ? "El peso neto debe ser mayor a 0" : ""}
                  />
                  <TextField
                    label="Cantidad de Rollos"
                    type="number"
                    fullWidth
                    value={currentRollCount}
                    onChange={(e) => setCurrentRollCount(Number(e.target.value))}
                    error={currentRollCount <= 0}
                    helperText={currentRollCount <= 0 ? "La cantidad de rollos debe ser mayor a 0" : ""}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={generateCards}
                        onChange={(e) => setGenerateCards(e.target.checked)}
                      />
                    }
                    label="Generar Tarjetas"
                  />
                </div>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setSelectedDetail(null)} color="error">
                  Cancelar
                </Button>
                <Button 
                  onClick={() => {
                    if (selectedDetail) {
                      handleAddDetail(selectedDetail as FabricDetail);
                    }
                  }} 
                  color="primary"
                >
                  Agregar
                </Button>
              </DialogActions>
            </Dialog>
          </>
        )}

        {/* Diálogo para seleccionar órdenes de servicio */}
        <Dialog
          open={isServiceDialogOpen}
          onClose={handleCloseServiceDialog}
          fullWidth
          maxWidth="lg"

        >
          <DialogTitle>Seleccionar Orden de Servicio</DialogTitle>
          <DialogContent>
            <div className="mb-4">
              <Typography variant="subtitle1" className="font-semibold mb-2" style={{ color: "#000" }}>
                Seleccionar periodo
              </Typography>
              <Select
                value={period}
                onChange={(e) => setPeriod(Number(e.target.value))}
              >
                {[2023, 2024, 2025].map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </div>
            
            <div className="max-w-full overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-blue-900 text-white">
                    <th className="px-4 py-4 font-normal">Número</th>
                    <th className="px-4 py-4 font-normal">Información</th>
                    <th className="px-4 py-4 font-normal">Cliente</th>
                    <th className="px-4 py-4 font-normal">Fecha</th>
                    <th className="px-4 py-4 font-normal">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {ordenesServicio
                    .slice(pagina * filasPorPagina, pagina * filasPorPagina + filasPorPagina)
                    .map((orden) => {
                      // Encontrar el nombre del proveedor
                      const supplierName = suppliers.find(s => s.code === orden.supplierId)?.name || "Desconocido";
                      
                      return (
                        <tr key={orden.id} className="text-center">
                          <td className="border-b border-gray-300 px-4 py-5">{orden.id}</td>
                          <td className="border-b border-gray-300 px-4 py-5">
                            <IconButton onClick={() => handleOpenOSDetails(orden.id)}>
                              <VisibilityIcon style={{ color: "#1976d2" }} />
                            </IconButton>
                          </td>
                          <td className="border-b border-gray-300 px-4 py-5">{supplierName}</td>
                          <td className="border-b border-gray-300 px-4 py-5">{orden.issueDate}</td>
                          <td className="border-b border-gray-300 px-4 py-5">
                            <IconButton color="primary" onClick={() => handleSelectServiceOrder(orden.id)}>
                              <Add />
                            </IconButton>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
              <TablePagination
                rowsPerPageOptions={[10, 25, 50]}
                component="div"
                count={ordenesServicio.length}
                rowsPerPage={filasPorPagina}
                page={pagina}
                onPageChange={(_, newPage) => setPagina(newPage)}
                onRowsPerPageChange={(e) => setFilasPorPagina(parseInt(e.target.value, 10))}
              />
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseServiceDialog} style={{ backgroundColor: "#d32f2f", color: "#fff" }}>
              Cancelar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Diálogo de detalles de órdenes de servicio */}
        <Dialog
          open={openOSDetail}
          onClose={handleCloseOSDetail}
          fullWidth
          maxWidth="lg"
          sx={{
            "& .MuiDialog-paper": {
              width: "30%",
              marginLeft: "20%",
            },
          }}
        >
          <DialogContent>
            <h3 className="text-lg font-semibold text-black mb-4">
              Información de la Orden de Servicio
            </h3>
            <div className="max-w-full overflow-x-auto">
              {OSDetail ? (
                <div className="mb-4 text-black">
                  <p className="mb-2"><strong>Fabric ID:</strong> {OSDetail.detail[0]?.fabricId} </p>
                  <p className="mb-2"><strong>Cantidad Ordenada:</strong> {OSDetail.detail[0]?.quantityOrdered} </p>
                  <p className="mb-2"><strong>Cantidad Enviada:</strong> {OSDetail.detail[0]?.quantitySupplied} </p>
                  <p className="mb-2"><strong>Precio:</strong> {OSDetail.detail[0]?.price} </p>
                  <p className="mb-2"><strong>Detalles:</strong> {OSDetail.detail[0]?.detailNote} </p>
                  <p className="mb-2"><strong>Estado:</strong> {OSDetail.detail[0]?.status?.value || 'No definido'} </p>
                </div>
              ) : (
                <p>Cargando información...</p>
              )}
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseOSDetail} style={{ backgroundColor: "#d32f2f", color: "#fff" }}>
              Cancelar
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert 
            onClose={() => setSnackbarOpen(false)} 
            severity={snackbarSeverity}
            sx={{
              width: "100%",
              backgroundColor: snackbarSeverity === "success" ? "#1976d2" : "#d32f2f",
              color: "#fff",
            }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>

        {/* Modificar los botones de acción al final */}
        <div className="flex justify-between mt-6">
          <Button
            variant="contained"
            onClick={handleCancel}
            style={{ backgroundColor: "#d32f2f" }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            style={{ backgroundColor: "#1976d2" }}
          >
            Crear Ingreso Tejido
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CrearIngresoTejido;

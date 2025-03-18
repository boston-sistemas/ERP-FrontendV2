"use client"

import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  fetchYarnDispatchByNumber,
  anulateYarnDispatch,
  checkIsDispatchUpdatable,
  updateYarnDispatch,
} from "../../services/movSalidaHiladoService";
import {
  fetchYarnPurchaseEntries,
  fetchYarnIncomeEntries,
  fetchYarnPurchaseEntryDetails,
  fetchFabricSearchId,
} from "../../../movimiento-ingreso-hilado/services/movIngresoHiladoService";
import { fetchSuppliers } from "../../../ordenes-servicio/services/ordenesServicioService";
import {
  fetchServiceOrders,
  fetchServiceOrderById,
} from "../../../ordenes-servicio/services/ordenesServicioService";

import {
  Supplier,
  YarnDispatch,
  YarnDispatchDetail,
  ServiceOrder, // Asumiendo que tienes esta interfaz
} from "../../../models/models";

import {
  CircularProgress,
  Typography,
  Box,
  Button,
  Snackbar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Tooltip,
  Table,
  TableHead,
  TableCell,
  TableBody,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TablePagination,
} from "@mui/material";
import MuiAlert, { AlertProps } from "@mui/material/Alert";
import { Close, Search, Add } from "@mui/icons-material";
import VisibilityIcon from '@mui/icons-material/Visibility';

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const DetallesMovSalidaHilado: React.FC = () => {
  const { exitNumber } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  // 1) Period
  const periodParam = searchParams.get("period");
  const [period] = useState<number>(() =>
    periodParam ? parseInt(periodParam) : 2025
  );

  // 2) Data + loading
  const [dispatchDetail, setDispatchDetail] = useState<YarnDispatch | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 3) Permisos de edición/anulación
  const [isEditable, setIsEditable] = useState(false);
  const [isAnulable, setIsAnulable] = useState(false);

  // 4) Tooltips
  const [editTooltip, setEditTooltip] = useState("");
  const [anulateTooltip, setAnulateTooltip] = useState("");

  // 5) Notificaciones
  const [error, setError] = useState<string | null>(null);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );

  // 6) Diálogos
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAnulateDialogOpen, setIsAnulateDialogOpen] = useState(false);

  // 7) Campos editables en <Dialog>
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [editSupplierCode, setEditSupplierCode] = useState("");
  const [editNroDir, setEditNroDir] = useState("000");
  const [editDocumentNote, setEditDocumentNote] = useState("");
  const [editDetail, setEditDetail] = useState<YarnDispatchDetail[]>([]);

  // (NUEVO) Campo para serviceOrderId
  const [editServiceOrderId, setEditServiceOrderId] = useState("");

  // 8) Para "Seleccionar Movimiento de Ingreso"
  const [purchaseEntries, setPurchaseEntries] = useState<any[]>([]);

  // (NUEVO) Para "Seleccionar Orden de Servicio"

  // Agregar este nuevo estado junto a los otros estados
  const [purchaseEntryPeriod, setPurchaseEntryPeriod] = useState<number>(period); // Inicializado con el period actual
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [pagina, setPagina] = useState(0);
  const [filasPorPagina, setFilasPorPagina] = useState(10);

  // ==========================================
  // useEffect: cargar suppliers + dispatch detail
  // ==========================================
  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        const data = await fetchSuppliers(50, 0, false);
        setSuppliers(data);
      } catch (e) {
        console.error("Error al cargar proveedores:", e);
      }
    };
    loadSuppliers();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!exitNumber || Array.isArray(exitNumber)) {
        setError("No se proporcionó un número de salida válido.");
        return;
      }
      setIsLoading(true);

      try {
        const data = await fetchYarnDispatchByNumber(exitNumber, period);
        setDispatchDetail(data);

        // Prellenar serviceOrderId si ya existe
        if (data.serviceOrderId) {
          setEditServiceOrderId(data.serviceOrderId);
        }

        const resp = await checkIsDispatchUpdatable(exitNumber, period);
        // Ej. resp = { updatable: true, message: "..." }
        if (data.statusFlag?.toUpperCase() === "A") {
          // Anulado
          setIsEditable(false);
          setIsAnulable(false);
          setEditTooltip("El movimiento está anulado.");
          setAnulateTooltip("El movimiento ya está anulado.");
        } else {
          if (resp.updatable) {
            setIsEditable(true);
            setIsAnulable(true);
            setEditTooltip("");
            setAnulateTooltip("");
          } else {
            setIsEditable(false);
            setIsAnulable(false);
            setEditTooltip(resp.message || "No se puede editar.");
            setAnulateTooltip(resp.message || "No se puede anular.");
          }
        }
      } catch (err) {
        setError("Error al obtener el detalle del movimiento.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [exitNumber, period]);

  // ==============================
  // Editar
  // ==============================
  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

  const [ingresos, setIngresos] = useState<any[]>([]);
  const [FabricInfo, setFabricInfo] = useState<any>(null);
  const [YarnsIds, setYarnsIds] = useState<string[]>([]);
  const [NameYarnsIds, setNameYarnsIds] = useState<string[]>([]);

  const handleEdit = async () => {
    if (!dispatchDetail) return;
    if (!isEditable) {
      setSnackbarMessage("No se puede editar este movimiento.");
      setSnackbarSeverity("error");
      return;
    }

    try {
      setIsLoading(true);

      // 1. Cargar los ingresos primero
      const ingresosResponse = await fetchYarnIncomeEntries(
        purchaseEntryPeriod,
        dispatchDetail?.serviceOrderId || ""
      );
      console.log("ingresosResponse", ingresosResponse);
      if (ingresosResponse?.yarnPurchaseEntries) {
        setIngresos(ingresosResponse.yarnPurchaseEntries);
      }

      // 2. Cargar información del tejido si hay detalles
      if (dispatchDetail.detail && dispatchDetail.detail.length > 0) {
        const fabricInfos = await fetchFabricSearchId(dispatchDetail.detail[0].fabricId);
        if (fabricInfos) {
          setFabricInfo(fabricInfos);
          
          // 3. Procesar los IDs de hilados inmediatamente después de obtener fabricInfo
          if (fabricInfos.recipe) {
            const yarnIds = fabricInfos.recipe.map((item: any) => item.yarn.id);
            const yarnNames = fabricInfos.recipe.map((item: any) => item.yarn.description);
            setYarnsIds(yarnIds);
            setNameYarnsIds(yarnNames);
          }
        }
      }

      // 4. Llenar los estados básicos del formulario
      setEditSupplierCode(dispatchDetail.supplierCode || "");
      setEditNroDir(dispatchDetail.nrodir || "000");
      setEditDocumentNote(dispatchDetail.documentNote || "");
      setEditDetail(dispatchDetail.detail || []);
      setEditServiceOrderId(dispatchDetail.serviceOrderId || "");

      // 5. Abrir el diálogo
      setIsEditDialogOpen(true);

    } catch (error) {
      console.error('Error al cargar datos:', error);
      showSnackbar("Error al cargar los datos. Por favor, inténtelo de nuevo.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // ==============================
  // Guardar => PATCH
  // ==============================
  const handleSaveChanges = async () => {
    if (!dispatchDetail) return;
    try {
      // OJO: Corrige entryGroupNumber/entryItemNumber para que sean numéricos
      const finalDetail = editDetail.map((d) => ({
        itemNumber: d.itemNumber ?? 1,
        entryNumber: d.entryNumber || "",
        entryGroupNumber: d.entryGroupNumber ?? 1, // <-- no null
        entryItemNumber: d.entryItemNumber ?? 1,    // <-- no null
        entryPeriod: d.entryPeriod ?? period,
        coneCount: d.coneCount ?? 0,
        packageCount: d.packageCount ?? 0,
        grossWeight: d.grossWeight ?? 0,
        netWeight: d.netWeight ?? 0,
      }));

      await updateYarnDispatch(exitNumber as string, period, {
        supplierCode: editSupplierCode,
        documentNote: editDocumentNote,
        nrodir: editNroDir,
        serviceOrderId: editServiceOrderId, // <-- se envía en el payload
        detail: finalDetail,
      });

      setSnackbarMessage("Cambios guardados exitosamente.");
      setSnackbarSeverity("success");
      setIsEditDialogOpen(false);

      // Re-fetch
      const updated = await fetchYarnDispatchByNumber(exitNumber as string, period);
      setDispatchDetail(updated);
    } catch (err) {
      console.error(err);
      setSnackbarMessage("Error al actualizar el movimiento.");
      setSnackbarSeverity("error");
    }
  };

  // ==============================
  // Anular
  // ==============================
  const handleAnulate = async () => {
    if (!isAnulable) {
      setSnackbarMessage("No se puede anular este movimiento.");
      setSnackbarSeverity("error");
      return;
    }
    try {
      await anulateYarnDispatch(exitNumber as string, period);
      setSnackbarMessage("Movimiento anulado exitosamente.");
      setSnackbarSeverity("success");

      setIsEditable(false);
      setIsAnulable(false);

      // Reload
      const updatedData = await fetchYarnDispatchByNumber(exitNumber as string, period);
      setDispatchDetail(updatedData);
    } catch (err) {
      setSnackbarMessage("Error al anular el movimiento.");
      setSnackbarSeverity("error");
      console.error(err);
    }
    setIsAnulateDialogOpen(false);
  };

    // ==============================
  // Movimiento de Ingreso
  // ==============================
  const [isPurchaseEntryDialogOpen, setIsPurchaseEntryDialogOpen] = useState(false);

  const handleOpenPurchaseEntryDialog = async () => {
    try {
      setIsLoading(true);
      setIsPurchaseEntryDialogOpen(true);
    } catch (error) {
      console.error("Error al preparar el diálogo:", error);
      showSnackbar("Error al cargar los datos", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClosePurchaseEntryDialog = () => setIsPurchaseEntryDialogOpen(false);

  const handleSelectPurchaseEntry = async (entryNumber: string) => {
    handleClosePurchaseEntryDialog();
    try {
      const detailsResp = await fetchYarnPurchaseEntryDetails(entryNumber, period);
      if (detailsResp.detail?.length) {
        const newDetail: YarnDispatchDetail[] = [];
        detailsResp.detail.forEach((d) => {
          d.detailHeavy.forEach((g) => {
            newDetail.push({
              itemNumber: d.itemNumber ?? 1,
              entryNumber: detailsResp.entryNumber,
              entryGroupNumber: g.groupNumber ?? 1,
              entryItemNumber: d.itemNumber ?? 1,
              entryPeriod: detailsResp.period,
              coneCount: g.coneCount ?? 0,
              packageCount: g.packageCount ?? 0,
              grossWeight: g.grossWeight ?? 0,
              netWeight: g.netWeight ?? 0,
            });
          });
        });
        setEditDetail(newDetail);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ==============================
  // Orden de Servicio
  // ==============================
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
  const [isServiceOrderDialogOpen, setIsServiceOrderDialogOpen] = useState(false);

  const handleOpenServiceOrderDialog = async () => {
    try {
      const resp = await fetchServiceOrders(period, false, false);
      setServiceOrders(resp.serviceOrders || []);
      setIsServiceOrderDialogOpen(true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCloseServiceOrderDialog = () => setIsServiceOrderDialogOpen(false);

  const handleSelectServiceOrder = async (orderId: string) => {
    setIsServiceOrderDialogOpen(false);
    // Simplemente guardamos el ID
    setEditServiceOrderId(orderId);
  };

  // ==============================
  // Miscel
  // ==============================
  const handleCloseSnackbar = () => setSnackbarMessage(null);
  const handleCloseEditDialog = () => setIsEditDialogOpen(false);
  const handleOpenAnulateDialog = () => setIsAnulateDialogOpen(true);
  const handleCloseAnulateDialog = () => setIsAnulateDialogOpen(false);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  if (!dispatchDetail) {
    return <Typography>No se encontró el detalle del movimiento.</Typography>;
  }

  // Para renderizar la dirección en un <Select>
  const selectedSupplierObj = suppliers.find(
    (sup) => sup.code === editSupplierCode
  );

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default sm:px-7.5 xl:pb-1">
      <div className="flex items-center justify-between mb-4 text-black">
        <Typography variant="h5" className="font-semibold">
          Detalle del Movimiento de Salida
        </Typography>
        <div className="flex gap-2">
          <Tooltip title={editTooltip}>
            <span>
              <Button
                variant="contained"
                disabled={!isEditable}
                onClick={handleEdit}
                sx={{
                  backgroundColor: dispatchDetail.promecStatus?.statusId.toUpperCase() === "A" 
                    ? "#9e9e9e !important"  // Gris cuando está anulado
                    : "#1976d2 !important", // Azul normal
                  color: "white",
                  boxShadow: "none",
                  "&:hover": {
                    backgroundColor: dispatchDetail.promecStatus?.statusId.toUpperCase() === "A"
                      ? "#757575"  // Gris más oscuro al hover cuando está anulado
                      : "#1259a3", // Azul más oscuro al hover normal
                  },
                  "&:disabled": {
                    backgroundColor: "#90caf9",
                    color: "#ffffff",
                  },
                }}
              >
                Editar
              </Button>
            </span>
          </Tooltip>
          <Tooltip title={anulateTooltip}>
            <span>
              <Button
                variant="contained"
                disabled={!isAnulable}
                onClick={handleOpenAnulateDialog}
                sx={{
                  backgroundColor: dispatchDetail.promecStatus?.statusId.toUpperCase() === "A" 
                    ? "#9e9e9e !important"  // Gris cuando está anulado
                    : "#FF0000 !important", // Rojo normal
                  color: "white",
                  boxShadow: "none",
                  "&:hover": {
                    backgroundColor: dispatchDetail.promecStatus?.statusId.toUpperCase() === "A"
                      ? "#757575"  // Gris más oscuro al hover cuando está anulado
                      : "#d32f2f", // Rojo más oscuro al hover normal
                  },
                  "&:disabled": {
                    backgroundColor: "#90caf9",
                    color: "#ffffff",
                  },
                }}
              >
                Anular
              </Button>
            </span>
          </Tooltip>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-black">
        <div>
          <Typography>
            <strong>Número de Salida:</strong> {dispatchDetail.exitNumber}
          </Typography>
          <Typography>
            <strong>Periodo:</strong> {dispatchDetail.period}
          </Typography>
          <Typography>
            <strong>Estado:</strong> {dispatchDetail.promecStatus.name}
          </Typography>
        </div>
        <div>
          <Typography>
            <strong>Fecha de Creación:</strong> {dispatchDetail.creationDate}
          </Typography>
          <Typography>
            <strong>Hora de Creación:</strong> {dispatchDetail.creationTime}
          </Typography>
          <Typography>
            <strong>Proveedor:</strong> {suppliers.map((supplier) =>
                          supplier.code === dispatchDetail.supplierCode
                            ? supplier.name
                            : ""
                        )}
          </Typography>
        </div>
      </div>

      <Typography className="mb-2 text-black">
        <strong>Nota del Documento:</strong>{" "}
        {dispatchDetail.documentNote || "No existe Nota de documento"}
      </Typography>

      <Typography variant="h6" className="font-semibold mb-2 text-black">
        Detalle de items
      </Typography>
      <div className="overflow-x-auto mb-4 text-black">
        <table className="w-full border-collapse table-auto">
          <thead>
            <tr className="bg-blue-900 text-white text-center">
              <th className="px-4 py-3 font-normal">Item</th>
              <th className="px-4 py-3 font-normal">Hilado</th>
              <th className="px-4 py-3 font-normal">Peso Bruto</th>
              <th className="px-4 py-3 font-normal">Peso Neto</th>
              <th className="px-4 py-3 font-normal">Bultos</th>
              <th className="px-4 py-3 font-normal">Conos</th>
            </tr>
          </thead>
          <tbody>
            {dispatchDetail.detail.map((item, idx) => {
              const possibleYarnId = (item as any).yarnId || "—";
              return (
                <tr key={idx} className="text-center">
                  <td className="border-b border-gray-200 px-4 py-2">
                    {item.itemNumber}
                  </td>
                  <td className="border-b border-gray-200 px-4 py-2">
                    {possibleYarnId}
                  </td>
                  <td className="border-b border-gray-200 px-4 py-2">
                    {item.grossWeight}
                  </td>
                  <td className="border-b border-gray-200 px-4 py-2">
                    {item.netWeight}
                  </td>
                  <td className="border-b border-gray-200 px-4 py-2">
                    {item.packageCount}
                  </td>
                  <td className="border-b border-gray-200 px-4 py-2">
                    {item.coneCount}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Snackbar */}
      <Snackbar
        open={!!snackbarMessage}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
      
      {/* Diálogo para Editar */}
      <Dialog
        open={isEditDialogOpen}
        onClose={handleCloseEditDialog}
        fullWidth
        maxWidth="lg"
        sx={{
          "& .MuiDialog-paper": {
            width: "70%",
            marginLeft: "20%",
          },
        }}
      >
        <DialogTitle>
          Editar Movimiento de Salida
        </DialogTitle>

        <DialogContent>
          <div className="mt-4 space-y-4">
            {/* Proveedor (readonly) */}
            <FormControl fullWidth disabled>
              <InputLabel id="supplier-label">Proveedor</InputLabel>
              <Select
                labelId="supplier-label"
                value={editSupplierCode}
                label="Proveedor"
              >
                {suppliers.map((sup) => (
                  <MenuItem key={sup.code} value={sup.code}>
                    {sup.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Dirección (editable si hay proveedor seleccionado) */}
            {selectedSupplierObj && (
              <FormControl fullWidth>
                <InputLabel id="address-label">Dirección</InputLabel>
                <Select
                  labelId="address-label"
                  value={editNroDir}
                  label="Dirección"
                  onChange={(e) => setEditNroDir(e.target.value as string)}
                >
                  {Object.entries(selectedSupplierObj.addresses).map(
                    ([addrCode, addrName]) => (
                      <MenuItem key={addrCode} value={addrCode}>
                        {addrName}
                      </MenuItem>
                    )
                  )}
                </Select>
              </FormControl>
            )}

            {/* Orden de Servicio (OS) (readonly) - sin botón de selección */}
            <TextField
              label="Orden de Servicio (ID)"
              value={editServiceOrderId}
              fullWidth
              disabled
            />

            {/* Nota del Documento */}
            <TextField
              label="Nota del Documento"
              value={editDocumentNote}
              onChange={(e) => setEditDocumentNote(e.target.value)}
              fullWidth
              multiline
              rows={3}
            />

            <Typography variant="subtitle1" className="font-semibold mt-4">
              Detalle
            </Typography>
            <div className="overflow-x-auto">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Ítem</TableCell>
                    <TableCell>Conos</TableCell>
                    <TableCell>Bultos</TableCell>
                    <TableCell>Peso Neto</TableCell>
                    <TableCell>Peso Bruto</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {editDetail.map((d, i) => (
                    <TableRow key={i}>
                      <TableCell>{d.itemNumber ?? 1}</TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          value={d.coneCount}
                          onChange={(e) =>
                            handleDetailChange(
                              i,
                              "coneCount",
                              parseInt(e.target.value) || 0
                            )
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          value={d.packageCount}
                          onChange={(e) =>
                            handleDetailChange(
                              i,
                              "packageCount",
                              parseInt(e.target.value) || 0
                            )
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          value={d.netWeight}
                          onChange={(e) =>
                            handleDetailChange(
                              i,
                              "netWeight",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          value={d.grossWeight}
                          onChange={(e) =>
                            handleDetailChange(
                              i,
                              "grossWeight",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <Button
              variant="outlined"
              onClick={handleOpenPurchaseEntryDialog}
              startIcon={<Search />}
            >
              Seleccionar Ingreso (opcional)
            </Button>
          </div>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancelar</Button>
          <Button 
            variant="contained" 
            onClick={handleSaveChanges}
            sx={{
              backgroundColor: "#1976d2 !important", // Azul por defecto
              color: "white",
              boxShadow: "none",
              "&:hover": {
                backgroundColor: "#1259a3 !important", // Azul más oscuro al hover
              },
            }}
          >
            Guardar Cambios
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo Orden de Servicio */}
      <Dialog
        open={isServiceOrderDialogOpen}
        onClose={handleCloseServiceOrderDialog}
        fullWidth
        maxWidth="lg"
        sx={{
          "& .MuiDialog-paper": {
            width: "70%",
            marginLeft: "20%",
          },
        }}
      >
        <DialogTitle>
          Seleccionar Orden de Servicio
          <IconButton
            aria-label="close"
            onClick={handleCloseServiceOrderDialog}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {/* Tabla con desplazamiento si es necesario */}
          <div className="max-w-full overflow-x-auto">
            <table className="w-full table-auto border-collapse">
              <thead className="bg-blue-900 text-white">
                <tr>
                  <th className="px-4 py-4 text-center">ID</th>
                  <th className="px-4 py-4 text-center">Cliente</th>
                  <th className="px-4 py-4 text-center">Fecha</th>
                  <th className="px-4 py-4 text-center">Acción</th>
                </tr>
              </thead>
              <tbody>
                {serviceOrders.map((so) => (
                  <tr key={so.id} className="text-center text-black hover:bg-gray-100 text-gray-900">
                    <td className="border-b border-gray-300 px-4 py-5 mb-2">{so.id}</td>
                    <td className="border-b border-gray-300 px-4 py-5 mb-2"></td>
                    <td className="border-b border-gray-300 px-4 py-5 mb-2">{so.supplierId}</td>
                    <td className="border-b border-gray-300 px-4 py-5 mb-2">{so.issueDate}</td>
                    <td className="border-b border-gray-300 px-4 py-5 mb-2">
                      <button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md transition-all"
                        onClick={() => handleSelectServiceOrder(so.id)}
                      >
                        Seleccionar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseServiceOrderDialog}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para Ingreso */}
      <Dialog
        open={isPurchaseEntryDialogOpen}
        onClose={handleClosePurchaseEntryDialog}
        fullWidth
        maxWidth="lg"
        sx={{
          "& .MuiDialog-paper": {
            width: "70%",
            marginLeft: "20%",
          },
        }}
      >
        <DialogTitle>Seleccionar Movimiento de Ingreso</DialogTitle>
        <DialogContent>
          <div className="mb-4">
            <Typography variant="subtitle1" className="font-semibold mb-2" style={{ color: "#000" }}>
              Seleccionar periodo
            </Typography>
            <Select
              labelId="purchase-period-label"
              value={purchaseEntryPeriod}
              onChange={(e) => {
                const selectedPeriod = Number(e.target.value);
                if ([2023, 2024, 2025].includes(selectedPeriod)) {
                  setPurchaseEntryPeriod(selectedPeriod);
                  // Recargar los datos con el nuevo período
                  fetchYarnPurchaseEntries(selectedPeriod, 10, 0, false)
                    .then(resp => setPurchaseEntries(resp.yarnPurchaseEntries || []))
                    .catch(e => console.error(e));
                } else {
                  setSnackbarMessage("Período no válido.");
                  setSnackbarSeverity("error");
                }
              }}
            >
              {[2023, 2024, 2025].map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </div>
          <div className="max-w-full overflow-x-auto">
             {Array.isArray(YarnsIds) && YarnsIds.length > 0 ? (
              YarnsIds.map((yarnId, index) => {
                const yarnName = NameYarnsIds[index] || `ID: ${yarnId}`;
                
                // Filtra los ingresos correspondientes a este yarnId
                const ingresosFiltrados = ingresos.filter((ingreso) => {
                  return ingreso.yarnId === yarnId;
                });

                // Si no hay ingresos, no mostrar la tabla para este yarnId
                if (ingresosFiltrados.length === 0) {
                  return null;
                }

                return (
                  <div key={yarnId} className="mb-8">
                    <h2 className="text-lg font-bold my-4 text-black">
                      Hilado: {yarnName}
                    </h2>

                    <table className="w-full table-auto">
                      <thead>
                        <tr className="bg-blue-900 text-white">
                          <th className="px-4 py-4 font-normal">Número</th>
                          <th className="px-4 py-4 font-normal">Peso Bruto</th>
                          <th className="px-4 py-4 font-normal">Peso Neto</th>
                          <th className="px-4 py-4 font-normal">Paquetes</th>
                          <th className="px-4 py-4 font-normal">Conos</th>
                          <th className="px-4 py-4 font-normal">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ingresosFiltrados.map((ingreso) => {
                          const alreadySelected = editDetail.some(
                            (detail) => detail.entryNumber === ingreso.entryNumber
                          );

                          // Accede directamente a detailHeavy ya que está en el nivel principal
                          const detailHeavy = ingreso.detailHeavy && ingreso.detailHeavy.length > 0 
                            ? ingreso.detailHeavy[0] 
                            : {};
                          
                          return (
                            <tr key={ingreso.entryNumber} className="text-center">
                              <td className="border-b border-gray-300 px-4 py-5">
                                {ingreso.entryNumber}
                              </td>
                              <td className="border-b border-gray-300 px-4 py-5">
                                {detailHeavy.grossWeight?.toFixed(2) || "--"}
                              </td>
                              <td className="border-b border-gray-300 px-4 py-5">
                                {detailHeavy.netWeight?.toFixed(2) || "--"}
                              </td>
                              <td className="border-b border-gray-300 px-4 py-5">
                                {detailHeavy.packageCount || "--"}
                              </td>
                              <td className="border-b border-gray-300 px-4 py-5">
                                {detailHeavy.coneCount || "--"}
                              </td>
                              <td className="border-b border-gray-300 px-4 py-5">
                                {alreadySelected ? (
                                  <span className="text-gray-500">Seleccionado</span>
                                ) : (
                                  <Button
                                    variant="contained"
                                    onClick={() => handleSelectPurchaseEntry(ingreso.entryNumber)}
                                    sx={{
                                      backgroundColor: "#1976d2 !important",
                                      color: "white",
                                      boxShadow: "none",
                                      "&:hover": {
                                        backgroundColor: "#1259a3 !important",
                                      },
                                    }}
                                  >
                                    Seleccionar
                                  </Button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              })
            ) : (
              <Typography className="text-center py-4 text-black">
                No hay hilados disponibles para mostrar
              </Typography>
            )}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePurchaseEntryDialog}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para Anular */}
      <Dialog
        open={isAnulateDialogOpen}
        onClose={handleCloseAnulateDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Confirmar Anulación
          <IconButton
            aria-label="close"
            onClick={handleCloseAnulateDialog}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          ¿Seguro de anular este movimiento de salida? Esta acción no se puede deshacer.
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAnulateDialog}>Cancelar</Button>
          <Button 
            variant="contained" 
            onClick={handleAnulate}
            sx={{
              backgroundColor: "#FF0000 !important", // Rojo por defecto
              color: "white",
              boxShadow: "none",
              "&:hover": {
                backgroundColor: "#d32f2f !important", // Rojo más oscuro al hover
              },
            }}
          >
            Anular
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default DetallesMovSalidaHilado;

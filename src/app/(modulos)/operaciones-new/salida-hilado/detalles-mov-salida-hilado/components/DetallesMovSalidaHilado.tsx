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
import { fetchYarnbyId } from "../../../hilados/services/hiladoService";

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

  const [yarnsInfo, setYarnsInfo] = useState<{ [key: string]: any }>({});

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

        // Obtener información de los hilados
        const uniqueYarnIds = new Set(data.detail.map((item: any) => item.yarnId).filter(Boolean));
        const yarnPromises = Array.from(uniqueYarnIds).map(yarnId => fetchYarnbyId(yarnId));
        const yarnsData = await Promise.all(yarnPromises);
        const yarnsMap = yarnsData.reduce((acc, yarn) => {
          acc[yarn.id] = yarn;
          return acc;
        }, {});
        setYarnsInfo(yarnsMap);

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
      const finalDetail = editDetail.map((d) => ({
        itemNumber: d.itemNumber ?? 1,
        entryNumber: d.entryNumber || "",
        entryGroupNumber: d.entryGroupNumber ?? 1,
        entryItemNumber: d.entryItemNumber ?? 1,
        entryPeriod: d.entryPeriod ?? period,
        coneCount: Math.max(1, d.coneCount ?? 1),
        packageCount: Math.max(1, d.packageCount ?? 1),
        netWeight: Math.max(0, d.netWeight ?? 0),
        grossWeight: Math.max(0, d.grossWeight ?? 0),
        fabricId: (d as any).fabricId || ""
      }));

      const payload = {
        documentNote: editDocumentNote || "",
        nrodir: editNroDir || "000",
        detail: finalDetail
      };

      console.log("Enviando payload:", JSON.stringify(payload, null, 2));

      const response = await updateYarnDispatch(exitNumber as string, period, payload);
      console.log("Respuesta del backend:", response);

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
  const [selectedEntries, setSelectedEntries] = useState<Set<string>>(new Set());

  const handleOpenPurchaseEntryDialog = async () => {
    try {
      setIsLoading(true);
      setSelectedEntries(new Set(editDetail.map(d => d.entryNumber)));
      setIsPurchaseEntryDialogOpen(true);
    } catch (error) {
      console.error("Error al preparar el diálogo:", error);
      showSnackbar("Error al cargar los datos", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClosePurchaseEntryDialog = () => {
    setIsPurchaseEntryDialogOpen(false);
    setSelectedEntries(new Set());
  };

  const handleSelectPurchaseEntry = async (entryNumber: string) => {
    try {
      const detailsResp = await fetchYarnPurchaseEntryDetails(entryNumber, period);
      if (detailsResp.detail?.length) {
        const newDetails: YarnDispatchDetail[] = [];
        detailsResp.detail.forEach((d) => {
          d.detailHeavy.forEach((g) => {
            newDetails.push({
              itemNumber: d.itemNumber ?? 1,
              entryNumber: detailsResp.entryNumber,
              entryGroupNumber: g.groupNumber ?? 1,
              entryItemNumber: d.itemNumber ?? 1,
              entryPeriod: detailsResp.period,
              coneCount: g.coneCount ?? 0,
              packageCount: g.packageCount ?? 0,
              grossWeight: g.grossWeight ?? 0,
              netWeight: g.netWeight ?? 0,
              yarnId: d.yarnId // Asegúrate de incluir el yarnId
            });
          });
        });

        // Si ya está seleccionado, lo quitamos
        if (selectedEntries.has(entryNumber)) {
          setSelectedEntries(prev => {
            const next = new Set(prev);
            next.delete(entryNumber);
            return next;
          });
          setEditDetail(prev => prev.filter(d => d.entryNumber !== entryNumber));
        } else {
          // Si no está seleccionado, lo agregamos
          setSelectedEntries(prev => {
            const next = new Set(prev);
            next.add(entryNumber);
            return next;
          });
          setEditDetail(prev => [...prev, ...newDetails]);
        }
      }
    } catch (err) {
      console.error(err);
      showSnackbar("Error al cargar los detalles del ingreso", "error");
    }
  };

  const handleDetailChange = (index: number, field: string, value: number) => {
    setEditDetail(prev => {
      const next = [...prev];
      (next[index] as any)[field] = value;
      return next;
    });
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
    <>
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
                const yarnInfo = yarnsInfo[possibleYarnId];
                return (
                  <tr key={idx} className="text-center">
                    <td className="border-b border-gray-200 px-4 py-2">
                      {item.itemNumber}
                    </td>
                    <td className="border-b border-gray-200 px-4 py-2">
                      {yarnInfo ? yarnInfo.description : possibleYarnId}
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
              width: "80%",
              maxWidth: "1200px",
              marginLeft: "20%",
              borderRadius: "12px",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
            },
          }}
        >
          <DialogTitle sx={{
            borderBottom: "1px solid #e5e7eb",
            padding: "24px 32px",
            backgroundColor: "#f8fafc",
            borderTopLeftRadius: "12px",
            borderTopRightRadius: "12px",
          }}>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 600, color: "#1e293b" }}>
              Editar Movimiento de Salida
            </Typography>
          </DialogTitle>

          <DialogContent sx={{ padding: "32px", backgroundColor: "#ffffff" }}>
            <div className="space-y-6">
              {/* Proveedor (readonly) */}
              <FormControl fullWidth disabled sx={{ "& .MuiInputBase-root": { backgroundColor: "#f8fafc" } }}>
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
                <FormControl fullWidth sx={{ "& .MuiOutlinedInput-root": { "&:hover fieldset": { borderColor: "#2563eb" } } }}>
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

              {/* Orden de Servicio (OS) (readonly) */}
              <TextField
                label="Orden de Servicio (ID)"
                value={editServiceOrderId}
                fullWidth
                disabled
                sx={{ 
                  "& .MuiInputBase-root": { 
                    backgroundColor: "#f8fafc",
                    "&.Mui-disabled": {
                      backgroundColor: "#f1f5f9"
                    }
                  }
                }}
              />

              {/* Nota del Documento */}
              <TextField
                label="Nota del Documento"
                value={editDocumentNote}
                onChange={(e) => setEditDocumentNote(e.target.value)}
                fullWidth
                multiline
                rows={3}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": {
                      borderColor: "#2563eb"
                    }
                  }
                }}
              />

              <div className="mt-8">
                <Typography variant="h6" sx={{ 
                  color: "#1e293b",
                  fontWeight: 600,
                  marginBottom: "16px",
                  borderBottom: "2px solid #e2e8f0",
                  paddingBottom: "8px"
                }}>
                  Detalle de Hilados
                </Typography>
                <div className="overflow-x-auto">
                  {editDetail.length > 0 ? (
                    <div className="space-y-8">
                      {Array.from(new Set(editDetail.map(d => (d as any).yarnId || 'Sin Hilado'))).map((yarnId, idx) => {
                        const itemsForYarn = editDetail.filter(d => (d as any).yarnId === yarnId);
                        return (
                          <div key={idx} className="border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white px-6 py-4">
                              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                Hilado: {yarnId}
                              </Typography>
                            </div>
                            <Table size="small" sx={{ 
                              "& .MuiTableCell-head": { 
                                backgroundColor: "#f8fafc",
                                fontWeight: 600,
                                color: "#475569"
                              }
                            }}>
                              <TableHead>
                                <TableRow>
                                  <TableCell sx={{ padding: "16px" }}>N° Ingreso</TableCell>
                                  <TableCell sx={{ padding: "16px" }}>Conos</TableCell>
                                  <TableCell sx={{ padding: "16px" }}>Bultos</TableCell>
                                  <TableCell sx={{ padding: "16px" }}>Peso Neto</TableCell>
                                  <TableCell sx={{ padding: "16px" }}>Peso Bruto</TableCell>
                                  <TableCell sx={{ padding: "16px", textAlign: "center" }}>Acciones</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {itemsForYarn.map((d, i) => (
                                  <TableRow key={`${idx}-${i}`} sx={{ 
                                    "&:hover": { 
                                      backgroundColor: "#f8fafc"
                                    }
                                  }}>
                                    <TableCell sx={{ padding: "16px" }}>{d.entryNumber}</TableCell>
                                    <TableCell sx={{ padding: "16px" }}>
                                      <TextField
                                        type="number"
                                        value={d.coneCount}
                                        onChange={(e) =>
                                          handleDetailChange(
                                            editDetail.indexOf(d),
                                            "coneCount",
                                            parseInt(e.target.value) || 0
                                          )
                                        }
                                        size="small"
                                        inputProps={{ min: 0 }}
                                        sx={{ 
                                          width: '120px',
                                          "& .MuiOutlinedInput-root": {
                                            "&:hover fieldset": {
                                              borderColor: "#2563eb"
                                            }
                                          }
                                        }}
                                      />
                                    </TableCell>
                                    <TableCell sx={{ padding: "16px" }}>
                                      <TextField
                                        type="number"
                                        value={d.packageCount}
                                        onChange={(e) =>
                                          handleDetailChange(
                                            editDetail.indexOf(d),
                                            "packageCount",
                                            parseInt(e.target.value) || 0
                                          )
                                        }
                                        size="small"
                                        inputProps={{ min: 0 }}
                                        sx={{ 
                                          width: '120px',
                                          "& .MuiOutlinedInput-root": {
                                            "&:hover fieldset": {
                                              borderColor: "#2563eb"
                                            }
                                          }
                                        }}
                                      />
                                    </TableCell>
                                    <TableCell sx={{ padding: "16px" }}>
                                      <TextField
                                        type="number"
                                        value={d.netWeight}
                                        onChange={(e) =>
                                          handleDetailChange(
                                            editDetail.indexOf(d),
                                            "netWeight",
                                            parseFloat(e.target.value) || 0
                                          )
                                        }
                                        size="small"
                                        inputProps={{ min: 0, step: "0.01" }}
                                        sx={{ 
                                          width: '120px',
                                          "& .MuiOutlinedInput-root": {
                                            "&:hover fieldset": {
                                              borderColor: "#2563eb"
                                            }
                                          }
                                        }}
                                      />
                                    </TableCell>
                                    <TableCell sx={{ padding: "16px" }}>
                                      <TextField
                                        type="number"
                                        value={d.grossWeight}
                                        onChange={(e) =>
                                          handleDetailChange(
                                            editDetail.indexOf(d),
                                            "grossWeight",
                                            parseFloat(e.target.value) || 0
                                          )
                                        }
                                        size="small"
                                        inputProps={{ min: 0, step: "0.01" }}
                                        sx={{ 
                                          width: '120px',
                                          "& .MuiOutlinedInput-root": {
                                            "&:hover fieldset": {
                                              borderColor: "#2563eb"
                                            }
                                          }
                                        }}
                                      />
                                    </TableCell>
                                    <TableCell sx={{ padding: "16px", textAlign: "center" }}>
                                      <IconButton
                                        onClick={() => {
                                          setSelectedEntries(prev => {
                                            const next = new Set(prev);
                                            next.delete(d.entryNumber);
                                            return next;
                                          });
                                          setEditDetail(prev => prev.filter(item => item.entryNumber !== d.entryNumber));
                                        }}
                                        size="small"
                                        sx={{
                                          color: '#dc2626',
                                          transition: 'all 0.2s',
                                          '&:hover': {
                                            backgroundColor: 'rgba(220, 38, 38, 0.08)',
                                            transform: 'scale(1.1)'
                                          },
                                        }}
                                      >
                                        <Close />
                                      </IconButton>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 px-4 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                      <Typography sx={{ color: "#64748b", marginBottom: "8px" }}>
                        No hay ítems disponibles
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                        Utilice "Seleccionar Ingreso" para agregar ítems
                      </Typography>
                    </div>
                  )}
                </div>
              </div>

              <Button
                variant="outlined"
                onClick={handleOpenPurchaseEntryDialog}
                startIcon={<Search />}
                sx={{
                  marginTop: "24px",
                  borderColor: "#2563eb",
                  color: "#2563eb",
                  '&:hover': {
                    borderColor: "#1d4ed8",
                    backgroundColor: "rgba(37, 99, 235, 0.04)"
                  }
                }}
              >
                Seleccionar Ingreso (opcional)
              </Button>
            </div>
          </DialogContent>

          <DialogActions sx={{ 
            padding: "24px 32px",
            borderTop: "1px solid #e5e7eb",
            backgroundColor: "#f8fafc"
          }}>
            <Button 
              onClick={handleCloseEditDialog}
              sx={{
                color: "#64748b",
                '&:hover': {
                  backgroundColor: "#f1f5f9"
                }
              }}
            >
              Cancelar
            </Button>
            <Button 
              variant="contained" 
              onClick={handleSaveChanges}
              sx={{
                backgroundColor: "#2563eb !important",
                color: "white",
                boxShadow: "0 2px 4px rgba(37, 99, 235, 0.1)",
                '&:hover': {
                  backgroundColor: "#1d4ed8 !important",
                  boxShadow: "0 4px 6px rgba(37, 99, 235, 0.2)"
                }
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
              width: "80%",
              maxWidth: "1200px",
              margin: "32px auto",
              borderRadius: "12px",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
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
          <DialogTitle className="flex justify-between items-center">
            <Typography variant="h6">Seleccionar Movimientos de Ingreso</Typography>
            <IconButton onClick={handleClosePurchaseEntryDialog}>
              <Close />
            </IconButton>
          </DialogTitle>
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
                  const ingresosFiltrados = ingresos.filter((ingreso) => ingreso.yarnId === yarnId);

                  if (ingresosFiltrados.length === 0) return null;

                  return (
                    <div key={yarnId} className="mb-8">
                      <div className="bg-blue-900 text-white px-4 py-2 rounded-t-lg">
                        <Typography variant="h6" className="font-semibold">
                          Hilado: {yarnName}
                        </Typography>
                      </div>

                      <table className="w-full table-auto border-collapse">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-4 py-3 font-medium text-left">Número</th>
                            <th className="px-4 py-3 font-medium text-right">Peso Bruto</th>
                            <th className="px-4 py-3 font-medium text-right">Peso Neto</th>
                            <th className="px-4 py-3 font-medium text-right">Paquetes</th>
                            <th className="px-4 py-3 font-medium text-right">Conos</th>
                            <th className="px-4 py-3 font-medium text-center">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ingresosFiltrados.map((ingreso) => {
                            const isSelected = selectedEntries.has(ingreso.entryNumber);
                            const detailHeavy = ingreso.detailHeavy?.[0] || {};
                            
                            return (
                              <tr 
                                key={ingreso.entryNumber} 
                                className={`border-b hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}
                              >
                                <td className="px-4 py-3 text-left">{ingreso.entryNumber}</td>
                                <td className="px-4 py-3 text-right">{detailHeavy.grossWeight?.toFixed(2) || "--"}</td>
                                <td className="px-4 py-3 text-right">{detailHeavy.netWeight?.toFixed(2) || "--"}</td>
                                <td className="px-4 py-3 text-right">{detailHeavy.packageCount || "--"}</td>
                                <td className="px-4 py-3 text-right">{detailHeavy.coneCount || "--"}</td>
                                <td className="px-4 py-3 text-center">
                                  <Button
                                    variant={isSelected ? "outlined" : "contained"}
                                    onClick={() => handleSelectPurchaseEntry(ingreso.entryNumber)}
                                    sx={{
                                      backgroundColor: isSelected ? "transparent !important" : "#1976d2 !important",
                                      color: isSelected ? "#1976d2" : "white",
                                      borderColor: "#1976d2",
                                      "&:hover": {
                                        backgroundColor: isSelected ? "#f8fafc !important" : "#1259a3 !important",
                                        borderColor: "#1976d2",
                                      },
                                    }}
                                  >
                                    {isSelected ? "Deseleccionar" : "Seleccionar"}
                                  </Button>
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
                <Typography className="text-center py-4 text-gray-500">
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

      <div className="mt-4 mb-4">
        <Button
          variant="outlined"
          onClick={() => router.push("/operaciones-new/salida-hilado")}
          sx={{
            borderColor: "#64748b",
            color: "#64748b",
            '&:hover': {
              borderColor: "#475569",
              backgroundColor: "#f1f5f9",
            }
          }}
        >
          Volver
        </Button>
      </div>
    </>
  );
};

export default DetallesMovSalidaHilado;


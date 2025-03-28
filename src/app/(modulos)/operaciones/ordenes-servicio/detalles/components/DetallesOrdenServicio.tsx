"use client";
import React, { useEffect, useState } from "react";
import {
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  Tooltip,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import { Edit, Block, Settings, Add, Close, Search } from "@mui/icons-material";
import { useParams, useRouter } from "next/navigation";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import Visibility from '@mui/icons-material/Visibility';

import {
  fetchServiceOrderById,
  updateServiceOrder,
  anulateServiceOrder,
  checkIfServiceOrderIsUpdatable,
  fetchServiceOrderStatus,
  fetchSuppliers,
  fetchFabricById,
} from "../../services/ordenesServicioService";

import { ServiceOrder, ServiceOrderDetail, Supplier } from "../../../models/models";

import { fetchTejidos } from "../../../tejidos/services/tejidosService"; 

const DetallesOrdenServicio: React.FC = () => {
  const { id } = useParams(); // Puede ser string | string[]
  const router = useRouter();

  // ================== Estados base ==================
  const [orden, setOrden] = useState<ServiceOrder | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ================== Editar ==================
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // - Proveedor editable
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [editedSupplierId, setEditedSupplierId] = useState<string>("");

  // - Detalle editable (usamos `fabricId` en el payload,
  //   aunque la OS original venga con `tissueId`).
  const [editedDetails, setEditedDetails] = useState<ServiceOrderDetail[]>([]);

  // ================== Diálogo para Seleccionar Tejido ==================
  const [isFabricDialogOpen, setIsFabricDialogOpen] = useState(false);
  const [fabrics, setFabrics] = useState<any[]>([]); // tu interfaz Fabric
  const [fabricSelectIndex, setFabricSelectIndex] = useState<number | null>(null);
  const [selectedFabric, setSelectedFabric] = useState<any>(null);

  // ================== Anular ==================
  const [isAnulateDialogOpen, setIsAnulateDialogOpen] = useState(false);

  // ================== Cambiar Estado ==================
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [serviceOrderStatuses, setServiceOrderStatuses] =
    useState<Array<{ id: number; value: string }>>([]);
  const [selectedStatusId, setSelectedStatusId] = useState<number | null>(null);

  // ================== Updatable? ==================
  const [isEditable, setIsEditable] = useState<boolean>(false);
  const [isAnulable, setIsAnulable] = useState<boolean>(false);

  // ================== Diálogo para detalles del tejido ==================
  const [isFabricDetailsDialogOpen, setIsFabricDetailsDialogOpen] = useState(false);

  // ================== Efecto: cargar OS + checkUpdatable ==================
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setIsLoading(true);
  
      try {
        const realId = Array.isArray(id) ? id[0] : id;
        const so = await fetchServiceOrderById(realId);
        setOrden(so);
  
        const updatableResp = await checkIfServiceOrderIsUpdatable(realId);
        setIsEditable(updatableResp.updatable);
        setIsAnulable(so.statusFlag !== "A"); // Solo anulable si no está ya anulada
      } catch (err) {
        console.error(err);
        setError("Error al cargar la Orden de Servicio.");
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchData();
  }, [id]);  

  // ================== Efecto: cargar suppliers para combo ==================
  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        const s = await fetchSuppliers();
        setSuppliers(s);
      } catch (e) {
        console.error("Error al cargar proveedores:", e);
      }
    };
    loadSuppliers();
  }, []);

  // ================== Editar: abrir y precargar ==================
  const handleOpenEditDialog = () => {
    if (!orden) return;

    setEditedSupplierId(orden.supplierId);

    // Tomamos "tissueId" como "fabricId" a nivel UI
    // y guardamos quantityOrdered, price, etc.
    const items = orden.detail.map((d) => ({
      ...d,
      // statusParamId: d.statusParamId ?? d.status?.id ?? 1028,
      // OJO: en la OS no se ve "fabricId". Lo mostramos en la tabla => d.fabricId || d.tissueId
      // Para la edición, usaremos "fabricId" si existe, si no, "tissueId".
      fabricId: (d as any).fabricId || d.tissueId,
    }));
    setEditedDetails(items);
    setIsEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => setIsEditDialogOpen(false);

  // ================== Manejo del array de detalles ==================
  const handleDetailChange = (
    idx: number,
    field: keyof ServiceOrderDetail | "fabricId",
    value: number | string
  ) => {
    setEditedDetails((prev) =>
      prev.map((item, i) =>
        i === idx ? { ...item, [field]: value } : item
      )
    );
  };

  const handleAddDetailRow = () => {
    // Nuevo row
    setEditedDetails((prev) => [
      ...prev,
      {
        fabricId: "",        // <-- Nuevo
        quantityOrdered: 1,
        price: 1,
        statusParamId: 1028,
      } as any,
    ]);
  };

  const handleRemoveDetailRow = (index: number) => {
    setEditedDetails((prev) => prev.filter((_, i) => i !== index));
  };

  // ================== Seleccionar tejido en un diálogo ==================
  const openFabricDialogForIndex = async (index: number) => {
    setFabricSelectIndex(index);
    try {
      const resp = await fetchTejidos(); // GET /operations/v1/fabrics => {fabrics: Fabric[]}
      setFabrics(resp.fabrics || []);
      setIsFabricDialogOpen(true);
    } catch (err) {
      console.error("Error al cargar tejidos:", err);
    }
  };

  const handleCloseFabricDialog = () => {
    setIsFabricDialogOpen(false);
    setFabricSelectIndex(null);
  };

  const handleSelectFabric = (fabricId: string) => {
    if (fabricSelectIndex === null) return;
    setEditedDetails((prev) =>
      prev.map((item, idx) =>
        idx === fabricSelectIndex ? { ...item, fabricId } : item
      )
    );
    handleCloseFabricDialog();
  };

  const handleOpenFabricDetailsDialog = async (fabricId: string) => {
    try {
      const fabricData = await fetchFabricById(fabricId);
      setSelectedFabric(fabricData);
      setIsFabricDetailsDialogOpen(true);
    } catch (error) {
      console.error("Error al cargar detalles del tejido:", error);
      setSnackbarMessage(error.response?.data?.detail || "Error al cargar detalles del tejido");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleCloseFabricDetails = () => {
    setIsFabricDetailsDialogOpen(false);
    setSelectedFabric(null);
  };

  function getSupplierNameById(id: string, suppliers: Supplier[]): string {
    const supplier = suppliers.find((item) => item.code === id);
    return supplier ? supplier.name : "Desconocido";
  }

  // ================== New states for snackbar ==================
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

  // ================== New functions for snackbar ==================
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  // ================== Guardar Cambios => PATCH ==================
  const handleSaveChanges = async () => {
    if (!orden) return;
    try {
      // statusParamId a nivel raíz (por ejemplo 1028).
      const rootStatusParamId = 1028;

      const payload = {
        statusParamId: rootStatusParamId,
        supplierId: editedSupplierId,
        detail: editedDetails.map((d) => ({
          fabricId: (d as any).fabricId || "", // forzamos a string
          quantityOrdered: d.quantityOrdered,
          price: d.price,
          statusParamId: d.statusParamId ?? 1028,
        })),
      };

      await updateServiceOrder(orden.id, payload);
      const updated = await fetchServiceOrderById(orden.id);
      setOrden(updated);
      setIsEditDialogOpen(false);

      // Mostrar snackbar de éxito
      setSnackbarMessage("Orden de servicio actualizada con éxito.");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (err) {
      console.error("Error al actualizar la OS:", err);
      setSnackbarMessage("Error al actualizar la orden de servicio.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  // ================== Anular ==================
  const handleOpenAnulateDialog = () => setIsAnulateDialogOpen(true);
  const handleCloseAnulateDialog = () => setIsAnulateDialogOpen(false);

  const handleAnulateOrder = async () => {
    const realId = Array.isArray(id) ? id[0] : id;
    if (!realId) return;

    try {
      await anulateServiceOrder(realId);
      setOrden((prev) => (prev ? { ...prev, statusFlag: "A" } : null));
      setIsEditable(false);
      setIsAnulable(false);
      setIsAnulateDialogOpen(false);

      // Mostrar snackbar de éxito
      setSnackbarMessage("Orden de servicio anulada con éxito.");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (err) {
      console.error("Error al anular la OS:", err);
      setSnackbarMessage("Error al anular la orden de servicio.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  // ================== Cambiar Estado ==================
  const handleOpenStatusDialog = async () => {
    try {
      const data = await fetchServiceOrderStatus();
      setServiceOrderStatuses(data.serviceOrderStatus || []);
      setSelectedStatusId(null);
      setIsStatusDialogOpen(true);
    } catch (err) {
      console.error("Error al cargar estados:", err);
    }
  };

  const handleCloseStatusDialog = () => setIsStatusDialogOpen(false);

  const handleChangeStatus = async () => {
    if (!selectedStatusId || !orden) return;
    try {
      const payload = {
        statusParamId: selectedStatusId,
        detail: [],
      };
      await updateServiceOrder(orden.id, payload);
      const updated = await fetchServiceOrderById(orden.id);
      setOrden(updated);
      setIsStatusDialogOpen(false);

      // Mostrar snackbar de éxito
      setSnackbarMessage("Estado de la orden de servicio cambiado con éxito.");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (err) {
      console.error("Error al cambiar estado:", err);
      setSnackbarMessage("Error al cambiar estado de la orden de servicio.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const isEditableOrAnulable = (isUpdatable: boolean): boolean => {
    // Habilitar si el estado es "No iniciado" y la orden es editable
    return isUpdatable; // Ajusta "P" si "No iniciado" tiene otro valor
  };
  
  const isOrderCanceled = (statusFlag: string): boolean => {
    return statusFlag === "A"; // Ajusta "A" si "Anulada" tiene otro valor
  };
  

  // ================== Volver ==================
  const handleGoBack = () => {
    router.push("/operaciones-new/ordenes-servicio");
  };

  // ================== Responsive ==================
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down("md"));

  // ================== New states for new dialogs ==================
  const [isYarnDetailsDialogOpen, setIsYarnDetailsDialogOpen] = useState(false);
  const [selectedYarn, setSelectedYarn] = useState<any>(null);

  const [isFiberDetailsDialogOpen, setIsFiberDetailsDialogOpen] = useState(false);
  const [selectedFiber, setSelectedFiber] = useState<any>(null);

  // ================== New functions for new dialogs ==================
  const handleOpenYarnDetails = (yarn: any) => {
    setSelectedYarn(yarn);
    setIsYarnDetailsDialogOpen(true);
  };

  const handleCloseYarnDetails = () => {
    setIsYarnDetailsDialogOpen(false);
    setSelectedYarn(null);
  };

  const handleOpenFiberDetails = (fiber: any) => {
    setSelectedFiber(fiber);
    setIsFiberDetailsDialogOpen(true);
  };

  const handleCloseFiberDetails = () => {
    setIsFiberDetailsDialogOpen(false);
    setSelectedFiber(null);
  };

  // ================== Render ==================
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  if (!orden) {
    return <div>No se encontró la Orden de Servicio.</div>;
  }

  return (
    <div className="space-y-5">
      {/* Encabezado: Título + Botones */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">
          Detalle de la Orden de Servicio: {orden.id}
        </h1>
        <div className="flex gap-3">
          <Button variant="outlined" onClick={handleGoBack}>
            Regresar
          </Button>

          {/* EDITAR */}
          <Tooltip
            title={isEditable ? "" : "No se puede editar en este estado"}
          >
            <span>
              <Button
                startIcon={<Edit />}
                variant="contained"
                disabled={!isEditable || isOrderCanceled(orden.statusFlag)}
                onClick={isEditable && !isOrderCanceled(orden.statusFlag) 
                  ? handleOpenEditDialog 
                  : undefined}
                style={isEditable && !isOrderCanceled(orden.statusFlag)
                  ? { backgroundColor: "#1976d2", color: "#fff" }
                  : { backgroundColor: "#b0b0b0", color: "#fff" }}
              >
                Editar
              </Button>
            </span>
          </Tooltip>

          {/* ANULAR */}
          <Tooltip
            title={isAnulable ? "" : "No se puede anular en este estado"}
          >
            <span>
              <Button
                startIcon={<Block />}
                variant="contained"
                disabled={!isAnulable || isOrderCanceled(orden.statusFlag)}
                onClick={isAnulable && !isOrderCanceled(orden.statusFlag)
                  ? handleOpenAnulateDialog
                  : undefined}
                style={isAnulable && !isOrderCanceled(orden.statusFlag)
                  ? { backgroundColor: "#d32f2f", color: "#fff" }
                  : { backgroundColor: "#b0b0b0", color: "#fff" }}
              >
                Anular
              </Button>
            </span>
          </Tooltip>
        </div>
      </div>

      {/* Info de la Orden */}
      <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default">
        <h2 className="text-xl font-semibold mb-4">Información de la Orden</h2>
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-blue-900 uppercase text-center text-white">
              <th className="px-4 py-4 font-normal">ID</th>
              <th className="px-4 py-4 font-normal">Proveedor</th>
              <th className="px-4 py-4 font-normal">Fecha Emisión</th>
              <th className="px-4 py-4 font-normal">Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr className="text-center text-black">
              <td className="border-b border-[#eee] px-4 py-5">{orden.id}</td>
              <td className="border-b border-[#eee] px-4 py-5">
                {getSupplierNameById(orden.supplierId, suppliers)}
              </td>
              <td className="border-b border-[#eee] px-4 py-5">{orden.issueDate}</td>
              <td className="border-b border-[#eee] px-4 py-5">{orden.status?.value || '---'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Detalle de la Orden */}
      <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default">
        <h2 className="text-xl font-semibold mb-4">Detalle de la Orden</h2>
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-blue-900 uppercase text-center text-white">
              <th className="px-4 py-4 font-normal">Tejido</th>
              <th className="px-4 py-4 font-normal">Cantidad Programada</th>
              <th className="px-4 py-4 font-normal">Cantidad Recibida</th>
              <th className="px-4 py-4 font-normal">Precio</th>
              <th className="px-4 py-4 font-normal">Estado</th>
            </tr>
          </thead>
          <tbody>
            {orden.detail.map((det, idx) => (
              <tr key={idx} className="text-center text-black">
                {/* Si la API no trae .fabricId, mostramos .tissueId */}
                <td className="border-b border-[#eee] px-4 py-5 flex items-center justify-center">
                  <span>{(det as any).fabricId || det.tissueId || "(sin id)"}</span>
                  <IconButton 
                    color = "primary"
                    onClick={async () => {
                      const fabric = await fetchFabricById((det as any).fabricId || det.tissueId);
                      setSelectedFabric(fabric);
                      setIsFabricDetailsDialogOpen(true);
                    }}
                  >
                    <Visibility />
                  </IconButton>
                </td>
                <td className="border-b border-[#eee] px-4 py-5">
                  {det.quantityOrdered}
                </td>
                <td className="border-b border-[#eee] px-4 py-5">
                  {det.quantitySupplied || 0}
                </td>
                <td className="border-b border-[#eee] px-4 py-5">{det.price}</td>
                <td className="border-b border-[#eee] px-4 py-5">
                  {det.status?.value || "---"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Diálogo para Editar */}
      <Dialog
        open={isEditDialogOpen}
        onClose={handleCloseEditDialog}
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
        <DialogTitle>Editar Orden</DialogTitle>
        <DialogContent>
          {/* Select de Proveedor 
          <div className="mb-4">
            <FormControl fullWidth>
              <InputLabel id="supplier-label">Proveedor</InputLabel>
              <Select
                labelId="supplier-label"
                value={editedSupplierId}
                label="Proveedor"
                onChange={(e) => setEditedSupplierId(e.target.value as string)}
              >
                {suppliers.map((sup) => (
                  <MenuItem key={sup.code} value={sup.code}>
                    {sup.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>*/}

          <h3 className="text-lg font-semibold mb-2">Detalle</h3>
          <table className="w-full table-auto border-collapse">
            <tbody>
              {editedDetails.map((item, idx) => (
                <tr key={idx} className="text-center text-black">
                  <td className="border-b border-[#eee] px-2 py-1">
                    <Button
                      variant="outlined"
                      onClick={() => openFabricDialogForIndex(idx)}
                      startIcon={<Search />}
                    >
                      {item.fabricId ? `Tejido: ${item.fabricId}` : "Seleccionar Tejido"}
                    </Button>
                  </td>
                  <td>
                    <IconButton
                      onClick={() => item.fabricId && handleOpenFabricDetailsDialog(item.fabricId)}
                      disabled={!item.fabricId}
                    >
                      <Visibility color="primary" />
                    </IconButton>
                  </td>
                  <td className="border-b border-[#eee] px-2 py-1">
                    <TextField
                      label="Cantidad"
                      value={item.quantityOrdered || ""}
                      onChange={(e) => handleDetailChange(idx, "quantityOrdered", Number(e.target.value) || 0)}
                      fullWidth
                      variant="outlined"
                      size="small"
                    />
                  </td>
                  <td className="border-b border-[#eee] px-2 py-1">
                    <TextField
                      label="Precio" 
                      value={item.price || ""}
                      onChange={(e) => handleDetailChange(idx, "price", Number(e.target.value) || 0)}
                      fullWidth
                      variant="outlined"
                      size="small"
                    />
                  </td>
                  <td className="border-b border-[#eee] px-2 py-1">
                    <IconButton color="error" onClick={() => handleRemoveDetailRow(idx)}>
                      <Close />
                    </IconButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <Button
            startIcon={<Add />}
            variant="outlined"
            onClick={handleAddDetailRow}
            style={{ marginTop: 8 }}
          >
            Agregar Tejido
          </Button>
        </DialogContent>
        <DialogActions>
          <Button style={{ backgroundColor: "#d32f2f", color: "#fff" }}
onClick={handleCloseEditDialog}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleSaveChanges}
            style={{ backgroundColor: "#1976d2", color: "#fff" }}
          >
            Guardar Cambios
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para seleccionar Tejido */}
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

      {/* Diálogo para Anular */}
      <Dialog
        open={isAnulateDialogOpen}
        onClose={handleCloseAnulateDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Anular Orden de Servicio</DialogTitle>
        <DialogContent>
          ¿Seguro de anular esta orden? Esta acción no se puede deshacer.
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAnulateDialog} style={{ backgroundColor: "#d32f2f", color: "#fff" }}
          >Cancelar</Button>
          <Button
            variant="contained"
            style={{ backgroundColor: "#1976d2", color: "#fff" }}
            onClick={handleAnulateOrder}
          >
            Anular
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para Cambiar Estado */}
      <Dialog
        open={isStatusDialogOpen}
        onClose={async () => setIsStatusDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Cambiar Estado de la Orden</DialogTitle>
        <DialogContent>
          <FormControl fullWidth>
            <InputLabel id="status-label">Estado</InputLabel>
            <Select
              labelId="status-label"
              value={selectedStatusId ? selectedStatusId.toString() : ""}
              label="Estado"
              onChange={(e) => setSelectedStatusId(Number(e.target.value))}
            >
              <MenuItem value="" disabled>
                -- Seleccione Estado --
              </MenuItem>
              {serviceOrderStatuses.map((st) => (
                <MenuItem key={st.id} value={st.id}>
                  {st.value}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button style={{ backgroundColor: "#d32f2f", color: "#fff" }}
 onClick={() => setIsStatusDialogOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            style={{ backgroundColor: "#1976d2", color: "#fff" }}
            onClick={handleChangeStatus}
            disabled={!selectedStatusId}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
      {/* Diálogo para detalles del tejido */}
      <Dialog
        open={isFabricDetailsDialogOpen}
        onClose={handleCloseFabricDetails}
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
          Detalle del Tejido
          </h1>
          <IconButton
            aria-label="close"
            onClick={handleCloseFabricDetails}
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
                          <IconButton color = "primary" onClick={() => handleOpenYarnDetails(item.yarn)}>
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
          <Button onClick={handleCloseFabricDetails} style={{ backgroundColor: "#d32f2f", color: "#fff" }}>
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

export default DetallesOrdenServicio;

﻿"use client";
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
} from "@mui/material";
import { Edit, Block, Settings, Add, Close, Search } from "@mui/icons-material";
import { useParams, useRouter } from "next/navigation";

import {
  fetchServiceOrderById,
  updateServiceOrder,
  anulateServiceOrder,
  checkIfServiceOrderIsUpdatable,
  fetchServiceOrderStatus,
  fetchSuppliers,
} from "../../services/ordenesServicioService";

import { ServiceOrder, ServiceOrderDetail, Supplier } from "../../../models/models";

// <-- Debes tener un servicio que retorne los tejidos:
import { fetchTejidos } from "../../../tejidos/services/tejidosService"; 
// Ej: fetchTejidos -> GET /operations/v1/fabrics => {fabrics: Fabric[]}

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


  function getSupplierNameById(id: string, suppliers: Supplier[]): string {
    const supplier = suppliers.find((item) => item.code === id);
    return supplier ? supplier.name : "Desconocido";
  }

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
          // "fabricId" para el Patch
          fabricId: (d as any).fabricId || "", // forzamos a string
          quantityOrdered: d.quantityOrdered,
          price: d.price,
          // statusParamId: d.statusParamId ?? 1028,
          // (si tu API pide statusParamId en cada ítem)
          statusParamId: d.statusParamId ?? 1028,
        })),
      };

      await updateServiceOrder(orden.id, payload);
      const updated = await fetchServiceOrderById(orden.id);
      setOrden(updated);
      setIsEditDialogOpen(false);
    } catch (err) {
      console.error("Error al actualizar la OS:", err);
      alert("Error al actualizar la orden de servicio.");
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
    } catch (err) {
      console.error("Error al anular la OS:", err);
      alert("Error al anular la orden de servicio.");
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
    } catch (err) {
      console.error("Error al cambiar estado:", err);
      alert("Error al cambiar estado de la orden de servicio.");
    }
  };

  const isEditableOrAnulable = (statusFlag: string, isUpdatable: boolean): boolean => {
    // Habilitar si el estado es "No iniciado" y la orden es editable
    return statusFlag === "P" && isUpdatable; // Ajusta "P" si "No iniciado" tiene otro valor
  };
  
  const isOrderCanceled = (statusFlag: string): boolean => {
    return statusFlag === "A"; // Ajusta "A" si "Anulada" tiene otro valor
  };
  

  // ================== Volver ==================
  const handleGoBack = () => {
    router.push("/operaciones-new/ordenes-servicio");
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
          Detalles de la Orden de Servicio: {orden.id}
        </h1>
        <div className="flex gap-3">
          <Button variant="outlined" onClick={handleGoBack}>
            Regresar
          </Button>

          {/* EDITAR */}
          <Tooltip
          title={
            isEditableOrAnulable(orden.statusFlag, isEditable) && !isOrderCanceled(orden.statusFlag)
              ? ""
              : "No se puede editar en este estado"
          }
        >
          <span>
            <Button
              startIcon={<Edit />}
              variant="contained"
              disabled={
                !isEditableOrAnulable(orden.statusFlag, isEditable) || isOrderCanceled(orden.statusFlag)
              }
              onClick={
                isEditableOrAnulable(orden.statusFlag, isEditable) && !isOrderCanceled(orden.statusFlag)
                  ? handleOpenEditDialog
                  : undefined
              }
              style={
                isEditableOrAnulable(orden.statusFlag, isEditable) && !isOrderCanceled(orden.statusFlag)
                  ? { backgroundColor: "#1976d2", color: "#fff" }
                  : { backgroundColor: "#b0b0b0", color: "#fff" }
              }
            >
              Editar
            </Button>
          </span>
        </Tooltip>
          {/* CAMBIAR ESTADO */}
          <Tooltip
          title={
            isEditableOrAnulable(orden.statusFlag, isEditable) && !isOrderCanceled(orden.statusFlag)
              ? ""
              : "No se puede cambiar estado en este estado"
          }
        >
          <span>
            <Button
              startIcon={<Settings />}
              variant="contained"
              disabled={
                !isEditableOrAnulable(orden.statusFlag, isEditable) || isOrderCanceled(orden.statusFlag)
              }
              onClick={
                isEditableOrAnulable(orden.statusFlag, isEditable) && !isOrderCanceled(orden.statusFlag)
                  ? handleOpenStatusDialog
                  : undefined
              }
              style={
                isEditableOrAnulable(orden.statusFlag, isEditable) && !isOrderCanceled(orden.statusFlag)
                  ? { backgroundColor: "#1976d2", color: "#fff" }
                  : { backgroundColor: "#b0b0b0", color: "#fff" }
              }
            >
              Cambiar Estado
            </Button>
          </span>
        </Tooltip>

          {/* ANULAR */}
          <Tooltip
          title={
            isEditableOrAnulable(orden.statusFlag, isEditable) && !isOrderCanceled(orden.statusFlag)
              ? ""
              : "No se puede anular en este estado"
          }
        >
          <span>
            <Button
              startIcon={<Block />}
              variant="contained"
              disabled={
                !isEditableOrAnulable(orden.statusFlag, isEditable) || isOrderCanceled(orden.statusFlag)
              }
              onClick={
                isEditableOrAnulable(orden.statusFlag, isEditable) && !isOrderCanceled(orden.statusFlag)
                  ? handleOpenAnulateDialog
                  : undefined
              }
              style={
                isEditableOrAnulable(orden.statusFlag, isEditable) && !isOrderCanceled(orden.statusFlag)
                  ? { backgroundColor: "#d32f2f", color: "#fff" }
                  : { backgroundColor: "#b0b0b0", color: "#fff" }
              }
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
            <tr className="text-center">
              <td className="border-b border-[#eee] px-4 py-5">{orden.id}</td>
              <td className="border-b border-[#eee] px-4 py-5">
                {getSupplierNameById(orden.supplierId, suppliers)}
              </td>
              <td className="border-b border-[#eee] px-4 py-5">{orden.issueDate}</td>
              <td className="border-b border-[#eee] px-4 py-5">{orden.statusFlag}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Detalle de la Orden */}
      <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default">
        <h2 className="text-xl font-semibold mb-4">Detalles de la Orden</h2>
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-blue-900 uppercase text-center text-white">
              <th className="px-4 py-4 font-normal">Tejido</th>
              <th className="px-4 py-4 font-normal">Cantidad Ordenada</th>
              <th className="px-4 py-4 font-normal">Cantidad Suministrada</th>
              <th className="px-4 py-4 font-normal">Precio</th>
              <th className="px-4 py-4 font-normal">Estado</th>
            </tr>
          </thead>
          <tbody>
            {orden.detail.map((det, idx) => (
              <tr key={idx} className="text-center">
                {/* Si la API no trae .fabricId, mostramos .tissueId */}
                <td className="border-b border-[#eee] px-4 py-5">
                  {(det as any).fabricId || det.tissueId || "(sin id)"}
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
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Editar Orden</DialogTitle>
        <DialogContent>
          {/* Select de Proveedor */}
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
          </div>

          <h3 className="text-lg font-semibold mb-2">Detalle</h3>
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-blue-900 text-white text-center">
                <th className="px-4 py-2">Tejido (fabricId)</th>
                <th className="px-4 py-2">Cantidad</th>
                <th className="px-4 py-2">Precio</th>
                <th className="px-4 py-2">Eliminar</th>
              </tr>
            </thead>
            <tbody>
              {editedDetails.map((item, idx) => (
                <tr key={idx} className="text-center">
                  <td className="border-b border-[#eee] px-2 py-1">
                    {item.fabricId || "(nuevo)"}
                    <IconButton
                      size="small"
                      onClick={() => openFabricDialogForIndex(idx)}
                      style={{ marginLeft: 8 }}
                    >
                      <Search fontSize="small" />
                    </IconButton>
                  </td>
                  <td className="border-b border-[#eee] px-2 py-1">
                    <TextField
                      type="number"
                      value={item.quantityOrdered}
                      onChange={(e) =>
                        handleDetailChange(idx, "quantityOrdered", parseInt(e.target.value, 10))
                      }
                      style={{ width: "70px" }}
                    />
                  </td>
                  <td className="border-b border-[#eee] px-2 py-1">
                    <TextField
                      type="number"
                      value={item.price}
                      onChange={(e) =>
                        handleDetailChange(idx, "price", parseInt(e.target.value, 10))
                      }
                      style={{ width: "70px" }}
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
        fullWidth
        maxWidth="lg"
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
            <Table>
              <TableHead>
                <TableRow style={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell style={{ fontWeight: "bold", textTransform: "uppercase" }}>ID</TableCell>
                  <TableCell style={{ fontWeight: "bold", textTransform: "uppercase" }}>Descripción</TableCell>
                  <TableCell style={{ fontWeight: "bold", textTransform: "uppercase" }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {fabrics.map((fabric) => (
                  <TableRow key={fabric.id} hover>
                    <TableCell>{fabric.id}</TableCell>
                    <TableCell>{fabric.description}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        style={{ backgroundColor: "#1976d2", color: "#fff" }}
                        size="small"
                        onClick={() => handleSelectFabric(fabric.id)}
                      >
                        Seleccionar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseFabricDialog} style={{ backgroundColor: "#d32f2f", color: "#fff" }}
          >Cerrar</Button>
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
    </div>
  );
};

export default DetallesOrdenServicio;

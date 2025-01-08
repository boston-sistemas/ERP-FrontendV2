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
} from "@mui/material";
import { Edit, Block, Settings } from "@mui/icons-material";
import { useParams, useRouter } from "next/navigation";
import {
  fetchServiceOrderById,
  updateServiceOrder,
  anulateServiceOrder,
  checkIfServiceOrderIsUpdatable,
} from "../../services/ordenesServicioService";
import { ServiceOrder, ServiceOrderDetail } from "../../../models/models";

// (NUEVO) Para cambiar estado
import { fetchServiceOrderStatus } from "../../services/ordenesServicioService";

const DetallesOrdenServicio: React.FC = () => {
  const { id } = useParams();
  const router = useRouter();

  const [orden, setOrden] = useState<ServiceOrder | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Editar
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedDetails, setEditedDetails] = useState<ServiceOrderDetail[]>([]);

  // Anular
  const [isAnulateDialogOpen, setIsAnulateDialogOpen] = useState(false);

  // Cambiar estado
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [serviceOrderStatuses, setServiceOrderStatuses] = useState<
    Array<{ id: number; value: string }>
  >([]);
  const [selectedStatusId, setSelectedStatusId] = useState<number | null>(null);

  // Updatable?
  const [isEditable, setIsEditable] = useState<boolean>(false);
  const [isAnulable, setIsAnulable] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const so = await fetchServiceOrderById(id as string);
        setOrden(so);
        setEditedDetails(so.detail || []);

        const updatableResp = await checkIfServiceOrderIsUpdatable(id as string);
        // updatableResp = { updatable: boolean, message: string }
        // Chequeamos statusFlag:
        if (so.statusFlag === "A") {
          // A de Anulado
          setIsEditable(false);
          setIsAnulable(false);
        } else {
          setIsEditable(updatableResp.updatable);
          setIsAnulable(so.statusFlag !== "A");
        }
      } catch (err) {
        console.error(err);
        setError("Error al cargar la orden de servicio.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Cargar la lista de estados
  const loadServiceOrderStatuses = async () => {
    try {
      const data = await fetchServiceOrderStatus(); 
      // data = { serviceOrderStatus: [ {id, value}, ... ] }
      setServiceOrderStatuses(data.serviceOrderStatus || []);
    } catch (e) {
      console.error("Error al cargar estados de OS:", e);
    }
  };

  const handleOpenEditDialog = () => setIsEditDialogOpen(true);
  const handleCloseEditDialog = () => setIsEditDialogOpen(false);

  const handleOpenAnulateDialog = () => setIsAnulateDialogOpen(true);
  const handleCloseAnulateDialog = () => setIsAnulateDialogOpen(false);

  // Cambiar estado
  const handleOpenStatusDialog = async () => {
    await loadServiceOrderStatuses();
    setSelectedStatusId(null); // reset
    setIsStatusDialogOpen(true);
  };
  const handleCloseStatusDialog = () => setIsStatusDialogOpen(false);

  // Manejo local de detail
  const handleDetailChange = (
    idx: number,
    field: keyof ServiceOrderDetail,
    value: number
  ) => {
    const updated = [...editedDetails];
    (updated[idx] as any)[field] = value;
    setEditedDetails(updated);
  };

  // Guardar PATCH detail
  const handleSaveChanges = async () => {
    try {
      await updateServiceOrder(id as string, { detail: editedDetails });
      // Refetch or update local
      setOrden((prev) =>
        prev ? { ...prev, detail: editedDetails } : null
      );
      setIsEditDialogOpen(false);
    } catch (err) {
      console.error("Error al actualizar la OS:", err);
    }
  };

  // Anular
  const handleAnulateOrder = async () => {
    try {
      await anulateServiceOrder(id as string);
      setOrden((prev) =>
        prev
          ? {
              ...prev,
              statusFlag: "A",
            }
          : null
      );
      setIsAnulateDialogOpen(false);
      setIsEditable(false);
      setIsAnulable(false);
    } catch (err) {
      console.error("Error al anular la OS:", err);
    }
  };

  // Cambiar estado
  const handleChangeStatus = async () => {
    if (!selectedStatusId) return;
    try {
      // Supón que tu backend pide PATCH con { statusParamId: selectedStatusId }
      await updateServiceOrder(id as string, {
        detail: [],
        statusParamId: selectedStatusId, // <-- Ajusta según tu API
      } as any);
      // Recargar
      const updated = await fetchServiceOrderById(id as string);
      setOrden(updated);
      setIsStatusDialogOpen(false);
    } catch (e) {
      console.error("Error al cambiar estado:", e);
    }
  };

  const handleGoBack = () => {
    router.push("/operaciones-new/ordenes-servicio");
  };

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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">
          Detalles de la Orden de Servicio: {orden.id}
        </h1>
        <div className="flex gap-3">
          <Button variant="outlined" onClick={handleGoBack}>
            Regresar
          </Button>

          {/* Editar */}
          <Tooltip title={isEditable ? "" : "No se puede editar"}>
            <span>
              <Button
                startIcon={<Edit />}
                variant="contained"
                onClick={isEditable ? handleOpenEditDialog : undefined}
                disabled={!isEditable}
                style={
                  isEditable
                    ? { backgroundColor: "#1976d2", color: "#fff" }
                    : { backgroundColor: "#b0b0b0", color: "#fff" }
                }
              >
                Editar
              </Button>
            </span>
          </Tooltip>

          {/* Cambiar estado */}
          <Tooltip title={isEditable ? "" : "No se puede cambiar estado"}>
            <span>
              <Button
                startIcon={<Settings />}
                variant="contained"
                onClick={isEditable ? handleOpenStatusDialog : undefined}
                disabled={!isEditable}
                style={
                  isEditable
                    ? { backgroundColor: "#1976d2", color: "#fff" }
                    : { backgroundColor: "#b0b0b0", color: "#fff" }
                }
              >
                Cambiar Estado
              </Button>
            </span>
          </Tooltip>

          {/* Anular */}
          <Tooltip title={isAnulable ? "" : "Ya está anulada"}>
            <span>
              <Button
                startIcon={<Block />}
                variant="contained"
                onClick={isAnulable ? handleOpenAnulateDialog : undefined}
                disabled={!isAnulable}
                style={
                  isAnulable
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
              <td className="border-b border-[#eee] px-4 py-5">{orden.supplierId}</td>
              <td className="border-b border-[#eee] px-4 py-5">{orden.issueDate}</td>
              <td className="border-b border-[#eee] px-4 py-5">{orden.statusFlag}</td>
            </tr>
          </tbody>
        </table>
      </div>

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
                <td className="border-b border-[#eee] px-4 py-5">{det.tissueId}</td>
                <td className="border-b border-[#eee] px-4 py-5">{det.quantityOrdered}</td>
                <td className="border-b border-[#eee] px-4 py-5">{det.quantitySupplied}</td>
                <td className="border-b border-[#eee] px-4 py-5">{det.price}</td>
                <td className="border-b border-[#eee] px-4 py-5">
                  {det.status?.value || "---"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Diálogo Editar */}
      <Dialog open={isEditDialogOpen} onClose={handleCloseEditDialog} fullWidth maxWidth="md">
        <DialogTitle>Editar Orden</DialogTitle>
        <DialogContent>
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-blue-900 uppercase text-center text-white">
                <th className="px-4 py-4">Tejido</th>
                <th className="px-4 py-4">Cantidad Ordenada</th>
                <th className="px-4 py-4">Precio</th>
              </tr>
            </thead>
            <tbody>
              {editedDetails.map((item, idx) => (
                <tr key={idx} className="text-center">
                  <td className="border-b border-[#eee] px-4 py-4">{item.tissueId}</td>
                  <td className="border-b border-[#eee] px-4 py-4">
                    <TextField
                      type="number"
                      value={item.quantityOrdered}
                      onChange={(e) =>
                        handleDetailChange(idx, "quantityOrdered", Number(e.target.value))
                      }
                      style={{ width: "100px" }}
                    />
                  </td>
                  <td className="border-b border-[#eee] px-4 py-4">
                    <TextField
                      type="number"
                      value={item.price}
                      onChange={(e) =>
                        handleDetailChange(idx, "price", Number(e.target.value))
                      }
                      style={{ width: "100px" }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancelar</Button>
          <Button
            variant="contained"
            style={{ backgroundColor: "#1976d2", color: "#fff" }}
            onClick={handleSaveChanges}
          >
            Guardar Cambios
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo Anular */}
      <Dialog open={isAnulateDialogOpen} onClose={handleCloseAnulateDialog} fullWidth maxWidth="sm">
        <DialogTitle>Anular Orden de Servicio</DialogTitle>
        <DialogContent>
          ¿Está seguro de anular esta orden? No se puede deshacer.
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAnulateDialog}>Cancelar</Button>
          <Button
            variant="contained"
            style={{ backgroundColor: "#d32f2f", color: "#fff" }}
            onClick={handleAnulateOrder}
          >
            Anular
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo Cambiar Estado */}
      <Dialog open={isStatusDialogOpen} onClose={handleCloseStatusDialog} fullWidth maxWidth="sm">
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
              <MenuItem value="" disabled>-- Seleccione Estado --</MenuItem>
              {serviceOrderStatuses.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.value}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStatusDialog}>Cancelar</Button>
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

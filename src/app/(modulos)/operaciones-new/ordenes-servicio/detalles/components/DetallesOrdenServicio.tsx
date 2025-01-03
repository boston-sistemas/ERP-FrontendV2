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
} from "@mui/material";
import { Edit, Block } from "@mui/icons-material";
import { useParams, useRouter } from "next/navigation";
import {
  fetchServiceOrderById,
  updateServiceOrder,
  anulateServiceOrder,
  checkIfServiceOrderIsUpdatable,
} from "../../services/ordenesServicioService";
import { ServiceOrder, ServiceOrderDetail } from "../../../models/models";

const DetallesOrdenServicio: React.FC = () => {
  const { id } = useParams();
  const router = useRouter();
  const [orden, setOrden] = useState<ServiceOrder | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAnulateDialogOpen, setIsAnulateDialogOpen] = useState(false);
  const [editedDetails, setEditedDetails] = useState<ServiceOrderDetail[]>([]);
  const [isEditable, setIsEditable] = useState<boolean>(true);
  const [isAnulable, setIsAnulable] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetchServiceOrderById(id as string);
        setOrden(response);
        setEditedDetails(response.detail || []);

        const editableData = await checkIfServiceOrderIsUpdatable(id as string);
        setIsEditable(editableData.updatable && response.statusFlag !== "A"); // No editable si está anulada

        // Verificar si la orden está anulada
        setIsAnulable(response.statusFlag !== "A");
      } catch (err) {
        setError("Error al cargar la información de la orden de servicio.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleOpenEditDialog = () => {
    setIsEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
  };

  const handleOpenAnulateDialog = () => {
    setIsAnulateDialogOpen(true);
  };

  const handleCloseAnulateDialog = () => {
    setIsAnulateDialogOpen(false);
  };

  const handleDetailChange = (
    index: number,
    field: keyof ServiceOrderDetail,
    value: string | number
  ) => {
    const updatedDetails = [...editedDetails];
    updatedDetails[index] = { ...updatedDetails[index], [field]: value };
    setEditedDetails(updatedDetails);
  };

  const handleSaveChanges = async () => {
    try {
      await updateServiceOrder(id as string, { detail: editedDetails });
      setOrden((prev) => (prev ? { ...prev, detail: editedDetails } : null));
      setIsEditDialogOpen(false);
    } catch (err) {
      console.error("Error al guardar los cambios:", err);
    }
  };

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
      setIsAnulable(false);
      setIsEditable(false); // Deshabilitar edición si se anula
    } catch (err) {
      console.error("Error al anular la orden:", err);
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

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-black">
          Detalles de la Orden de Servicio: {id}
        </h1>
        <div className="flex gap-3">
          <Button
            variant="outlined"
            style={{ backgroundColor: "#1976d2", color: "#fff" }}
            onClick={handleGoBack}
          >
            Regresar
          </Button>
          <Tooltip title={isEditable ? "" : "Esta Orden de Servicio no es editable"} arrow>
            <span>
              <Button
                startIcon={<Edit />}
                variant="contained"
                style={
                  isEditable
                    ? { backgroundColor: "#1976d2", color: "#fff" }
                    : { backgroundColor: "#b0b0b0", color: "#fff" }
                }
                onClick={isEditable ? handleOpenEditDialog : undefined}
                disabled={!isEditable}
              >
                Editar
              </Button>
            </span>
          </Tooltip>
          <Tooltip title={isAnulable ? "" : "Esta Orden de Servicio ya está anulada"} arrow>
            <span>
              <Button
                startIcon={<Block />}
                variant="contained"
                style={
                  isAnulable
                    ? { backgroundColor: "#d32f2f", color: "#fff" }
                    : { backgroundColor: "#b0b0b0", color: "#fff" }
                }
                onClick={isAnulable ? handleOpenAnulateDialog : undefined}
                disabled={!isAnulable}
              >
                Anular
              </Button>
            </span>
          </Tooltip>
        </div>
      </div>

      <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default">
        <h2 className="text-xl font-semibold mb-4 text-black">Información de la Orden</h2>
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-blue-900 uppercase text-center">
              {["No. Servicio", "Proveedor", "Fecha Emisión", "Código Almacén", "Estado"].map(
                (col, index) => (
                  <th key={index} className="px-4 py-4 text-center font-normal text-white">
                    {col}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {orden ? (
              <tr className="text-center">
                <td className="border-b border-[#eee] px-4 py-5">{orden.id}</td>
                <td className="border-b border-[#eee] px-4 py-5">{orden.supplierId}</td>
                <td className="border-b border-[#eee] px-4 py-5">{orden.issueDate}</td>
                <td className="border-b border-[#eee] px-4 py-5">{orden.storageCode}</td>
                <td className="border-b border-[#eee] px-4 py-5">{orden.statusFlag}</td>
              </tr>
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-4">
                  No se encontró la información de la orden.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default">
        <h2 className="text-xl font-semibold mb-4 text-black">Detalles de la Orden</h2>
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-blue-900 uppercase text-center">
              {["Código", "Cantidad Ordenada", "Cantidad Suministrada", "Precio", "Estado"].map(
                (col, index) => (
                  <th key={index} className="px-4 py-4 text-center font-normal text-white">
                    {col}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {orden?.detail?.length ? (
              orden.detail.map((detalle, index) => (
                <tr key={index} className="text-center">
                  <td className="border-b border-[#eee] px-4 py-5">{detalle.tissueId}</td>
                  <td className="border-b border-[#eee] px-4 py-5">{detalle.quantityOrdered}</td>
                  <td className="border-b border-[#eee] px-4 py-5">{detalle.quantitySupplied}</td>
                  <td className="border-b border-[#eee] px-4 py-5">{detalle.price}</td>
                  <td className="border-b border-[#eee] px-4 py-5">{detalle.status?.value}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-4">
                  No se encontraron detalles para esta orden de servicio.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={isEditDialogOpen} onClose={handleCloseEditDialog} fullWidth maxWidth="md">
        <DialogTitle>Editar Detalles de la Orden</DialogTitle>
        <DialogContent>
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-blue-900 uppercase text-center">
                {["Código", "Cantidad Ordenada", "Precio"].map((col, index) => (
                  <th key={index} className="px-4 py-4 text-center font-normal text-white">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {editedDetails.map((detalle, index) => (
                <tr key={index} className="text-center">
                  <td className="border-b border-[#eee] px-4 py-5">{detalle.tissueId}</td>
                  <td className="border-b border-[#eee] px-4 py-5">
                    <TextField
                      type="number"
                      value={detalle.quantityOrdered}
                      onChange={(e) =>
                        handleDetailChange(index, "quantityOrdered", Number(e.target.value))
                      }
                      fullWidth
                    />
                  </td>
                  <td className="border-b border-[#eee] px-4 py-5">
                    <TextField
                      type="number"
                      value={detalle.price}
                      onChange={(e) =>
                        handleDetailChange(index, "price", Number(e.target.value))
                      }
                      fullWidth
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

      <Dialog open={isAnulateDialogOpen} onClose={handleCloseAnulateDialog} fullWidth maxWidth="sm">
        <DialogTitle>Confirmar Anulación</DialogTitle>
        <DialogContent>
          ¿Seguro de anular esta orden de servicio? Esta acción no se puede deshacer.
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
    </div>
  );
};

export default DetallesOrdenServicio;

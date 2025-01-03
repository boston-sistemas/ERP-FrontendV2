"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  fetchYarnDispatchByNumber,
  updateYarnDispatchStatus,
  checkIsDispatchUpdatable,
} from "../../services/movSalidaHiladoService";
import { YarnDispatch } from "../../../models/models";
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
} from "@mui/material";
import MuiAlert, { AlertProps } from "@mui/material/Alert";

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const DetallesMovSalidaHilado: React.FC = () => {
  const { exitNumber } = useParams();
  const router = useRouter();
  const [dispatchDetail, setDispatchDetail] = useState<YarnDispatch | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isEditable, setIsEditable] = useState(false);
  const [isAnulable, setIsAnulable] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [snackbarSeverity, setSnackbarSeverity] =
    useState<"success" | "error">("success");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAnulateDialogOpen, setIsAnulateDialogOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!exitNumber || Array.isArray(exitNumber)) {
        setError("No se proporcionó un número de salida válido.");
        return;
      }

      setIsLoading(true);
      try {
        const data = await fetchYarnDispatchByNumber(exitNumber, 2024);
        setDispatchDetail(data);

        const isUpdatable = await checkIsDispatchUpdatable(exitNumber);
        setIsEditable(isUpdatable);
        setIsAnulable(isUpdatable);
      } catch (err) {
        setError("Error al obtener el detalle del movimiento.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [exitNumber]);

  const handleEdit = () => {
    if (!isEditable) {
      setSnackbarMessage("No se puede editar este movimiento.");
      setSnackbarSeverity("error");
      return;
    }

    setIsEditDialogOpen(true);
  };

  const handleSaveChanges = () => {
    setSnackbarMessage("Cambios guardados exitosamente.");
    setSnackbarSeverity("success");
    setIsEditDialogOpen(false);
  };

  const handleAnulate = async () => {
    if (!isAnulable) {
      setSnackbarMessage("No se puede anular este movimiento.");
      setSnackbarSeverity("error");
      return;
    }

    try {
      await updateYarnDispatchStatus(exitNumber, "anulate");
      setSnackbarMessage("Movimiento anulado exitosamente.");
      setSnackbarSeverity("success");
      setIsEditable(false);
      setIsAnulable(false);
    } catch (err) {
      setSnackbarMessage("Error al anular el movimiento.");
      setSnackbarSeverity("error");
      console.error(err);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarMessage(null);
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

  return (
    <Box p={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Detalle del Movimiento de Salida</Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            color="primary"
            disabled={!isEditable}
            onClick={handleEdit}
          >
            Editar
          </Button>
          <Button
            variant="contained"
            color="secondary"
            disabled={!isAnulable}
            onClick={handleOpenAnulateDialog}
          >
            Anular
          </Button>
        </Box>
      </Box>
      <Typography>
        <strong>Número de Salida:</strong> {dispatchDetail.exitNumber}
      </Typography>
      <Typography>
        <strong>Fecha de Creación:</strong> {dispatchDetail.creationDate}
      </Typography>
      <Typography>
        <strong>Proveedor:</strong> {dispatchDetail.supplierCode}
      </Typography>
      <Typography>
        <strong>Nota del Documento:</strong>{" "}
        {dispatchDetail.documentNote || "No existe Nota de documento"}
      </Typography>
      <Typography variant="h6" gutterBottom>
        Detalle de Ítems
      </Typography>
      <ul>
        {dispatchDetail.detail.map((item, index) => (
          <li key={index}>
            <Typography>
              <strong>Ítem Número:</strong> {item.itemNumber}
            </Typography>
            <Typography>
              <strong>Peso Neto:</strong> {item.netWeight}
            </Typography>
            <Typography>
              <strong>Peso Bruto:</strong> {item.grossWeight}
            </Typography>
            <Typography>
              <strong>Conos:</strong> {item.coneCount}
            </Typography>
            <Typography>
              <strong>Paquetes:</strong> {item.packageCount}
            </Typography>
          </li>
        ))}
      </ul>

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

      <Dialog
        open={isEditDialogOpen}
        onClose={handleCloseEditDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Editar Movimiento de Salida</DialogTitle>
        <DialogContent>Aquí va el formulario para editar el movimiento.</DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancelar</Button>
          <Button variant="contained" color="primary" onClick={handleSaveChanges}>
            Guardar Cambios
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isAnulateDialogOpen}
        onClose={handleCloseAnulateDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Confirmar Anulación</DialogTitle>
        <DialogContent>
          ¿Seguro de anular este movimiento de salida? Esta acción no se puede deshacer.
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAnulateDialog}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={handleAnulate}>
            Anular
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DetallesMovSalidaHilado;

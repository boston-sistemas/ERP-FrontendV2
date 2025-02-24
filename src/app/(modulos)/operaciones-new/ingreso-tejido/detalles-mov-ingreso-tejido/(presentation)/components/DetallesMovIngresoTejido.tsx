"use client";

import React, { useState, useEffect } from "react";
import {
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
} from "@mui/material";
import { Edit, Block, ExpandMore, ExpandLess } from "@mui/icons-material";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import {
  fetchWeavingServiceEntryById,
  annulWeavingServiceEntry,
  checkWeavingServiceEntryIsUpdatable,
} from "../../../services/IngresoTejidoService";
import { WeavingServiceEntry, DetailCard } from "@/app/(modulos)/operaciones-new/models/models";

const DetallesMovIngresoTejido: React.FC = () => {
  const router = useRouter();
  const { entryNumber } = useParams() as { entryNumber: string };
  const searchParams = useSearchParams();
  const period = Number(searchParams.get("period"));

  const [detalle, setDetalle] = useState<WeavingServiceEntry | null>(null);
  const [isEditable, setIsEditable] = useState(false);
  const [isAnulable, setIsAnulable] = useState(false);
  const [openRows, setOpenRows] = useState<Record<number, boolean>>({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const toggleRow = (index: number) => {
    setOpenRows((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const entry = await fetchWeavingServiceEntryById(entryNumber, period);
        setDetalle(entry);

        const updatableResponse = await checkWeavingServiceEntryIsUpdatable(
          entryNumber,
          period
        );
        setIsEditable(updatableResponse.updatable);
        setIsAnulable(updatableResponse.updatable);
      } catch (error) {
        showSnackbar("Error al cargar los detalles del movimiento.", "error");
        console.error("Error al cargar los detalles:", error);
      }
    };

    fetchData();
  }, [entryNumber, period]);

  const handleEdit = () => {
    if (detalle) {
      router.push(
        `/operaciones-new/ingreso-tejido/editar-mov-ingreso-tejido/${detalle.entryNumber}`
      );
    }
  };

  const handleAnnul = async () => {
    if (detalle) {
      try {
        await annulWeavingServiceEntry(detalle.entryNumber, period);
        showSnackbar(`Movimiento de ingreso N° ${detalle.entryNumber} anulado con éxito.`, "success");
        setDetalle((prev) =>
          prev
            ? {
                ...prev,
                statusFlag: "A",
              }
            : null
        );
        setIsEditable(false);
        setIsAnulable(false);
      } catch (error) {
        showSnackbar("Error al anular el movimiento.", "error");
        console.error("Error al anular el ingreso:", error);
      }
    }
  };

  if (!detalle) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Typography variant="h6">Cargando detalles del movimiento...</Typography>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-md border p-5 bg-gray-50 shadow-md">
        <div className="grid grid-cols-2 gap-4 text-sm mb-5">
          <div>
            <Typography style={{ color: "black" }}>
              <strong>N°:</strong> {detalle.entryNumber}
            </Typography>
            <Typography style={{ color: "black" }}>
              <strong>Proveedor:</strong> {detalle.supplierCode}
            </Typography>
            <Typography style={{ color: "black" }}>
              <strong>O/C N°:</strong> {detalle.supplierPoCorrelative} {detalle.supplierPoSeries || "N/A"}
            </Typography>
          </div>
          <div>
            <Typography style={{ color: "black" }}>
              <strong>Fecha Doc.:</strong> {detalle.fecgf}
            </Typography>
            <Typography style={{ color: "black" }}>
              <strong>Estado:</strong> {detalle.statusFlag === "A" ? "Anulado" : "Activo"}
            </Typography>
          </div>
        </div>
        <Tooltip title={isEditable ? "" : "El movimiento de ingreso no es editable"} arrow>
          <span>
            <Button
              startIcon={<Edit />}
              variant="contained"
              style={{ backgroundColor: isEditable ? "#0288d1" : "#b0b0b0", color: "#fff", marginRight: "10px" }}
              onClick={isEditable ? handleEdit : undefined}
              disabled={!isEditable}
            >
              Editar
            </Button>
          </span>
        </Tooltip>
        <Tooltip title={isAnulable ? "" : "El movimiento de ingreso no se puede anular"} arrow>
          <span>
            <Button
              startIcon={<Block />}
              variant="contained"
              style={{ backgroundColor: isAnulable ? "#d32f2f" : "#b0b0b0", color: "#fff" }}
              onClick={isAnulable ? handleAnnul : undefined}
              disabled={!isAnulable}
            >
              Anular
            </Button>
          </span>
        </Tooltip>
      </div>

      <TableContainer className="rounded-md border bg-gray-50 shadow-md mt-5">
        <Table>
          <TableHead className="bg-blue-900">
            <TableRow>
              {["Item", "Tejido", "Peso Neto", "Tipo Tarjeta", "Proveedor Hilado"].map((col, index) => (
                <TableCell key={index} className="text-white text-center">
                  {col}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {detalle.detail?.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="text-center">{item.itemNumber}</TableCell>
                <TableCell className="text-center">{item.fabridId}</TableCell>
                <TableCell className="text-center">{item.guideNetWeight}</TableCell>
                <TableCell className="text-center">{item.fabricType}</TableCell>
                <TableCell className="text-center">{item.tintSupplierId}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <div className="flex justify-end mt-5">
        <Button
          variant="contained"
          style={{ backgroundColor: "#0288d1", color: "#fff" }}
          onClick={() => router.push("/operaciones-new/ingreso-tejido")}
        >
          Regresar a Movimientos
        </Button>
      </div>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%", backgroundColor: snackbarSeverity === "success" ? "#1976d2" : "#d32f2f", color: "#fff" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default DetallesMovIngresoTejido;

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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Edit, Block, ExpandMore, ExpandLess, Visibility } from "@mui/icons-material";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import {
  fetchWeavingServiceEntryById,
  annulWeavingServiceEntry,
  checkWeavingServiceEntryIsUpdatable,
  fetchFabricById,
} from "../../../services/IngresoTejidoService";
import { WeavingServiceEntry, DetailCard } from "@/app/(modulos)/operaciones-new/models/models";

const ERROR_COLOR = "#d32f2f"; // Example color for error

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
  const [isFabricDialogOpen, setIsFabricDialogOpen] = useState(false);
  const [selectedFabric, setSelectedFabric] = useState<Fabric | null>(null);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isMediumScreen = useMediaQuery(theme.breakpoints.between("sm", "md"));

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

  const handleOpenFabricDetails = async (fabricId: string) => {
    try {
      const fabric = await fetchFabricById(fabricId);
      setSelectedFabric(fabric);
      setIsFabricDialogOpen(true);
    } catch (error) {
      showSnackbar("Error al cargar los detalles del tejido.", "error");
    }
  };

  const handleCloseFabricDialog = () => {
    setIsFabricDialogOpen(false);
    setSelectedFabric(null);
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
              <strong>Estado:</strong> {detalle.promecStatus.name}
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

      {/* Tabla de Detalles */}
      <div className="max-w-full overflow-x-auto mt-5">
        <table className="w-full table-auto border-collapse">
          <thead className="bg-blue-900">
            <tr>
              {["Item", "Tejido", "Peso Neto", "Orden de servicio"].map((col, index) => (
                <th key={index} className="px-4 py-4 text-center font-normal text-white">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {detalle.detail?.map((item, index) => (
              <tr key={index} className="text-center text-black">
                <td className="border-b border-gray-300 px-4 py-5">{item.itemNumber}</td>
                <td className="border-b border-gray-300 px-4 py-5">
                  {item.fabridId}
                  <IconButton onClick={() => handleOpenFabricDetails(item.fabridId)}>
                    <Visibility color="primary"/>
                  </IconButton>
                </td>
                <td className="border-b border-gray-300 px-4 py-5">{item.guideNetWeight}</td>
                <td className="border-b border-gray-300 px-4 py-5">
                  {item.serviceOrderId}
                  <IconButton>
                    <Visibility color="primary"/>
                  </IconButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Nueva tabla para detailCard */}
      <div className="max-w-full overflow-x-auto mt-5">
        <table className="w-full table-auto border-collapse">
          <thead className="bg-blue-900">
            <tr>
              {["ID", "Tejido", "Peso Neto", "Proveedor Hilado", "Tipo Tarjeta", "Estado", "Proveedor Tintorería", "Color Tintorería"].map((col, index) => (
                <th key={index} className="px-4 py-4 text-center font-normal text-white">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {detalle.detail?.flatMap((item) =>
              item.detailCard.map((card, index) => (
                <tr key={index} className="text-center text-black">
                  <td className="border-b border-gray-300 px-4 py-5">{card.id}</td>
                  <td className="border-b border-gray-300 px-4 py-5">
                    {card.productId}
                    <IconButton onClick={() => handleOpenFabricDetails(card.productId)}>
                      <Visibility color="primary"/>
                    </IconButton>
                  </td>
                  <td className="border-b border-gray-300 px-4 py-5">{card.netWeight}</td>
                  <td className="border-b border-gray-300 px-4 py-5">{card.yarnSupplierId}</td>
                  <td className="border-b border-gray-300 px-4 py-5">{card.cardType}</td>
                  <td className="border-b border-gray-300 px-4 py-5">{card.statusFlag}</td>
                  <td className="border-b border-gray-300 px-4 py-5">{card.tintSupplierId}</td>
                  <td className="border-b border-gray-300 px-4 py-5">{card.tintColorId}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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

      <Dialog
        open={isFabricDialogOpen}
        onClose={handleCloseFabricDialog}
        fullScreen={isSmallScreen}
        maxWidth="md"
        PaperProps={{
          sx: {
            ...(!isSmallScreen && !isMediumScreen && {
              marginLeft: "200px",
              maxWidth: "calc(100% - 280px)",
            }),
            maxHeight: "calc(100% - 64px)",
            overflowY: "auto",
          },
        }}
      >
        <DialogTitle>Detalle del Tejido</DialogTitle>
        <DialogContent>
          {selectedFabric ? (
            <div className="mb-4 text-black">
              <p className="mb-2"><strong>ID:</strong> {selectedFabric.id}</p>
              <p className="mb-2"><strong>Descripción:</strong> {selectedFabric.description}</p>
              <p className="mb-2"><strong>Barcode:</strong> {selectedFabric.barcode || "No disponible"}</p>
              <p className="mb-2"><strong>Tipo de Tejido:</strong> {selectedFabric.fabricType?.value || "No disponible"}</p>
              <p className="mb-2"><strong>Densidad:</strong> {selectedFabric.density || "No disponible"}</p>
              <p className="mb-2"><strong>Ancho:</strong> {selectedFabric.width || "No disponible"}</p>
              <p className="mb-2"><strong>Patrón de Estructura:</strong> {selectedFabric.structurePattern || "No disponible"}</p>
              <p className="mb-2"><strong>Unidad de Inventario:</strong> {selectedFabric.inventoryUnitCode || "No disponible"}</p>
              <p className="mb-2"><strong>Unidad de Compra:</strong> {selectedFabric.purchaseUnitCode || "No disponible"}</p>
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
                    {selectedFabric.recipe.map((item, index) => (
                      <tr key={index} className="text-center text-black">
                        <td className="border-b border-[#eee] px-4 py-5">{item.yarn.description}</td>
                        <td className="border-b border-[#eee] px-4 py-5">{item.proportion}%</td>
                        <td className="border-b border-[#eee] px-4 py-5">{item.diameter}</td>
                        <td className="border-b border-[#eee] px-4 py-5">{item.galgue}</td>
                        <td className="border-b border-[#eee] px-4 py-5">{item.numPlies}</td>
                        <td className="border-b border-[#eee] px-4 py-5">{item.stitchLength}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <CircularProgress />
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCloseFabricDialog}
            variant="contained"
            style={{ backgroundColor: ERROR_COLOR, color: "#fff" }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default DetallesMovIngresoTejido;

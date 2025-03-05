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
  SelectChangeEvent,
} from "@mui/material";
import { useRouter } from "next/navigation";
import {
  fetchSuppliers,
  fetchServiceOrderById,
} from "@/app/(modulos)/operaciones-new/ordenes-servicio/services/ordenesServicioService";
import {
  createWeavingServiceEntry,
  fetchSuppliersT,
} from "../../../services/IngresoTejidoService";
import { fetchServiceOrders } from "@/app/(modulos)/operaciones-new/ordenes-servicio/services/ordenesServicioService";

import {
  Supplier,
  ServiceOrder,
  Detail,
  WeavingServiceEntry,
} from "@/app/(modulos)/operaciones-new/models/models";

const CrearIngresoTejido: React.FC = () => {
  const router = useRouter();

  // State para formulario principal
  const [period, setPeriod] = useState<number>(2024);
  const [supplierId, setSupplierId] = useState<string>("");
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supplierPoCorrelative, setSupplierPoCorrelative] = useState<string>("");
  const [supplierPoSeries, setSupplierPoSeries] = useState<string>("");
  const [documentNote, setDocumentNote] = useState<string>("");
  const [fecgf, setFecgf] = useState<string>("2024-01-10");
  const [generateCards, setGenerateCards] = useState<boolean>(false);

  // State para detalles
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
  const [selectedServiceOrderId, setSelectedServiceOrderId] = useState<string>("");
  const [fabrics, setFabrics] = useState<{ id: string; description: string }[]>([]);
  const [selectedFabricId, setSelectedFabricId] = useState<string>("");
  const [guideNetWeight, setGuideNetWeight] = useState<number>(0);
  const [rollCount, setRollCount] = useState<number>(0);
  const [details, setDetails] = useState<Detail[]>([]);

  // Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const suppliersResp = await fetchSuppliersT();
        setSuppliers(suppliersResp);

        const serviceOrdersResp = await fetchServiceOrders(10, 0, false);

        // Ordenar las órdenes de servicio por fecha de creación (issueDate)
        const sortedServiceOrders = serviceOrdersResp.serviceOrders.sort(
          (a: ServiceOrder, b: ServiceOrder) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()
        );

        setServiceOrders(sortedServiceOrders || []);
      } catch (error) {
        console.error("Error al cargar datos iniciales:", error);
        showSnackbar("Error al cargar datos iniciales.", "error");
      }
    };
    fetchInitialData();
  }, []);

  const handleServiceOrderChange = async (e: SelectChangeEvent<string>) => {
    const orderId = e.target.value;
    console.log("Orden de Servicio seleccionada:", orderId);
    setSelectedServiceOrderId(orderId);
    try {
      const serviceOrderResp: ServiceOrder = await fetchServiceOrderById(orderId);
      console.log("Respuesta del endpoint:", serviceOrderResp);

      // Mapear los tejidos desde el campo detail
      const mappedFabrics = serviceOrderResp.detail.map((detail) => ({
        id: detail.fabricId,
        description: `Tejido - ${detail.fabricId}`,
      }));

      setFabrics(mappedFabrics);
    } catch (error) {
      console.error("Error al cargar tejidos:", error);
      showSnackbar("Error al cargar tejidos.", "error");
    }
  };

  const handleAddDetail = () => {
    if (!selectedFabricId || !guideNetWeight || !rollCount) {
      showSnackbar("Complete todos los campos del detalle.", "error");
      return;
    }

    const newDetail: Detail = {
      guideNetWeight,
      rollCount,
      serviceOrderId: selectedServiceOrderId,
      fabricId: selectedFabricId,
      tintColorId: "",
      tintSupplierId: "",
      tintSupplierColorId: null,
    };

    setDetails([...details, newDetail]);
    setGuideNetWeight(0);
    setRollCount(0);
    setSelectedFabricId("");
  };

  const handleCreateEntry = async () => {
    const payload = {
      period,
      supplierPoCorrelative,
      supplierPoSeries,
      documentNote,
      supplierId,
      fecgf,
      generateCards,
      detail: details,
    };

    try {
      await createWeavingServiceEntry(payload);
      showSnackbar("Movimiento creado exitosamente.", "success");
      router.push("/operaciones-new/ingreso-tejido");
    } catch (error) {
      console.error("Error al crear el movimiento:", error);
      showSnackbar("Error al crear el movimiento.", "error");
    }
  };

  return (
    <div className="flex justify-center items-start min-h-screen bg-gray-100 py-10">
      <div
        className="bg-white border border-gray-300 rounded-lg shadow-lg p-6 w-full"
        style={{ maxWidth: "90%", margin: "auto" }}
      >
        <h2 className="text-2xl font-semibold text-center text-blue-800 mb-6">
          Crear Movimiento de Ingreso de Tejido
        </h2>
        <form>
          <FormControl fullWidth margin="dense">
            <InputLabel id="period-label">Periodo</InputLabel>
            <Select
              labelId="period-label"
              value={period}
              onChange={(e) => setPeriod(Number(e.target.value))}
            >
              {[2023, 2024, 2025].map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="dense">
            <InputLabel id="supplier-label">Proveedor</InputLabel>
            <Select
              labelId="supplier-label"
              value={supplierId || ""}
              onChange={(e) => setSupplierId(e.target.value as string)}
            >
              {suppliers.map((supplier) => (
                <MenuItem key={supplier.code} value={supplier.code}>
                  {supplier.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Guía"
            fullWidth
            margin="dense"
            value={supplierPoCorrelative}
            onChange={(e) => setSupplierPoCorrelative(e.target.value)}
          />

          <TextField
            label="Factura"
            fullWidth
            margin="dense"
            value={supplierPoSeries}
            onChange={(e) => setSupplierPoSeries(e.target.value)}
          />

          <TextField
            label="Nota del Documento"
            fullWidth
            margin="dense"
            value={documentNote}
            onChange={(e) => setDocumentNote(e.target.value)}
          />

          <FormControl fullWidth margin="dense">
            <InputLabel id="service-order-label">Orden de Servicio</InputLabel>
            <Select
              labelId="service-order-label"
              value={selectedServiceOrderId || ""}
              onChange={handleServiceOrderChange}
            >
              {serviceOrders.map((order) => (
                <MenuItem key={order.id} value={order.id}>
                  {order.id}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="dense">
            <InputLabel id="fabric-label">Tejido</InputLabel>
            <Select
              labelId="fabric-label"
              value={selectedFabricId || ""}
              onChange={(e) => setSelectedFabricId(e.target.value as string)}
              disabled={!selectedServiceOrderId}
            >
              {fabrics.map((fabric) => (
                <MenuItem key={fabric.id} value={fabric.id}>
                  {fabric.description}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Peso Neto"
            type="number"
            fullWidth
            margin="dense"
            value={guideNetWeight}
            onChange={(e) => setGuideNetWeight(Number(e.target.value))}
          />

          <TextField
            label="Cantidad de Rollos"
            type="number"
            fullWidth
            margin="dense"
            value={rollCount}
            onChange={(e) => setRollCount(Number(e.target.value))}
          />

          <div className="flex items-center mt-4">
            <Switch
              checked={generateCards}
              onChange={(e) => setGenerateCards(e.target.checked)}
            />
            <Typography>Generar Tarjetas</Typography>
          </div>

          <Button
            variant="contained"
            color="primary"
            onClick={handleAddDetail}
            style={{ marginTop: "16px", backgroundColor: "#1976d2", color: "#fff"}
          }
          >
            Agregar Detalle
          </Button>

          <div className="mt-6">
            <h3 className="text-lg font-semibold">Detalles</h3>
            {details.map((detail, index) => (
              <div key={index} className="border p-3 mt-3 rounded-md">
                <Typography>Tejido: {detail.fabricId}</Typography>
                <Typography>Peso Neto: {detail.guideNetWeight}</Typography>
                <Typography>Rollos: {detail.rollCount}</Typography>
              </div>
            ))}
          </div>

          <div className="flex justify-end mt-6 gap-4">
            <Button
              variant="contained"
              style={{ backgroundColor: "#d32f2f", color: "#fff" }}
              onClick={() => router.push("/operaciones-new/ingreso-tejido")}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              style={{ backgroundColor: "#1976d2", color: "#fff" }}
              onClick={handleCreateEntry}
            >
              Crear Movimiento
            </Button>
          </div>
        </form>
      </div>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default CrearIngresoTejido;

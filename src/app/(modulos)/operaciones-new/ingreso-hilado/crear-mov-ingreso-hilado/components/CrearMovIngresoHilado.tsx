"use client";

import React, { useState, useEffect } from "react";
import {
  Button,
  TextField,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Typography,
  TablePagination,
  Switch,
  MenuItem,
  Select,
} from "@mui/material";
import MuiAlert, { AlertProps } from "@mui/material/Alert";
import { Add, Delete } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { fetchOrdenCompras, createYarnPurchaseEntry } from "../services/crearMovIngreso";
import { PurchaseOrder, Yarn, YarnPurchaseEntryDetail, YarnPurchaseEntry, PurchaseOrderResponse } from "../../../models/models";

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const CrearMovIngresoHilado: React.FC = () => {
  const router = useRouter();
  const [guiaCorrelativa, setGuiaCorrelativa] = useState("");
  const [facturaSerie, setFacturaSerie] = useState("");
  const [loteProveedor, setLoteProveedor] = useState("");
  const [nota, setNota] = useState("");
  const [ordenesCompra, setOrdenesCompra] = useState<PurchaseOrder[]>([]);
  const [pagina, setPagina] = useState(0);
  const [filasPorPagina, setFilasPorPagina] = useState(5);
  const [openOrdenesDialog, setOpenOrdenesDialog] = useState(false);
  const [selectedOrden, setSelectedOrden] = useState<PurchaseOrder | null>(null);
  const [period, setPeriod] = useState(2024); // Período por defecto
  const [details, setDetails] = useState<
    {
      yarnId: string;
      guideNetWeight: number;
      guideGrossWeight: number;
      guidePackageCount: number;
      guideConeCount: number;
      detailHeavy: { groupNumber: number; coneCount: number; packageCount: number; grossWeight: number; netWeight: number }[];
      isWeighted: boolean;
    }[]
  >([]);

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  useEffect(() => {
    // Fetch inicial con periodo 2024
    const initialFetch = async () => {
      try {
        const data: PurchaseOrderResponse = await fetchOrdenCompras(2024);
        setOrdenesCompra(data.ordenes);
      } catch (error) {
        console.error("Error al cargar órdenes de compra para el periodo inicial:", error);
        setSnackbarMessage("Error al cargar órdenes de compra para el periodo inicial.");
        setOpenSnackbar(true);
      }
    };

    initialFetch();
  }, []);

  useEffect(() => {
    // Fetch dinámico basado en el periodo seleccionado
    if (period !== 2024) {
      const fetchOrdenes = async () => {
        try {
          const data: PurchaseOrderResponse = await fetchOrdenCompras(period);
          setOrdenesCompra(data.ordenes);
        } catch (error) {
          console.error("Error al cargar órdenes de compra:", error);
          setSnackbarMessage("Error al cargar órdenes de compra.");
          setOpenSnackbar(true);
        }
      };

      fetchOrdenes();
    }
  }, [period]);

  const toggleOrdenesDialog = () => {
    setOpenOrdenesDialog(!openOrdenesDialog);
  };

  const handleSelectOrden = (orden: PurchaseOrder) => {
    setSelectedOrden(orden);

    const initialDetails = orden.detail.map((detalle) => ({
      yarnId: detalle.yarn.id,
      guideNetWeight: 0,
      guideGrossWeight: 0,
      guidePackageCount: 0,
      guideConeCount: 0,
      detailHeavy: [],
      isWeighted: false,
    }));
    setDetails(initialDetails);

    setSnackbarMessage(`Orden de Compra ${orden.purchaseOrderNumber} seleccionada.`);
    setOpenSnackbar(true);
    toggleOrdenesDialog();
  };

  const handleDetailChange = (index: number, field: string, value: any) => {
    setDetails((prevDetails) =>
      prevDetails.map((detail, i) =>
        i === index ? { ...detail, [field]: value } : detail
      )
    );
  };

  const handleAddGroup = (index: number) => {
    setDetails((prevDetails) =>
      prevDetails.map((detail, idx) =>
        idx === index
          ? {
              ...detail,
              detailHeavy: [
                ...detail.detailHeavy,
                {
                  groupNumber: detail.detailHeavy.length + 1,
                  coneCount: 0,
                  packageCount: 1,
                  grossWeight: 0,
                  netWeight: 0,
                },
              ],
            }
          : detail
      )
    );
  };

  const handleUpdateGroup = (
    index: number,
    groupIndex: number,
    key: string,
    value: number
  ) => {
    setDetails((prevDetails) =>
      prevDetails.map((detail, i) =>
        i === index
          ? {
              ...detail,
              detailHeavy: detail.detailHeavy.map((group, gIndex) =>
                gIndex === groupIndex
                  ? { ...group, [key]: key === "packageCount" ? 1 : value }
                  : group
              ),
            }
          : detail
      )
    );
  };

  const handleDeleteGroup = (detailIndex: number, groupIndex: number) => {
    setDetails((prevDetails) =>
      prevDetails.map((detail, index) =>
        index === detailIndex
          ? {
              ...detail,
              detailHeavy: detail.detailHeavy.filter((_, idx) => idx !== groupIndex),
            }
          : detail
      )
    );
  };

  const handleCreate = async () => {
    if (!selectedOrden) {
      setSnackbarMessage("Debe seleccionar una orden de compra válida.");
      setOpenSnackbar(true);
      return;
    }
  
    const payload: Partial<YarnPurchaseEntry> = {
      period,
      supplierPoCorrelative: guiaCorrelativa,
      supplierPoSeries: facturaSerie,
      fecgf: new Date().toISOString().split("T")[0],
      purchaseOrderNumber: selectedOrden.purchaseOrderNumber,
      documentNote: nota,
      supplierBatch: loteProveedor,
      detail: details.map((detail, index) => ({
        itemNumber: index + 1,
        yarnId: detail.yarnId,
        guideNetWeight: detail.guideNetWeight,
        guideGrossWeight: detail.guideGrossWeight,
        guidePackageCount: detail.guidePackageCount,
        guideConeCount: detail.guideConeCount,
        detailHeavy: detail.isWeighted ? detail.detailHeavy : [],
        isWeighted: detail.isWeighted,
        statusFlag: "P",
      })),
    };
  
    try {
      const response = await createYarnPurchaseEntry(payload);
  
      if (response.entryNumber) {
        // Guardar el número de entrada en el localStorage
        localStorage.setItem("entryNumber", JSON.stringify({ entryNumber: response.entryNumber }));
  
        setSnackbarMessage("Movimiento creado exitosamente.");
        setOpenSnackbar(true);
  
        // Redirigir al componente principal
        router.push("/operaciones-new/ingreso-hilado");
      }
    } catch (error: any) {
      console.error("Error al crear el movimiento:", error);
      setSnackbarMessage(error.message || "Error al crear el movimiento.");
      setOpenSnackbar(true);
    }
  };  

  const handleCancel = () => {
    router.push("/operaciones-new/ingreso-hilado");
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border border-gray-300 rounded-lg shadow-lg p-8 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-6 text-center" style={{ color: "#000" }}>
          Crear Mov. de Ingreso de Hilado
        </h2>
        <div className="mb-4">
          <Typography variant="subtitle1" className="font-semibold mb-2" style={{ color: "#000" }}>
            Seleccionar Año del Periodo
          </Typography>
          <Select
            value={period}
            onChange={(e) => setPeriod(Number(e.target.value))}
            fullWidth
            variant="outlined"
            displayEmpty
            style={{ backgroundColor: "#fff" }}
          >
            <MenuItem value="" disabled>
              Seleccionar año
            </MenuItem>
            {[2023, 2024, 2025].map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </Select>
        </div>

        <div className="mb-4">
          <Typography
            variant="subtitle1"
            className="font-semibold mb-2"
            style={{ color: "#000" }}
          >
            Seleccionar Orden de Compra
          </Typography>
          {selectedOrden && (
            <Typography
              variant="body2"
              className="mb-2 font-semibold"
              style={{ color: "#000" }}
            >
              Orden seleccionada: {selectedOrden.purchaseOrderNumber}
            </Typography>
          )}
          <IconButton onClick={toggleOrdenesDialog}>
            <Add style={{ color: "#1976d2" }} />
          </IconButton>
        </div>

        <form>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <TextField
              label="Guía"
              value={guiaCorrelativa}
              onChange={(e) => setGuiaCorrelativa(e.target.value)}
              fullWidth
              variant="outlined"
              size="small"
            />
            <TextField
              label="Factura"
              value={facturaSerie}
              onChange={(e) => setFacturaSerie(e.target.value)}
              fullWidth
              variant="outlined"
              size="small"
            />
            <TextField
              label="Lte. Provee."
              value={loteProveedor}
              onChange={(e) => setLoteProveedor(e.target.value)}
              fullWidth
              variant="outlined"
              size="small"
            />
          </div>

          {/* Hilados dinámicos */}
          {details.map((detail, index) => (
            <div key={index} className="mb-6">
              <Typography
                variant="subtitle1"
                className="font-semibold mb-2"
                style={{ color: "#000" }}
              >
                Hilado: {detail.yarnId}
              </Typography>
              <div className="grid grid-cols-2 gap-4">
                <TextField
                  label="N° Bultos"
                  value={detail.guidePackageCount || ""}
                  onChange={(e) => handleDetailChange(index, "guidePackageCount", parseInt(e.target.value) || 0)}
                  fullWidth
                  variant="outlined"
                  size="small"
                />
                <TextField
                  label="N° Conos"
                  value={detail.guideConeCount || ""}
                  onChange={(e) => handleDetailChange(index, "guideConeCount", parseInt(e.target.value) || 0)}
                  fullWidth
                  variant="outlined"
                  size="small"
                />
                <TextField
                  label="Peso Bruto"
                  value={detail.guideGrossWeight || ""}
                  onChange={(e) => handleDetailChange(index, "guideGrossWeight", parseFloat(e.target.value) || 0)}
                  fullWidth
                  variant="outlined"
                  size="small"
                />
                <TextField
                  label="Peso Neto"
                  value={detail.guideNetWeight || ""}
                  onChange={(e) => handleDetailChange(index, "guideNetWeight", parseFloat(e.target.value) || 0)}
                  fullWidth
                  variant="outlined"
                  size="small"
                />
              </div>
              <div className="flex items-center justify-between mt-4">
                <Typography variant="subtitle1" className="font-semibold">
                  Pesaje
                </Typography>
                <Switch
                  checked={detail.isWeighted}
                  onChange={(e) => handleDetailChange(index, "isWeighted", e.target.checked)}
                  color="primary"
                />
              </div>
              {detail.isWeighted && (
                <div className="mb-4">
                  <table className="table-auto w-full">
                    <thead>
                      <tr className="bg-blue-900 text-white text-sm">
                        {["Grupo", "N° Bultos", "N° Conos", "Peso Bruto", "Peso Neto", "Acciones"].map((col, colIndex) => (
                          <th key={colIndex} className="px-2 py-3 text-center">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {detail.detailHeavy.map((group, groupIndex) => (
                        <tr
                          key={groupIndex}
                          className={`${
                            groupIndex % 2 === 0 ? "bg-gray-100" : "bg-white"
                          } hover:bg-gray-200 text-sm`}
                        >
                          <td className="px-2 py-3 text-center">{group.groupNumber}</td>
                          <td className="px-2 py-3 text-center">
                          <TextField
                            type="number"
                            size="small"
                            fullWidth
                            value={group.packageCount}
                            InputProps={{ readOnly: true }} // Deshabilitar edición
                          />
                          </td>
                          <td className="px-2 py-3 text-center">
                            <TextField
                              type="number"
                              size="small"
                              fullWidth
                              value={group.coneCount}
                              onChange={(e) =>
                                handleUpdateGroup(index, groupIndex, "coneCount", parseInt(e.target.value) || 0)
                              }
                            />
                          </td>
                          <td className="px-2 py-3 text-center">
                            <TextField
                              type="number"
                              size="small"
                              fullWidth
                              value={group.grossWeight}
                              onChange={(e) =>
                                handleUpdateGroup(index, groupIndex, "grossWeight", parseFloat(e.target.value) || 0)
                              }
                            />
                          </td>
                          <td className="px-2 py-3 text-center">
                            <TextField
                              type="number"
                              size="small"
                              fullWidth
                              value={group.netWeight}
                              onChange={(e) =>
                                handleUpdateGroup(index, groupIndex, "netWeight", parseFloat(e.target.value) || 0)
                              }
                            />
                          </td>
                          <td className="px-2 py-3 text-center">
                            <IconButton
                              color="error"
                              onClick={() => handleDeleteGroup(index, groupIndex)}
                            >
                              <Delete />
                            </IconButton>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="flex justify-end mt-2">
                    <IconButton color="primary" onClick={() => handleAddGroup(index)}>
                      <Add />
                    </IconButton>
                  </div>
                </div>
              )}
            </div>
          ))}

          <TextField
            label="Nota"
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            size="small"
          />
          <div className="flex justify-between mt-4">
            <Button
              variant="contained"
              style={{ backgroundColor: "#d32f2f", color: "#fff" }}
              onClick={handleCancel}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              style={{ backgroundColor: "#1976d2", color: "#fff" }}
              onClick={handleCreate}
            >
              Crear
            </Button>
          </div>
        </form>
      </div>

      <Dialog open={openOrdenesDialog} onClose={toggleOrdenesDialog} maxWidth="md" fullWidth>
        <DialogTitle>Seleccionar Orden de Compra</DialogTitle>
        <DialogContent>
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-blue-900 text-white uppercase text-sm">
                {["N° O/C", "Proveedor", "Nombre o Razón Social", "Fecha Emisión", "Fecha Vencimiento", "Agregar"].map((col, index) => (
                  <th key={index} className="border-b border-[#eee] px-4 py-5 text-center font-normal">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
  {ordenesCompra
    .slice(pagina * filasPorPagina, pagina * filasPorPagina + filasPorPagina)
    .map((orden, index) => (
      <tr
        key={orden.purchaseOrderNumber}
        className={`${
          index % 2 === 0 ? "bg-gray-100" : "bg-white"
        } hover:bg-gray-200 text-sm`}
      >
        <td className="border-b border-[#eee] px-4 py-5 text-center">
          {orden.purchaseOrderNumber}
        </td>
        <td className="border-b border-[#eee] px-4 py-5 text-center">
          {orden.supplierCode}
        </td>
        <td className="border-b border-[#eee] px-4 py-5 text-center">
          {orden.supplierCode || "N/A"}
        </td>
        <td className="border-b border-[#eee] px-4 py-5 text-center">
          {orden.issueDate}
        </td>
        <td className="border-b border-[#eee] px-4 py-5 text-center">
          {orden.dueDate}
        </td>
        <td className="border-b border-[#eee] px-4 py-5 text-center">
          <IconButton color="primary" onClick={() => handleSelectOrden(orden)}>
            <Add />
          </IconButton>
        </td>
      </tr>
    ))}
</tbody>

          </table>
          <TablePagination
            component="div"
            count={ordenesCompra.length}
            page={pagina}
            onPageChange={(_, newPage) => setPagina(newPage)}
            rowsPerPage={filasPorPagina}
            onRowsPerPageChange={(e) => setFilasPorPagina(parseInt(e.target.value, 10))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={toggleOrdenesDialog} style={{ backgroundColor: "#1976d2", color: "#fff" }}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );

};

export default CrearMovIngresoHilado;

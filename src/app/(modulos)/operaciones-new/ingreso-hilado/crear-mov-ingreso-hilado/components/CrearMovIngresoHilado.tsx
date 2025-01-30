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
  useMediaQuery,
  useTheme,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import MuiAlert, { AlertProps } from "@mui/material/Alert";
import { Add, Delete, Visibility } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { fetchOrdenCompras, createYarnPurchaseEntry, fetchPurchaseOrderById } from "../services/crearMovIngresoService";
import { fetchSuppliersHil } from "../../services/movIngresoHiladoService";
import { fetchYarnbyId } from "../../../hilados/services/hiladoService";
import { PurchaseOrder, Yarn, YarnPurchaseEntryDetail, YarnPurchaseEntry, PurchaseOrderResponse } from "../../../models/models";

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const CrearMovIngresoHilado: React.FC = () => {
  const router = useRouter();
  const [guiaYFactura, setGuiaYFactura] = useState("");
  const [guiaCorrelativa, setGuiaCorrelativa] = useState("");
  const [facturaSerie, setFacturaSerie] = useState("");
  const [loteProveedor, setLoteProveedor] = useState("");
  const [nota, setNota] = useState("");
  const [ordenesCompra, setOrdenesCompra] = useState<PurchaseOrder[]>([]);
  const [pagina, setPagina] = useState(0);
  const [filasPorPagina, setFilasPorPagina] = useState(10);
  const [openOrdenesDialog, setOpenOrdenesDialog] = useState(false);
  const [selectedOrden, setSelectedOrden] = useState<PurchaseOrder | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
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
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

  const [openPurchaseOrderDialog, setOpenPurchaseOrderDialog] = useState(false);
  const [selectedPurchaseOrder, setSelectedPurchaseOrder] = useState<PurchaseOrder | null>(null);

  const [openYarnDialog, setOpenYarnDialog] = useState(false);
  const [selectedYarn, setSelectedYarn] = useState<Yarn | null>(null);

  const [suppliers, setSuppliers] = useState([]);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isMediumScreen = useMediaQuery(theme.breakpoints.between("sm", "md"));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchOrdenCompras(selectedYear);
        setOrdenesCompra(data.yarnOrders || []);
        const suppliersData = await fetchSuppliersHil();
        setSuppliers(suppliersData.suppliers || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        setSnackbarMessage("Error al cargar datos.");
        setOpenSnackbar(true);
      }
    };
    fetchData();
  }, [selectedYear]);

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

  const handleViewOrderDetails = async (purchaseOrderNumber: string) => {
    try {
      const data = await fetchPurchaseOrderById(purchaseOrderNumber);
      setSelectedPurchaseOrder(data);
      setOpenPurchaseOrderDialog(true);
    } catch (error) {
      console.error("Error fetching order details:", error);
      setSnackbarMessage("Error al obtener detalles de la orden.");
      setOpenSnackbar(true);
    }
  };

  const handleClosePurchaseOrderDialog = () => {
    setOpenPurchaseOrderDialog(false);
    setSelectedPurchaseOrder(null);
  };

  const handleOpenYarnDialog = async (yarnId: string) => {
    try {
      const data = await fetchYarnbyId(yarnId);
      setSelectedYarn(data);
      setOpenYarnDialog(true);
    } catch (error) {
      console.error("Error fetching yarn data:", error);
    }
  };

  const handleCloseYarnDialog = () => {
    setOpenYarnDialog(false);
    setSelectedYarn(null);
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
    
      const payload: YarnPurchaseEntry = {
        period: selectedYear,
        supplierPoCorrelative: guiaCorrelativa,
        supplierPoSeries: facturaSerie,
        fecgf: new Date().toISOString().split("T")[0],
        purchaseOrderNumber: selectedOrden.purchaseOrderNumber,
        documentNote: nota || "", // Opcional, se envía vacío si no se completa
        supplierBatch: loteProveedor,
        detail: details.map((detail, index) => ({
          itemNumber: index + 1,
          yarnId: detail.yarnId,
          guideNetWeight: detail.guideNetWeight,
          guideGrossWeight: detail.guideGrossWeight,
          guidePackageCount: detail.guidePackageCount,
          guideConeCount: detail.guideConeCount,
          detailHeavy: detail.isWeighted
            ? detail.detailHeavy.map((heavy) => ({
                groupNumber: heavy.groupNumber,
                coneCount: heavy.coneCount,
                packageCount: heavy.packageCount,
                grossWeight: heavy.grossWeight,
                netWeight: heavy.netWeight,
              }))
            : [],
          isWeighted: detail.isWeighted,
        })),
      };
    
      try {
        const response = await createYarnPurchaseEntry(payload);
    
        if (response?.entryNumber) {
          localStorage.setItem(
            "entryNumber",
            JSON.stringify({ entryNumber: response.entryNumber })
          );
    
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

  const handleGuiaYFacturaChange = (value: string) => {
    setGuiaYFactura(value);
    const [guia, factura] = value.split(" "); 
    setGuiaCorrelativa(guia || "");
    setFacturaSerie(factura || "");
  };

  const handleYearChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedYear(event.target.value as number);
    // Fetch or filter orders based on the selected year
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border border-gray-300 rounded-lg shadow-lg p-8 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-6 text-center" style={{ color: "#000" }}>
          Crear Mov. de Ingreso de Hilado
        </h2>
        <div className="mb-4">
          <Typography
            variant="subtitle1"
            className="font-semibold mb-2"
            style={{ color: "#000" }}
          >
            Seleccionar Orden de Compra
          </Typography>
          {selectedOrden && (
            <div className="flex items-center gap-2">
              <Typography
                variant="body2"
                className="mb-2 font-semibold"
                style={{ color: "#000" }}
              >
                Número de la O/C: {selectedOrden.purchaseOrderNumber}
              </Typography>
              <IconButton onClick={() => handleViewOrderDetails(selectedOrden.purchaseOrderNumber)} style={{ marginBottom: "8px" }}>
                <Visibility style={{ color: "#1976d2" }} />
              </IconButton>
            </div>
          )}
          <Button variant="outlined" onClick={toggleOrdenesDialog}>
            Seleccionar O/C
          </Button>
        </div>

        <form>
          <div className="grid grid-cols-2 gap-4 mb-4">
          <TextField
            label="Guía/Factura"
            value={guiaYFactura}
            onChange={(e) => handleGuiaYFacturaChange(e.target.value)}
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
              <div className="flex items-center justify-between">
              <Typography
                variant="subtitle1"
                className="font-semibold mb-2"
                style={{ color: "#000" }}
              >
                Hilado: {detail.yarnId}
                <IconButton onClick={() => handleOpenYarnDialog(detail.yarnId)}>
                  <Visibility style={{ color: "#1976d2" }} />
                </IconButton>
              </Typography>
              </div>
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
                <Typography variant="subtitle1" className="font-semibold text-black">
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

      <Dialog open={openOrdenesDialog} onClose={toggleOrdenesDialog} maxWidth="md"
      PaperProps={{
        sx: {
          ...( !isSmallScreen && !isMediumScreen && {
            marginLeft: "280px", 
            maxWidth: "calc(100% - 280px)", 
          }),
        },
      }}
        >
        <DialogTitle>Seleccionar Orden de Compra</DialogTitle>
        <DialogContent>
          <div className="mb-4">
            <Typography variant="subtitle1" className="font-semibold mb-2" style={{ color: "#000" }}>
              Seleccionar Periodo
            </Typography>
            <Select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
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
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-blue-900 text-white uppercase text-sm">
                {["N° O/C", "Proveedor", "Información", "Fecha Emisión", "Fecha Vencimiento", "Agregar"].map((col, index) => (
                  <th key={index} className="border-b border-[#eee] px-4 py-5 text-center font-normal">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ordenesCompra && ordenesCompra.length > 0 ? (
                ordenesCompra
                  .slice(pagina * filasPorPagina, pagina * filasPorPagina + filasPorPagina)
                  .map((orden, index) => (
                    <tr
                      key={orden.purchaseOrderNumber}
                      className={`${
                        index % 2 === 0 ? "bg-gray-100" : "bg-white"
                      } hover:bg-gray-200 text-sm`}
                    >
                      <td className="border-b border-[#eee] px-4 py-5 text-center text-black">
                        {orden.purchaseOrderNumber}
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5 text-center">
                        {suppliers.find(supplier => supplier.code === orden.supplierCode)?.name || "Desconocido"}
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5 text-center">
                        <IconButton onClick={(e) => { e.stopPropagation(); handleViewOrderDetails(orden.purchaseOrderNumber); }} style={{ marginBottom: "8px" }}>
                          <Visibility style={{ color: "#1976d2" }} />
                        </IconButton>
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5 text-center">
                        {orden.issueDate}
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5 text-center">
                        {orden.dueDate}
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5 text-center">
                        <Button variant="outlined" onClick={() => handleSelectOrden(orden)}>
                          Seleccionar
                        </Button>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-4">
                    No hay órdenes de compra disponibles.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <TablePagination
            component="div"
            count={ordenesCompra ? ordenesCompra.length : 0}
            page={pagina}
            onPageChange={(_, newPage) => setPagina(newPage)}
            rowsPerPage={filasPorPagina}
            onRowsPerPageChange={(e) => setFilasPorPagina(parseInt(e.target.value, 10))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={toggleOrdenesDialog} style={{ backgroundColor: "#d32f2f", color: "#fff" }}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openPurchaseOrderDialog}
        onClose={handleClosePurchaseOrderDialog}
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
        <DialogContent>
          <h3 className="text-lg font-semibold text-black mb-4">
            Información de la Orden de Compra
          </h3>
          {selectedPurchaseOrder ? (
            <div className="mb-4 text-black">
              <p className="mb-2"><strong>Proveedor:</strong> {suppliers.find(supplier => supplier.code === selectedPurchaseOrder.supplierCode)?.name || "Desconocido"}</p>
              <p className="mb-2"><strong>Fecha de Emisión:</strong> {selectedPurchaseOrder.issueDate}</p>
              <p className="mb-2"><strong>Fecha de Vencimiento:</strong> {selectedPurchaseOrder.dueDate}</p>
              <p className="mb-2"><strong>Método de Pago:</strong> {selectedPurchaseOrder.paymentMethod}</p>
              <p className="mb-6"><strong>Estado:</strong> {selectedPurchaseOrder.promecStatus.name}</p>
              
              <div className="max-w-full overflow-x-auto">
                <table className="w-full table-auto border-collapse">
                  <thead>
                    <tr className="bg-blue-900 uppercase text-center text-white">
                      <th className="px-4 py-4 text-center font-normal">Hilado</th>
                      <th className="px-4 py-4 text-center font-normal">Cantidad</th>
                      <th className="px-4 py-4 text-center font-normal">Avance</th>
                      <th className="px-4 py-4 text-center font-normal">Precio</th>
                      <th className="px-4 py-4 text-center font-normal">Importe</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPurchaseOrder.detail.map((item, index) => (
                      <tr key={index} className="text-center text-black">
                        <td className="border-b border-gray-300 px-4 py-5">
                          {item.yarn.description}
                          <IconButton onClick={() => handleOpenYarnDialog(item.yarn.id)}>
                            <Visibility style={{ color: "#1976d2" }} />
                          </IconButton>
                        </td>
                        <td className="border-b border-gray-300 px-4 py-5">{item.quantityOrdered} {item.unitCode}</td>
                        <td className="border-b border-gray-300 px-4 py-5">{item.quantitySupplied} {item.unitCode}</td>
                        <td className="border-b border-gray-300 px-4 py-5">{selectedPurchaseOrder.promecCurrency.symbol} {item.precto} </td>
                        <td className="border-b border-gray-300 px-4 py-5">{selectedPurchaseOrder.promecCurrency.symbol} {item.impcto}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p>Cargando información...</p>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleClosePurchaseOrderDialog}
            variant="contained"
            style={{ backgroundColor: "#d32f2f", color: "#fff" }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openYarnDialog}
        onClose={handleCloseYarnDialog}
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
        <DialogContent>
          <h3 className="text-lg font-semibold text-black mb-4">
            Información del Hilado
          </h3>
          {selectedYarn ? (
            <div className="mb-4 text-black">
              <p className="mb-2"><strong>ID:</strong> {selectedYarn.id}</p>
              <p className="mb-2"><strong>Descripción:</strong> {selectedYarn.description}</p>
              <p className="mb-2"><strong>Título:</strong> {selectedYarn.yarnCount?.value || "--"}</p>
              <p className="mb-2"><strong>Acabado:</strong> {selectedYarn.spinningMethod?.value || "--"}</p>
              <p className="mb-2"><strong>Barcode:</strong> {selectedYarn.barcode}</p>
              <p className="mb-2"><strong>Color:</strong> {selectedYarn.color?.name || "No teñido"}</p>
              <p className="mb-2"><strong>Fabricado en:</strong> {selectedYarn.manufacturedIn?.value || "--"}</p>
              <p className="mb-2"><strong>Distinciones:</strong>{" "}
                {selectedYarn.distinctions.length > 0
                  ? selectedYarn.distinctions.map((dist) => dist.value).join(", ")
                  : "--"
                }
              </p>
            </div>
          ) : (
            <p>Cargando información del hilado...</p>
          )}
          <h3 className="text-lg font-semibold text-black mb-2 mt-4">Receta</h3>
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
                {selectedYarn?.recipe?.length > 0 ? (
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
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseYarnDialog}
            variant="contained"
            style={{ backgroundColor: "#d32f2f", color: "#fff" }}
          >
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

"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableRow,
  TableCell,
  Button,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TablePagination,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Alert,
  Snackbar,
  Typography,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import {
  fetchYarnPurchaseEntries,
  fetchYarnPurchaseEntryDetails,
  fetchFabricTypes,
} from "../../../ingreso-hilado/services/movIngresoHiladoService";
import {
  fetchServiceOrders,
  fetchServiceOrderById,
  fetchSuppliers,
} from "../../../ordenes-servicio/services/ordenesServicioService";
import { createYarnDispatch } from "../../services/movSalidaHiladoService";
import { ServiceOrder, Supplier, YarnDispatch, YarnPurchaseEntry ,YarnPurchaseEntryResponse, FabricType } from "../../../models/models";

  const CrearMovSalidaHilado: React.FC = () => {
  const [dataIngreso, setDataIngreso] = useState<any>(null); // Detalles del ingreso
  const [dataOS, setDataOS] = useState<any>(null); // Detalles de la orden de servicio
  const [ingresos, setIngresos] = useState<any[]>([]);
  const [ordenesServicio, setOrdenesServicio] = useState<ServiceOrder[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<any[]>([]);
  const [isIngresoDialogOpen, setIsIngresoDialogOpen] = useState<boolean>(false);
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState<boolean>(false);
  const [pagina, setPagina] = useState(0);
  const [filasPorPagina, setFilasPorPagina] = useState(10);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [typeFabric, setTypeFabric] = useState<FabricType[]>([]);
  const [selectTypeFabric, setSelectedTypeFabric] = useState<string>("");
  const [selectedSupplier, setSelectedSupplier] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [period, setPeriod] = useState<number>(2025);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [selectedEntries, setselectedEntries] = useState<YarnPurchaseEntry[]>([]);
  
  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };
  
  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };

  const loadIngresosAndOrders = async () => {
    setIsLoading(true);
    try {
      const [ingresosResponse, ordenesServicioResponse] = await Promise.all([
        fetchYarnPurchaseEntries(period, 50, 0, false), // Usa el período actualizado
        fetchServiceOrders(50, 0, false,period),
      ]);
      setIngresos(ingresosResponse.yarnPurchaseEntries || []);
      setOrdenesServicio(ordenesServicioResponse.serviceOrders || []);
    } catch (error) {
      showSnackbar("Error al cargar datos. Inténtelo de nuevo.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Cargar ingresos y órdenes de servicio cuando cambie el período
    loadIngresosAndOrders();
  }, [period]); // Dependencia del estado `period`  
  

  useEffect(() => {
    const savedEntryNumber = localStorage.getItem("entryNumber");
    if (savedEntryNumber) {
      const parsedPayload = JSON.parse(savedEntryNumber);
      loadIngresoDetails(parsedPayload); // Carga los detalles del ingreso
      setSelectedGroups(parsedPayload.groups || []); // Preselecciona los grupos
      localStorage.removeItem("entryNumber"); // Limpia el localStorage después de cargar
    }
  
    loadIngresosAndOrders();
    loadSupplierData();
    loadFabricTypes();
  }, []);
  
  // Seleccionar varias opciones de ingreso

  const handleAddEntry = (ingreso: YarnPurchaseEntry) => {
    if (!selectedEntries.some((r) => r.entryNumber === ingreso.entryNumber)) {
      setselectedEntries((prev) => [...prev, ingreso]);
      showSnackbar("Entrada añadida.", "success");
    }
  };

  const loadIngresoDetails = async (ingreso: string) => {
    try {
      const response = await fetchYarnPurchaseEntryDetails(ingreso.entryNumber, period); // Usa el período actualizado
      setDataIngreso({
        ...response,
        detail: response.detail || [], // Asegura que siempre haya un array de detalles
      });
      if (!selectedEntries.some((r) => r.entryNumber === ingreso.entryNumber)) {
        setselectedEntries((prev) => [...prev, ingreso]);
        showSnackbar("Entrada añadida.", "success");
      }
    } catch (error) {
      showSnackbar("Error al cargar detalles del ingreso.", "error");
    }
  };    

  const loadSupplierData = async () => {
    try {
      const suppliers = await fetchSuppliers();
      setSuppliers(suppliers);
    } catch (error) {
      console.error("Error al cargar los proveedores:", error);
    }
  }
  
  const loadFabricTypes = async () => {
    try {
      const fabricType = await fetchFabricTypes();
      setTypeFabric(fabricType.fabricTypes);
    } catch (error) {
      console.error("Error al cargar los tipos de tejido:", error);
    }
  }

  const handleProveedorChange = (event: SelectChangeEvent<string>) => {
    setSelectedSupplier(event.target.value);
  };

  const handleAddressChange = (event: SelectChangeEvent<string>) => {
    setSelectedAddress(event.target.value);
  };

  const handleFabricTypeChange = (event: SelectChangeEvent<string>) => {
    setSelectedTypeFabric(event.target.value);
  };

  const supplier = suppliers.find((sup) => sup.code === selectedSupplier);

  const handleGroupInputChange = (
    itemIndex: number,
    groupIndex: number,
    field: string,
    value: number
  ) => {
    setDataIngreso((prevData: any) => {
      const updatedData = { ...prevData };
      updatedData.detail[itemIndex].detailHeavy[groupIndex][field] = value;
      return updatedData;
    });
  };

  const handleSelectServiceOrder = async (orderId: string) => {
    try {
      const serviceOrderDetails = await fetchServiceOrderById(orderId);
      setDataOS({
        ...serviceOrderDetails,
        detail: serviceOrderDetails.detail || [], // Asegura que haya un array de detalles
      });
      setIsServiceDialogOpen(false); // Cierra el diálogo después de seleccionar
    } catch (error) {
      console.error("Error al cargar la orden de servicio:", error);
      alert("No se pudo cargar la orden de servicio seleccionada. Por favor, inténtelo de nuevo.");
    }
  };

  const toggleGroupSelection = (newGroup: any) => {
    setSelectedGroups(prev => {
      const existe = prev.some(
        g =>
          g.entryGroupNumber === newGroup.entryGroupNumber &&
          g.entryItemNumber === newGroup.entryItemNumber
      );
      return existe
        ? // si ya estaba, lo quitamos
          prev.filter(
            g =>
              !(
                g.entryGroupNumber === newGroup.entryGroupNumber &&
                g.entryItemNumber === newGroup.entryItemNumber
              )
          )
        : // si no estaba, lo agregamos
          [...prev, newGroup];
    });
  };
  
  

  const handleSaveSalida = async () => {
    if (!dataIngreso || !dataOS) {
      showSnackbar("Debe seleccionar un movimiento de ingreso y una orden de servicio.", "error");
      return;
    }
    
    if (!selectedAddress) {
      showSnackbar("Debe seleccionar una dirección de proveedor.", "error");
      return;
    }
    
    if (selectedGroups.length === 0) {
      showSnackbar("Debe seleccionar al menos un grupo para generar la salida.", "error");
      return;
    }    
  
    const period = 2025; // Cambia esto según el período actual
    const supplierCode = suppliers.find((supplier) => supplier.code === selectedSupplier)?.code || "";
    const serviceOrderId = dataOS.id; // Id de la orden de servicio
    const nrodir = selectedAddress; // Dirección seleccionada
    const detail = selectedGroups
  .filter((g) =>
    g.itemNumber !== undefined &&      // o `typeof g.itemNumber === "number"`
    g.entryNumber !== undefined &&
    g.entryGroupNumber !== undefined &&
    g.entryItemNumber !== undefined &&
    g.entryPeriod !== undefined
  )
  .map((g) => ({
    itemNumber: g.itemNumber,
    entryNumber: g.entryNumber,
    entryGroupNumber: g.entryGroupNumber,
    entryItemNumber: g.entryItemNumber,
    entryPeriod: g.entryPeriod,
    coneCount: g.coneCount,
    packageCount: g.packageCount,
    grossWeight: g.grossWeight,
    netWeight: g.netWeight,
  }));

    const payload: YarnDispatch = {
      period,
      supplierCode,
      documentNote: null, // Ajusta según lo necesario
      nrodir,
      serviceOrderId,
      detail,
    };
  
    console.log("Payload enviado:", JSON.stringify(payload, null, 2));
  
    try {
      const response = await createYarnDispatch(payload);
      alert("Movimiento de salida creado exitosamente.");
      console.log("Respuesta del backend:", response);
    } catch (error) {
      console.error("Error al guardar el movimiento de salida:", error);
      alert("Hubo un error al intentar guardar el movimiento de salida.");
    }
  };
  
  const handleOpenIngresoDialog = () => setIsIngresoDialogOpen(true);
  const handleCloseIngresoDialog = () => setIsIngresoDialogOpen(false);

  const handleOpenServiceDialog = () => setIsServiceDialogOpen(true);
  const handleCloseServiceDialog = () => setIsServiceDialogOpen(false);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Crear Movimiento de Salida de Hilado</h1>
        <div>
          <p className="text-lg mb-2">Seleccionar Proveedor y Dirección:</p>
          <div className="flex items-center space-x-4 mb-4">
            {/* Selección de Proveedor */}
            <FormControl fullWidth style={{ maxWidth: "300px" }}>
              <Select
                labelId="proveedor-label"
                value={selectedSupplier || ""}
                onChange={handleProveedorChange}
                displayEmpty
                MenuProps={{
                  PaperProps: {
                    style: {
                      transform: "translateX(30%)",
                    },
                  },
                }}
              >
                <MenuItem value="" disabled>
                  Seleccione un Proveedor
                </MenuItem>
                {suppliers.map((supplier) => (
                  <MenuItem key={supplier.code} value={supplier.code}>
                    {supplier.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
      
            {/* Selección de Dirección */}
            {supplier && (
              <FormControl fullWidth style={{ maxWidth: "300px" }}>
                <Select
                  labelId="direccion-label"
                  value={selectedAddress || ""}
                  onChange={handleAddressChange}
                  displayEmpty
                  MenuProps={{
                    PaperProps: {
                      style: {
                        transform: "translateX(30%)",
                      },
                    },
                  }}
                >
                  <MenuItem value="" disabled>
                    Seleccione una Dirección
                  </MenuItem>
                  {Object.entries(supplier.addresses).map(([code, address]) => (
                    <MenuItem key={code} value={code}>
                      {address}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </div>
        </div>
      <div>
        {/* Movimiento de ingreso */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-lg">
            Movimiento de Ingreso Asociado:{" "}
            {dataIngreso ? <strong>{dataIngreso.entryNumber}</strong> : "Ninguno"}
          </p>
          <div>
          <Button style={{ backgroundColor: "#1976d2", color: "#fff" }} onClick={handleOpenIngresoDialog}>
              Seleccionar Movimiento de Ingreso
            </Button>
          </div>
        </div>

        {/* Orden de Servicio */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-lg">
            Orden de Servicio Asociada: {dataOS ? <strong>{dataOS.id}</strong> : "Ninguna"}
          </p>
          <div>
            <Button style={{ backgroundColor: "#1976d2", color: "#fff" }} onClick={handleOpenServiceDialog}>
              Seleccionar Orden de Servicio
            </Button>
          </div>
        </div>

        {/* Tabla de detalles de ingreso */}
        {dataIngreso && (
          <div className="max-w-full overflow-x-auto">
            <h2 className="text-lg font-semibold mb-3">Detalles del Movimiento de Ingreso</h2>
            {dataIngreso.detail.map((item: any, index: number) => (
              <React.Fragment key={index}>
                <h2 className="text-lg font-semibold mb-2">
                  Hilado {index + 1}: {item.yarnId}
                </h2>
                {item.detailHeavy.map((group: any, groupIndex: number) => (
                  <h3 className="text-lg font-semibold mb-2">Peso bruto: <strong>{group.grossWeight}</strong> <br /> 
                  Peso neto: <strong>{group.netWeight}</strong></h3>
                ))}
              </React.Fragment>
            ))}</div>
        )}
        <div>
            <p className="text-lg mb-2">Seleccionar tipo de tejido:</p>
            <div className="flex items-center space-x-4 mb-4">
              {/* Selección de tipo de tejido */}
              <FormControl fullWidth style={{ maxWidth: "300px" }}>
                <Select
                  labelId="tejido-label"
                  value={selectTypeFabric || ""}
                  onChange={handleFabricTypeChange}
                  displayEmpty
                  MenuProps={{
                    PaperProps: {
                      style: {
                        transform: "translateX(30%)",
                      },
                    },
                  }}
                >
                  <MenuItem value="" disabled>
                    Seleccione un tipo de tejido
                  </MenuItem>
                  {typeFabric.map((typefab) => (
                    <MenuItem key={typefab.id} value={typefab.id}>
                      {typefab.value}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
        </div>

            {/* {dataIngreso.detail.map((item: any, index: number) => (
              <React.Fragment key={index}>
                <h2 className="text-lg font-semibold mb-2">
                  Hilado {index + 1}: {item.yarnId}
                </h2>
                <table className="w-full table-auto mb-4">
                  <thead>
                    <tr className="bg-blue-900 uppercase text-center text-white">
                      <th className="px-4 py-4 font-normal">Grupo</th>
                      <th className="px-4 py-4 font-normal">Conos</th>
                      <th className="px-4 py-4 font-normal">Bultos</th>
                      <th className="px-4 py-4 font-normal">Peso Bruto</th>
                      <th className="px-4 py-4 font-normal">Peso Neto</th>
                      <th className="px-4 py-4 font-normal">Seleccionar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {item.detailHeavy.map((group: any, groupIndex: number) => (
                      <TableRow key={groupIndex} className="text-center">
                        <TableCell className="border-b border-gray-300 px-4 py-5">
                          {group.groupNumber}
                        </TableCell>
                        <TableCell className="border-b border-gray-300 px-4 py-5">
                          <TextField
                            type="number"
                            value={group.coneCount}
                            onChange={(e) => handleGroupInputChange(
                              index,
                              groupIndex,
                              "coneCount",
                              parseInt(e.target.value) || 0
                            )}
                            fullWidth />
                        </TableCell>
                        <TableCell className="border-b border-gray-300 px-4 py-5">
                          <TextField
                            type="number"
                            value={group.packageCount}
                            onChange={(e) => handleGroupInputChange(
                              index,
                              groupIndex,
                              "packageCount",
                              parseInt(e.target.value) || 0
                            )}
                            fullWidth />
                        </TableCell>
                        <TableCell className="border-b border-gray-300 px-4 py-5">
                          <TextField
                            type="number"
                            value={group.grossWeight}
                            onChange={(e) => handleGroupInputChange(
                              index,
                              groupIndex,
                              "grossWeight",
                              parseFloat(e.target.value) || 0
                            )}
                            fullWidth />
                        </TableCell>
                        <TableCell className="border-b border-gray-300 px-4 py-5">
                          <TextField
                            type="number"
                            value={group.netWeight}
                            onChange={(e) => handleGroupInputChange(
                              index,
                              groupIndex,
                              "netWeight",
                              parseFloat(e.target.value) || 0
                            )}
                            fullWidth />
                        </TableCell>
                        <TableCell className="border-b border-gray-300 px-4 py-5">
                        <Checkbox
                        checked={selectedGroups.some(
                          (g) =>
                            g.entryGroupNumber === group.groupNumber &&
                            g.entryItemNumber === item.itemNumber
                        )}
                        onChange={() =>
                          toggleGroupSelection({
                            ...group,
                            itemNumber: item.itemNumber,
                            entryNumber: dataIngreso.entryNumber,
                            entryGroupNumber: group.groupNumber,
                            entryItemNumber: item.itemNumber,
                            entryPeriod: dataIngreso.period,
                          })
                        }
                      />
                        </TableCell>
                      </TableRow>
                    ))}
                  </tbody>
                </table>
              </React.Fragment>
            ))} */}

        {/* Tabla de detalles de orden de servicio */}
        {dataOS && (
          <div className="max-w-full overflow-x-auto">
            <h2 className="text-lg font-semibold mb-2">Detalles de la Orden de Servicio</h2>
            {dataOS.detail.map((item: any, index: number) => (
              <React.Fragment key={index}>
                <table className="w-full table-auto mb-4">
                  <thead>
                    <tr className="bg-blue-900 uppercase text-center text-white">
                      <th className="px-4 py-4 font-normal">Tejido</th>
                      <th className="px-4 py-4 font-normal">Cantidad Ordenada</th>
                      <th className="px-4 py-4 font-normal">Cantidad Suministrada</th>
                      <th className="px-4 py-4 font-normal">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    <TableRow className="text-center">
                      <TableCell className="border-b border-gray-300 px-4 py-5">{item.tissueId}</TableCell>
                      <TableCell className="border-b border-gray-300 px-4 py-5">{item.quantityOrdered}</TableCell>
                      <TableCell className="border-b border-gray-300 px-4 py-5">{item.quantitySupplied || 0}</TableCell>
                      <TableCell className="border-b border-gray-300 px-4 py-5">{item.status?.value || "Pendiente"}</TableCell>
                    </TableRow>
                  </tbody>
                </table>
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Diálogo para seleccionar movimientos de ingreso */}
        <Dialog
            open={isIngresoDialogOpen}
            onClose={handleCloseIngresoDialog}
            fullWidth
            maxWidth="lg"
            sx={{
              "& .MuiDialog-paper": {
                width: "70%", // Incrementa el ancho
                marginLeft: "20%", // Ajusta el margen para mantenerlo centrado en el espacio restante
              },
            }}
          >
          <DialogTitle>Seleccionar Movimiento de Ingreso</DialogTitle>
          <DialogContent>
            <div className="mb-4">
              <Typography variant="subtitle1" className="font-semibold mb-2" style={{ color: "#000" }}>
              Seleccionar periodo
              </Typography>
              <Select
                labelId="period-label"
                value={period}
                onChange={(e) => {
                  const selectedPeriod = Number(e.target.value);
                  if ([2023, 2024, 2025].includes(selectedPeriod)) {
                    setPeriod(selectedPeriod); // Solo actualiza si el período es válido
                  } else {
                    showSnackbar("Período no válido.", "error");
                  }
                }}
                >
                  {[2023, 2024, 2025].map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
              </Select>
            </div>
            <div className="max-w-full overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-blue-900 text-white">
                    <th className="px-4 py-4 font-normal">Número</th>
                    <th className="px-4 py-4 font-normal">Proveedor</th>
                    <th className="px-4 py-4 font-normal">Fecha</th>
                    <th className="px-4 py-4 font-normal">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {ingresos
                    .slice(pagina * filasPorPagina, pagina * filasPorPagina + filasPorPagina)
                    .map((ingreso) => {
                      const alreadySelected = selectedEntries.some(
                        (r) => r.entryNumber === ingreso.entryNumber
                      );
                      return (
                        <tr key={ingreso.entryNumber} className="text-center">
                          <td className="border-b border-gray-300 px-4 py-5">
                            {ingreso.entryNumber}
                          </td>
                          <td className="border-b border-gray-300 px-4 py-5">
                            {ingreso.supplierCode || "--"}
                          </td>
                          <td className="border-b border-gray-300 px-4 py-5">
                            {ingreso.creationDate || "--"}
                          </td>
                          <td className="border-b border-gray-300 px-4 py-5">
                            {alreadySelected ? (
                              <span className="text-gray-500">Seleccionado</span>
                            ) : (
                              <IconButton color="primary" onClick={() => loadIngresoDetails(ingreso)}>
                                <Add />
                              </IconButton>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
              <TablePagination
                rowsPerPageOptions={[10, 25, 50]}
                component="div"
                count={ingresos.length}
                rowsPerPage={filasPorPagina}
                page={pagina}
                onPageChange={(_, newPage) => setPagina(newPage)}
                onRowsPerPageChange={(e) => setFilasPorPagina(parseInt(e.target.value, 10))} />
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseIngresoDialog} style={{ backgroundColor: "#d32f2f", color: "#fff" }}>
              Cancelar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Diálogo para seleccionar órdenes de servicio */}
        <Dialog
        open={isServiceDialogOpen}
        onClose={handleCloseServiceDialog}
        fullWidth
        maxWidth="lg"
        sx={{
          "& .MuiDialog-paper": {
            width: "70%",
            marginLeft: "20%",
          },
        }}
      >
          <DialogTitle>Seleccionar Orden de Servicio</DialogTitle>
          <DialogContent>
            <div className="max-w-full overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-blue-900 text-white">
                    <th className="px-4 py-4 font-normal">Número</th>
                    <th className="px-4 py-4 font-normal">Cliente</th>
                    <th className="px-4 py-4 font-normal">Fecha</th>
                    <th className="px-4 py-4 font-normal">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {ordenesServicio.slice(pagina * filasPorPagina, pagina * filasPorPagina + filasPorPagina).map((orden) => (
                    <tr key={orden.id} className="text-center">
                      <td className="border-b border-gray-300 px-4 py-5">{orden.id}</td>
                      <td className="border-b border-gray-300 px-4 py-5">{orden.supplierId}</td>
                      <td className="border-b border-gray-300 px-4 py-5">{orden.issueDate}</td>
                      <td className="border-b border-gray-300 px-4 py-5">
                        <IconButton color="primary" onClick={() => handleSelectServiceOrder(orden.id)}>
                          <Add />
                        </IconButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <TablePagination
                rowsPerPageOptions={[10, 25, 50]}
                component="div"
                count={ordenesServicio.length}
                rowsPerPage={filasPorPagina}
                page={pagina}
                onPageChange={(_, newPage) => setPagina(newPage)}
                onRowsPerPageChange={(e) => setFilasPorPagina(parseInt(e.target.value, 10))} />
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseServiceDialog} style={{ backgroundColor: "#d32f2f", color: "#fff" }}>
              Cancelar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Botón para guardar la salida */}
        {dataIngreso && dataOS && (
          <Button variant="contained" onClick={handleSaveSalida} style={{ marginTop: "16px", backgroundColor: "#4caf50", color: "#fff" }}>
            Guardar Salida
          </Button>
        )}
        <Snackbar
          open={openSnackbar}
          autoHideDuration={3000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: "100%" }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </div>
    </div>
    </div>
  );
};

export default CrearMovSalidaHilado;

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
import { Add, Details } from "@mui/icons-material";
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
  fetchYarnPurchaseEntries,
  fetchYarnIncomeEntries,
  fetchYarnPurchaseEntryDetails,
  fetchFabricTypes,
  fetchFabricSearchId,
} from "../../../ingreso-hilado/services/movIngresoHiladoService";
import {
  fetchServiceOrders,
  fetchServiceOrderById,
  fetchSuppliers,
  fetchServiceOrderBySupplier,
} from "../../../ordenes-servicio/services/ordenesServicioService";
import {
  fetchYarnbyId,
} from "../../../hilados/services/hiladoService";
import { createYarnDispatch } from "../../services/movSalidaHiladoService";
import { ServiceOrder, Supplier, Yarn, YarnDispatch, YarnPurchaseEntry ,YarnPurchaseEntryResponse, Fabric, FabricType } from "../../../models/models";

  const ERROR_COLOR = "#d32f2f";

  const CrearMovSalidaHilado: React.FC = () => {
  // PROVEEDOR Y DIRECCION
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<string>("");
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [period, setPeriod] = useState<number>(2025); // Período actualizado

  // TODO CON RESPECTO A INGRESOS
  const [dataIngreso, setDataIngreso] = useState<any>(null); // Detalles del ingreso
  const [ingresos, setIngresos] = useState<any[]>([]);
  const [selectedEntries, setselectedEntries] = useState<YarnPurchaseEntry[]>([]); // Ingresos seleccionados
  const [isIngresoDialogOpen, setIsIngresoDialogOpen] = useState<boolean>(false);

  // TODO CON RESPECTO A ORDENES DE SERVICIO
  const [ordenesServicio, setOrdenesServicio] = useState<ServiceOrder[]>([]); // Lista de órdenes de servicio
  const [dataOS, setDataOS] = useState<any>(null); // Detalles de la orden de servicio
  const [openFabricDialog, setOpenFabricDialog] = useState(false); // Estado del diálogo de información de tejido
  const [openYarnDialog, setOpenYarnDialog] = useState(false); // Estado del diálogo de información de tejido
  const [FabricInfo, setFabricInfo] = useState<any>(null); // Detalles de fibras
  const [typeFabric, setTypeFabric] = useState<FabricType[]>([]); // Tipos de fibras
  const [selectTypeFabric, setSelectedTypeFabric] = useState<string>("");
  const [selectInfoFabric, setSelectedInfoFabric] = useState<Fabric | null>(null); // Información del tejido seleccionado
  const [selectInfoYarn, setSelectedInfoYarn] = useState<Yarn | null>(null); // Información del tejido seleccionado
  const [selectInfoFabricRecipe, setSelectedInfoFabricRecipe] = useState<any>(null); // Información de la receta del tejido seleccionado
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState<boolean>(false);

  // FRAMEWORK

  const [isSmallScreen, setIsSmallScreen] = useState(false); // Estado de tamaño de pantalla
  const [isMediumScreen, setIsMediumScreen] = useState(false);  // Estado de tamaño de pantalla
  const [selectedGroups, setSelectedGroups] = useState<any[]>([]);
  const [pagina, setPagina] = useState(0);
  const [filasPorPagina, setFilasPorPagina] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  
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
    FilterIngresosbySupplier();
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

  const FilterIngresosbySupplier = async () => {
    try {
      const response = await fetchYarnIncomeEntries(period,selectedSupplier);
      console.log("Ingresos:",response);
      setIngresos(response.yarnPurchaseEntries || []);
    } catch (error) {
      console.error("Error al cargar los tipos de tejido:", error);
    }
  }

  const FilterServicebySupplier = async () => {
    try {
      const response = await fetchServiceOrderBySupplier(selectedSupplier,period);
      setOrdenesServicio(response.serviceOrders || []);
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

  const loadFabricInfo = async (details: any) => { // Carga la información del tejido
    try {
      const fabricInfos = await fetchFabricSearchId(details[0].fabricId);
      setFabricInfo(fabricInfos);
    } catch (error) {
      console.error("Error al cargar la información del tejido:", error);
    };
  };

  const handleSelectServiceOrder = async (orderId: string) => {
    try {
      const serviceOrderDetails = await fetchServiceOrderById(orderId);
      setDataOS({
        ...serviceOrderDetails,
        detail: serviceOrderDetails.detail || [], // Asegura que haya un array de detalles
      });
      console.log("Detalles de la orden de servicio:", serviceOrderDetails);
      loadFabricInfo(serviceOrderDetails.detail); // Carga la información del tejido
      sleepES5(100); // Espera 75ms antes de cargar la información
      setIsServiceDialogOpen(false); // Cierra el diálogo después de seleccionar
    } catch (error) {
      console.error("Error al cargar la orden de servicio:", error);
      alert("No se pudo cargar la orden de servicio seleccionada. Por favor, inténtelo de nuevo.");
    }
  };

   const handleOpenFabricDialog = async (FabricId: number) => {
    setOpenFabricDialog(true);
    setSelectedInfoFabric(null);
      try {
        const data = await fetchFabricSearchId(FabricId);
        setSelectedInfoFabric(data);
        setSelectedInfoFabricRecipe(data.recipe);
        console.log("InfoFabricRecipe:", data.recipe);
      } catch (error) {
        console.error("Error al cargar los datos del hilo:", error);
      }
    };

    const handleOpenYarnDialog = async (yarnId: string) => {
      setOpenYarnDialog(true);
      setSelectedInfoYarn(null);
      try {
        const data = await fetchYarnbyId(yarnId);
        console.log("Yarn data:",data);
        setSelectedInfoYarn(data);
      } catch (error) {
        console.error("Error al cargar los datos del hilo:", error);
      }
    };

    const handleCloseFabricDialog = () => {
      setOpenFabricDialog(false);
    };

    const handleCloseYarnDialog = () => {
      setOpenYarnDialog(false);
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
  
  const handleOpenIngresoDialog = () => 
    {FilterIngresosbySupplier();
      sleepES5(100); // Espera 75ms antes de cargar la información
    setIsIngresoDialogOpen(true);
    };
  const handleCloseIngresoDialog = () => setIsIngresoDialogOpen(false);

  const handleOpenServiceDialog = () => 
    {FilterServicebySupplier();
      sleepES5(100); // Espera 75ms antes de cargar la información
      setIsServiceDialogOpen(true);
    };
  const handleCloseServiceDialog = () => setIsServiceDialogOpen(false);


  var sleepES5 = function(ms: number){  // Función sleep
    var esperarHasta = new Date().getTime() + ms;
    while(new Date().getTime() < esperarHasta) continue;
  };

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
                        transform: "translateX(24%)",
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

        {/* Tabla de detalles de ingreso */}
        {dataIngreso && (
          <div className="max-w-full overflow-x-auto mb-6">
            <h2 className="text-lg font-semibold mb-3">Detalles del Movimiento de Ingreso</h2>
            {dataIngreso.detail.map((item: any, index: number) => (
              <React.Fragment key={index}>
                <h2 className="text-lg font-semibold mb-4">
                  Hilado {index + 1}: {item.yarnId}
                </h2>
                {item.detailHeavy.map((group: any, groupIndex: number) => (
                  <div key={groupIndex} className="border-b border-gray-300 py-4 mb-4">
                    <h3 className="text-lg font-semibold mb-2">
                      Peso bruto: <strong>{group.grossWeight}</strong>  &emsp;&emsp;&emsp;&emsp;&emsp;
                      Peso neto: <strong>{group.netWeight}</strong>
                    </h3>
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        )}
        {dataIngreso && (<>
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
                        transform: "translateX(0%)", // Ajusta la posición del menú desplegable
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
          </>
        )}

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
                  {ordenesServicio.slice(pagina * filasPorPagina,
                   pagina * filasPorPagina + filasPorPagina).map((orden) => (
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
                      <th className="px-4 py-4 font-normal">Precio</th>
                      <th className="px-4 py-4 font-normal">Cantidad Ordenada</th>
                      <th className="px-4 py-4 font-normal">Cantidad Suministrada</th>
                      <th className="px-4 py-4 font-normal">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                  <tr className="text-center text-black">
                    <td className="border-b border-gray-300 px-4 py-5 mb-2">{FabricInfo.description}
                    <IconButton onClick={() => handleOpenFabricDialog(FabricInfo.id)}>  {/*Botón para ver la información del tejido*/}
                          <VisibilityIcon 
                          style={{ color: "#1976d2" }}
                          />
                        </IconButton>
                    </td>
                    <td className="border-b border-gray-300 px-4 py-5 mb-2">{item.price}</td>
                    <td className="border-b border-gray-300 px-4 py-5 mb-2">{item.quantityOrdered}</td>
                    <td className="border-b border-gray-300 px-4 py-5 mb-2">{item.quantitySupplied || 0}</td>
                    <td className="border-b border-gray-300 px-4 py-5 mb-2">{item.status?.value || "Pendiente"}</td>
                  </tr>
                  </tbody>
                </table>
              </React.Fragment>
            ))}
          </div>
        )}

  <Dialog // Diálogo para ver la información del tejido
            open={openFabricDialog}
            onClose={handleCloseFabricDialog}
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
                Información del tejido
              </h3>
              {selectInfoFabric ? (
                <div className="mb-4 text-black">
                  <p className="mb-2"><strong>ID:</strong> {selectInfoFabric.id} </p>
                  <p className="mb-2"><strong>Descripción:</strong> {selectInfoFabric.purchaseDescription} </p>
                  <p className="mb-2"><strong>Color:</strong> {selectInfoFabric.color ? selectInfoFabric.color : "Sin color"} </p>
                  <p className="mb-2"><strong>Tipo:</strong> {selectInfoFabric.fabricType.value} </p>
                  <p className="mb-2"><strong>Densidad:</strong> {selectInfoFabric.density} </p>
                  <p className="mb-2"><strong>Ancho:</strong> {selectInfoFabric.width} </p>
                  <p className="mb-2"><strong>Patrón estructural:</strong> {selectInfoFabric.structurePattern} </p>
                </div>
              ) : (
                <p>Cargando información...</p>
              )}
              <div className="max-w-full overflow-x-auto">
              <h4 className="text-lg font-semibold text-black mb-4">Información de la receta</h4>
                <table className="w-full table-auto border-collapse">
                  <thead>
                    <tr className="bg-blue-900 uppercase text-center text-white">
                      <th className="px-4 py-4 text-center font-normal">Descripción</th>
                      <th className="px-4 py-4 text-center font-normal">Diametro</th>
                      <th className="px-4 py-4 text-center font-normal">Galga</th>
                      <th className="px-4 py-4 text-center font-normal">Numero de cabos</th>
                      <th className="px-4 py-4 text-center font-normal">Proporción</th>
                      <th className="px-4 py-4 text-center font-normal">Longitud de puntada</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/*Proveedor del Hilo (IMPORTANTE)*/}
                    {selectInfoFabricRecipe?.map((item, index) => (
                      <tr key={index} className="text-center text-black">
                        <td className="border-b border-gray-300 px-4 py-5 mb-2">{item.yarn.description}<IconButton 
                        onClick={() => handleOpenYarnDialog(item.yarn.id)}>  {/*Botón para ver la información del hilo?*/}
                            <VisibilityIcon 
                            style={{ color: "#1976d2" }}
                            />
                          </IconButton></td>
                        <td className="border-b border-gray-300 px-4 py-5 mb-2">{item.diameter}</td>
                        <td className="border-b border-gray-300 px-4 py-5 mb-2">{item.galgue}</td>
                        <td className="border-b border-gray-300 px-4 py-5 mb-2">{item.numPlies}</td>
                        <td className="border-b border-gray-300 px-4 py-5 mb-2">{item.proportion}</td>
                        <td className="border-b border-gray-300 px-4 py-5 mb-2">{item.stitchLength}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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

          <Dialog // Diálogo para ver la información del Yarn
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
                Información del hilado
              </h3>
              {selectInfoYarn ? (
                <div className="mb-4 text-black">
                  <p className="mb-2"><strong>ID:</strong> {selectInfoYarn.id} </p>
                  <p className="mb-2"><strong>Descripción:</strong> {selectInfoYarn.purchaseDescription} </p>
                  <p className="mb-2"><strong>Color:</strong> {selectInfoYarn.color?.name || "Sin color"} </p>
                  <p className="mb-2"><strong>Recuento de Hilos:</strong> {selectInfoYarn.yarnCount?.value || "---"} </p>
                  <p className="mb-2"><strong>Acabado de Hilado:</strong> {selectInfoYarn.spinningMethod?.value || "---"} </p>
                  <p className="mb-2"><strong>Manufacturado en:</strong> {selectInfoYarn.manufacturedIn?.value || "---"} </p>
                  <p className="mb-2"><strong>Distinciones: </strong> 
                  {selectInfoYarn.distinctions?.length > 0 
                    ? selectInfoYarn.distinctions.map((dist, index) => (
                        <span key={dist.id}>{dist.value}{index < selectInfoYarn.distinctions.length - 1 ? ", " : ""}</span>
                      ))
                    : "Ninguna"}
                  </p>
                  <p className="mb-2">
                    <strong>Activo:</strong> {selectInfoYarn.isActive ? "Si" : "No activo"}
                  </p>
                </div>
              ) : (
                <p>Cargando información...</p>
              )}
              <div className="max-w-full overflow-x-auto">
              <h4 className="text-lg font-semibold text-black mb-4">Información de la receta</h4>
                <table className="w-full table-auto border-collapse">
                  <thead>
                    <tr className="bg-blue-900 uppercase text-center text-white">
                      <th className="px-4 py-4 text-center font-normal">Fibra</th>
                      <th className="px-4 py-4 text-center font-normal">Proporcion</th>
                      <th className="px-4 py-4 text-center font-normal">Origen</th>
                      <th className="px-4 py-4 text-center font-normal">Denominacion</th>
                      <th className="px-4 py-4 text-center font-normal">Color</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectInfoYarn?.recipe.map((item, index) => (
                      <tr key={index} className="text-center text-black">
                        <td className="border-b border-gray-300 px-4 py-5 mb-2">{item.fiber.category.value}</td>
                        <td className="border-b border-gray-300 px-4 py-5 mb-2">{item.proportion}</td>
                        <td className="border-b border-gray-300 px-4 py-5 mb-2">{item.fiber.origin}</td>
                        <td className="border-b border-gray-300 px-4 py-5 mb-2">{item.fiber.denomination.value}</td>
                        <td className="border-b border-gray-300 px-4 py-5 mb-2">{item.fiber.color?.name || "Sin color"} </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={handleCloseYarnDialog}
                variant="contained"
                style={{ backgroundColor: ERROR_COLOR, color: "#fff" }}
              >
                Cerrar
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
  );
};

export default CrearMovSalidaHilado;

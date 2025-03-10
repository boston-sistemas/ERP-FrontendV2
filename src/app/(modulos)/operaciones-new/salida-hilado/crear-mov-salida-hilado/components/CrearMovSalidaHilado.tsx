"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  Tooltip,
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
  Card,
  CardContent, 
  Grid, 
  Stack
} from "@mui/material";
import { Add, Details } from "@mui/icons-material";
import RemoveIcon from "@mui/icons-material/Remove";
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
  fetchYarnPurchaseEntries,
  fetchYarnIncomeEntries,
  fetchYarnPurchaseEntryDetails,
  fetchFabricTypes,
  fetchFabricSearchId,
  fetchYarnEntriesByEntryNumber,
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
  const [selectYarnEntryInfo, setYarnEntriesByEntryNumber] = useState<YarnPurchaseEntryResponse | null>(null);
  const [selectYarnEntryInfoDetail, setYarnEntriesByEntryNumberDetail] = useState<any>(null);
  const [openYarnEntryInfoDialog, setOpenYarnEntryInfoDialog] = useState(false);
  const [ingresosSeleccionados, setIngresosSeleccionados] = useState<YarnPurchaseEntry[]>([]);
  const [cantidadRequerida, setCantidadRequerida] = useState(0);


  // TODO CON RESPECTO A ORDENES DE SERVICIO
  const [ordenesServicio, setOrdenesServicio] = useState<ServiceOrder[]>([]); // Lista de órdenes de servicio
  const [dataOS, setDataOS] = useState<any>(null); // Detalles de la orden de servicio
  const [openFabricDialog, setOpenFabricDialog] = useState(false); // Estado del diálogo de información de tejido
  const [openYarnDialog, setOpenYarnDialog] = useState(false); // Estado del diálogo de información de tejido
  const [FabricInfo, setFabricInfo] = useState<any>(null); // Detalles de fibras
  const [typeFabric, setTypeFabric] = useState<FabricType[]>([]); // Tipos de fibras
  const [selectTypeFabric, setSelectedTypeFabric] = useState<string>(""); // Tipo de fibra seleccionado
  const [selectInfoFabric, setSelectedInfoFabric] = useState<Fabric | null>(null); // Información del tejido seleccionado
  const [selectInfoYarn, setSelectedInfoYarn] = useState<Yarn | null>(null); // Información del tejido seleccionado
  const [selectInfoFabricRecipe, setSelectedInfoFabricRecipe] = useState<any>(null); // Información de la receta del tejido seleccionado
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState<boolean>(false);

  // FRAMEWORK

  const [inputText, setInputText] = useState("");
  const [isSmallScreen, setIsSmallScreen] = useState(false); // Estado de tamaño de pantalla
  const [isMediumScreen, setIsMediumScreen] = useState(false);  // Estado de tamaño de pantalla
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
  }, [period]);
  

  useEffect(() => {
    const savedEntryNumber = localStorage.getItem("entryNumber");
    if (savedEntryNumber) {
      const parsedPayload = JSON.parse(savedEntryNumber);
      loadIngresoDetails(parsedPayload); // Carga los detalles del ingreso
      //setSelectedGroups(parsedPayload.groups || []); // Preselecciona los grupos
      localStorage.removeItem("entryNumber"); // Limpia el localStorage después de cargar
    }
  
    loadIngresosAndOrders();
    loadSupplierData();
    loadFabricTypes();
  }, []);

  const handleRemoveEntry = (entryNumber: string) => {
    setselectedEntries((prev) => prev.filter((entry) => entry.entryNumber !== entryNumber));
    showSnackbar("Entrada eliminada.", "success");
  };
  
  const loadIngresoDetails = async (ingreso: string) => {
    try {
      const response = await fetchYarnPurchaseEntryDetails(ingreso.entryNumber, period);
      setDataIngreso((prev) => ({
        ...prev,
        detail: response.detail || [], 
      }));
      setselectedEntries((prev) => {
        if (!prev.some((r) => r.entryNumber === ingreso.entryNumber)) {
          return [...prev, ingreso];
        }
        return prev;
      });
      showSnackbar("Entrada añadida.", "success");
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
      if (!ordenesServicio || ordenesServicio.length === 0) {
        return; // Salimos de la función si no hay órdenes de servicio
      }
      const response = await fetchYarnIncomeEntries(period,ordenesServicio[0].id);
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
      loadFabricInfo(serviceOrderDetails.detail); // Carga la información del tejido
      sleepES5(120); // Espera 75ms antes de cargar la información
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
      } catch (error) {
        console.error("Error al cargar los datos del hilo:", error);
      }
    };

    const handleOpenYarnEntryInfoDialog = async (yarnEntryNumber: string) => {
      setOpenYarnEntryInfoDialog(true);
      setYarnEntriesByEntryNumber(null);
      try {
        const data = await fetchYarnEntriesByEntryNumber(period, yarnEntryNumber);
        setYarnEntriesByEntryNumber(data);
        setYarnEntriesByEntryNumberDetail(data.detail);
      } catch (error) {
        console.error("Error al cargar los datos del hilo:", error);
        }
    };

    const handleOpenYarnDialog = async (yarnId: string) => {
      setOpenYarnDialog(true);
      setSelectedInfoYarn(null);
      try {
        const data = await fetchYarnbyId(yarnId);
        setSelectedInfoYarn(data);
      } catch (error) {
        console.error("Error al cargar los datos del hilo:", error);
      }
    };

    const handleCloseFabricDialog = () => {
      setOpenFabricDialog(false);
    };

    const handleCloseYarnEntryInfoDialog = () => {
      setOpenYarnEntryInfoDialog(false);
    };

    const handleCloseYarnDialog = () => {
      setOpenYarnDialog(false);
    };
  
    interface Ingreso {
      numeroIngreso: string;
      pesoNeto: number;
      paquetesRestantes: number;
      conosRestantes: number;
      asignado: number;
      paquetesAsignados: number;
      conosAsignados: number;
    }

    const handleDistribuir = () => {
      let pesoRestante = cantidadRequerida;
      let nuevaSeleccion: YarnPurchaseEntry[] = [];
  
      // Ordenamos los ingresos disponibles de mayor a menor peso neto
      const ingresosOrdenados = selectedEntries.flatMap(entry => entry.detailHeavy).sort((a, b) => b.netWeight - a.netWeight);
  
      for (let ingreso of ingresosOrdenados) {
        if (pesoRestante <= 0) break;
        let asignado = Math.min(pesoRestante, ingreso.netWeight);
        pesoRestante -= asignado;
  
        nuevaSeleccion.push({
          ...ingreso,
          netWeight: asignado,
          packageCount: ingreso.packageCount, // Editable
          coneCount: ingreso.coneCount, // Editable
        });
      }
  
      if (pesoRestante > 0) {
        showSnackbar("Error: No hay suficiente peso disponible.", "error");
        setIngresosSeleccionados([]);
      } else {
        setIngresosSeleccionados(nuevaSeleccion);
        console.log("Ingresos seleccionados:", nuevaSeleccion);
      }
    };
  
    const handleEditarIngreso = (index: number, campo: keyof YarnPurchaseEntry, valor: number) => {
      const copia = [...ingresosSeleccionados];
      copia[index] = { ...copia[index], [campo]: valor };
      setIngresosSeleccionados(copia);
    };

    const handleSaveSalida = async () => {
      // Validaciones previas
      if (!dataIngreso) {
        showSnackbar("Debe seleccionar un movimiento de ingreso.", "error");
        return;
      }
    
      if (!dataOS) {
        showSnackbar("Debe seleccionar una orden de servicio.", "error");
        return;
      }
    
      if (!selectedAddress) {
        showSnackbar("Debe seleccionar una dirección de proveedor.", "error");
        return;
      }
    
      if (selectedEntries.length === 0) {
        showSnackbar("Debe seleccionar al menos un grupo para generar la salida.", "error");
        return;
      }
    
      // Validación del proveedor
      const supplier = suppliers.find((supplier) => supplier.code === selectedSupplier);
      if (!supplier) {
        showSnackbar("El proveedor seleccionado no es válido.", "error");
        return;
      }
    
      console.log("Ingresos seleccionados para output:", selectedEntries);
      console.log("Fabric:", FabricInfo);

      const detail = selectedEntries.flatMap(entry =>
        entry.detailHeavy.map(g => ({
          itemNumber: g.itemNumber,
          entryNumber: g.ingressNumber, // Asegurar que sea el correcto
          entryGroupNumber: g.groupNumber, // Si aplica
          entryItemNumber: g.itemNumber, // Confirmar si este campo es correcto
          entryPeriod: g.period || 0, // Asegurar que no sea undefined
          coneCount: g.coneCount || 0,
          packageCount: g.packageCount || 0,
          netWeight: g.netWeight || 0,
          grossWeight: g.grossWeight || 0,
          fabricId: FabricInfo.id,
        }))
      );

      console.log("Detalle generado correctamente:", detail);

    
      if (detail.length === 0) {
        showSnackbar("No se encontraron datos válidos para procesar la salida.", "error");
        return;
      }
    
      const payload: YarnDispatch = {
        supplierCode: supplier.code,
        documentNote: null, // Ajustar según necesidad
        nrodir: selectedAddress,
        serviceOrderId: dataOS.id,
        detail,
      };
    
      console.log("Enviando payload:", JSON.stringify(payload, null, 2));
    
      try {
        const response = await createYarnDispatch(payload);
        showSnackbar("Movimiento de salida creado exitosamente.", "success");
        console.log("Respuesta del backend:", response);
    
        // Opcional: limpiar estados después de éxito
        setselectedEntries([]);
        setIngresosSeleccionados([]);
      } catch (error) {
        console.error("Error al guardar el movimiento de salida:", error);
        showSnackbar("Hubo un error al intentar guardar el movimiento de salida.", "error");
      }
    };
    
  
  const handleOpenIngresoDialog = () => 
    {FilterIngresosbySupplier();
      sleepES5(100);
    setIsIngresoDialogOpen(true);
    };
  const handleCloseIngresoDialog = () => setIsIngresoDialogOpen(false);

  const handleOpenServiceDialog = () => 
    {FilterServicebySupplier();
      sleepES5(100);
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
        {/* Orden de Servicio */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-lg">
            Orden de Servicio Asociada: {dataOS ? <strong>{dataOS.id}</strong> : "Ninguna"}
          </p>
          <div>
          <Tooltip title={selectedSupplier === "" ? "No hay órdenes de servicio disponibles" : ""} arrow>
            <span> {/* Necesario para envolver el botón cuando está deshabilitado */}
              <Button
                style={{
                  backgroundColor: selectedSupplier === "" ? "#BDBDBD" : "#1976d2",
                  color: "#fff",
                  cursor: selectedSupplier === "" ? "not-allowed" : "pointer",
                }}
                onClick={handleOpenServiceDialog}
                disabled={selectedSupplier === ""}
              >
                Seleccionar Orden de servicio
              </Button>
            </span>
          </Tooltip>
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

        {/* Movimiento de ingreso */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-lg">
            Movimiento de Ingreso Asociado:{" "}
            {dataIngreso ? <strong>{dataIngreso.entryNumber}</strong> : "Ninguno"}
          </p>
          <div>
            <Tooltip 
              title={!dataOS ? "Debe seleccionar una Orden de Servicio primero" : ""} 
              arrow
            >
              <span> {/* Necesario para que Tooltip funcione en un botón deshabilitado */}
                <Button
                  style={{
                    backgroundColor: !dataOS ? "#BDBDBD" : "#1976d2",
                    color: "#fff",
                    cursor: !dataOS ? "not-allowed" : "pointer",
                  }}
                  onClick={handleOpenIngresoDialog}
                  disabled={!dataOS} // Se deshabilita si NO hay orden de servicio seleccionada
                >
                  Seleccionar movimiento de ingreso
                </Button>
              </span>
            </Tooltip>
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
          <DialogTitle>Seleccionar movimiento de ingreso</DialogTitle>
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
                    <th className="px-4 py-4 font-normal">Peso Bruto</th>
                    <th className="px-4 py-4 font-normal">Peso Neto</th>
                    <th className="px-4 py-4 font-normal">Paquetes restantes</th>
                    <th className="px-4 py-4 font-normal">Conos restantes</th>
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
                      const detail = ingreso.detailHeavy?.[0] || {}; 
                      return (
                        <tr key={ingreso.entryNumber} className="text-center">
                          <td className="border-b border-gray-300 px-4 py-5">
                            {ingreso.entryNumber}<IconButton onClick={() => handleOpenYarnEntryInfoDialog(ingreso.entryNumber)}>
                          <VisibilityIcon 
                          style={{ color: "#1976d2" }}
                          />
                        </IconButton>
                        </td>
                          <td className="border-b border-gray-300 px-4 py-5">
                            {detail.grossWeight || "--"}
                          </td>
                          <td className="border-b border-gray-300 px-4 py-5">
                            {detail.netWeight || "--"}
                          </td>
                          <td className="border-b border-gray-300 px-4 py-5">
                            {detail.packagesLeft || "--"}
                          </td>
                          <td className="border-b border-gray-300 px-4 py-5">
                            {detail.conesLeft || "--"}
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

        <Dialog
            open={openYarnEntryInfoDialog}
            onClose={handleCloseYarnEntryInfoDialog}
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
                Información del movimiento de ingreso
              </h3>
              {selectYarnEntryInfo ? (
                <div className="mb-4 text-black">
                  <p className="mb-2"><strong>ID:</strong> {selectYarnEntryInfo.entryNumber} </p>
                  <p className="mb-2"><strong>Numero de orden de la compra:</strong> {selectYarnEntryInfo.purchaseOrderNumber} </p>
                  <p className="mb-2"><strong>Proveedor de lote:</strong> {selectYarnEntryInfo.supplierBatch} </p>
                  <p className="mb-2"><strong>Tipo de cambio:</strong> {selectYarnEntryInfo.exchangeRate} </p>
                  <p className="mb-2"><strong>Fecha de creación:</strong> {selectYarnEntryInfo.creationDate} </p>
                  <p className="mb-2"><strong>Tiempo de creación:</strong> {selectYarnEntryInfo.creationTime} </p>
                  <p className="mb-2"><strong>Notas del documento:</strong> {selectYarnEntryInfo.documentNote || "No hay notas"} </p>
                </div>
              ) : (
                <p>Cargando información...</p>
              )}
              <div className="max-w-full overflow-x-auto">
                <table className="w-full table-auto">
                <thead>
                  <tr className="bg-blue-900 text-white">
                    <th className="px-4 py-4 font-normal">Ítem</th>
                    <th className="px-4 py-4 font-normal">ID Hilo</th>
                    <th className="px-4 py-4 font-normal">Lote de proveedor</th>
                    <th className="px-4 py-4 font-normal">Peso Bruto</th>
                    <th className="px-4 py-4 font-normal">Peso Neto</th>
                    <th className="px-4 py-4 font-normal">Conos</th>
                    <th className="px-4 py-4 font-normal">Paquetes</th>
                  </tr>
                </thead>
                <tbody>
                  {selectYarnEntryInfoDetail?.map((ingreso: any, index: number) => {
                    const alreadySelected = selectedEntries.some(
                      (r) => r.yarnId === ingreso.yarnId
                    );
                    const detail = ingreso.detailHeavy?.[0] || {};
                    return (
                        <tr key={index} className="text-center">
                        <td className="border-b border-gray-300 px-4 py-5">{ingreso.itemNumber}</td>
                        <td className="border-b border-gray-300 px-4 py-5">
                          {ingreso.yarnId}
                        </td>
                        <td className="border-b border-gray-300 px-4 py-5">
                          {ingreso.supplierBatch}
                        </td>
                        <td className="border-b border-gray-300 px-4 py-5">
                          {ingreso.guideGrossWeight || "--"}
                        </td>
                        <td className="border-b border-gray-300 px-4 py-5">
                          {ingreso.guideNetWeight || "--"}
                        </td>
                        <td className="border-b border-gray-300 px-4 py-5">
                          {ingreso.guideConeCount || "--"}
                        </td>
                        <td className="border-b border-gray-300 px-4 py-5">
                          {ingreso.guidePackageCount || "--"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                </table>
              </div>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={handleCloseYarnEntryInfoDialog}
                variant="contained"
                style={{ backgroundColor: ERROR_COLOR, color: "#fff" }}
              >
                Cerrar
              </Button>
            </DialogActions>
          </Dialog>


        {/* Tabla de ingresos seleccionados */}
        {selectedEntries.length > 0 && (
            <div className="max-w-full overflow-x-auto mb-6">
              <h2 className="text-lg font-semibold mb-3">Ingresos Seleccionados</h2>
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-blue-900 uppercase text-center text-white">
                    <th className="border border-gray-300 px-4 py-2">Número de Ingreso</th>
                    <th className="border border-gray-300 px-4 py-2">Peso Bruto</th>
                    <th className="border border-gray-300 px-4 py-2">Peso Neto</th>
                    <th className="border border-gray-300 px-4 py-2">Paquetes Restantes</th>
                    <th className="border border-gray-300 px-4 py-2">Conos Restantes</th>
                    <th className="border border-gray-300 px-4 py-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedEntries.map((ingreso, index) => {
                    const detail = ingreso.detailHeavy?.[0] || {};
                    return (
                      <tr key={ingreso.entryNumber} className="text-center border-b border-gray-300">
                        <td className="border border-gray-300 px-4 py-2">{ingreso.entryNumber}</td>
                        <td className="border border-gray-300 px-4 py-2">{detail.grossWeight || "--"}</td>
                        <td className="border border-gray-300 px-4 py-2">{detail.netWeight || "--"}</td>
                        <td className="border border-gray-300 px-4 py-2">{detail.packagesLeft || "--"}</td>
                        <td className="border border-gray-300 px-4 py-2">{detail.conesLeft || "--"}</td>
                        <td className="border border-gray-300 px-4 py-2">
                          <IconButton color="secondary" onClick={() => handleRemoveEntry(ingreso.entryNumber)}>
                            <RemoveIcon />
                          </IconButton>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
        )}
          
        {/* Tabla de detalles de ingreso */}
        {dataIngreso && (
            <div className="max-w-full overflow-x-auto mb-6">
              <h2 className="text-lg font-semibold mb-3">Detalles del Movimiento de Ingreso</h2>
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-blue-900 uppercase text-center text-white">
                    <th className="border border-gray-300 px-4 py-2">#</th>
                    <th className="border border-gray-300 px-4 py-2">Hilado</th>
                    <th className="border border-gray-300 px-4 py-2">Peso Bruto</th>
                    <th className="border border-gray-300 px-4 py-2">Peso Neto</th>
                  </tr>
                </thead>
                <tbody>
                  {dataIngreso.detail.map((item: any, index: number) =>
                    item.detailHeavy.map((group: any, groupIndex: number) => (
                      <tr key={`${index}-${groupIndex}`} className="text-center border-b border-gray-300">
                        <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
                        <td className="border border-gray-300 px-4 py-2">{item.yarnId}</td>
                        <td className="border border-gray-300 px-4 py-2">{group.grossWeight}</td>
                        <td className="border border-gray-300 px-4 py-2">{group.netWeight}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

        {selectedEntries.length > 0 && (
          <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            label="Cantidad Requerida (kg)"
            type="number"
            value={cantidadRequerida}
            onChange={(e) => setCantidadRequerida(parseFloat(e.target.value) || 0)}
            variant="outlined"
            sx={{
              width: "25%", // Ocupa solo 1/4 del ancho
              minWidth: "150px", // Evita que sea muy pequeño
              "& input": {
                appearance: "textfield",
              },
              "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": {
                appearance: "none",
                margin: 0,
              },
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.1)",
              },
            }}
          />

          <Button
            onClick={handleDistribuir}
            variant="contained"
            sx={{
              backgroundColor: "#1976D2 !important",
              color: "white !important",
              fontWeight: "bold",
              textTransform: "uppercase",
              padding: "8px 16px",
              borderRadius: "4px",
              boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
              "&:hover": {
                backgroundColor: "#1565C0 !important",
              },
            }}
          >
            Distribuir
          </Button>
        </Stack>
        )}

        
       {/* Mostrar ingresos seleccionados */}
      <Grid container spacing={2} sx={{ marginTop: 2 }}>
        {ingresosSeleccionados.map((ingreso, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card sx={{ borderRadius: "12px", boxShadow: "0px 4px 10px rgba(0,0,0,0.1)" }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold">
                  Hilado: {ingreso.yarnId}
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  Peso Asignado: <strong>{ingreso.netWeight} kg</strong>
                </Typography>

                {/* Contenedor para inputs alineados */}
                <Grid container spacing={1} sx={{ marginTop: 1 }}>
                  <Grid item xs={6}>
                    <TextField
                      label="Paquetes"
                      type="number"
                      value={ingreso.packageCount}
                      onChange={(e) => handleEditarIngreso(index, "packageCount", parseInt(e.target.value) || 0)}
                      fullWidth
                      variant="outlined"
                      sx={{
                        "& input": {
                          appearance: "textfield",
                        },
                        "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": {
                          appearance: "none",
                          margin: 0,
                        },
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "8px",
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <TextField
                      label="Conos"
                      type="number"
                      value={ingreso.coneCount}
                      onChange={(e) => handleEditarIngreso(index, "coneCount", parseInt(e.target.value) || 0)}
                      fullWidth
                      variant="outlined"
                      sx={{
                        "& input": {
                          appearance: "textfield",
                        },
                        "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": {
                          appearance: "none",
                          margin: 0,
                        },
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "8px",
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

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

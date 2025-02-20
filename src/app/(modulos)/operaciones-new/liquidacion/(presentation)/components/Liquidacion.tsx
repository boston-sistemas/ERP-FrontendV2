"use client";

import React, { useState, useEffect } from "react";
import {
  TablePagination,
  IconButton,
  Button,
  TextField,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  useMediaQuery,
  Menu,
} from "@mui/material";
import {
  Edit,
  Visibility,
  Search,
  Close,
  Add,
  FilterList,
} from "@mui/icons-material";

interface Liquidacion {
  "Orden/Serv": string;
  "Fecha Doc.": string;
  "Hilado": string;
  "Salida": number;
  "Ingreso": number;
  "Estado": string;
  "Merma Teórica": number;
  "Información de Ingreso": string;
  "Stock Actual": number;
}

const Liquidacion: React.FC = () => {
  // ────────────────────────────────────────────────────────────────────────────
  // Estados generales
  // ────────────────────────────────────────────────────────────────────────────
  const [liquidaciones, setLiquidaciones] = useState<Liquidacion[]>([]);
  const [pagina, setPagina] = useState(0);
  const [filasPorPagina, setFilasPorPagina] = useState(10);

  // Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );

  // Para filtro/búsqueda
  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFilter, setEstadoFilter] = useState<string>("");

  // Diálogos
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedLiquidacion, setSelectedLiquidacion] = useState<Liquidacion | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Estado para el diálogo de información de ingreso
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);

  // Estado para el diálogo de "Cerrado con merma irregular"
  const [irregularMermaDialogOpen, setIrregularMermaDialogOpen] = useState(false);

  // Estado para el diálogo de detalles del hilado
  const [yarnDetailDialogOpen, setYarnDetailDialogOpen] = useState(false);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down("md"));

  // Estados del Form de edición
  const [editForm, setEditForm] = useState<{
    "Orden/Serv": string;
    "Fecha Doc.": string;
    "Hilado": string;
    "Salida": number;
    "Ingreso": number;
    "Estado": string;
    "Merma Teórica": number;
    "Información de Ingreso": string;
    "Stock Actual": number;
  }>({
    "Orden/Serv": "",
    "Fecha Doc.": "",
    "Hilado": "",
    "Salida": 0,
    "Ingreso": 0,
    "Estado": "",
    "Merma Teórica": 0,
    "Información de Ingreso": "",
    "Stock Actual": 0,
  });

  // Estados para el filtro de fecha
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Datos hardcodeados para las tablas
  const detalleIngreso = [
    { tejido: "JLL140", ancho: 90, fecha: "09/01/25", hilo: 100, pesoGuia: 812.40, ingresoMecsa: 812.40, consumoHilo: 812.40 },
    { tejido: "RLK240", ancho: 80, fecha: "09/01/25", hilo: 99, pesoGuia: 203.40, ingresoMecsa: 201.37, consumoHilo: 201.37 },
  ];

  const resumenIngreso = [
    { tejido: "JLL140", ancho: 90, fecha: "09/01/25", hilo: 100, pesoGuia: 812.40, ingresoMecsa: 812.40, consumoHilo: 812.40 },
    { tejido: "RLK240", ancho: 80, fecha: "09/01/25", hilo: 99, pesoGuia: 203.40, ingresoMecsa: 201.37, consumoHilo: 201.37 },
  ];

  // Datos del hilado para el diálogo
  const yarnDetails = {
    "Proveedor Tejeduria": "TRICOT FINE S.A",
    "Proveedor Hilado": "SAN IGNACIO",
    "Hilado": "HILADO 30/1 DE ALGODON PEINADO AMERICANO",
    "Titulo": "30/1",
    "Fibra": "ALGODON",
    "Procedencia": "AMERICANO",
    "Acabado": "PEINADO",
    "Lote hilo": "GSI-P047",
    "Guia Mecsa": 40053534,
    "Tejido": "RLK240",
    "Nombre": "Rib Licrado 30/1 Algodon Americano Peinado + 20dn de ancho 80",
    "Ancho": 80,
    "Galga": 20,
    "Diametro": 30,
    "LM": 2.8,
    "Kilogramos": 3000.00,
    "Consumo": 2975.57,
    "Restante": 24.43,
    "Merma": "0.81%",
    "Estado": "CERRADO",
    "Saldo Recogido": true,
    "Liquidado": true,
    "Orden de Compra": 10013708,
  };

  // Datos para las tablas
  const envioDevolucionData = [
    {
      ordenServ: "RSA0174",
      tipo: "S",
      noDocumento: "T1040001657",
      fechaDoc: "10/02/2025",
      ordenServ2: "H301PCOITC",
      nroBolsas: 27,
      nroConos: 648,
      pesoNeto: 1224.72,
      pesoBruto: 1293.84,
    },
  ];

  const ajusteVentasData: any[] = [];

  const consumoMermaData: any[] = [];

  // ────────────────────────────────────────────────────────────────────────────
  // Datos Hardcodeados para Prueba
  // ────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const datosPrueba: Liquidacion[] = [
      {
        "Orden/Serv": "TRI1749",
        "Fecha Doc.": "17/02/2025",
        "Hilado": "H301PCOITC",
        "Salida": 1942.45,
        "Ingreso": 1901.76,
        "Estado": "X",
        "Merma Teórica": 2.090,
        "Información de Ingreso": "",
        "Stock Actual": 20000,
      },
      {
        "Orden/Serv": "TRI1764",
        "Fecha Doc.": "12/02/2025",
        "Hilado": "H301PCOITC",
        "Salida": 247.38,
        "Ingreso": 211.05,
        "Estado": "P",
        "Merma Teórica": 14.686,
        "Información de Ingreso": "",
        "Stock Actual": 15000,
      },
      {
        "Orden/Serv": "TRI1767",
        "Fecha Doc.": "04/02/2025",
        "Hilado": "H301PCOITC",
        "Salida": 2031.90,
        "Ingreso": 1993.04,
        "Estado": "P",
        "Merma Teórica": 1.912,
        "Información de Ingreso": "",
        "Stock Actual": 10000,
      }
    ];
    setLiquidaciones(datosPrueba);
  }, []);

  // ────────────────────────────────────────────────────────────────────────────
  // FILTROS
  // ────────────────────────────────────────────────────────────────────────────
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Funciones para manejar el menú de búsqueda avanzada
  const handleAdvancedSearchClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleAdvancedSearchClose = () => {
    setAnchorEl(null);
  };

  // Modificar la lógica de filtrado para incluir las fechas
  const filteredLiquidaciones = liquidaciones.filter((liquidacion) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      liquidacion["Orden/Serv"].toLowerCase().includes(searchLower) ||
      liquidacion["Fecha Doc."].includes(searchLower);

    const matchesEstado = estadoFilter ? liquidacion["Estado"] === estadoFilter : true;

    const matchesStartDate = startDate ? new Date(liquidacion["Fecha Doc."]) >= new Date(startDate) : true;
    const matchesEndDate = endDate ? new Date(liquidacion["Fecha Doc."]) <= new Date(endDate) : true;

    return matchesSearch && matchesEstado && matchesStartDate && matchesEndDate;
  });

  // ────────────────────────────────────────────────────────────────────────────
  // MANEJO DE DIÁLOGOS
  // ────────────────────────────────────────────────────────────────────────────
  const handleOpenDetailDialog = (liquidacion: Liquidacion) => {
    setSelectedLiquidacion(liquidacion);
    setDetailDialogOpen(true);
  };

  const handleCloseDetailDialog = () => {
    setSelectedLiquidacion(null);
    setDetailDialogOpen(false);
  };

  const handleOpenEditDialog = (liquidacion: Liquidacion) => {
    setSelectedLiquidacion(liquidacion);
    setEditForm({
      "Orden/Serv": liquidacion["Orden/Serv"],
      "Fecha Doc.": liquidacion["Fecha Doc."],
      "Hilado": liquidacion["Hilado"],
      "Salida": liquidacion["Salida"],
      "Ingreso": liquidacion["Ingreso"],
      "Estado": liquidacion["Estado"],
      "Merma Teórica": liquidacion["Merma Teórica"],
      "Información de Ingreso": liquidacion["Información de Ingreso"],
      "Stock Actual": liquidacion["Stock Actual"],
    });
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setSelectedLiquidacion(null);
    setEditDialogOpen(false);
  };

  // Funciones para manejar el diálogo de información de ingreso
  const handleInfoDialogOpen = () => {
    setInfoDialogOpen(true);
  };

  const handleInfoDialogClose = () => {
    setInfoDialogOpen(false);
  };

  // Función para manejar la apertura del diálogo
  const handleIrregularMermaDialogOpen = () => {
    setIrregularMermaDialogOpen(true);
  };

  // Función para manejar el cierre del diálogo
  const handleIrregularMermaDialogClose = () => {
    setIrregularMermaDialogOpen(false);
  };

  // Función para manejar la apertura del diálogo de detalles del hilado
  const handleYarnDetailDialogOpen = () => {
    setYarnDetailDialogOpen(true);
  };

  // Función para manejar el cierre del diálogo de detalles del hilado
  const handleYarnDetailDialogClose = () => {
    setYarnDetailDialogOpen(false);
  };

  // ────────────────────────────────────────────────────────────────────────────
  // MANEJO DE FORMULARIOS
  // ────────────────────────────────────────────────────────────────────────────
  const handleEditFormChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: name === "Salida" || name === "Ingreso" ? parseFloat(value) : value,
    }));
  };

  const handleSaveEdit = () => {
    if (selectedLiquidacion) {
      const updatedLiquidaciones = liquidaciones.map((liquidacion) =>
        liquidacion["Orden/Serv"] === selectedLiquidacion["Orden/Serv"]
          ? { ...liquidacion, ...editForm }
          : liquidacion
      );
      setLiquidaciones(updatedLiquidaciones);
      setSnackbarMessage("Liquidación actualizada exitosamente.");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      handleCloseEditDialog();
    }
  };

  // ────────────────────────────────────────────────────────────────────────────
  // MANEJO DE SNACKBAR
  // ────────────────────────────────────────────────────────────────────────────
  const handleCloseSnackbar = () => setSnackbarOpen(false);

  // Funciones para manejar las acciones de los botones
  const handleGenerarConsumo = (ordenServ: string) => {
    console.log(`Generar consumo para la orden: ${ordenServ}`);
    // Implementar la lógica para generar consumo
  };

  const handleCerrarOrden = (ordenServ: string) => {
    console.log(`Cerrar orden para la orden: ${ordenServ}`);
    // Implementar la lógica para cerrar la orden
  };

  // ────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default sm:px-7.5 xl:pb-1">
        {/* Barra superior */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-gray-300 rounded-md px-2">
              <Search />
              <TextField
                variant="standard"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={handleSearch}
                InputProps={{
                  disableUnderline: true,
                }}
              />
            </div>
            {/* Selector de Estado */}
            <FormControl
              variant="outlined"
              sx={{
                minWidth: 180,
                marginLeft: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  backgroundColor: 'white',
                  '&:hover fieldset': {
                    borderColor: '#2563eb',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#4B5563',
                },
              }}
            >
              <InputLabel id="estado-select-label">Estado</InputLabel>
              <Select
                labelId="estado-select-label"
                id="estado-select"
                value={estadoFilter}
                onChange={(e) => setEstadoFilter(e.target.value)}
                label="Estado"
                sx={{
                  height: '40px',
                  '& .MuiSelect-select': {
                    paddingY: '8px',
                  }
                }}
              >
                <MenuItem value="">
                  Todos
                </MenuItem>
                <MenuItem value="P" >Pendiente</MenuItem>
                <MenuItem value="X" >Por Liquidar</MenuItem>
                <MenuItem value="C" >Cerrado</MenuItem>
              </Select>
            </FormControl>

            {/* Botón de Búsqueda Avanzada */}
            <Button
              startIcon={<FilterList />}
              variant="outlined"
              onClick={handleAdvancedSearchClick}
            >
              Filtrar por fecha
            </Button>
          </div>
        </div>

        {/* Menú de Búsqueda Avanzada */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleAdvancedSearchClose}
        >
          <div className="p-4 space-y-2" style={{ maxWidth: "300px" }}>
            <TextField
              label="Fecha Inicio"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
              fullWidth
            />
            <TextField
              label="Fecha Fin"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
              fullWidth
            />
          </div>
        </Menu>

        {/* Tabla principal */}
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-blue-900 uppercase text-center text-white">
                <th className="px-4 py-4 font-normal">Orden/Serv</th>
                <th className="px-4 py-4 font-normal">Fecha Doc.</th>
                <th className="px-4 py-4 font-normal">Hilado</th>
                <th className="px-4 py-4 font-normal">Salida</th>
                <th className="px-4 py-4 font-normal">Ingreso</th>
                <th className="px-4 py-4 font-normal">Stock Actual</th>
                <th className="px-4 py-4 font-normal">Estado</th>
                <th className="px-4 py-4 font-normal">Información de Ingreso</th>
                <th className="px-4 py-4 font-normal">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredLiquidaciones.length > 0 ? (
                filteredLiquidaciones
                  .slice(
                    pagina * filasPorPagina,
                    pagina * filasPorPagina + filasPorPagina
                  )
                  .map((liquidacion) => (
                    <tr key={liquidacion["Orden/Serv"]} className="text-center text-black">
                      <td className="border-b border-gray-300 px-4 py-5">
                        {liquidacion["Orden/Serv"]}
                      </td>
                      <td className="border-b border-gray-300 px-4 py-5">
                        {liquidacion["Fecha Doc."]}
                      </td>
                      <td className="border-b border-gray-300 px-4 py-5">
                        {liquidacion["Hilado"]}
                        <IconButton onClick={handleYarnDetailDialogOpen}>
                          <Visibility />
                        </IconButton>
                      </td>
                      <td className="border-b border-gray-300 px-4 py-5">
                        {liquidacion["Salida"].toFixed(2)} KG
                      </td>
                      <td className="border-b border-gray-300 px-4 py-5">
                        {liquidacion["Ingreso"].toFixed(2)} KG
                      </td>
                      <td className="border-b border-gray-300 px-4 py-5">
                        {liquidacion["Stock Actual"]}
                      </td>
                      <td className="border-b border-gray-300 px-4 py-5">
                        {liquidacion["Estado"]}
                      </td>
                      <td className="border-b border-gray-300 px-4 py-5">
                        {liquidacion["Información de Ingreso"]}
                        <IconButton onClick={handleInfoDialogOpen}>
                          <Visibility />
                        </IconButton>
                      </td>
                      <td className="border-b border-gray-300 px-4 py-5">
                        <Button
                          variant="contained"
                          style={{ backgroundColor: "#1976d2", color: "#fff" }}
                          onClick={handleIrregularMermaDialogOpen}
                        >
                          Cerrado con merma irregular
                        </Button>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan={10} className="pt-5 pb-5 text-center text-black">
                    No hay datos disponibles
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredLiquidaciones.length}
            rowsPerPage={filasPorPagina}
            page={pagina}
            onPageChange={(_, newPage) => setPagina(newPage)}
            onRowsPerPageChange={(e) =>
              setFilasPorPagina(parseInt(e.target.value, 10))
            }
          />
        </div>
      </div>

      {/* Diálogo para VISUALIZAR detalles de Liquidación */}
      <Dialog
        open={detailDialogOpen}
        onClose={handleCloseDetailDialog}
        fullScreen={isSmallScreen}
        maxWidth="sm"
        PaperProps={{
          sx: {
            ...( !isSmallScreen && !isMediumScreen && {
              marginLeft: "280px",
              maxWidth: "600px",
            }),
            maxHeight: "calc(100% - 64px)",
            overflowY: "auto",
            padding: "20px",
          },
        }}
      >
        <DialogTitle>Detalles de Liquidación</DialogTitle>
        <DialogContent>
          {selectedLiquidacion && (
            <div className="mb-4 text-black">
              <p className="mb-2"><strong>Orden/Serv:</strong> {selectedLiquidacion["Orden/Serv"]}</p>
              <p className="mb-2"><strong>Fecha Doc.:</strong> {selectedLiquidacion["Fecha Doc."]}</p>
              <p className="mb-2"><strong>Hilado:</strong> {selectedLiquidacion["Hilado"]}</p>
              <p className="mb-2"><strong>Salida:</strong> {selectedLiquidacion["Salida"].toFixed(2)} KG</p>
              <p className="mb-2"><strong>Ingreso:</strong> {selectedLiquidacion["Ingreso"].toFixed(2)} KG</p>
              <p className="mb-2"><strong>Estado:</strong> {selectedLiquidacion["Estado"]}</p>
              <p className="mb-2"><strong>Merma Teórica:</strong> {selectedLiquidacion["Merma Teórica"]}</p>
              <p className="mb-2"><strong>Información de Ingreso:</strong> {selectedLiquidacion["Información de Ingreso"]}</p>
              <p className="mb-2"><strong>Stock Actual:</strong> {selectedLiquidacion["Stock Actual"]}</p>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseDetailDialog}
            variant="contained"
            style={{ backgroundColor: "#d32f2f", color: "#fff" }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para CREAR / EDITAR Liquidación */}
      <Dialog
        open={editDialogOpen}
        onClose={handleCloseEditDialog}
        fullScreen={isSmallScreen}
        maxWidth="sm"
        PaperProps={{
          sx: {
            ...( !isSmallScreen && !isMediumScreen && {
              marginLeft: "280px",
              maxWidth: "600px",
            }),
            maxHeight: "calc(100% - 64px)",
            overflowY: "auto",
            padding: "20px",
          },
        }}
      >
        <DialogTitle>{selectedLiquidacion ? "Editar Liquidación" : "Crear Liquidación"}</DialogTitle>
        <DialogContent>
          <form className="space-y-4">
            <TextField
              label="Orden/Serv"
              name="Orden/Serv"
              fullWidth
              value={editForm["Orden/Serv"]}
              onChange={handleEditFormChange}
            />
            <TextField
              label="Fecha Doc."
              name="Fecha Doc."
              type="date"
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              value={editForm["Fecha Doc."] || ""}
              onChange={handleEditFormChange}
            />
            <TextField
              label="Hilado"
              name="Hilado"
              fullWidth
              value={editForm["Hilado"]}
              onChange={handleEditFormChange}
            />
            <TextField
              label="Salida"
              name="Salida"
              type="number"
              fullWidth
              value={editForm["Salida"]}
              onChange={handleEditFormChange}
            />
            <TextField
              label="Ingreso"
              name="Ingreso"
              type="number"
              fullWidth
              value={editForm["Ingreso"]}
              onChange={handleEditFormChange}
            />
            <TextField
              label="Estado"
              name="Estado"
              select
              fullWidth
              SelectProps={{
                native: true,
              }}
              value={editForm["Estado"]}
              onChange={handleEditFormChange}
            >
              <option value="">Seleccione...</option>
              <option value="P">Pendiente</option>
              <option value="X">Por Liquidar</option>
              <option value="C">Cerrado</option>
            </TextField>
            <TextField
              label="Merma Teórica"
              name="Merma Teórica"
              type="number"
              fullWidth
              value={editForm["Merma Teórica"]}
              onChange={handleEditFormChange}
            />
            <TextField
              label="Información de Ingreso"
              name="Información de Ingreso"
              multiline
              rows={4}
              fullWidth
              value={editForm["Información de Ingreso"]}
              onChange={handleEditFormChange}
            />
            <TextField
              label="Stock Actual"
              name="Stock Actual"
              type="number"
              fullWidth
              value={editForm["Stock Actual"]}
              onChange={handleEditFormChange}
            />
          </form>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseEditDialog}
            variant="contained"
            style={{ backgroundColor: "#d32f2f", color: "#fff" }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSaveEdit}
            variant="contained"
            style={{ backgroundColor: "#1976d2", color: "#fff" }}
          >
            {selectedLiquidacion ? "Guardar Cambios" : "Crear"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de Información de Ingreso */}
      <Dialog
        open={infoDialogOpen}
        onClose={handleInfoDialogClose}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Información de Ingreso</DialogTitle>
        <DialogContent>
          <h3 className="text-lg font-semibold text-black mb-4">DETALLE DE INGRESO</h3>
          <table className="w-full table-auto mb-6">
            <thead>
              <tr className="bg-blue-900 uppercase text-center text-white">
                <th className="px-4 py-4 font-normal">Tejido</th>
                <th className="px-4 py-4 font-normal">Ancho</th>
                <th className="px-4 py-4 font-normal">Fecha</th>
                <th className="px-4 py-4 font-normal">%Hilo</th>
                <th className="px-4 py-4 font-normal">Hilado Usado</th>
                <th className="px-4 py-4 font-normal">Peso Guia</th>
                <th className="px-4 py-4 font-normal">Ingreso Mecsa</th>
                <th className="px-4 py-4 font-normal">Consumo Hilo</th>
              </tr>
            </thead>
            <tbody>
              {detalleIngreso.map((detalle, index) => (
                <tr key={index} className="text-center text-black">
                  <td className="border-b border-gray-300 px-4 py-5">{detalle.tejido}</td>
                  <td className="border-b border-gray-300 px-4 py-5">{detalle.ancho}</td>
                  <td className="border-b border-gray-300 px-4 py-5">{detalle.fecha}</td>
                  <td className="border-b border-gray-300 px-4 py-5">{detalle.hilo}</td>
                  <td className="border-b border-gray-300 px-4 py-5">
                    <IconButton>
                      <Visibility />
                    </IconButton>
                  </td>
                  <td className="border-b border-gray-300 px-4 py-5">{detalle.pesoGuia}</td>
                  <td className="border-b border-gray-300 px-4 py-5">{detalle.ingresoMecsa}</td>
                  <td className="border-b border-gray-300 px-4 py-5">{detalle.consumoHilo}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 className="text-lg font-semibold text-black mb-4">RESUMEN DE INGRESO</h3>
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-blue-900 uppercase text-center text-white">
                <th className="px-4 py-4 font-normal">Tejido</th>
                <th className="px-4 py-4 font-normal">Ancho</th>
                <th className="px-4 py-4 font-normal">Fecha</th>
                <th className="px-4 py-4 font-normal">%Hilo</th>
                <th className="px-4 py-4 font-normal">Hilado Usado</th>
                <th className="px-4 py-4 font-normal">Peso Guia</th>
                <th className="px-4 py-4 font-normal">Ingreso Mecsa</th>
                <th className="px-4 py-4 font-normal">Consumo Hilo</th>
              </tr>
            </thead>
            <tbody>
              {resumenIngreso.map((resumen, index) => (
                <tr key={index} className="text-center text-black">
                  <td className="border-b border-gray-300 px-4 py-5">{resumen.tejido}</td>
                  <td className="border-b border-gray-300 px-4 py-5">{resumen.ancho}</td>
                  <td className="border-b border-gray-300 px-4 py-5">{resumen.fecha}</td>
                  <td className="border-b border-gray-300 px-4 py-5">{resumen.hilo}</td>
                  <td className="border-b border-gray-300 px-4 py-5">
                    <IconButton>
                      <Visibility />
                    </IconButton>
                  </td>
                  <td className="border-b border-gray-300 px-4 py-5">{resumen.pesoGuia}</td>
                  <td className="border-b border-gray-300 px-4 py-5">{resumen.ingresoMecsa}</td>
                  <td className="border-b border-gray-300 px-4 py-5">{resumen.consumoHilo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleInfoDialogClose}
            variant="contained"
            style={{ backgroundColor: "#d32f2f", color: "#fff" }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de Detalles del Hilado */}
      <Dialog
        open={yarnDetailDialogOpen}
        onClose={handleYarnDetailDialogClose}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Detalles del Hilado</DialogTitle>
        <DialogContent>
          <div className="space-y-6">
            <div className="p-4 border rounded-md shadow-sm bg-gray-50">
              <h3 className="font-semibold text-lg mb-2">Información del Hilado</h3>
              <div className="grid grid-cols-2 gap-4">
                <p><strong>Proveedor Tejeduria:</strong> {yarnDetails["Proveedor Tejeduria"]}</p>
                <p><strong>Proveedor Hilado:</strong> {yarnDetails["Proveedor Hilado"]}</p>
                <p><strong>Hilado:</strong> {yarnDetails["Hilado"]}</p>
                <p><strong>Título:</strong> {yarnDetails["Titulo"]}</p>
                <p><strong>Fibra:</strong> {yarnDetails["Fibra"]}</p>
                <p><strong>Procedencia:</strong> {yarnDetails["Procedencia"]}</p>
                <p><strong>Acabado:</strong> {yarnDetails["Acabado"]}</p>
                <p><strong>Lote hilo:</strong> {yarnDetails["Lote hilo"]}</p>
                <p><strong>Guia Mecsa:</strong> {yarnDetails["Guia Mecsa"]}</p>
              </div>
            </div>
            <div className="p-4 border rounded-md shadow-sm bg-gray-50">
              <h3 className="font-semibold text-lg mb-2">Tejido Asociado</h3>
              <div className="grid grid-cols-2 gap-4">
                <p><strong>Tejido:</strong> {yarnDetails["Tejido"]}</p>
                <p><strong>Nombre:</strong> {yarnDetails["Nombre"]}</p>
                <p><strong>Ancho:</strong> {yarnDetails["Ancho"]}</p>
                <p><strong>Galga:</strong> {yarnDetails["Galga"]}</p>
                <p><strong>Diametro:</strong> {yarnDetails["Diametro"]}</p>
                <p><strong>LM:</strong> {yarnDetails["LM"]}</p>
              </div>
            </div>
            <div className="p-4 border rounded-md shadow-sm bg-gray-50">
              <h3 className="font-semibold text-lg mb-2">Avance</h3>
              <div className="grid grid-cols-2 gap-4">
                <p><strong>Kilogramos:</strong> {yarnDetails["Kilogramos"]}</p>
                <p><strong>Consumo:</strong> {yarnDetails["Consumo"]}</p>
                <p><strong>Restante:</strong> {yarnDetails["Restante"]}</p>
                <p><strong>Merma:</strong> {yarnDetails["Merma"]}</p>
                <p><strong>Estado:</strong> {yarnDetails["Estado"]}</p>
                <p><strong>Saldo Recogido:</strong> {yarnDetails["Saldo Recogido"] ? "Sí" : "No"}</p>
                <p><strong>Liquidado:</strong> {yarnDetails["Liquidado"] ? "Sí" : "No"}</p>
                <p><strong>Orden de Compra:</strong> {yarnDetails["Orden de Compra"]}</p>
              </div>
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleYarnDetailDialogClose}
            variant="contained"
            style={{ backgroundColor: "#d32f2f", color: "#fff" }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para "Cerrado con merma irregular" */}
      <Dialog
        open={irregularMermaDialogOpen}
        onClose={handleIrregularMermaDialogClose}
        fullScreen={isSmallScreen}
        maxWidth="lg"
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
        <DialogTitle>Cerrado con Merma Irregular</DialogTitle>
        <DialogContent>
          <div className="space-y-6">
            {/* Cuadros de Tejido y Hilado */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-4 border rounded-md shadow-sm bg-gray-50">
                <h3 className="font-semibold text-lg mb-2">Tejido</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p><strong>Envío H:</strong> 1224.72</p>
                    <p><strong>Ingreso T:</strong> 0.00</p>
                    <p><strong>Saldo:</strong> 1224.72</p>
                    <p><strong>Merma %:</strong> 100.00</p>
                  </div>
                </div>
              </div>
              <div className="p-4 border rounded-md shadow-sm bg-gray-50">
                <h3 className="font-semibold text-lg mb-2">Hilado</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p><strong>Envío:</strong> 1224.72</p>
                    <p><strong>Consumo H:</strong> 0.00</p>
                    <p><strong>Saldo:</strong> 1224.72</p>
                    <p><strong>Merma %:</strong> 100.00</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Input y Botones */}
            <div className="flex items-center gap-4 mb-4">
              <TextField
                label="Merma Aprobada (%)"
                type="number"
                variant="outlined"
                size="small"
              />
              <Button
                variant="contained"
                style={{ backgroundColor: "#1976d2", color: "#fff" }}
              >
                Calcula Merma
              </Button>
              <Button
                variant="contained"
                style={{ backgroundColor: "#1976d2", color: "#fff" }}
              >
                Generar Consumo
              </Button>
            </div>

            {/* Tabla de Envío/Devolución de Hilado */}
            <div>
              <h3 className="font-semibold text-lg mb-2">Envío/Devolución de Hilado</h3>
              <table className="w-full table-auto mb-4">
                <thead>
                  <tr className="bg-blue-900 text-center text-white">
                    <th className="px-4 py-2">O/Serv</th>
                    <th className="px-4 py-2">Tipo</th>
                    <th className="px-4 py-2">No.Documento</th>
                    <th className="px-4 py-2">Fecha Doc.</th>
                    <th className="px-4 py-2">O/Serv</th>
                    <th className="px-4 py-2">NroBolsas</th>
                    <th className="px-4 py-2">NroConos</th>
                    <th className="px-4 py-2">PesoNeto</th>
                    <th className="px-4 py-2">PesoBruto</th>
                  </tr>
                </thead>
                <tbody>
                  {envioDevolucionData.map((item, index) => (
                    <tr key={index} className="text-center">
                      <td className="border px-4 py-2">{item.ordenServ}</td>
                      <td className="border px-4 py-2">{item.tipo}</td>
                      <td className="border px-4 py-2">{item.noDocumento}</td>
                      <td className="border px-4 py-2">{item.fechaDoc}</td>
                      <td className="border px-4 py-2">{item.ordenServ2}</td>
                      <td className="border px-4 py-2">{item.nroBolsas}</td>
                      <td className="border px-4 py-2">{item.nroConos}</td>
                      <td className="border px-4 py-2">{item.pesoNeto}</td>
                      <td className="border px-4 py-2">{item.pesoBruto}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Tabla de Ajuste/Ventas de Hilados */}
            <div>
              <h3 className="font-semibold text-lg mb-2">Ajuste/Ventas de Hilados</h3>
              <table className="w-full table-auto mb-4">
                <thead>
                  <tr className="bg-blue-900 text-center text-white">
                    <th className="px-4 py-2">O/Serv</th>
                    <th className="px-4 py-2">Tipo</th>
                    <th className="px-4 py-2">No.Documento</th>
                    <th className="px-4 py-2">Fecha Doc.</th>
                    <th className="px-4 py-2">O/Serv</th>
                    <th className="px-4 py-2">NroBolsas</th>
                    <th className="px-4 py-2">NroConos</th>
                    <th className="px-4 py-2">PesoNeto</th>
                    <th className="px-4 py-2">PesoBruto</th>
                  </tr>
                </thead>
                <tbody>
                  {ajusteVentasData.length > 0 ? (
                    ajusteVentasData.map((item, index) => (
                      <tr key={index} className="text-center">
                        <td className="border px-4 py-2">{item.ordenServ}</td>
                        <td className="border px-4 py-2">{item.tipo}</td>
                        <td className="border px-4 py-2">{item.noDocumento}</td>
                        <td className="border px-4 py-2">{item.fechaDoc}</td>
                        <td className="border px-4 py-2">{item.ordenServ2}</td>
                        <td className="border px-4 py-2">{item.nroBolsas}</td>
                        <td className="border px-4 py-2">{item.nroConos}</td>
                        <td className="border px-4 py-2">{item.pesoNeto}</td>
                        <td className="border px-4 py-2">{item.pesoBruto}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="text-center py-4 text-gray-500">
                        No hay datos disponibles.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Tabla de Consumo - Merma de Hilado (por Tejido) */}
            <div>
              <h3 className="font-semibold text-lg mb-2">Consumo - Merma de Hilado (por Tejido)</h3>
              <table className="w-full table-auto mb-4">
                <thead>
                  <tr className="bg-blue-900 text-center text-white">
                    <th className="px-4 py-2">O/Serv</th>
                    <th className="px-4 py-2">Tipo</th>
                    <th className="px-4 py-2">No.Documento</th>
                    <th className="px-4 py-2">Fecha Doc.</th>
                    <th className="px-4 py-2">O/Serv</th>
                    <th className="px-4 py-2">NroBolsas</th>
                    <th className="px-4 py-2">NroConos</th>
                    <th className="px-4 py-2">PesoNeto</th>
                    <th className="px-4 py-2">PesoBruto</th>
                  </tr>
                </thead>
                <tbody>
                  {consumoMermaData.length > 0 ? (
                    consumoMermaData.map((item, index) => (
                      <tr key={index} className="text-center">
                        <td className="border px-4 py-2">{item.ordenServ}</td>
                        <td className="border px-4 py-2">{item.tipo}</td>
                        <td className="border px-4 py-2">{item.noDocumento}</td>
                        <td className="border px-4 py-2">{item.fechaDoc}</td>
                        <td className="border px-4 py-2">{item.ordenServ2}</td>
                        <td className="border px-4 py-2">{item.nroBolsas}</td>
                        <td className="border px-4 py-2">{item.nroConos}</td>
                        <td className="border px-4 py-2">{item.pesoNeto}</td>
                        <td className="border px-4 py-2">{item.pesoBruto}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="text-center py-4 text-gray-500">
                        No hay datos disponibles.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleIrregularMermaDialogClose}
            variant="contained"
            style={{ backgroundColor: "#d32f2f", color: "#fff" }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={snackbarSeverity}
          onClose={handleCloseSnackbar}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Liquidacion;

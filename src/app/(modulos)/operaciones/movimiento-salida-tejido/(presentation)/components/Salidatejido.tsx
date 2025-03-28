"use client";

import React, { useState } from "react";
import useSWR from "swr";
import {
  TablePagination,
  IconButton,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  Typography,
  Dialog,
  DialogContent,
  DialogActions,
  Menu,
  Snackbar,
  Alert,
  Tooltip,
} from "@mui/material";
import { Visibility, Add, FilterList } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import {
  fetchDyeingServiceDispatches,
  fetchDyeingSuppliers,
  DyeingServiceDispatch,
  Supplier
} from "../../services/SalidaTejidoService";


const PRIMARY_COLOR = "#1976d2";
const ERROR_COLOR = "#d32f2f";

const getCurrentYear = () => new Date().getFullYear();
const generateYearOptions = (startYear: number) => {
  const currentYear = getCurrentYear();
  return Array.from({ length: currentYear - startYear + 1 }, (_, i) => startYear + i);
};

const SalidaTejido: React.FC = () => {
  const router = useRouter();
  const [pagina, setPagina] = useState(0);
  const [filasPorPagina, setFilasPorPagina] = useState(10);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [period, setPeriod] = useState(getCurrentYear());
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

  // Fetch de datos usando SWR
  const {
    data: dataSalidas,
    error: errorSalidas,
    isLoading: isLoadingSalidas,
  } = useSWR(
    ["dyeing-service-dispatches", period, pagina, includeInactive],
    async () => {
      return await fetchDyeingServiceDispatches(period, pagina + 1, includeInactive);
    },
    {
      refreshInterval: 0,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  // Fetch de proveedores
  const {
    data: dataProveedores,
    error: errorProveedores,
    isLoading: isLoadingProveedores,
  } = useSWR("dyeing-suppliers", fetchDyeingSuppliers, {
    refreshInterval: 0,
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
  });

  const handleCreateSalidaTejido = () => {
    router.push("/operaciones/movimiento-salida-tejido/crear");
  };

  const handleDetailsClick = (dispatchNumber: string) => {
    localStorage.setItem("selectedPeriod", JSON.stringify(period));
    router.push(`/operaciones/movimiento-salida-tejido/detalle/${dispatchNumber}`);
  };

  const handleAdvancedSearchClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleAdvancedSearchClose = () => {
    setAnchorEl(null);
  };

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

  // Función helper para obtener la dirección del proveedor
  const getSupplierAddress = (supplierCode: string, nrodir: string) => {
    const supplier = dataProveedores?.suppliers?.find(s => s.code === supplierCode);
    if (!supplier) return "No encontrado";

    // Asegurarse de que nrodir tenga el formato correcto (3 dígitos)
    const formattedNrodir = nrodir.padStart(3, '0');
    return supplier.addresses[formattedNrodir] || "Dirección no encontrada";
  };

  // Función helper para mostrar la dirección con tooltip
  const AddressInfo: React.FC<{ address: string }> = ({ address }) => {
    return (
      <Tooltip
        title={address}
        arrow
        placement="top"
      >
        <span className="cursor-help">
          {address.length > 30 ? `${address.substring(0, 30)}...` : address}
        </span>
      </Tooltip>
    );
  };

  // Función simplificada para mostrar el nombre del proveedor
  const getSupplierName = (supplierCode: string) => {
    const supplier = dataProveedores?.suppliers?.find(s => s.code === supplierCode);
    return supplier ? supplier.name : supplierCode;
  };

  return (
    <div className="space-y-5">
      <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <div className="max-w-full overflow-x-auto">
          <div className="flex items-center justify-start gap-2 mb-4">
            <Button
              startIcon={<FilterList />}
              variant="outlined"
              onClick={handleAdvancedSearchClick}
            >
              Filtrar por fecha
            </Button>

            <FormControlLabel
              control={
                <Switch
                  checked={includeInactive}
                  onChange={(e) => setIncludeInactive(e.target.checked)}
                  color="primary"
                />
              }
              label="Mostrar anulados"
            />

            <Typography variant="body2" className="font-semibold">
              Período:
            </Typography>
            <Select
              value={period}
              onChange={(e) => setPeriod(Number(e.target.value))}
              displayEmpty
              variant="outlined"
              size="small"
              style={{ width: "120px", backgroundColor: "#fff" }}
            >
              {generateYearOptions(2023).map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>

            <Button
              startIcon={<Add />}
              variant="contained"
              style={{ backgroundColor: PRIMARY_COLOR, color: "#fff", marginLeft: 'auto' }}
              onClick={handleCreateSalidaTejido}
            >
              CREAR
            </Button>
          </div>

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
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <TextField
                label="Fecha Fin"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </div>
          </Menu>

          <table className="w-full table-auto">
            <thead>
              <tr className="bg-blue-900 uppercase text-center">
                {[
                  "Nro Salida",
                  "Usuario",
                  "Proveedor",
                  "Estado",
                  "Dirección",
                  "Color",
                  "Notas",
                  "Periodo",
                  "Fecha",
                  "Detalles"
                ].map((col, index) => (
                  <th key={index} className="px-4 py-4 text-center font-normal text-white">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoadingSalidas ? (
                <tr>
                  <td colSpan={8} className="text-center py-4">
                    Cargando datos...
                  </td>
                </tr>
              ) : errorSalidas ? (
                <tr>
                  <td colSpan={8} className="text-center py-4 text-red-500">
                    Error al cargar los datos
                  </td>
                </tr>
              ) : dataSalidas?.dyeingServiceDispatches?.length ? (
                dataSalidas.dyeingServiceDispatches.map((salida, index) => (
                  <tr key={index} className="text-center text-black">
                    <td className="border-b border-[#eee] px-4 py-5">
                      {salida.dispatchNumber}
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5">
                      {salida.userId}
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5">
                      {getSupplierName(salida.supplierCode)}
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5">
                      {salida.statusFlag === 'A' ? 'Anulado' : 'Activo'}
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5">
                      <AddressInfo 
                        address={getSupplierAddress(salida.supplierCode, salida.nrodir)}
                      />
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5">
                      {salida.tintSupplierColorId}
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5">
                      <IconButton
                        color="primary"
                        onClick={() => handleDetailsClick(salida.dispatchNumber)}
                      >
                        <Visibility />
                      </IconButton>
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5">
                      {salida.period}
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5">
                      {salida.creationDate}
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5">
                      <IconButton
                        color="primary"
                        onClick={() => handleDetailsClick(salida.dispatchNumber)}
                      >
                        <Visibility />
                      </IconButton>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-4">
                    No se encontraron resultados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={dataSalidas?.total || 0}
            rowsPerPage={filasPorPagina}
            page={pagina}
            onPageChange={(_, newPage) => setPagina(newPage)}
            onRowsPerPageChange={(e) => setFilasPorPagina(parseInt(e.target.value, 10))}
            labelRowsPerPage="Filas por página:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
            }
          />
        </div>
      </div>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default SalidaTejido;

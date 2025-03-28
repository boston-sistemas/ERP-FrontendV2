"use client";

import React, { useState, useEffect } from "react";
import {
  TablePagination,
  IconButton,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  MenuItem,
  Select,
  Typography,
  Snackbar,
  Alert,
  Menu,
} from "@mui/material";
import { Visibility, Add, Close, Search, FilterList } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { WeavingServiceEntry, Supplier } from "../../../models/models";
import { fetchWeavingServiceEntries, fetchWeavingServiceEntryById, annulWeavingServiceEntry, checkWeavingServiceEntryIsUpdatable, fetchSuppliersT } from "../../services/IngresoTejidoService";

const getCurrentYear = () => new Date().getFullYear();
const generateYearOptions = (currentYear: number) => {
  return Array.from({ length: 4 }, (_, index) => currentYear - index);
};

const MovIngresoTejido: React.FC = () => {
    const router = useRouter();
    const [entries, setEntries] = useState<WeavingServiceEntry[]>([]);
    const [pagina, setPagina] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [filasPorPagina, setFilasPorPagina] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [includeInactive, setIncludeInactive] = useState(false);
    const [period, setPeriod] = useState(getCurrentYear());
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [showDeleted, setShowDeleted] = useState(false);
  
    useEffect(() => {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const response = await fetchWeavingServiceEntries(
            period,
            showDeleted,
            pagina,
            undefined,
            undefined,
            undefined,
            startDate || undefined,
            endDate || undefined
          );
          setEntries(response.weavingServiceEntries || []);
          setTotalItems(response.total);

          const supplierList = await fetchSuppliersT();
          setSuppliers(supplierList);
        } catch (error) {
          console.error("Error al cargar los datos:", error);
          showSnackbar("Error al cargar los datos", "error");
        } finally {
          setIsLoading(false);
        }
      };
  
      fetchData();
    }, [pagina, showDeleted, period, startDate, endDate]);
  
    const handleCreateEntry = () => {
      router.push("/operaciones-new/ingreso-tejido/crear-mov-ingreso-tejido");
    };
  
    const handleViewDetails = (entryNumber: string, period: number) => {
      router.push(`/operaciones-new/ingreso-tejido/detalles-mov-ingreso-tejido/${entryNumber}?period=${period}`);
    };
  
    const filteredEntries = entries.filter((entry) =>
      Object.values(entry).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  
    const handleChangePage = (event: unknown, newPage: number) => {
      setPagina(newPage + 1);
    };
  
    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
      setFilasPorPagina(parseInt(event.target.value, 10));
      setPagina(1);
    };
  
    const handleSnackbarClose = () => {
      setSnackbarOpen(false);
    };
  
    const showSnackbar = (message: string, severity: "success" | "error") => {
      setSnackbarMessage(message);
      setSnackbarSeverity(severity);
      setSnackbarOpen(true);
    };
  
    const handleAdvancedSearchClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(event.currentTarget);
    };
  
    const handleAdvancedSearchClose = () => {
      setAnchorEl(null);
    };
  
    const handleApplyFilter = () => {
      // Lógica para aplicar el filtro
      handleAdvancedSearchClose();
    };
  
    return (
      <div className="space-y-5">
        <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default sm:px-7.5 xl:pb-1">
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
                    checked={showDeleted}
                    onChange={(e) => setShowDeleted(e.target.checked)}
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
                {generateYearOptions(getCurrentYear()).map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>

              <Button
                startIcon={<Add />}
                variant="contained"
                style={{ backgroundColor: "#1976d2", color: "#fff", marginLeft: 'auto' }}
                onClick={() => router.push('/operaciones-new/ingreso-tejido/crear-mov-ingreso-tejido')}
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

            <table className="w-full h-full border-collapse table-auto">
              <thead>
                <tr className="bg-blue-900 uppercase text-center">
                  {[
                    "Nro Ingreso",
                    "Periodo",
                    "Fecha",
                    "Hora",
                    "Proveedor",
                    "Estado",
                    "Detalles",
                  ].map((col, index) => (
                    <th
                      key={index}
                      className="px-4 py-4 text-center font-normal text-white"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-black">
                      Cargando datos...
                    </td>
                  </tr>
                ) : filteredEntries.length > 0 ? (
                  filteredEntries.map((entry, index) => {
                    const supplierName = suppliers.find(s => s.code === entry.supplierCode)?.name || "Desconocido";
                    return (
                      <tr key={index} className="text-center text-black">
                        <td className="border-b border-[#eee] px-4 py-5">
                          {entry.entryNumber}
                        </td>
                        <td className="border-b border-[#eee] px-4 py-5">
                          {entry.period}
                        </td>
                        <td className="border-b border-[#eee] px-4 py-5">
                          {entry.creationDate}
                        </td>
                        <td className="border-b border-[#eee] px-4 py-5">
                          {entry.creationTime}
                        </td>
                        <td className="border-b border-[#eee] px-4 py-5">
                          {supplierName}
                        </td>
                        <td className="border-b border-[#eee] px-4 py-5">
                          {entry.promecStatus.name}
                        </td>
                        <td className="border-b border-[#eee] px-4 py-5">
                          <IconButton
                            color="primary"
                            onClick={() => handleViewDetails(entry.entryNumber, entry.period)}
                          >
                            <Visibility />
                          </IconButton>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-black">
                      No se encontraron resultados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
  
          <TablePagination
            component="div"
            count={totalItems}
            page={pagina - 1}
            rowsPerPage={filasPorPagina}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Filas por página:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
            }
            rowsPerPageOptions={[10, 25, 50]}
            className="text-black"
          />
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
            sx={{
              width: "100%",
              backgroundColor: snackbarSeverity === "success" ? "#1976d2" : "#d32f2f",
              color: "#fff",
            }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </div>
    );
  };
  
  export default MovIngresoTejido;
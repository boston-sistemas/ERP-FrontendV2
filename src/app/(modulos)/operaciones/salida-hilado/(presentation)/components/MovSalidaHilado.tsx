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
} from "@mui/material";
import { Visibility, Add, Close, Search } from "@mui/icons-material";
import { useRouter, useSearchParams } from "next/navigation";
import { YarnDispatch } from "../../../models/models";
import { fetchSuppliers } from "../../../ordenes-servicio/services/ordenesServicioService";
import { fetchYarnDispatches } from "../../services/movSalidaHiladoService";
import { Supplier } from "../../../models/models";

const MovSalidaHilado: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [dispatches, setDispatches] = useState<YarnDispatch[]>([]);
  const [pagina, setPagina] = useState(0);
  const [filasPorPagina, setFilasPorPagina] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [period, setPeriod] = useState(2025);

  // Estado para manejar el diálogo
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogContent, setDialogContent] = useState<string>("");

  // Cargar datos del servicio
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetchYarnDispatches(
          period, // Usar el período seleccionado
          filasPorPagina,
          pagina * filasPorPagina,
          includeInactive
        );
        const suppliers = await fetchSuppliers();
        setSuppliers(suppliers);
        setDispatches(response.yarnWeavingDispatches || []);
      } catch (error) {
        console.error("Error al cargar los datos:", error);
      } finally {
        setIsLoading(false);
      }
    };
    

    fetchData();
  }, [pagina, filasPorPagina, includeInactive, period]); // Actualizar cuando cambie el período

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleCreateMovSalidaHilado = () => {
    localStorage.removeItem("entryNumber");
    router.push("/operaciones/salida-hilado/crear-mov-salida-hilado");
  };

  const handleDetailsClick = (exitNumber: string, period: number) => {
    // En este caso, como query param
    router.push(
      `/operaciones/salida-hilado/detalles-mov-salida-hilado/${exitNumber}?period=${period}`
    );
  };

  const handleDialogOpen = (documentNote: string | null) => {
    setDialogContent(
      documentNote && documentNote.trim()
        ? documentNote
        : "No existe Nota de documento"
    );
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIncludeInactive(event.target.checked);
  };

  const filteredDispatches = dispatches.filter((dispatch) =>
    Object.values(dispatch).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="space-y-5">
      <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <div className="max-w-full overflow-x-auto">
          <div className="flex items-center justify-between gap-2 mb-4">
            {/* Contenedor de Período, Búsqueda y Switch */}
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
              <FormControlLabel
                control={
                  <Switch
                    checked={includeInactive}
                    onChange={handleSwitchChange}
                    color="primary"
                  />
                }
                label="Mostrar inactivos"
              />
              <div className="flex items-center gap-2">
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
                  {[2023, 2024, 2025].map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </div>
            </div>

            {/* Botón Crear */}
            <div className="flex items-center gap-2">
              <Button
                startIcon={<Add />}
                variant="contained"
                style={{ backgroundColor: "#1976d2", color: "#fff" }}
                onClick={handleCreateMovSalidaHilado}
              >
                CREAR
              </Button>
            </div>
          </div>

          {/* Tabla de Movimientos */}
          <table className="w-full h-full border-collapse table-auto">
            <thead>
              <tr className="bg-blue-900 uppercase text-center">
                {[
                  "Nro Salida",
                  "Periodo",
                  "Fecha",
                  "Hora",
                  "Proveedor",
                  "Estado",
                  "Nota Documento",
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
                  <td colSpan={8} className="text-center py-4">
                    Cargando datos...
                  </td>
                </tr>
              ) : filteredDispatches.length > 0 ? (
                filteredDispatches.map((dispatch, index) => (
                  <tr key={index} className="text-center">
                    <td className="border-b border-[#eee] px-4 py-5">
                      {dispatch.exitNumber}
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5">
                      {dispatch.period}
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5">
                      {dispatch.creationDate}
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5">
                      {dispatch.creationTime}
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5">
                        {suppliers.map((supplier) =>
                          supplier.code === dispatch.supplierCode
                            ? supplier.name
                            : ""
                        )}
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5">
                      {dispatch.promecStatus.name}
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5">
                      <IconButton
                        color="primary"
                        onClick={() =>
                          handleDialogOpen(dispatch.documentNote)
                        }
                      >
                        <Visibility />
                      </IconButton>
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5">
                      <IconButton
                        color="primary"
                        onClick={() =>
                          handleDetailsClick(dispatch.exitNumber, dispatch.period)
                        }
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
        </div>

        {/* Paginación */}
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={dispatches.length}
          rowsPerPage={filasPorPagina}
          page={pagina}
          onPageChange={(_, newPage) => setPagina(newPage)}
          onRowsPerPageChange={(e) =>
            setFilasPorPagina(parseInt(e.target.value, 10))
          }
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
          }
        />
      </div>

      {/* Dialog para mostrar la Nota del Documento */}
      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>
          Nota del Documento
          <IconButton
            aria-label="close"
            onClick={handleDialogClose}
            style={{ position: "absolute", right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <p>{dialogContent}</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default MovSalidaHilado;
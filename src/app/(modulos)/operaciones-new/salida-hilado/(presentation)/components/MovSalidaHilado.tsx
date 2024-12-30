"use client";

import React, { useState, useEffect } from "react";
import {
  TablePagination,
  IconButton,
  Button,
  TextField,
  Menu,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Visibility, Add, FilterList, Search, Close } from "@mui/icons-material";
import { useRouter, useSearchParams } from "next/navigation";
import { YarnDispatch } from "../../../models/models";
import { fetchYarnDispatches } from "../../services/movSalidaHiladoService";

const MovSalidaHilado: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [dispatches, setDispatches] = useState<YarnDispatch[]>([]);
  const [pagina, setPagina] = useState(0);
  const [filasPorPagina, setFilasPorPagina] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Estado para manejar el diálogo
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogContent, setDialogContent] = useState<string>("");

  // Cargar datos del servicio
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetchYarnDispatches(
          2024,
          filasPorPagina,
          pagina * filasPorPagina
        );
        setDispatches(response.yarnWeavingDispatches || []);
      } catch (error) {
        console.error("Error al cargar los datos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [pagina, filasPorPagina]);

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleCreateMovSalidaHilado = () => {
    router.push("/operaciones-new/salida-hilado/crear-mov-salida-hilado");
  };

  const handleDetailsClick = (exitNumber: string) => {
    router.push(`/operaciones-new/salida-hilado/detalles-mov-salida-hilado/${exitNumber}`);
  };

  const handleDialogOpen = (documentNote: string | null) => {
    setDialogContent(documentNote && documentNote.trim() ? documentNote : "No existe Nota de documento");
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
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
            {/* Contenedor de Búsqueda y Filtros */}
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
              <Button
                startIcon={<FilterList />}
                variant="outlined"
                onClick={handleFilterClick}
              >
                Filtros
              </Button>
              <Menu
                anchorEl={filterAnchorEl}
                open={Boolean(filterAnchorEl)}
                onClose={handleFilterClose}
              >
                <div className="p-4 space-y-2" style={{ maxWidth: "300px", margin: "0 auto" }}>
                  <TextField
                    label="Proveedor"
                    variant="outlined"
                    placeholder="Filtrar por proveedor..."
                    size="small"
                    fullWidth
                  />
                  <TextField
                    label="Fecha"
                    type="date"
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                    size="small"
                    fullWidth
                  />
                </div>
              </Menu>
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
          <table className="table-auto border-collapse">
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
                      {dispatch.supplierCode}
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5">
                      {dispatch.statusFlag}
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5">
                      <IconButton
                        color="primary"
                        onClick={() => handleDialogOpen(dispatch.documentNote)}
                      >
                        <Visibility />
                      </IconButton>
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5">
                      <IconButton
                        color="primary"
                        onClick={() => router.push(`/operaciones-new/salida-hilado/detalles-mov-salida-hilado/${dispatch.exitNumber}`)}
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

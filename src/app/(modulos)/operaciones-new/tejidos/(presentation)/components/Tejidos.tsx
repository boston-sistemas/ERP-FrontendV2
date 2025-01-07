"use client";

import React, { useState, useEffect } from "react";
import {
  TablePagination,
  IconButton,
  Button,
  TextField,
  Menu,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import {
  Visibility,
  Add,
  Edit,
  PowerSettingsNew,
  FilterList,
  Search,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { fetchTejidos, updateFabricStatus } from "../../services/tejidosService";
import { Fabric, FabricRecipe } from "../../../models/models";

const Tejidos: React.FC = () => {
  const router = useRouter();
  const [tejidos, setTejidos] = useState<Fabric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [pagina, setPagina] = useState(0);
  const [filasPorPagina, setFilasPorPagina] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<FabricRecipe[] | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTejido, setSelectedTejido] = useState<Fabric | null>(null);
  const [mostrarEditar, setMostrarEditar] = useState(false);
  const [mostrarDeshabilitar, setMostrarDeshabilitar] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);

  useEffect(() => {
    const loadTejidos = async () => {
      try {
        setLoading(true);
        const data = await fetchTejidos();
        setTejidos(data.fabrics);
      } catch (error) {
        console.error("Error fetching tejidos:", error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadTejidos();
  }, []);

  const handleShowReceta = (recipe: FabricRecipe[]) => {
    setSelectedRecipe(recipe);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setSelectedRecipe(null);
    setDialogOpen(false);
  };

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleDisableTejido = async () => {
    if (!selectedTejido) return;

    setLoadingUpdate(true);

    try {
      // Llamada al endpoint para actualizar el estado
      await updateFabricStatus(selectedTejido.id, !selectedTejido.isActive);

      // Actualizar el estado local del tejido
      setTejidos((prevTejidos) =>
        prevTejidos.map((tejido) =>
          tejido.id === selectedTejido.id
            ? { ...tejido, isActive: !tejido.isActive }
            : tejido
        )
      );

      // Cerrar el diálogo de confirmación
      setConfirmDialogOpen(false);
      setSelectedTejido(null);
    } catch (error) {
      console.error("Error al actualizar el estado del tejido:", error);
      alert("Ocurrió un error al intentar actualizar el estado del tejido.");
    } finally {
      setLoadingUpdate(false);
    }
  };

  const filteredTejidos = tejidos.filter((tejido) =>
    tejido.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateTejido = () => {
    router.push("/operaciones-new/tejidos/crear-tejido");
  };

  const handleEditTejido = (tejido: Fabric) => {
    setSelectedTejido(tejido);
    setEditDialogOpen(true);
  };

  const handleSaveEditTejido = () => {
    setTejidos((prevTejidos) =>
      prevTejidos.map((tejido) =>
        tejido.id === selectedTejido?.id ? { ...selectedTejido } : tejido
      )
    );
    setEditDialogOpen(false);
  };

  const handleConfirmDisableTejido = (id: string) => {
    setSelectedTejido(tejidos.find((tejido) => tejido.id === id) || null);
    setConfirmDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Hubo un error al cargar los datos. Inténtalo nuevamente.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <div className="max-w-full overflow-x-auto">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center border border-gray-300 rounded-md px-2">
                <Search />
                <TextField
                  variant="standard"
                  placeholder="Buscar por descripción..."
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
              ></Menu>
            </div>
            <div className="flex items-center gap-2">
              <Button
                startIcon={<Add />}
                variant="contained"
                style={{ backgroundColor: "#1976d2", color: "#fff" }}
                onClick={handleCreateTejido}
              >
                CREAR
              </Button>
              <Button
                startIcon={<Edit />}
                variant="contained"
                style={{ backgroundColor: "#1976d2", color: "#fff" }}
                onClick={() => setMostrarEditar(!mostrarEditar)}
              >
                EDITAR
              </Button>
              <Button
                startIcon={<PowerSettingsNew />}
                variant="contained"
                style={{ backgroundColor: "#d32f2f", color: "#fff" }}
                onClick={() => setMostrarDeshabilitar(!mostrarDeshabilitar)}
              >
                DESHABILITAR
              </Button>
            </div>
          </div>

          <table className="w-full table-auto">
            <thead>
              <tr className="bg-blue-900 uppercase text-center">
                {["ID", "Descripción", "Densidad", "Ancho", "Estado", "Patrón", "Tipo", "Receta"].map(
                  (col, index) => (
                    <th key={index} className="px-4 py-4 text-center font-normal text-white">
                      {col}
                    </th>
                  )
                )}
                {mostrarEditar && (
                  <th className="px-4 py-4 text-center font-normal text-white">Editar</th>
                )}
                {mostrarDeshabilitar && (
                  <th className="px-4 py-4 text-center font-normal text-white">Deshabilitar</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredTejidos.slice(pagina * filasPorPagina, pagina * filasPorPagina + filasPorPagina).map((tejido) => (
                <tr key={tejido.id} className="text-center">
                  <td className="border-b border-[#eee] px-4 py-5">{tejido.id}</td>
                  <td className="border-b border-[#eee] px-4 py-5">{tejido.description}</td>
                  <td className="border-b border-[#eee] px-4 py-5">{tejido.density}</td>
                  <td className="border-b border-[#eee] px-4 py-5">{tejido.width}</td>
                  <td className="border-b border-[#eee] px-4 py-5">
                    <span className={`text-sm ${tejido.isActive ? "text-green-500" : "text-red-500"}`}>
                      {tejido.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="border-b border-[#eee] px-4 py-5">{tejido.structurePattern}</td>
                  <td className="border-b border-[#eee] px-4 py-5">{tejido.fabricType.value}</td>
                  <td className="border-b border-[#eee] px-4 py-5">
                    <IconButton onClick={() => handleShowReceta(tejido.recipe)} className="text-inherit">
                      <Visibility />
                    </IconButton>
                  </td>
                  {mostrarEditar && (
                    <td className="border-b border-[#eee] px-4 py-5">
                      <IconButton onClick={() => handleEditTejido(tejido)} className="text-inherit">
                        <Edit />
                      </IconButton>
                    </td>
                  )}
                  {mostrarDeshabilitar && (
                    <td className="border-b border-[#eee] px-4 py-5">
                      <IconButton onClick={() => handleConfirmDisableTejido(tejido.id)} className="text-inherit">
                        <PowerSettingsNew />
                      </IconButton>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={filteredTejidos.length}
          rowsPerPage={filasPorPagina}
          page={pagina}
          onPageChange={(event, newPage) => setPagina(newPage)}
          onRowsPerPageChange={(event) => setFilasPorPagina(parseInt(event.target.value, 10))}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`}
        />
      </div>

      {/* Diálogo de Confirmación para Deshabilitar */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>Confirmar Deshabilitación</DialogTitle>
        <DialogContent>
          <p>
            ¿Estás seguro de que deseas cambiar el estado del tejido{" "}
            <strong>{selectedTejido?.description}</strong>?
          </p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)} style={{ backgroundColor: "#d32f2f", color: "#fff" }} disabled={loadingUpdate}>
            Cancelar
          </Button>
          <Button onClick={handleDisableTejido} style={{ backgroundColor: "#1976d2", color: "#fff" }} disabled={loadingUpdate}>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de Edición */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>Editar Tejido</DialogTitle>
        <DialogContent>
          {selectedTejido && (
            <form className="space-y-4">
              <TextField
                fullWidth
                label="Descripción"
                value={selectedTejido.description}
                onChange={(e) =>
                  setSelectedTejido({ ...selectedTejido, description: e.target.value })
                }
              />
              <TextField
                fullWidth
                label="Densidad"
                type="number"
                value={selectedTejido.density}
                onChange={(e) =>
                  setSelectedTejido({ ...selectedTejido, density: parseInt(e.target.value, 10) })
                }
              />
              <TextField
                fullWidth
                label="Ancho"
                type="number"
                value={selectedTejido.width}
                onChange={(e) =>
                  setSelectedTejido({ ...selectedTejido, width: parseInt(e.target.value, 10) })
                }
              />
              <TextField
                fullWidth
                label="Estado"
                value={selectedTejido.isActive ? "Activo" : "Inactivo"}
                disabled
              />
            </form>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleSaveEditTejido} color="secondary">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Tejidos;


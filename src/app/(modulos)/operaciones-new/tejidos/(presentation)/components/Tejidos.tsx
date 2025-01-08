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
  Close,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import {
  fetchTejidos,
  updateFabricStatus,
  updateFabric,
} from "../../services/tejidosService";
import { Fabric } from "../../../models/models";

const Tejidos: React.FC = () => {
  const router = useRouter();

  const [tejidos, setTejidos] = useState<Fabric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [pagina, setPagina] = useState(0);
  const [filasPorPagina, setFilasPorPagina] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);

  // Mostrar/ocultar columnas de Editar / Deshabilitar
  const [mostrarEditar, setMostrarEditar] = useState(false);
  const [mostrarDeshabilitar, setMostrarDeshabilitar] = useState(false);

  // Diálogo para confirmar deshabilitación
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedTejido, setSelectedTejido] = useState<Fabric | null>(null);
  const [loadingUpdate, setLoadingUpdate] = useState(false);

  // Diálogo para Editar
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [fabricToEdit, setFabricToEdit] = useState<Fabric | null>(null);

  useEffect(() => {
    const loadTejidos = async () => {
      try {
        setLoading(true);
        const data = await fetchTejidos();
        setTejidos(data.fabrics || []);
      } catch (error) {
        console.error("Error fetching tejidos:", error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadTejidos();
  }, []);

  // Filtros
  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };
  const handleFilterClose = () => setFilterAnchorEl(null);

  // Búsqueda
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };
  const filteredTejidos = tejidos.filter((t) =>
    t.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginación
  const handleChangePage = (event: unknown, newPage: number) => {
    setPagina(newPage);
  };
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setFilasPorPagina(parseInt(event.target.value, 10));
    setPagina(0);
  };

  // CREAR → Navega a /operaciones-new/tejidos/crear-tejido
  const handleCreateTejido = () => {
    router.push("/operaciones-new/tejidos/crear-tejido");
  };

  // Confirmar Deshabilitar
  const handleConfirmDisableTejido = (tejido: Fabric) => {
    setSelectedTejido(tejido);
    setConfirmDialogOpen(true);
  };
  const handleDisableTejido = async () => {
    if (!selectedTejido) return;
    setLoadingUpdate(true);
    try {
      await updateFabricStatus(selectedTejido.id, !selectedTejido.isActive);
      // Actualizar local
      setTejidos((prev) =>
        prev.map((t) =>
          t.id === selectedTejido.id ? { ...t, isActive: !t.isActive } : t
        )
      );
    } catch (err) {
      console.error("Error al cambiar estado del tejido:", err);
      alert("Hubo un error al cambiar el estado.");
    } finally {
      setLoadingUpdate(false);
      setConfirmDialogOpen(false);
      setSelectedTejido(null);
    }
  };

  // Editar
  const handleEditTejido = (tejido: Fabric) => {
    setFabricToEdit({ ...tejido }); // Clonar
    setEditDialogOpen(true);
  };
  const handleSaveEditTejido = async () => {
    if (!fabricToEdit) return;
    const payload = {
      density: fabricToEdit.density,
      width: fabricToEdit.width,
      description: fabricToEdit.description,
      structurePattern: fabricToEdit.structurePattern,
    };
    try {
      await updateFabric(fabricToEdit.id, payload);
      // Actualizar local
      setTejidos((prev) =>
        prev.map((t) => (t.id === fabricToEdit.id ? { ...fabricToEdit } : t))
      );
      setEditDialogOpen(false);
      setFabricToEdit(null);
    } catch (err) {
      console.error("Error al actualizar tejido:", err);
      alert("Hubo un error al actualizar el tejido.");
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default">
        {/* Encabezado */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-gray-300 rounded-md px-2">
              <Search />
              <TextField
                variant="standard"
                placeholder="Buscar por descripción..."
                value={searchTerm}
                onChange={handleSearch}
                InputProps={{ disableUnderline: true }}
              />
            </div>
            <Button startIcon={<FilterList />} variant="outlined" onClick={handleFilterClick}>
              Filtros
            </Button>
            <Menu
              anchorEl={filterAnchorEl}
              open={Boolean(filterAnchorEl)}
              onClose={handleFilterClose}
            >
              {/* (Opcional) Aquí podrías agregar más filtros. */}
            </Menu>
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

        {/* Tabla */}
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <CircularProgress />
          </div>
        ) : error ? (
          <div>Hubo un error al cargar los tejidos.</div>
        ) : tejidos.length === 0 ? (
          <div className="py-10 text-center text-gray-500">No hay datos para mostrar</div>
        ) : (
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-blue-900 uppercase text-center text-white">
                <th className="px-4 py-4">ID</th>
                <th className="px-4 py-4">Descripción</th>
                <th className="px-4 py-4">Densidad</th>
                <th className="px-4 py-4">Ancho</th>
                <th className="px-4 py-4">Estado</th>
                <th className="px-4 py-4">Patrón</th>
                <th className="px-4 py-4">Tipo de Tejido</th>
                {mostrarEditar && <th className="px-4 py-4">Editar</th>}
                {mostrarDeshabilitar && <th className="px-4 py-4">Deshabilitar</th>}
              </tr>
            </thead>
            <tbody>
              {filteredTejidos
                .slice(pagina * filasPorPagina, pagina * filasPorPagina + filasPorPagina)
                .map((tej) => (
                  <tr key={tej.id} className="text-center">
                    <td className="border-b border-[#eee] px-4 py-4">{tej.id}</td>
                    <td className="border-b border-[#eee] px-4 py-4">{tej.description}</td>
                    <td className="border-b border-[#eee] px-4 py-4">{tej.density}</td>
                    <td className="border-b border-[#eee] px-4 py-4">{tej.width}</td>
                    <td className="border-b border-[#eee] px-4 py-4">
                      {tej.isActive ? (
                        <span className="text-green-600">Activo</span>
                      ) : (
                        <span className="text-red-600">Inactivo</span>
                      )}
                    </td>
                    <td className="border-b border-[#eee] px-4 py-4">{tej.structurePattern}</td>
                    <td className="border-b border-[#eee] px-4 py-4">
                      {tej.fabricType?.value || ""}
                    </td>
                    {mostrarEditar && (
                      <td className="border-b border-[#eee] px-4 py-4">
                        <IconButton onClick={() => handleEditTejido(tej)}>
                          <Edit />
                        </IconButton>
                      </td>
                    )}
                    {mostrarDeshabilitar && (
                      <td className="border-b border-[#eee] px-4 py-4">
                        <IconButton onClick={() => handleConfirmDisableTejido(tej)}>
                          <PowerSettingsNew />
                        </IconButton>
                      </td>
                    )}
                  </tr>
                ))}
            </tbody>
          </table>
        )}

        {/* Paginación */}
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={filteredTejidos.length}
          rowsPerPage={filasPorPagina}
          page={pagina}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
          }
        />
      </div>

      {/* Diálogo Confirmar Deshabilitar */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>Confirmar Deshabilitar</DialogTitle>
        <DialogContent>
          <p>
            ¿Deseas cambiar el estado de <strong>{selectedTejido?.description}</strong>?
          </p>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmDialogOpen(false)}
            style={{ backgroundColor: "#d32f2f", color: "#fff" }}
            disabled={loadingUpdate}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleDisableTejido}
            style={{ backgroundColor: "#1976d2", color: "#fff" }}
            disabled={loadingUpdate}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo Editar */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Editar Tejido</DialogTitle>
        <DialogContent>
          {fabricToEdit && (
            <div className="space-y-4">
              <TextField
                label="Descripción"
                fullWidth
                value={fabricToEdit.description}
                onChange={(e) =>
                  setFabricToEdit({ ...fabricToEdit, description: e.target.value })
                }
              />
              <TextField
                label="Densidad"
                fullWidth
                type="number"
                value={fabricToEdit.density}
                onChange={(e) =>
                  setFabricToEdit({
                    ...fabricToEdit,
                    density: parseInt(e.target.value, 10),
                  })
                }
              />
              <TextField
                label="Ancho"
                fullWidth
                type="number"
                value={fabricToEdit.width}
                onChange={(e) =>
                  setFabricToEdit({
                    ...fabricToEdit,
                    width: parseInt(e.target.value, 10),
                  })
                }
              />
              <TextField
                label="Patrón"
                fullWidth
                value={fabricToEdit.structurePattern}
                onChange={(e) =>
                  setFabricToEdit({
                    ...fabricToEdit,
                    structurePattern: e.target.value,
                  })
                }
              />
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancelar</Button>
          <Button
            onClick={handleSaveEditTejido}
            style={{ backgroundColor: "#1976d2", color: "#fff" }}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Tejidos;

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
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Menu,
} from "@mui/material";
import { Edit, PowerSettingsNew, Add, Search, FilterList } from "@mui/icons-material";
import { fetchHilados, updateYarnStatus } from "../../services/hiladoService";
import { handleUpdateYarn } from "../../use-cases/hilado";
import { Yarn, Recipe } from "../../../models/models";
import { useRouter } from "next/navigation";

const Hilados: React.FC = () => {
  const router = useRouter();
  const [hilados, setHilados] = useState<Yarn[]>([]);
  const [pagina, setPagina] = useState(0);
  const [filasPorPagina, setFilasPorPagina] = useState(10);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");
  const [editingYarn, setEditingYarn] = useState<Yarn | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showEditColumn, setShowEditColumn] = useState(true);
  const [showDisableColumn, setShowDisableColumn] = useState(true);
  const [editForm, setEditForm] = useState<{
    title: string;
    finish: string;
    description: string;
    recipe: Recipe[];
  }>({
    title: "",
    finish: "",
    description: "",
    recipe: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchHilados();
        setHilados(data.yarns);
      } catch (error) {
        console.error("Error fetching hilados:", error);
      }
    };
    fetchData();
  }, []);

  const handleEditClick = (yarn: Yarn) => {
    setEditingYarn(yarn);
    setEditForm({
      title: yarn.yarnCount,
      finish: yarn.spinningMethod.value,
      description: yarn.description,
      recipe: yarn.recipe,
    });
    setEditDialogOpen(true);
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
    setEditingYarn(null);
  };

  const handleEditSave = async () => {
    if (editingYarn) {
      const updatedPayload = {
        yarnCount: editForm.title,
        spinningMethod: { value: editForm.finish },
        description: editForm.description,
        recipe: editForm.recipe,
      };

      await handleUpdateYarn(
        editingYarn.id,
        updatedPayload,
        setHilados,
        setSnackbarMessage,
        setSnackbarSeverity,
        setSnackbarOpen
      );

      handleEditClose();
    }
  };

  const handleToggleYarnStatus = async (id: string, isActive: boolean) => {
    try {
      await updateYarnStatus(id, !isActive);
      setHilados((prev) =>
        prev.map((hilado) =>
          hilado.id === id ? { ...hilado, isActive: !isActive } : hilado
        )
      );
      setSnackbarMessage(`Hilado ${!isActive ? "habilitado" : "deshabilitado"} correctamente`);
      setSnackbarSeverity("success");
    } catch (error) {
      console.error("Error actualizando el estado del hilado:", error);
      setSnackbarMessage("Error al actualizar el estado del hilado");
      setSnackbarSeverity("error");
    } finally {
      setSnackbarOpen(true);
    }
  };

  const handleCrearHilado = () => {
    router.push("/operaciones-new/hilados/crear-hilado");
  }

  const filteredHilados = hilados.filter((h) =>
    h.yarnCount.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default sm:px-7.5 xl:pb-1">
        {/* Barra superior dentro del contenedor de la tabla */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-gray-300 rounded-md px-2">
              <Search />
              <TextField
                variant="standard"
                placeholder="Buscar por título..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  disableUnderline: true,
                }}
              />
            </div>
          </div>
          <div className="space-x-2">
            <Button startIcon={<Add />} variant="contained" style={{ backgroundColor: "#1976d2", color: "#fff" }} onClick={handleCrearHilado}>
              CREAR
            </Button>
            <Button
              startIcon={<Edit />}
              variant="contained"
              style={{ backgroundColor: "#1976d2", color: "#fff" }}
              color="primary"
              onClick={() => setShowEditColumn((prev) => !prev)}
            >
              {showEditColumn ? "Ocultar Editar" : "Mostrar Editar"}
            </Button>
            <Button
              startIcon={<PowerSettingsNew />}
              variant="contained"
              style={{ backgroundColor: "#d32f2f", color: "#fff" }}
              color="error"
              onClick={() => setShowDisableColumn((prev) => !prev)}
            >
              {showDisableColumn ? "Ocultar Deshabilitar" : "Mostrar Deshabilitar"}
            </Button>
          </div>
        </div>
  
        {/* Tabla principal */}
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-blue-900 uppercase text-center text-white">
                <th className="px-4 py-4">SKU</th>
                <th className="px-4 py-4">Título</th>
                <th className="px-4 py-4">Acabado</th>
                <th className="px-4 py-4">Estado</th>
                {showEditColumn && <th className="px-4 py-4">Editar</th>}
                {showDisableColumn && <th className="px-4 py-4">Deshabilitar</th>}
              </tr>
            </thead>
            <tbody>
              {filteredHilados
                .slice(pagina * filasPorPagina, pagina * filasPorPagina + filasPorPagina)
                .map((hilado) => (
                  <tr key={hilado.id} className="text-center">
                    <td className="border-b px-4 py-5">{hilado.barcode}</td>
                    <td className="border-b px-4 py-5">{hilado.yarnCount}</td>
                    <td className="border-b px-4 py-5">{hilado.spinningMethod.value}</td>
                    <td className="border-b px-4 py-5">
                      <span className={hilado.isActive ? "text-green-500" : "text-red-500"}>
                        {hilado.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    {showEditColumn && (
                      <td className="border-b px-4 py-5">
                        <IconButton onClick={() => handleEditClick(hilado)}>
                          <Edit />
                        </IconButton>
                      </td>
                    )}
                    {showDisableColumn && (
                      <td className="border-b px-4 py-5">
                        <IconButton onClick={() => handleToggleYarnStatus(hilado.id, hilado.isActive)}>
                          <PowerSettingsNew />
                        </IconButton>
                      </td>
                    )}
                  </tr>
                ))}
            </tbody>
          </table>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={filteredHilados.length}
            rowsPerPage={filasPorPagina}
            page={pagina}
            onPageChange={(_, newPage) => setPagina(newPage)}
            onRowsPerPageChange={(e) => setFilasPorPagina(parseInt(e.target.value, 10))}
          />
        </div>
      </div>
  
      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={snackbarSeverity} onClose={() => setSnackbarOpen(false)}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
  
      {/* Dialog para edición */}
      <Dialog open={editDialogOpen} onClose={handleEditClose} maxWidth="md" fullWidth>
        <DialogTitle>Editar Hilado</DialogTitle>
        <DialogContent>
          <TextField
            label="Título"
            fullWidth
            margin="dense"
            value={editForm.title}
            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
          />
          <TextField
            label="Acabado"
            fullWidth
            margin="dense"
            value={editForm.finish}
            onChange={(e) => setEditForm({ ...editForm, finish: e.target.value })}
          />
          <TextField
            label="Descripción"
            fullWidth
            multiline
            rows={3}
            margin="dense"
            value={editForm.description}
            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose} color="error">
            Cancelar
          </Button>
          <Button onClick={handleEditSave} color="primary" variant="contained">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
  
};

export default Hilados;

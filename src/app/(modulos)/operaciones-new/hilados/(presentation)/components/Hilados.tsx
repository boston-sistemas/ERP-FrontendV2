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
} from "@mui/material";
import { Edit, PowerSettingsNew } from "@mui/icons-material";
import { fetchHilados, updateYarnStatus } from "../../services/hiladoService";
import { handleUpdateYarn } from "../../use-cases/hilado";
import { Yarn, Recipe } from "../../../models/models";

const Hilados: React.FC = () => {
  const [hilados, setHilados] = useState<Yarn[]>([]);
  const [pagina, setPagina] = useState(0);
  const [filasPorPagina, setFilasPorPagina] = useState(10);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");
  const [editingYarn, setEditingYarn] = useState<Yarn | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState<{ 
    title: string; 
    finish: string;
    description: string; 
    recipe: Recipe[] 
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

  return (
    <div className="space-y-5">
      <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-blue-900 uppercase text-center text-white">
                <th className="px-4 py-4">SKU</th>
                <th className="px-4 py-4">Título</th>
                <th className="px-4 py-4">Acabado</th>
                <th className="px-4 py-4">Estado</th>
                <th className="px-4 py-4">Editar</th>
                <th className="px-4 py-4">Deshabilitar</th>
              </tr>
            </thead>
            <tbody>
              {hilados
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
                    <td className="border-b px-4 py-5">
                      <IconButton onClick={() => handleEditClick(hilado)}>
                        <Edit />
                      </IconButton>
                    </td>
                    <td className="border-b px-4 py-5">
                      <IconButton onClick={() => handleToggleYarnStatus(hilado.id, hilado.isActive)}>
                        <PowerSettingsNew />
                      </IconButton>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={hilados.length}
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
          <h3 className="mt-4 font-semibold">Seleccionar Fibras</h3>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Categoría</TableCell>
                <TableCell>Variedad/Marca</TableCell>
                <TableCell>Procedencia</TableCell>
                <TableCell>Proporción</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {editForm.recipe.map((r: Recipe, index: number) => (
                <TableRow key={index}>
                  <TableCell>{r.fiber.category.value}</TableCell>
                  <TableCell>{r.fiber.denomination}</TableCell>
                  <TableCell>{r.fiber.origin}</TableCell>
                  <TableCell>{r.proportion}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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

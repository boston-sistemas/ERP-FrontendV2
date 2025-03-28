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
} from "@mui/material";
import { Add, Edit, PowerSettingsNew, Search, Close } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { fetchTejidos, updateFabricStatus, updateFabric } from "../../services/tejidosService";
import { Fabric } from "../../../models/models";

const Tejidos: React.FC = () => {
  const router = useRouter();

  const [tejidos, setTejidos] = useState<Fabric[]>([]);
  const [pagina, setPagina] = useState(0);
  const [filasPorPagina, setFilasPorPagina] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [fabricToEdit, setFabricToEdit] = useState<Fabric | null>(null);

  const [showEditColumn, setShowEditColumn] = useState(true);
  const [showDisableColumn, setShowDisableColumn] = useState(true);

  useEffect(() => {
    const loadTejidos = async () => {
      try {
        const data = await fetchTejidos();
        setTejidos(data.fabrics || []);
      } catch (error) {
        console.error("Error al cargar tejidos:", error);
      }
    };

    loadTejidos();
  }, []);

  const filteredTejidos = tejidos.filter((t) =>
    t.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditTejido = (tejido: Fabric) => {
    setFabricToEdit({ ...tejido });
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
      setTejidos((prev) =>
        prev.map((t) => (t.id === fabricToEdit.id ? { ...fabricToEdit } : t))
      );
      setSnackbarMessage("Tejido actualizado correctamente.");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      setEditDialogOpen(false);
    } catch (err) {
      console.error("Error al actualizar tejido:", err);
      setSnackbarMessage("Hubo un error al actualizar el tejido.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleToggleFabricStatus = async (id: string, isActive: boolean) => {
    try {
      await updateFabricStatus(id, !isActive);
      setTejidos((prev) =>
        prev.map((tejido) =>
          tejido.id === id ? { ...tejido, isActive: !isActive } : tejido
        )
      );
      setSnackbarMessage(`Tejido ${!isActive ? "habilitado" : "deshabilitado"} correctamente.`);
      setSnackbarSeverity("success");
    } catch (err) {
      console.error("Error al cambiar estado del tejido:", err);
      setSnackbarMessage("Error al cambiar el estado del tejido.");
      setSnackbarSeverity("error");
    } finally {
      setSnackbarOpen(true);
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-gray-300 rounded-md px-2">
              <Search />
              <TextField
                variant="standard"
                placeholder="Buscar por descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  disableUnderline: true,
                }}
              />
            </div>
          </div>
          <div className="space-x-2">
            <Button
              startIcon={<Add />}
              variant="contained"
              style={{ backgroundColor: "#1976d2", color: "#fff" }}
              onClick={() => router.push("/operaciones/tejidos/crear-tejido")}
            >
              CREAR
            </Button>
            <Button
              startIcon={<Edit />}
              variant="contained"
              style={{ backgroundColor: "#1976d2", color: "#fff" }}
              onClick={() => setShowEditColumn((prev) => !prev)}
            >
              {showEditColumn ? "Ocultar Editar" : "Mostrar Editar"}
            </Button>
            <Button
              startIcon={<PowerSettingsNew />}
              variant="contained"
              style={{ backgroundColor: "#d32f2f", color: "#fff" }}
              onClick={() => setShowDisableColumn((prev) => !prev)}
            >
              {showDisableColumn ? "Ocultar Deshabilitar" : "Mostrar Deshabilitar"}
            </Button>
          </div>
        </div>

        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-blue-900 uppercase text-center text-white">
                <th className="px-4 py-4 font-normal">ID</th>
                <th className="px-4 py-4 font-normal">Descripción</th>
                <th className="px-4 py-4 font-normal">Densidad</th>
                <th className="px-4 py-4 font-normal">Ancho</th>
                <th className="px-4 py-4 font-normal">Estado</th>
                {showEditColumn && <th className="px-4 py-4 font-normal">Editar</th>}
                {showDisableColumn && <th className="px-4 py-4 font-normal">Deshabilitar</th>}
              </tr>
            </thead>
            <tbody>
              {filteredTejidos.length > 0 ? (
                filteredTejidos
                  .slice(pagina * filasPorPagina, pagina * filasPorPagina + filasPorPagina)
                  .map((tejido) => (
                    <tr key={tejido.id} className="text-center text-black">
                      <td className="border-b border-gray-300 px-4 py-5">{tejido.id}</td>
                      <td className="border-b border-gray-300 px-4 py-5">{tejido.description}</td>
                      <td className="border-b border-gray-300 px-4 py-5">{tejido.density}</td>
                      <td className="border-b border-gray-300 px-4 py-5">{tejido.width}</td>
                      <td className="border-b border-gray-300 px-4 py-5">
                        <span
                          className={`text-sm ${
                            tejido.isActive ? "text-green-500" : "text-red-500"
                          }`}
                        >
                          {tejido.isActive ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      {showEditColumn && (
                        <td className="border-b border-gray-300 px-4 py-5">
                          <IconButton onClick={() => handleEditTejido(tejido)}>
                            <Edit />
                          </IconButton>
                        </td>
                      )}
                      {showDisableColumn && (
                        <td className="border-b border-gray-300 px-4 py-5">
                          <IconButton
                            onClick={() => handleToggleFabricStatus(tejido.id, tejido.isActive)}
                          >
                            <PowerSettingsNew />
                          </IconButton>
                        </td>
                      )}
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan={6} className="pt-5 pb-5 text-center text-black">
                    No hay datos disponibles
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={filteredTejidos.length}
            rowsPerPage={filasPorPagina}
            page={pagina}
            onPageChange={(_, newPage) => setPagina(newPage)}
            onRowsPerPageChange={(e) => setFilasPorPagina(parseInt(e.target.value, 10))}
          />
        </div>
      </div>

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

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
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
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setEditDialogOpen(false)}
            style={{ backgroundColor: "#d32f2f", color: "#fff" }}
          >
            Cancelar
          </Button>
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

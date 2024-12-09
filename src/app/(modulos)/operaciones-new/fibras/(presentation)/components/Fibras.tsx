"use client";

import React, { useState, useEffect } from "react";
import {
  TablePagination,
  IconButton,
  Typography,
  Button,
  Menu,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
} from "@mui/material";
import { Edit, Visibility, PowerSettingsNew } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { Fibra, Categoria, Color } from "../../../models/models";
import { handleFetchFibras } from "../../use-cases/fibra";

const Fibras: React.FC = () => {
  const router = useRouter();
  const [fibras, setFibras] = useState<Fibra[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagina, setPagina] = useState(0);
  const [filasPorPagina, setFilasPorPagina] = useState(10);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedFibra, setSelectedFibra] = useState<Fibra | null>(null);
  const [originalFibra, setOriginalFibra] = useState<Fibra | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

  useEffect(() => {
    handleFetchFibras(setFibras, setLoading, setError);
  }, []);

  const handleCambiarPagina = (event: any, newPage: any) => {
    setPagina(newPage);
  };

  const handleCambiarFilasPorPagina = (event: any) => {
    setFilasPorPagina(parseInt(event.target.value, 10));
    setPagina(0);
  };

  const handleEditFibra = (fibra: Fibra) => {
    setSelectedFibra(fibra);
    setOriginalFibra({ ...fibra });
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
  };

  const handleSaveFibra = async () => {
    if (selectedFibra && originalFibra) {
      setSnackbarMessage("Fibra actualizada correctamente");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      setOpenEditDialog(false);
    }
  };

  const handleDeshabilitarFibra = async (fibra: Fibra) => {
    setSnackbarMessage("Fibra deshabilitada");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
  };

  const handleCrearFibra = () => {
    router.push("/textiles/fibras/crear");
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <div className="space-y-5">
      {error && <div className="text-red-500">{error}</div>}
      
      <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">Lista de Fibras</h4>
        
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-blue-900 uppercase text-center dark:bg-meta-4">
                <th className="px-4 py-4 text-center text-white">ID</th>
                <th className="px-4 py-4 text-center text-white">Categoría</th>
                <th className="px-4 py-4 text-center text-white">Variedad</th>
                <th className="px-4 py-4 text-center text-white">Procedencia</th>
                <th className="px-4 py-4 text-center text-white">Color</th>
                <th className="px-4 py-4 text-center text-white">Estado</th>
                <th className="px-4 py-4 text-center text-white">Ver Hilados</th>
                <th className="px-4 py-4 text-center text-white">Editar</th>
                <th className="px-4 py-4 text-center text-white">Deshabilitar</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="pt-5 pb-5 text-center">Cargando...</td>
                </tr>
              ) : fibras.length === 0 ? (
                <tr>
                  <td colSpan={9} className="pt-5 pb-5 text-center">No existen fibras</td>
                </tr>
              ) : (
                fibras.slice(pagina * filasPorPagina, pagina * filasPorPagina + filasPorPagina).map(fibra => (
                  <tr key={fibra.fibra_id} className="text-center">
                    <td className="border-b border-[#eee] px-4 py-5">{fibra.fibra_id}</td>
                    <td className="border-b border-[#eee] px-4 py-5">{fibra.categoryId}</td>
                    <td className="border-b border-[#eee] px-4 py-5">{fibra.denomination}</td>
                    <td className="border-b border-[#eee] px-4 py-5">{fibra.origin}</td>
                    <td className="border-b border-[#eee] px-4 py-5">{fibra.ColorId}</td>
                    <td className="border-b border-[#eee] px-4 py-5">{fibra.isActive}</td>
                    <td className="border-b border-[#eee] px-4 py-5">
                      <IconButton onClick={() => {}}>
                        <Visibility />
                      </IconButton>
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5">
                      <IconButton onClick={() => handleEditFibra(fibra)}>
                        <Edit />
                      </IconButton>
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5">
                      <IconButton onClick={() => handleDeshabilitarFibra(fibra)}>
                        <PowerSettingsNew />
                      </IconButton>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={fibras.length}
          rowsPerPage={filasPorPagina}
          page={pagina}
          onPageChange={handleCambiarPagina}
          onRowsPerPageChange={handleCambiarFilasPorPagina}
          labelRowsPerPage="Filas por página:"
        />
      </div>

      <Button onClick={handleCrearFibra} variant="contained" color="primary" fullWidth>
        Crear Fibra
      </Button>
      
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog}>
        <DialogTitle>Editar Fibra</DialogTitle>
        <DialogContent>
          {selectedFibra && (
            <>
              <TextField
                label="Categoría"
                value={selectedFibra.category}
                onChange={(e) => setSelectedFibra({ ...selectedFibra, category: e.target.value })}
                fullWidth
              />
              <TextField
                label="Variedad"
                value={selectedFibra.variedad}
                onChange={(e) => setSelectedFibra({ ...selectedFibra, variedad: e.target.value })}
                fullWidth
              />
              <TextField
                label="Procedencia"
                value={selectedFibra.procedencia}
                onChange={(e) => setSelectedFibra({ ...selectedFibra, procedencia: e.target.value })}
                fullWidth
              />
              <TextField
                label="Color"
                value={selectedFibra.color}
                onChange={(e) => setSelectedFibra({ ...selectedFibra, color: e.target.value })}
                fullWidth
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancelar</Button>
          <Button onClick={handleSaveFibra}>Guardar</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Fibras;

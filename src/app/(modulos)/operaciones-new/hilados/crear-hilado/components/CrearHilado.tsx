"use client";

import React, { useState } from "react";
import {
  Button,
  TextField,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TablePagination,
  Snackbar,
} from "@mui/material";
import MuiAlert, { AlertProps } from "@mui/material/Alert";
import { Add, Close } from "@mui/icons-material";
import { useRouter } from "next/navigation";

const hardcodedFibras = [
  { id: 1, categoria: "ALGODON", variedad: "TANGUIS", procedencia: "PER", color: "-", estado: "Activo" },
  { id: 2, categoria: "ALGODON", variedad: "PIMA", procedencia: "PER", color: "-", estado: "Activo" },
  { id: 3, categoria: "ALGODON", variedad: "UPLAND", procedencia: "USA", color: "-", estado: "Inactivo" },
  { id: 4, categoria: "ELASTANO", variedad: "LYCRA", procedencia: "-", color: "-", estado: "Activo" },
  { id: 5, categoria: "POLIESTER", variedad: "-", procedencia: "-", color: "NEGRO", estado: "Inactivo" },
  { id: 6, categoria: "POLIESTER", variedad: "-", procedencia: "-", color: "BLANCO", estado: "Activo" },
];

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const CrearHilado: React.FC = () => {
  const router = useRouter();
  const [titulo, setTitulo] = useState("");
  const [acabado, setAcabado] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [pagina, setPagina] = useState(0);
  const [filasPorPagina, setFilasPorPagina] = useState(5);
  const [selectedFibras, setSelectedFibras] = useState<any[]>([]);
  const [openFibrasDialog, setOpenFibrasDialog] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("Fibra añadida correctamente");

  const toggleFibrasDialog = () => {
    setOpenFibrasDialog(!openFibrasDialog);
  };

  const handleAddFiber = (fibra: any) => {
    if (!selectedFibras.some((f) => f.id === fibra.id)) {
      setSelectedFibras([...selectedFibras, { ...fibra, proporcion: "" }]);
      setOpenSnackbar(true); // Open the snackbar
    }
  };

  const handleProportionChange = (id: number, value: string) => {
    setSelectedFibras((prev) =>
      prev.map((fibra) =>
        fibra.id === id ? { ...fibra, proporcion: value } : fibra
      )
    );
  };

  const handleDeleteSelectedFibra = (id: number) => {
    setSelectedFibras((prev) => prev.filter((fibra) => fibra.id !== id));
  };

  const handleCreateHilado = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Hilado creado con:", { titulo, acabado, descripcion, selectedFibras });
    setTitulo("");
    setAcabado("");
    setDescripcion("");
    setSelectedFibras([]);
  };

  const handleCancel = () => {
    router.push("/operaciones-new/hilados");
  };

  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackbar(false);
  };

  return (
    <div className="flex justify-center items-start min-h-screen bg-gray-100 dark:bg-gray-900 py-10">
      <div
        className="bg-white dark:bg-gray-800 border border-gray-300 rounded-lg shadow-lg p-6 w-full"
        style={{
          maxWidth: "90%",
          margin: "auto",
        }}
      >
        <h2 className="text-2xl font-semibold text-center text-blue-800 dark:text-blue-400 mb-6">Crear Hilado</h2>
        <form onSubmit={handleCreateHilado}>
          <TextField
            label="Título *"
            fullWidth
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            margin="dense"
            variant="outlined"
          />
          <TextField
            label="Acabado"
            fullWidth
            value={acabado}
            onChange={(e) => setAcabado(e.target.value)}
            margin="dense"
            variant="outlined"
          />

          <div className="mt-4">
            <h3 className="text-lg font-semibold text-black dark:text-white mb-2">Seleccionar Fibras</h3>
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-blue-900 uppercase text-center">
                  {["Categoría", "Variedad/Marca", "Procedencia", "Proporción"].map((col, index) => (
                    <th key={index} className="px-4 py-4 text-center font-normal text-white">
                      {col}
                    </th>
                  ))}
                  <th className="px-4 py-4 text-center font-normal text-white">Eliminar</th>
                </tr>
              </thead>
              <tbody>
                {selectedFibras.map((fibra) => (
                  <tr key={fibra.id} className="text-center">
                    <td className="border-b border-[#eee] px-4 py-5">{fibra.categoria}</td>
                    <td className="border-b border-[#eee] px-4 py-5">{fibra.variedad}</td>
                    <td className="border-b border-[#eee] px-4 py-5">{fibra.procedencia}</td>
                    <td className="border-b border-[#eee] px-4 py-5">
                      <TextField
                        variant="outlined"
                        size="small"
                        value={fibra.proporcion}
                        onChange={(e) => handleProportionChange(fibra.id, e.target.value)}
                        placeholder="Proporción"
                      />
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5">
                      <IconButton
                        style={{ backgroundColor: "#ffff", color: "#d32f2f" }}
                        onClick={() => handleDeleteSelectedFibra(fibra.id)}
                      >
                        <Close />
                      </IconButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <IconButton onClick={toggleFibrasDialog}>
              <Add />
            </IconButton>
          </div>

          <TextField
            label="Descripción"
            fullWidth
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            margin="dense"
            variant="outlined"
          />

          <div className="flex justify-end mt-6 gap-4">
            <Button
              onClick={handleCancel}
              variant="contained"
              style={{ backgroundColor: "#d32f2f", color: "#fff" }}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="contained" style={{ backgroundColor: "#1976d2", color: "#fff" }}>
              Crear
            </Button>
          </div>
        </form>
      </div>

      {/* Diálogo para seleccionar fibras */}
      <Dialog
        open={openFibrasDialog}
        onClose={toggleFibrasDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Seleccionar Fibras</DialogTitle>
        <DialogContent>
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-blue-900 uppercase text-center">
                {["ID", "Categoría", "Variedad/Marca", "Procedencia", "Estado"].map((col, index) => (
                  <th key={index} className="px-4 py-4 text-center font-normal text-white">
                    {col}
                  </th>
                ))}
                <th className="px-4 py-4 text-center font-normal text-white">Agregar</th>
              </tr>
            </thead>
            <tbody>
              {hardcodedFibras
                .slice(pagina * filasPorPagina, pagina * filasPorPagina + filasPorPagina)
                .map((fibra) => (
                  <tr key={fibra.id} className="text-center">
                    <td className="border-b border-[#eee] px-4 py-5">{fibra.id}</td>
                    <td className="border-b border-[#eee] px-4 py-5">{fibra.categoria}</td>
                    <td className="border-b border-[#eee] px-4 py-5">{fibra.variedad}</td>
                    <td className="border-b border-[#eee] px-4 py-5">{fibra.procedencia}</td>
                    <td className="border-b border-[#eee] px-4 py-5">
                    <span className={`text-sm ${fibra.estado === "Activo" ? "text-green-500" : "text-red-500"}`}>{fibra.estado}</span>
                  </td>
                    <td className="border-b border-[#eee] px-4 py-5">
                      <IconButton color="primary" onClick={() => handleAddFiber(fibra)}>
                        <Add />
                      </IconButton>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          <TablePagination
            component="div"
            count={hardcodedFibras.length}
            page={pagina}
            onPageChange={(_, newPage) => setPagina(newPage)}
            rowsPerPage={filasPorPagina}
            onRowsPerPageChange={(e) => setFilasPorPagina(parseInt(e.target.value, 10))}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={toggleFibrasDialog}
            style={{ backgroundColor: "#1976d2", color: "#fff" }}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default CrearHilado;

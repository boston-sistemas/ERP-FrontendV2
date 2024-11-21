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
import { Add, Close, Visibility } from "@mui/icons-material";
import { useRouter } from "next/navigation";

const hardcodedHilados = [
  { id: 1, titulo: "Hilado Algodón", acabado: "Brillante", descripcion: "Hilado suave", receta: "-", estado: "Activo" },
  { id: 2, titulo: "Hilado Polyester", acabado: "Mate", descripcion: "Hilado fuerte", receta: "-", estado: "Activo" },
  { id: 3, titulo: "Hilado Mixto", acabado: "Semimate", descripcion: "Hilado mixto algodón/polyester", receta: "-", estado: "Inactivo" },
  { id: 4, titulo: "Hilado Seda", acabado: "Brillante", descripcion: "Hilado lujoso", receta: "-", estado: "Activo" },
];

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const CrearTejido: React.FC = () => {
  const router = useRouter();
  const [familia, setFamilia] = useState("");
  const [ancho, setAncho] = useState("");
  const [densidad, setDensidad] = useState("");
  const [desagujado, setDesagujado] = useState("");
  const [pagina, setPagina] = useState(0);
  const [filasPorPagina, setFilasPorPagina] = useState(5);
  const [selectedHilados, setSelectedHilados] = useState<any[]>([]);
  const [openHiladosDialog, setOpenHiladosDialog] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("Hilado añadido correctamente");
  const [descripcion, setDescripcion] = useState("");

  const toggleHiladosDialog = () => {
    setOpenHiladosDialog(!openHiladosDialog);
  };

  const handleAddHilado = (hilado: any) => {
    if (!selectedHilados.some((h) => h.id === hilado.id)) {
      setSelectedHilados([...selectedHilados, { ...hilado, nroCabos: "", galga: "", diametro: "", lm: "", proporcion: "" }]);
      setOpenSnackbar(true);
    }
  };

  const handleDeleteSelectedHilado = (id: number) => {
    setSelectedHilados((prev) => prev.filter((hilado) => hilado.id !== id));
  };

  const handleFieldChange = (id: number, field: string, value: string) => {
    setSelectedHilados((prev) =>
      prev.map((hilado) =>
        hilado.id === id ? { ...hilado, [field]: value } : hilado
      )
    );
  };

  const handleCreateTejido = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Tejido creado con:", { familia, ancho, densidad, desagujado, selectedHilados });
    setFamilia("");
    setAncho("");
    setDensidad("");
    setDesagujado("");
    setSelectedHilados([]);
  };

  const handleCancel = () => {
    router.push("/operaciones-new/tejidos");
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
        <h2 className="text-2xl font-semibold text-center text-blue-800 dark:text-blue-400 mb-6">Crear Tejido</h2>
        <form onSubmit={handleCreateTejido}>
          <TextField
            label="Familia *"
            fullWidth
            value={familia}
            onChange={(e) => setFamilia(e.target.value)}
            margin="dense"
            variant="outlined"
          />
          <TextField
            label="Ancho *"
            fullWidth
            value={ancho}
            onChange={(e) => setAncho(e.target.value)}
            margin="dense"
            variant="outlined"
          />
          <TextField
            label="Densidad *"
            fullWidth
            value={densidad}
            onChange={(e) => setDensidad(e.target.value)}
            margin="dense"
            variant="outlined"
          />
          <TextField
            label="Desagujado *"
            fullWidth
            value={desagujado}
            onChange={(e) => setDesagujado(e.target.value)}
            margin="dense"
            variant="outlined"
          />

          <div className="mt-4">
            <h3 className="text-lg font-semibold text-black dark:text-white mb-2">Seleccionar Hilados</h3>
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-blue-900 uppercase text-center">
                  {["Título", "Nro Cabos", "Galga", "Diámetro", "LM", "Proporción", "Eliminar"].map((col, index) => (
                    <th key={index} className="px-4 py-4 text-center font-normal text-white">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {selectedHilados.map((hilado) => (
                  <tr key={hilado.id} className="text-center">
                    <td className="border-b border-[#eee] px-4 py-5">{hilado.titulo}</td>
                    <td className="border-b border-[#eee] px-4 py-5">
                      <TextField
                        variant="outlined"
                        size="small"
                        value={hilado.nroCabos}
                        onChange={(e) => handleFieldChange(hilado.id, "nroCabos", e.target.value)}
                        placeholder="Nro Cabos"
                      />
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5">
                      <TextField
                        variant="outlined"
                        size="small"
                        value={hilado.galga}
                        onChange={(e) => handleFieldChange(hilado.id, "galga", e.target.value)}
                        placeholder="Galga"
                      />
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5">
                      <TextField
                        variant="outlined"
                        size="small"
                        value={hilado.diametro}
                        onChange={(e) => handleFieldChange(hilado.id, "diametro", e.target.value)}
                        placeholder="Diámetro"
                      />
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5">
                      <TextField
                        variant="outlined"
                        size="small"
                        value={hilado.lm}
                        onChange={(e) => handleFieldChange(hilado.id, "lm", e.target.value)}
                        placeholder="LM"
                      />
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5">
                      <TextField
                        variant="outlined"
                        size="small"
                        value={hilado.proporcion}
                        onChange={(e) => handleFieldChange(hilado.id, "proporcion", e.target.value)}
                        placeholder="Proporción"
                      />
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5">
                      <IconButton
                        style={{ backgroundColor: "#ffff", color: "#d32f2f" }}
                        onClick={() => handleDeleteSelectedHilado(hilado.id)}
                      >
                        <Close />
                      </IconButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <IconButton onClick={toggleHiladosDialog}>
              <Add />
            </IconButton>
          </div>

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

      {/* Diálogo para seleccionar hilados */}
      <Dialog
        open={openHiladosDialog}
        onClose={toggleHiladosDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Seleccionar Hilados</DialogTitle>
        <DialogContent>
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-blue-900 uppercase text-center">
                {["ID", "Título", "Acabado", "Descripción", "Estado", "Receta", "Agregar"].map((col, index) => (
                  <th key={index} className="px-4 py-4 text-center font-normal text-white">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {hardcodedHilados
                .slice(pagina * filasPorPagina, pagina * filasPorPagina + filasPorPagina)
                .map((hilado) => (
                  <tr key={hilado.id} className="text-center">
                    <td className="border-b border-[#eee] px-4 py-5">{hilado.id}</td>
                    <td className="border-b border-[#eee] px-4 py-5">{hilado.titulo}</td>
                    <td className="border-b border-[#eee] px-4 py-5">{hilado.acabado}</td>
                    <td className="border-b border-[#eee] px-4 py-5">{hilado.descripcion}</td>
                    <td className="border-b border-[#eee] px-4 py-5">
                      <span className={`text-sm ${hilado.estado === "Activo" ? "text-green-500" : "text-red-500"}`}>{hilado.estado}</span>
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5">
                      <IconButton color="primary">
                        <Visibility />
                      </IconButton>
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5">
                      <IconButton color="primary" onClick={() => handleAddHilado(hilado)}>
                        <Add />
                      </IconButton>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          <TablePagination
            component="div"
            count={hardcodedHilados.length}
            page={pagina}
            onPageChange={(_, newPage) => setPagina(newPage)}
            rowsPerPage={filasPorPagina}
            onRowsPerPageChange={(e) => setFilasPorPagina(parseInt(e.target.value, 10))}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={toggleHiladosDialog}
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

export default CrearTejido;

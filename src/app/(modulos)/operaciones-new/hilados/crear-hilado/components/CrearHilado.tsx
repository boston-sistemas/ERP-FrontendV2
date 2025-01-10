"use client";

import React, { useState, useEffect } from "react";
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
import { fetchSpinningMethods, createYarn } from "../../services/hiladoService";
import { fetchFibras } from "../../../fibras/services/fibraService";
import { Fiber, Recipe } from "../../../models/models";

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
  const [selectedRecipes, setSelectedRecipes] = useState<Recipe[]>([]);
  const [availableFibras, setAvailableFibras] = useState<Fiber[]>([]);
  const [spinningMethods, setSpinningMethods] = useState<{ id: number; value: string }[]>([]);
  const [openFibrasDialog, setOpenFibrasDialog] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fibras = await fetchFibras();
        const methods = await fetchSpinningMethods();
        setAvailableFibras(fibras.fibers);
        setSpinningMethods(methods);
      } catch (error) {
        console.error("Error fetching data:", error);
        setSnackbarMessage("Error al cargar los datos.");
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
      }
    };
    fetchData();
  }, []);

  const toggleFibrasDialog = () => {
    setOpenFibrasDialog(!openFibrasDialog);
  };

  const handleAddFiber = (fibra: Fiber) => {
    if (!selectedRecipes.some((recipe) => recipe.fiber.id === fibra.id)) {
      setSelectedRecipes([...selectedRecipes, { fiber: fibra, proportion: 0 }]);
      setSnackbarMessage("Fibra añadida correctamente.");
      setSnackbarSeverity("success");
      setOpenSnackbar(true);
    }
  };

  const handleProportionChange = (id: string, value: string) => {
    const proportion = Number(value);
    setSelectedRecipes((prev) =>
      prev.map((recipe) =>
        recipe.fiber.id === id ? { ...recipe, proportion: proportion } : recipe
      )
    );
  };

  const handleDeleteSelectedFiber = (id: string) => {
    setSelectedRecipes((prev) => prev.filter((recipe) => recipe.fiber.id !== id));
  };

  const handleCreateHilado = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedRecipes.length === 0) {
      setSnackbarMessage("Debe seleccionar al menos una fibra.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
      return;
    }

    const totalProportion = selectedRecipes.reduce((acc, recipe) => acc + recipe.proportion, 0);
    if (totalProportion !== 100) {
      setSnackbarMessage("La suma de las proporciones debe ser igual a 100.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
      return;
    }

    const payload = {
      yarnCount: titulo,
      numberingSystem: "Ne",
      spinningMethodId: parseInt(acabado, 10),
      colorId: null, // Cambiar si es necesario agregar un color
      description: descripcion,
      recipe: selectedRecipes.map((recipe) => ({
        fiberId: recipe.fiber.id,
        proportion: recipe.proportion,
      })),
    };

    try {
      await createYarn(payload);
      setSnackbarMessage("Hilado creado exitosamente.");
      setSnackbarSeverity("success");
      setOpenSnackbar(true);

      // Limpiar el formulario
      setTitulo("");
      setAcabado("");
      setDescripcion("");
      setSelectedRecipes([]);

      // Redirigir a la lista de hilados
      router.push("/operaciones-new/hilados");
    } catch (error) {
      console.error("Error creando el hilado:", error);
      setSnackbarMessage("Error al crear el hilado. Por favor, inténtelo de nuevo.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
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
      <div className="bg-white dark:bg-gray-800 border border-gray-300 rounded-lg shadow-lg p-6 w-full" style={{ maxWidth: "90%", margin: "auto" }}>
        <h2 className="text-2xl font-semibold text-center text-blue-800 dark:text-blue-400 mb-6">Crear Hilado</h2>
        <form onSubmit={handleCreateHilado}>
          <TextField label="Título *" fullWidth value={titulo} onChange={(e) => setTitulo(e.target.value)} margin="dense" variant="outlined" />
          <div className="mt-4">
            <label htmlFor="spinningMethod" className="block text-sm font-medium text-gray-700 mb-1">
              Método de Hilado
            </label>
            <select
              id="spinningMethod"
              className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 sm:text-sm"
              value={acabado}
              onChange={(e) => setAcabado(e.target.value)}
            >
              <option value="">Seleccione un método</option>
              {spinningMethods.map((method) => (
                <option key={method.id} value={method.id}>
                  {method.value}
                </option>
              ))}
            </select>
          </div>

          <TextField label="Descripción" fullWidth value={descripcion} onChange={(e) => setDescripcion(e.target.value)} margin="dense" variant="outlined" />

          <div className="mt-4">
            <h3 className="text-lg font-semibold text-black dark:text-white mb-2">Seleccionar Fibras</h3>
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-blue-900 uppercase text-center">
                  {["Categoría", "Color", "Procedencia", "Proporción"].map((col, index) => (
                    <th key={index} className="px-4 py-4 text-center font-normal text-white">
                      {col}
                    </th>
                  ))}
                  <th className="px-4 py-4 text-center font-normal text-white">Eliminar</th>
                </tr>
              </thead>
              <tbody>
                {selectedRecipes.map((recipe) => (
                  <tr key={recipe.fiber.id} className="text-center">
                    <td className="border-b border-[#eee] px-4 py-5">{recipe.fiber.category?.value || "Sin categoría"}</td>
                    <td className="border-b border-[#eee] px-4 py-5">{recipe.fiber.color?.name || "Sin color"}</td>
                    <td className="border-b border-[#eee] px-4 py-5">{recipe.fiber.origin || "Sin procedencia"}</td>
                    <td className="border-b border-[#eee] px-4 py-5">
                      <TextField
                        variant="outlined"
                        size="small"
                        value={recipe.proportion}
                        onChange={(e) => handleProportionChange(recipe.fiber.id, e.target.value)}
                        placeholder="Proporción"
                        type="number"
                      />
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5">
                      <IconButton
                        style={{ backgroundColor: "#ffff", color: "#d32f2f" }}
                        onClick={() => handleDeleteSelectedFiber(recipe.fiber.id)}
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

          <div className="flex justify-end mt-6 gap-4">
            <Button onClick={handleCancel} variant="contained" style={{ backgroundColor: "#d32f2f", color: "#fff" }}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained" style={{ backgroundColor: "#1976d2", color: "#fff" }}>
              Crear
            </Button>
          </div>
        </form>
      </div>

      {/* Diálogo para seleccionar fibras */}
      <Dialog open={openFibrasDialog} onClose={toggleFibrasDialog} maxWidth="md" fullWidth>
        <DialogTitle>Seleccionar Fibras</DialogTitle>
        <DialogContent>
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-blue-900 uppercase text-center">
                {["Categoría", "Color", "Procedencia", "Estado"].map((col, index) => (
                  <th key={index} className="px-4 py-4 text-center font-normal text-white">
                    {col}
                  </th>
                ))}
                <th className="px-4 py-4 text-center font-normal text-white">Agregar</th>
              </tr>
            </thead>
            <tbody>
              {availableFibras
                .slice(pagina * filasPorPagina, pagina * filasPorPagina + filasPorPagina)
                .map((fibra) => (
                  <tr key={fibra.id} className="text-center">
                    <td className="border-b border-[#eee] px-4 py-5">{fibra.category?.value || "Sin categoría"}</td>
                    <td className="border-b border-[#eee] px-4 py-5">{fibra.color?.name || "Sin color"}</td>
                    <td className="border-b border-[#eee] px-4 py-5">{fibra.origin || "Sin procedencia"}</td>
                    <td className="border-b border-[#eee] px-4 py-5">
                      <span className={`text-sm ${fibra.isActive ? "text-green-500" : "text-red-500"}`}>
                        {fibra.isActive ? "Activo" : "Inactivo"}
                      </span>
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
            count={availableFibras.length}
            page={pagina}
            onPageChange={(_, newPage) => setPagina(newPage)}
            rowsPerPage={filasPorPagina}
            onRowsPerPageChange={(e) => setFilasPorPagina(parseInt(e.target.value, 10))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={toggleFibrasDialog} style={{ backgroundColor: "#1976d2", color: "#fff" }}>
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
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default CrearHilado;
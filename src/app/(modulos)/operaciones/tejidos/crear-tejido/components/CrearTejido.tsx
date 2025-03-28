"use client";

import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  Snackbar,
  Alert,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";
import { Add, Close } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import {
  createFabric,
  fetchFabricTypes,
  fetchMecsaColors,
  fetchHilados,
  FabricType,
} from "../../services/tejidosService";
import { MecsaColor } from "../../../models/models";

interface RecipeItem {
  yarnId: string; // ID del hilado
  proportion: number; // Proporción
}

const CrearTejido: React.FC = () => {
  const router = useRouter();

  // State para selects
  const [fabricTypes, setFabricTypes] = useState<FabricType[]>([]);
  const [colors, setColors] = useState<MecsaColor[]>([]);

  // Campos del Tejido
  const [fabricTypeId, setFabricTypeId] = useState<number>(0);
  const [density, setDensity] = useState<number>(100);
  const [width, setWidth] = useState<number>(80);
  const [colorId, setColorId] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  // Receta
  const [recipe, setRecipe] = useState<RecipeItem[]>([]);

  // Yarn/hilados
  const [hilados, setHilados] = useState<any[]>([]);
  const [hiladosDialogOpen, setHiladosDialogOpen] = useState(false);
  const [paginaH, setPaginaH] = useState(0);
  const [filasPorPaginaH, setFilasPorPaginaH] = useState(5);

  // Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [typesResp, colorsResp] = await Promise.all([
          fetchFabricTypes(),
          fetchMecsaColors(),
        ]);
        setFabricTypes(typesResp.fabricTypes || []);
        setColors(colorsResp.mecsaColors || []);

        const hiladosResp = await fetchHilados();
        setHilados(hiladosResp.yarns || []);
      } catch (err) {
        console.error("Error al cargar datos:", err);
      }
    };
    fetchData();
  }, []);

  const handleAddHilado = (h: any) => {
    if (!recipe.some((item) => item.yarnId === h.id)) {
      setRecipe([...recipe, { yarnId: h.id, proportion: 0 }]);
      setSnackbarMessage("Hilado añadido correctamente.");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    }
  };

  const handleProportionChange = (id: string, value: number) => {
    setRecipe((prev) =>
      prev.map((item) =>
        item.yarnId === id ? { ...item, proportion: value } : item
      )
    );
  };

  const handleDeleteRecipeItem = (id: string) => {
    setRecipe((prev) => prev.filter((item) => item.yarnId !== id));
  };

  const handleCreateFabric = async (e: React.FormEvent) => {
    e.preventDefault();
    const totalProportion = recipe.reduce(
      (sum, item) => sum + item.proportion,
      0
    );
    if (totalProportion !== 100) {
      setSnackbarMessage("La suma de las proporciones debe ser 100%.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    const payload = {
      fabricTypeId,
      density,
      width,
      colorId,
      description,
      recipe,
    };

    try {
      await createFabric(payload);
      setSnackbarMessage("Tejido creado exitosamente.");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      router.push("/operaciones/tejidos");
    } catch (err) {
      console.error("Error al crear tejido:", err);
      setSnackbarMessage("Error al crear el tejido.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  return (
    <div className="flex justify-center items-start min-h-screen bg-gray-100 py-10">
      <div
        className="bg-white border border-gray-300 rounded-lg shadow-lg p-6 w-full"
        style={{ maxWidth: "90%", margin: "auto" }}
      >
        <h2 className="text-2xl font-semibold text-center text-blue-800 mb-6">
          Crear Tejido
        </h2>
        <form onSubmit={handleCreateFabric}>
          <FormControl fullWidth margin="dense">
            <InputLabel id="fabric-type-label">Tipo de Tejido</InputLabel>
            <Select
              labelId="fabric-type-label"
              value={fabricTypeId}
              onChange={(e) => setFabricTypeId(Number(e.target.value))}
            >
              <MenuItem value="" disabled>
                Seleccione un tipo
              </MenuItem>
              {fabricTypes.map((type) => (
                <MenuItem key={type.id} value={type.id}>
                  {type.value}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="dense">
            <InputLabel id="color-label">Color</InputLabel>
            <Select
              labelId="color-label"
              value={colorId}
              onChange={(e) => setColorId(e.target.value)}
            >
              <MenuItem value="" disabled>
                Seleccione un color
              </MenuItem>
              {colors.map((color) => (
                <MenuItem key={color.id} value={color.id}>
                  {color.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Densidad"
            type="number"
            fullWidth
            margin="dense"
            value={density}
            onChange={(e) => setDensity(Number(e.target.value))}
          />

          <TextField
            label="Ancho"
            type="number"
            fullWidth
            margin="dense"
            value={width}
            onChange={(e) => setWidth(Number(e.target.value))}
          />

          <TextField
            label="Descripción"
            fullWidth
            margin="dense"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <h3 className="text-lg font-semibold text-black mb-4">Selección de Hilados</h3>
          <div className="max-w-full overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-blue-900 text-white uppercase">
                  <th className="px-4 py-4 font-normal text-center">ID</th>
                  <th className="px-4 py-4 font-normal text-center">Proporción</th>
                  <th className="px-4 py-4 font-normal text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {recipe.map((item) => (
                  <tr key={item.yarnId} className="text-center">
                    <td className="border-b border-gray-300 px-4 py-4">{item.yarnId}</td>
                    <td className="border-b border-gray-300 px-4 py-4">
                      <TextField
                        type="number"
                        variant="outlined"
                        size="small"
                        value={item.proportion}
                        onChange={(e) =>
                          handleProportionChange(item.yarnId, Number(e.target.value))
                        }
                      />
                    </td>
                    <td className="border-b border-gray-300 px-4 py-4">
                      <IconButton
                        style={{ backgroundColor: "#ffff", color: "#d32f2f" }}
                        onClick={() => handleDeleteRecipeItem(item.yarnId)}
                      >
                        <Close />
                      </IconButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={() => setHiladosDialogOpen(true)}
              style={{ marginTop: "16px", color: "#1976d2" }}
            >
              Agregar Hilado
            </Button>
          </div>

          <div className="flex justify-end mt-6 gap-4">
            <Button
              variant="contained"
              style={{ backgroundColor: "#d32f2f", color: "#fff" }}
              onClick={() => router.push("/operaciones/tejidos")}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              style={{ backgroundColor: "#1976d2", color: "#fff" }}
              type="submit"
            >
              Crear
            </Button>
          </div>
        </form>
      </div>

      <Dialog
        open={hiladosDialogOpen}
        onClose={() => setHiladosDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Seleccionar Hilados</DialogTitle>
        <DialogContent>
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-blue-900 text-white uppercase">
                <th className="px-4 py-4 font-normal text-center">ID</th>
                <th className="px-4 py-4 font-normal text-center">Descripción</th>
                <th className="px-4 py-4 font-normal text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {hilados
                .slice(
                  paginaH * filasPorPaginaH,
                  paginaH * filasPorPaginaH + filasPorPaginaH
                )
                .map((h) => (
                  <tr key={h.id} className="text-center">
                    <td className="border-b border-gray-300 px-4 py-4">{h.id}</td>
                    <td className="border-b border-gray-300 px-4 py-4">{h.description}</td>
                    <td className="border-b border-gray-300 px-4 py-4">
                      <Button
                        variant="contained"
                        style={{ backgroundColor: "#1976d2", color: "#fff" }}
                        onClick={() => handleAddHilado(h)}
                      >
                        Agregar
                      </Button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          <TablePagination
            component="div"
            count={hilados.length}
            page={paginaH}
            onPageChange={(_, newPage) => setPaginaH(newPage)}
            rowsPerPage={filasPorPaginaH}
            onRowsPerPageChange={(e) =>
              setFilasPorPaginaH(Number(e.target.value))
            }
          />
        </DialogContent>
        <DialogActions>
          <Button
            style={{ backgroundColor: "#d32f2f", color: "#fff" }}
            onClick={() => setHiladosDialogOpen(false)}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={snackbarSeverity}>{snackbarMessage}</Alert>
      </Snackbar>
    </div>
  );
};

export default CrearTejido;

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
  Alert,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Checkbox,
  ListItemText,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { Add, Close } from "@mui/icons-material";
import { useRouter } from "next/navigation";

import {
  createYarn,
  fetchSpinningMethods,
  fetchYarnCounts,
  fetchManufacturingSites,
  fetchYarnDistinctions,
} from "../../services/hiladoService";

import { fetchMecsaColors } from "../../../fibras/services/fibraService";

import { fetchFibras } from "../../../fibras/services/fibraService";

import { Fiber, Recipe, MecsaColor } from "../../../models/models";

const CrearHilado: React.FC = () => {
  const router = useRouter();

  // 1) Campos básicos obligatorios
  const [yarnCountId, setYarnCountId] = useState<number | "">("");
  const [spinningMethodId, setSpinningMethodId] = useState<number | "">("");
  const [manufacturedInId, setManufacturedInId] = useState<number | "">("");
  const [description, setDescription] = useState("");

  // 2) Distinctions (múltiples)
  const [distinctionIds, setDistinctions] = useState<number[]>([]);
  const [availableDistinctions, setAvailableDistinctions] = useState<
    { id: number; value: string }[]
  >([]);

  // 3) Color
  const [colorId, setColorId] = useState<string>(""); // si tu color ID es string
  const [availableColors, setAvailableColors] = useState<MecsaColor[]>([]);
  const [isColorEnabled, setIsColorEnabled] = useState(false);

  // 4) Receta
  const [selectedRecipes, setSelectedRecipes] = useState<Recipe[]>([]);

  // 5) Catálogos
  const [availableYarnCounts, setAvailableYarnCounts] = useState<
    { id: number; value: string }[]
  >([]);
  const [availableSpinningMethods, setAvailableSpinningMethods] = useState<
    { id: number; value: string }[]
  >([]);
  const [availableManufacturingSites, setAvailableManufacturingSites] =
    useState<{ id: number; value: string }[]>([]);
  const [availableFibras, setAvailableFibras] = useState<Fiber[]>([]);

  // 6) Diálogo de Fibras
  const [openFibrasDialog, setOpenFibrasDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagina, setPagina] = useState(0);
  const [filasPorPagina, setFilasPorPagina] = useState(5);

  // 7) Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );

  // ---------------------------------------------------------------------------
  // Cargar catálogos al iniciar
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Yarn Counts
        const counts = await fetchYarnCounts();
        setAvailableYarnCounts(counts);

        // Spinning Methods
        const methods = await fetchSpinningMethods();
        setAvailableSpinningMethods(methods);

        // Manufacturing sites
        const sites = await fetchManufacturingSites();
        setAvailableManufacturingSites(sites);

        // Distinctions
        const dists = await fetchYarnDistinctions();
        setAvailableDistinctions(dists);

        // Fibras
        const fibData = await fetchFibras(false);
        setAvailableFibras(fibData.fibers);

        // Colors (MecsaColors)
        const mecsaCols = await fetchMecsaColors();
        setAvailableColors(mecsaCols);
      } catch (error: any) {
        console.error("Error al cargar catálogos:", error);
        setSnackbarMessage("Error al cargar datos para crear hilado.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    };
    fetchData();
  }, []);

  // ---------------------------------------------------------------------------
  // Filtro de fibras en el diálogo
  // ---------------------------------------------------------------------------
  const filteredFibras = availableFibras.filter((fibra) => {
    const s = searchTerm.toLowerCase();
    return (
      fibra.id.toLowerCase().includes(s) ||
      fibra.denomination?.value?.toLowerCase().includes(s) ||
      fibra.category?.value?.toLowerCase().includes(s) ||
      (fibra.origin || "").toLowerCase().includes(s) ||
      fibra.color?.name?.toLowerCase().includes(s)
    );
  });

  // ---------------------------------------------------------------------------
  // Manejo de la receta
  // ---------------------------------------------------------------------------
  const handleAddFiber = (fibra: Fiber) => {
    if (!selectedRecipes.some((r) => r.fiber.id === fibra.id)) {
      setSelectedRecipes((prev) => [...prev, { fiber: fibra, proportion: 0 }]);
      setSnackbarMessage("Fibra añadida a la receta.");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    }
  };

  const handleDeleteFiber = (fiberId: string) => {
    setSelectedRecipes((prev) => prev.filter((r) => r.fiber.id !== fiberId));
  };

  const handleProportionChange = (fiberId: string, value: string) => {
    const n = Number(value);
    setSelectedRecipes((prev) =>
      prev.map((r) => (r.fiber.id === fiberId ? { ...r, proportion: n } : r))
    );
  };

  // ---------------------------------------------------------------------------
  // Distinciones (múltiples)
  // ---------------------------------------------------------------------------
  const handleDistinctionsChange = (e: any) => {
    const {
      target: { value },
    } = e;
    setDistinctions(typeof value === "string" ? value.split(",") : value);
  };

  const handleReloadFibras = async () => {
    try {
      const fibras = await fetchFibras(false);
      setAvailableFibras(fibras.fibers);
      setSnackbarMessage("Fibras recargadas correctamente.");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error recargando las fibras:", error);
      setSnackbarMessage("Error al recargar las fibras. Inténtelo de nuevo.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  // ---------------------------------------------------------------------------
  // Crear Hilado
  // ---------------------------------------------------------------------------
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validar sum de proportions
    const totalProp = selectedRecipes.reduce((acc, r) => acc + r.proportion, 0);
    if (totalProp !== 100) {
      setSnackbarMessage("Las proporciones deben sumar 100%.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }
    // Armar payload
    const payload = {
      yarnCountId:
        yarnCountId && yarnCountId !== "" ? Number(yarnCountId) : null,
      spinningMethodId:
        spinningMethodId && spinningMethodId !== ""
          ? Number(spinningMethodId)
          : null,
      manufacturedInId:
        manufacturedInId && manufacturedInId !== ""
          ? Number(manufacturedInId)
          : null,
      colorId: colorId || null, // <-- colorId si se seleccionó, o null
      distinctionIds, // array de IDs
      description,
      // Receta
      recipe: selectedRecipes.map((r) => ({
        fiberId: r.fiber.id,
        proportion: r.proportion,
      })),
    };

    try {
      console.log("Payload a enviar:", payload);
      await createYarn(payload);
      setSnackbarMessage("Hilado creado con éxito");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);

      // Reset form
      setYarnCountId("");
      setSpinningMethodId("");
      setManufacturedInId("");
      setColorId("");
      setDistinctions([]);
      setDescription("");
      setSelectedRecipes([]);

      router.push("/operaciones-new/hilados");
    } catch (error: any) {
      console.error("Error al crear hilado:", error);
      setSnackbarMessage(error.message || "Error al crear hilado");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleCancel = () => {
    router.push("/operaciones-new/hilados");
  };

  // ---------------------------------------------------------------------------
  // Diálogo de Fibras
  // ---------------------------------------------------------------------------
  const toggleFibrasDialog = () => {
    setOpenFibrasDialog(!openFibrasDialog);
  };
  const handleCloseSnackbar = () => setSnackbarOpen(false);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="flex justify-center items-start min-h-screen bg-gray-100 py-10">
      <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-6 w-full max-w-5xl mx-auto">
        <h2 className="text-2xl font-semibold text-center text-blue-800 mb-6">
          Crear Hilado
        </h2>

        <form onSubmit={handleCreate}>
          {/* YarnCount selector */}
          <TextField
            label="Título de Hilado "
            select
            fullWidth
            value={yarnCountId}
            onChange={(e) => setYarnCountId(e.target.value as number | "")}
            margin="dense"
          >
            <MenuItem value="">-- Seleccione un Título --</MenuItem>
            {availableYarnCounts.map((yc) => (
              <MenuItem key={yc.id} value={yc.id}>
                {yc.value}
              </MenuItem>
            ))}
          </TextField>

          {/* SpinningMethod */}
          <TextField
            label="Acabado "
            select
            fullWidth
            value={spinningMethodId}
            onChange={(e) =>
              setSpinningMethodId(e.target.value as number | "")
            }
            margin="dense"
          >
            <MenuItem value="">-- Sin acabado --</MenuItem>
            {availableSpinningMethods.map((sm) => (
              <MenuItem key={sm.id} value={sm.id}>
                {sm.value}
              </MenuItem>
            ))}
          </TextField>

          {/* ManufacturedIn */}
          <TextField
            label="Lugar de Fabricación"
            select
            fullWidth
            value={manufacturedInId}
            onChange={(e) =>
              setManufacturedInId(e.target.value as number | "")
            }
            margin="dense"
          >
            <MenuItem value="">-- Sin definir --</MenuItem>
            {availableManufacturingSites.map((ms) => (
              <MenuItem key={ms.id} value={ms.id}>
                {ms.value}
              </MenuItem>
            ))}
          </TextField>

          {/* Distinctions (varios) */}
          <FormControl fullWidth margin="dense">
            <InputLabel id="distinctions-label">Distinciones</InputLabel>
            <Select
              labelId="distinctions-label"
              multiple
              value={distinctionIds}
              onChange={handleDistinctionsChange}
              renderValue={(selected) => {
                return availableDistinctions
                  .filter((d) => selected.includes(d.id))
                  .map((x) => x.value)
                  .join(", ");
              }}
            >
              {availableDistinctions.map((d) => (
                <MenuItem key={d.id} value={d.id}>
                  <Checkbox checked={distinctionIds.includes(d.id)} />
                  <ListItemText primary={d.value} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Descripción */}
          <TextField
            label="Descripción"
            fullWidth
            margin="dense"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          
        {/* Toggle Color */}
        <FormControlLabel
          label="¿Hilado con color?"
          labelPlacement="start"
          control={
            <Switch
              checked={isColorEnabled}
              onChange={() => setIsColorEnabled(!isColorEnabled)}
              color="primary"
            />
          }
          sx={{ color: "black" }}
        />

        {/* Renderizar el selector solo si isColorEnabled es true */}
        {isColorEnabled && (
          <TextField
            label="Color"
            fullWidth
            select
            value={colorId}
            onChange={(e) => setColorId(e.target.value)}
            margin="dense"
            variant="outlined"
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#444444" },
                "&:hover fieldset": { borderColor: "#444444" },
                "&.Mui-focused fieldset": { borderColor: "#444444" },
              },
              "& .MuiInputLabel-root": { color: "#444444" },
              "& .MuiInputLabel-root.Mui-focused": { color: "#444444" },
            }}
          >
            <MenuItem value="">Sin color</MenuItem>
            {availableColors.map((col) => (
              <MenuItem key={col.id} value={col.id}>
                {col.name}
              </MenuItem>
            ))}
          </TextField>
        )}

          {/* Receta (Fibra/Proporciones) */}
          <h3 className="text-lg font-semibold text-black mt-6 mb-2">
            Receta (Fibra/Proporciones)
          </h3>
          <div className="max-w-full overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-blue-900 uppercase text-white text-center">
                  <th className="px-4 py-4">ID Fibra</th>
                  <th className="px-4 py-4">Denominación</th>
                  <th className="px-4 py-4">Origen</th>
                  <th className="px-4 py-4">Categoría</th>
                  <th className="px-4 py-4">Color</th>
                  <th className="px-4 py-4">Proporción %</th>
                  <th className="px-4 py-4">Eliminar</th>
                </tr>
              </thead>
              <tbody>
                {selectedRecipes.map((r) => (
                  <tr key={r.fiber.id} className="text-center text-black" >
                    <td className="border-b border-gray-300 px-4 py-5">
                      {r.fiber.id}
                    </td>
                    <td className="border-b border-gray-300 px-4 py-5">
                      {r.fiber.denomination?.value || "--"}
                    </td>
                    <td className="border-b border-gray-300 px-4 py-5">
                      {r.fiber.origin || "--"}
                    </td>
                    <td className="border-b border-gray-300 px-4 py-5">
                      {r.fiber.category?.value || "--"}
                    </td>
                    <td className="border-b border-gray-300 px-4 py-5">
                      {r.fiber.color?.name || "Crudo"}
                    </td>
                    <td className="border-b border-gray-300 px-4 py-5">
                      <TextField
                        variant="outlined"
                        size="small"
                        type="number"
                        value={r.proportion}
                        onChange={(e) =>
                          handleProportionChange(r.fiber.id, e.target.value)
                        }
                      />
                    </td>
                    <td className="border-b border-gray-300 px-4 py-5">
                      <IconButton
                        style={{ color: "#d32f2f" }}
                        onClick={() => handleDeleteFiber(r.fiber.id)}
                      >
                        <Close />
                      </IconButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button
            startIcon={<Add />}
            variant="outlined"
            onClick={() => setOpenFibrasDialog(true)}
            className="mt-2"
          >
            Agregar Fibra
          </Button>

          {/* Botones de acción */}
          <div className="flex justify-end gap-4 mt-6">
            <Button
              onClick={handleCancel}
              variant="contained"
              style={{ backgroundColor: "#d32f2f", color: "#fff" }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              style={{ backgroundColor: "#1976d2", color: "#fff" }}
            >
              Crear
            </Button>
          </div>
        </form>
      </div>

      {/* Diálogo para Fibras */}
      <Dialog
        open={openFibrasDialog}
        onClose={() => setOpenFibrasDialog(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Seleccionar Fibras</DialogTitle>
        <DialogContent>
        <div className="flex justify-between items-center">
            <TextField
              variant="outlined"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              style={{ width: "50%" }}
            />
            <Button
              onClick={handleReloadFibras}
              style={{ backgroundColor: "#1976d2", color: "#fff" }}
            >
              Recargar Fibras
            </Button>
          </div>
          <div className="max-w-full overflow-x-auto mt-4">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-blue-900 uppercase text-white text-center">
                  <th className="px-4 py-4">ID</th>
                  <th className="px-4 py-4">Denominación</th>
                  <th className="px-4 py-4">Origen</th>
                  <th className="px-4 py-4">Categoría</th>
                  <th className="px-4 py-4">Color</th>
                  <th className="px-4 py-4">Acción</th>
                </tr>
              </thead>
              <tbody>
                {filteredFibras
                  .slice(
                    pagina * filasPorPagina,
                    pagina * filasPorPagina + filasPorPagina
                  )
                  .map((fibra) => {
                    const alreadySelected = selectedRecipes.some(
                      (r) => r.fiber.id === fibra.id
                    );
                    return (
                      <tr key={fibra.id} className="text-center">
                        <td className="border-b border-gray-300 px-4 py-5">
                          {fibra.id}
                        </td>
                        <td className="border-b border-gray-300 px-4 py-5">
                          {fibra.denomination?.value || "--"}
                        </td>
                        <td className="border-b border-gray-300 px-4 py-5">
                          {fibra.origin || "--"}
                        </td>
                        <td className="border-b border-gray-300 px-4 py-5">
                          {fibra.category?.value || "--"}
                        </td>
                        <td className="border-b border-gray-300 px-4 py-5">
                          {fibra.color?.name || "--"}
                        </td>
                        <td className="border-b border-gray-300 px-4 py-5">
                          {alreadySelected ? (
                            <span className="text-gray-500">Seleccionada</span>
                          ) : (
                            <IconButton
                              color="primary"
                              onClick={() => handleAddFiber(fibra)}
                            >
                              <Add />
                            </IconButton>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </DialogContent>
        <DialogActions>
          <TablePagination
            component="div"
            count={filteredFibras.length}
            page={pagina}
            onPageChange={(_, newPage) => setPagina(newPage)}
            rowsPerPage={filasPorPagina}
            onRowsPerPageChange={(e) =>
              setFilasPorPagina(parseInt(e.target.value, 10))
            }
            rowsPerPageOptions={[5, 10, 25]}
          />
          <Button
            onClick={() => setOpenFibrasDialog(false)}
            style={{ backgroundColor: "#d32f2f", color: "#fff" }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default CrearHilado;

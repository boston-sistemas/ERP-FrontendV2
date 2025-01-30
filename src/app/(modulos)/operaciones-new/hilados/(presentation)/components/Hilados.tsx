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
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  InputLabel,
  FormControl,
  Checkbox,
  ListItemText,
  useTheme, 
  useMediaQuery,
  Autocomplete,
} from "@mui/material";
import {
  Edit,
  PowerSettingsNew,
  Add,
  Search,
  Close,
  Visibility,
  Fullscreen,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";

// --- import de servicios ---
import {
  fetchHilados,
  updateYarnStatus,
  fetchSpinningMethods,
  updateYarn,
  checkYarnUpdateStatus,  
  fetchYarnCounts,
  fetchManufacturingSites,
  fetchYarnDistinctions
} from "../../services/hiladoService";
import { fetchFibras, fetchMecsaColors } from "../../../fibras/services/fibraService";

import { Yarn, Recipe, Fiber, MecsaColor } from "../../../models/models";

const Hilados: React.FC = () => {
  const router = useRouter();

  // ────────────────────────────────────────────────────────────────────────────
  // Estados generales
  // ────────────────────────────────────────────────────────────────────────────
  const [hilados, setHilados] = useState<Yarn[]>([]);
  const [pagina, setPagina] = useState(0);
  const [filasPorPagina, setFilasPorPagina] = useState(10);

  // Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );

  // Para filtro/búsqueda
  const [searchTerm, setSearchTerm] = useState("");
  const [includeInactive, setIncludeInactive] = useState(false);

  // Mostrar/ocultar columnas
  const [showEditColumn, setShowEditColumn] = useState(true);
  const [showDisableColumn, setShowDisableColumn] = useState(true);

  // ────────────────────────────────────────────────────────────────────────────
  // Dialogos (visualizar receta, editar hilado, escoger fibras)
  // ────────────────────────────────────────────────────────────────────────────
  // Receta: diálogo de visualización
  const [openRecipeDialog, setOpenRecipeDialog] = useState(false);
  const [selectedHilado, setSelectedHilado] = useState<Yarn | null>(null);

  // Editar
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingYarn, setEditingYarn] = useState<Yarn | null>(null);
  const [isColorEnabled, setIsColorEnabled] = useState(false);

  // Diálogo de Fibras
  const [showFiberDialog, setShowFiberDialog] = useState(false);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down("md"));

  // ────────────────────────────────────────────────────────────────────────────
  // Atributos de la edición
  // ────────────────────────────────────────────────────────────────────────────
  const [availableFibras, setAvailableFibras] = useState<Fiber[]>([]);
  const [availableYarnCounts, setAvailableYarnCounts] = useState<
    { id: number; value: string }[]
  >([]);
  const [availableSpinningMethods, setAvailableSpinningMethods] = useState<
    { id: number; value: string }[]
  >([]);
  const [availableColors, setAvailableColors] = useState<MecsaColor[]>([]);
  const [availableManufacturingSites, setAvailableManufacturingSites] =
    useState<{ id: number; value: string }[]>([]);
  const [availableDistinctions, setAvailableDistinctions] = useState<
    { id: number; value: string }[]
  >([]);

  // ────────────────────────────────────────────────────────────────────────────
  // Estados del Form de edición
  // ────────────────────────────────────────────────────────────────────────────
  const [editForm, setEditForm] = useState<{
    yarnCountId: number | "";
    spinningMethodId: number | "";
    colorId: string;
    manufacturedInId: number | "";
    distinctionIds: number[];
    description: string;
    recipe: Recipe[];
  }>({
    yarnCountId: "",
    spinningMethodId: "",
    colorId: "",
    manufacturedInId: "",
    distinctionIds: [],
    description: "",
    recipe: [],
  });

  // Para controlar si es parcial
  const [isPartial, setIsPartial] = useState(false);
  const [allowedFields, setAllowedFields] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchHilados(includeInactive);
        setHilados(data.yarns);

        const spinningMeths = await fetchSpinningMethods();
        setAvailableSpinningMethods(spinningMeths);

        const fibers = await fetchFibras(includeInactive);
        setAvailableFibras(fibers.fibers);

        const yarnCounts = await fetchYarnCounts();
        setAvailableYarnCounts(yarnCounts);

        const colors = await fetchMecsaColors();
        setAvailableColors(colors);

        const sites = await fetchManufacturingSites();
        setAvailableManufacturingSites(sites);

        const dists = await fetchYarnDistinctions();
        setAvailableDistinctions(dists);

      } catch (error) {
        console.error("Error fetching hilados:", error);
        setSnackbarMessage("Error al cargar los datos de hilados.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    };
    fetchData();
  }, [includeInactive]);

  // ────────────────────────────────────────────────────────────────────────────
  // FILTROS
  // ────────────────────────────────────────────────────────────────────────────
  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIncludeInactive(event.target.checked);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredHilados = hilados.filter((h) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (h.yarnCount?.value || "").toLowerCase().includes(searchLower) ||
      (h.description || "").toLowerCase().includes(searchLower) ||
      (h.color?.name || "").toLowerCase().includes(searchLower) ||
      (h.spinningMethod?.value || "").toLowerCase().includes(searchLower) ||
      String(h.barcode ?? "").toLowerCase().includes(searchLower)
    );
  });

  // ────────────────────────────────────────────────────────────────────────────
  // VISUALIZAR RECETA
  // ────────────────────────────────────────────────────────────────────────────
  const handleOpenRecipeDialog = (yarn: Yarn) => {
    setSelectedHilado(yarn);
    setOpenRecipeDialog(true);
  };
  const handleCloseRecipeDialog = (yarn: Yarn) => {
    setSelectedHilado(yarn);
    setOpenRecipeDialog(false);
  };

  const handleCrearHilado = () => {
    router.push("/operaciones-new/hilados/crear-hilado");
  };

  // ────────────────────────────────────────────────────────────────────────────
  // EDITAR HILADO
  // ────────────────────────────────────────────────────────────────────────────
  const handleEditClick = async (yarn: Yarn) => {
    try {
      const status = await checkYarnUpdateStatus(yarn.id);
      if (!status.updatable) {
        setSnackbarMessage(status.message || "El hilado no es editable.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return;
      }

      setIsPartial(status.isPartial);
      setAllowedFields(status.fields || []); 

      setEditingYarn(yarn);
      setEditForm({
        yarnCountId: yarn.yarnCount?.id || "",
        spinningMethodId: yarn.spinningMethod?.id || "",
        colorId: yarn.color?.id || "",
        manufacturedInId: yarn.manufacturedIn?.id || "",
        distinctionIds: yarn.distinctions
          ? yarn.distinctions.map((dist) => dist.id)
          : [],
        description: yarn.description || "",
        recipe: yarn.recipe ? [...yarn.recipe] : [],
      });

      setIsColorEnabled(!!yarn.color);
      setEditDialogOpen(true);
    } catch (err: any) {
      console.error("Error al chequear status de hilado:", err);
      setSnackbarMessage(
        err.message || "No se pudo verificar si el hilado es editable."
      );
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
    setEditingYarn(null);
    setIsPartial(false);
    setAllowedFields([]);
  };

  const handleEditSave = async () => {
    if (!editingYarn) return;
  
    let payload: any = {};
  
    if (isPartial) {
      payload = {
        description: editForm.description,
      };
    } else {
      payload = {
        yarnCountId:
          editForm.yarnCountId !== "" ? Number(editForm.yarnCountId) : null,
        spinningMethodId:
          editForm.spinningMethodId !== ""
            ? Number(editForm.spinningMethodId)
            : null,
        colorId: editForm.colorId || null,
        manufacturedInId:
          editForm.manufacturedInId !== ""
            ? Number(editForm.manufacturedInId)
            : null,
        distinctionIds: editForm.distinctionIds,
        description: editForm.description,
        recipe: editForm.recipe.map((item) => ({
          fiberId: item.fiber?.id,
          proportion: item.proportion,
        })),
      };
    }

    try {
      await updateYarn(editingYarn.id, payload);

      setSnackbarMessage("Hilado actualizado correctamente.");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);

      // Recargar tabla
      const data = await fetchHilados(includeInactive);
      setHilados(data.yarns);

      handleEditClose(); 
    } catch (error: any) {
      console.error("Error actualizando el hilado:", error);
      setSnackbarMessage(error.message || "Error al actualizar el hilado.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  // ────────────────────────────────────────────────────────────────────────────
  // (DES)HABILITAR HILADO
  // ────────────────────────────────────────────────────────────────────────────
  const handleToggleYarnStatus = async (id: string, isActive: boolean) => {
    try {
      await updateYarnStatus(id, !isActive);
      setHilados((prev) =>
        prev.map((h) =>
          h.id === id ? { ...h, isActive: !isActive } : h
        )
      );
      setSnackbarMessage(
        `Hilado ${!isActive ? "habilitado" : "deshabilitado"} correctamente.`
      );
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error al cambiar estado del hilado:", error);
      setSnackbarMessage("Error al cambiar estado del hilado.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  // ────────────────────────────────────────────────────────────────────────────
  // FIBRAS EN EL DIALOGO
  // ────────────────────────────────────────────────────────────────────────────
  const [fiberSearchTerm, setFiberSearchTerm] = useState("");
  const [fiberPage, setFiberPage] = useState(0);
  const [fiberRowsPerPage, setFiberRowsPerPage] = useState(5);

  const filteredFibras = availableFibras.filter((fibra) => {
    const searchLower = fiberSearchTerm.toLowerCase();
    return (
      fibra.denomination?.value?.toLowerCase().includes(searchLower) ||
      fibra.category?.value?.toLowerCase().includes(searchLower) ||
      (fibra.origin || "").toLowerCase().includes(searchLower) ||
      fibra.color?.name?.toLowerCase().includes(searchLower)
    );
  });

  const handleFiberDialogClose = () => setShowFiberDialog(false);

  const handleReloadFibras = async () => {
    try {
      const fibs = await fetchFibras(false);
      setAvailableFibras(fibs.fibers);
      setSnackbarMessage("Fibras recargadas correctamente.");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error: any) {
      console.error("Error recargando fibras:", error);
      setSnackbarMessage("Error al recargar fibras.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  // ────────────────────────────────────────────────────────────────────────────
  // Añadir / Eliminar fibras de la receta en EDICIÓN
  // ────────────────────────────────────────────────────────────────────────────
  const handleAddFiber = (fibra: Fiber) => {
    if (!editForm.recipe.some((r) => r.fiber?.id === fibra.id)) {
      setEditForm((prev) => ({
        ...prev,
        recipe: [...prev.recipe, { fiber: fibra, proportion: 0 }],
      }));
      setSnackbarMessage("Fibra añadida a la receta");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    }
  };

  const handleDeleteSelectedFibra = (fiberId?: string) => {
    setEditForm((prev) => ({
      ...prev,
      recipe: prev.recipe.filter((r) => r.fiber?.id !== fiberId),
    }));
  };

  const handleProportionChange = (fiberId?: string, val?: string) => {
    const num = Number(val || 0);
    setEditForm((prev) => ({
      ...prev,
      recipe: prev.recipe.map((r) =>
        r.fiber?.id === fiberId ? { ...r, proportion: num } : r
      ),
    }));
  };

  // ────────────────────────────────────────────────────────────────────────────
  // Distinciones (múltiples) en EDICIÓN
  // ────────────────────────────────────────────────────────────────────────────
  const handleDistinctionChange = (e: any) => {
    const { value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      distinctionIds: typeof value === "string" ? value.split(",") : value,
    }));
  };

  // ────────────────────────────────────────────────────────────────────────────
  // Funciones de ayuda para "edición parcial"
  // ────────────────────────────────────────────────────────────────────────────
  const isFieldDisabled = (fieldName: string) => {
    // Si no es parcial → no deshabilitamos nada
    if (!isPartial) return false;
    // Si es parcial, sólo habilitamos los campos presentes en allowedFields
    return !allowedFields.includes(fieldName);
  };

  const handleCloseSnackbar = () => setSnackbarOpen(false);

  // ────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default sm:px-7.5 xl:pb-1">
        {/* Barra superior */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-gray-300 rounded-md px-2">
              <Search />
              <TextField
                variant="standard"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={handleSearch}
                InputProps={{
                  disableUnderline: true,
                }}
              />
            </div>
            <FormControlLabel
              control={
                <Switch
                  checked={includeInactive}
                  onChange={handleSwitchChange}
                  color="primary"
                />
              }
              label="Mostrar inactivos"
            />
          </div>
          <div className="space-x-2">
            <Button
              startIcon={<Add />}
              variant="contained"
              style={{ backgroundColor: "#1976d2", color: "#fff" }}
              onClick={handleCrearHilado}
            >
              CREAR
            </Button>
            <Button
              startIcon={<Edit />}
              variant="contained"
              style={{ backgroundColor: "#1976d2", color: "#fff" }}
              color="primary"
              onClick={() => setShowEditColumn((prev) => !prev)}
            >
              Editar
            </Button>
            <Button
              startIcon={<PowerSettingsNew />}
              variant="contained"
              style={{ backgroundColor: "#d32f2f", color: "#fff" }}
              color="error"
              onClick={() => setShowDisableColumn((prev) => !prev)}
            >
              Deshabilitar
            </Button>
          </div>
        </div>

        {/* Tabla principal */}
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-blue-900 uppercase text-center text-white">
                <th className="px-4 py-4 font-normal">TÍTULO</th>
                <th className="px-4 py-4 font-normal">DESCRIPCIÓN</th>
                <th className="px-4 py-4 font-normal">ACABADO</th>
                <th className="px-4 py-4 font-normal">INFORMACIÓN</th>
                <th className="px-4 py-4 font-normal">ESTADO</th>
                {showEditColumn && <th className="px-4 py-4 font-normal">EDITAR</th>}
                {showDisableColumn && (
                  <th className="px-4 py-4 font-normal">DESHABILITAR</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredHilados.length > 0 ? (
                filteredHilados
                  .slice(
                    pagina * filasPorPagina,
                    pagina * filasPorPagina + filasPorPagina
                  )
                  .map((hilado) => (
                    <tr key={hilado.id} className="text-center text-black">
                      <td className="border-b border-gray-300 px-4 py-5">
                        {hilado.yarnCount?.value || ""}
                      </td>
                      <td className="border-b border-gray-300 px-4 py-5">
                        {hilado.description}
                      </td>
                      <td className="border-b border-gray-300 px-4 py-5">
                        {hilado.spinningMethod?.value || ""}
                      </td>
                      <td className="border-b border-gray-300 px-4 py-5">
                        <IconButton
                          onClick={() => handleOpenRecipeDialog(hilado)}
                        >
                          <Visibility />
                        </IconButton>
                      </td>
                      <td className="border-b border-gray-300 px-4 py-5">
                        <span
                          className={` ${
                            hilado.isActive
                              ? "text-green-500 font-normal"
                              : "text-red-500 font-normal"
                          }`}
                        >
                          {hilado.isActive ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      {showEditColumn && (
                        <td className="border-b border-gray-300 px-4 py-5">
                          <IconButton onClick={() => handleEditClick(hilado)}>
                            <Edit />
                          </IconButton>
                        </td>
                      )}
                      {showDisableColumn && (
                        <td className="border-b border-gray-300 px-4 py-5">
                          <IconButton
                            onClick={() =>
                              handleToggleYarnStatus(hilado.id, hilado.isActive)
                            }
                          >
                            <PowerSettingsNew />
                          </IconButton>
                        </td>
                      )}
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan={9} className="pt-5 pb-5 text-center text-black">
                    No hay datos disponibles
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={filteredHilados.length}
            rowsPerPage={filasPorPagina}
            page={pagina}
            onPageChange={(_, newPage) => setPagina(newPage)}
            onRowsPerPageChange={(e) =>
              setFilasPorPagina(parseInt(e.target.value, 10))
            }
          />
        </div>
      </div>

      {/* Diálogo para VISUALIZAR receta */}
      <Dialog
        open={openRecipeDialog}
        onClose={handleCloseRecipeDialog}
        fullScreen={isSmallScreen}
        maxWidth="md"
        PaperProps={{
          sx: {
            ...( !isSmallScreen && !isMediumScreen && {
              marginLeft: "280px", 
              maxWidth: "calc(100% - 280px)", 
            }),
            maxHeight: "calc(100% - 64px)",
            overflowY: "auto",
          },
        }}
      >
        <DialogContent>
          <h3 className="text-lg font-semibold text-black mb-4">
            Información del Hilado
          </h3>
            {selectedHilado && (
              <div className="mb-4 text-black">
                <p className="mb-2"><strong>ID:</strong> {selectedHilado.id || "--"}</p>
                <p className="mb-2"><strong>Descripción:</strong> {selectedHilado.description}</p>
                <p className="mb-2"><strong>Título:</strong> {selectedHilado.yarnCount?.value || "--"}</p>
                <p className="mb-2"><strong>Acabado:</strong> {selectedHilado.spinningMethod?.value || "--"}</p>
                <p className="mb-2"><strong>Código de barras:</strong> {selectedHilado.barcode}</p>
                <p className="mb-2"><strong>Color:</strong> {selectedHilado.color?.name || "No teñido"}</p>
                <p className="mb-2"><strong>Fabricado en:</strong> {selectedHilado.manufacturedIn?.value || "--"}</p>
                <p className="mb-2"><strong>Distinciones:</strong>{" "}
                  {selectedHilado.distinctions && selectedHilado.distinctions.length > 0
                    ? selectedHilado.distinctions.map((dist) => dist.value).join(", ")
                    : "--"
                  }
                </p>
              </div>
            )}
          <div className="max-w-full overflow-x-auto">
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="bg-blue-900 uppercase text-center text-white">
                  <th className="px-4 py-4 text-center font-normal">
                    Categoría
                  </th>
                  <th className="px-4 py-4 text-center font-normal">
                    Denominación
                  </th>
                  <th className="px-4 py-4 text-center font-normal">
                    Procedencia
                  </th>
                  <th className="px-4 py-4 text-center font-normal">
                    Color
                  </th>
                  <th className="px-4 py-4 text-center font-normal">
                    Proporción (%)
                  </th>
                </tr>
              </thead>
              <tbody>
                {selectedHilado?.recipe?.length ?? 0 > 0 ? (
                  selectedHilado?.recipe.map((item, index) => (
                    <tr key={index} className="text-center text-black">
                      <td className="border-b border-gray-300 px-4 py-5">
                        {item.fiber?.category?.value || "-"}
                      </td>
                      <td className="border-b border-gray-300 px-4 py-5">
                        {item.fiber?.denomination?.value || "-"}
                      </td>
                      <td className="border-b border-gray-300 px-4 py-5">
                        {item.fiber?.origin || "-"}
                      </td>
                      <td className="border-b border-gray-300 px-4 py-5">
                        {item.fiber?.color?.name || "Crudo"}
                      </td>
                      <td className="border-b border-gray-300 px-4 py-5">
                        {item.proportion}%
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-gray-500">
                      No hay datos disponibles.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseRecipeDialog}
            variant="contained"
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
          severity={snackbarSeverity}
          onClose={handleCloseSnackbar}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Diálogo para EDITAR hilado */}
      <Dialog 
        open={editDialogOpen} 
        onClose={handleEditClose} 
        fullScreen={isSmallScreen}
        maxWidth={false} 
        PaperProps={{
          sx: {
            ...( !isSmallScreen && !isMediumScreen && {
              marginLeft: "280px", 
              maxWidth: "800px", 
              width: "800px", 
            }),
            maxHeight: "calc(100% - 64px)",
            overflowY: "auto",
            padding: "20px", 
          },
        }}
      >
        <DialogTitle>
          {isPartial ? "Editar Descripción del Hilado" : "Editar Hilado"}
        </DialogTitle>
        <DialogContent>
          {editForm && (
            <>
              {/* Solo mostrar los campos si NO es edición parcial */}
              {!isPartial && (
                <>
                  {/* Título del Hilado */}
                  <Autocomplete
                    options={availableYarnCounts}
                    getOptionLabel={(option) => option.value}
                    value={availableYarnCounts.find(
                      (option) => option.id === editForm.yarnCountId
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Título de Hilado"
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
                      />
                    )}
                    onChange={(event, newValue) => {
                      setEditForm((prev) => ({
                        ...prev,
                        yarnCountId: newValue ? newValue.id : "",
                      }));
                    }}
                  />

                  {/* Acabado */}
                  <Autocomplete
                    options={availableSpinningMethods}
                    getOptionLabel={(option) => option.value}
                    value={availableSpinningMethods.find(
                      (option) => option.id === editForm.spinningMethodId
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Acabado"
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
                      />
                    )}
                    onChange={(event, newValue) => {
                      setEditForm((prev) => ({
                        ...prev,
                        spinningMethodId: newValue ? newValue.id : "",
                      }));
                    }}
                  />

                  {/* Lugar de Fabricación */}
                  <Autocomplete
                    options={availableManufacturingSites}
                    getOptionLabel={(option) => option.value}
                    value={availableManufacturingSites.find(
                      (option) => option.id === editForm.manufacturedInId
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Lugar de Fabricación"
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
                      />
                    )}
                    onChange={(event, newValue) => {
                      setEditForm((prev) => ({
                        ...prev,
                        manufacturedInId: newValue ? newValue.id : "",
                      }));
                    }}
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

                  {/* Color (si está habilitado) */}
                  {isColorEnabled && (
                    <Autocomplete
                      options={availableColors}
                      getOptionLabel={(option) => option.name}
                      value={availableColors.find(
                        (option) => option.id === editForm.colorId
                      )}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Color"
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
                        />
                      )}
                      onChange={(event, newValue) => {
                        setEditForm((prev) => ({
                          ...prev,
                          colorId: newValue ? newValue.id : "",
                        }));
                      }}
                    />
                  )}

                  {/* Distinciones */}
                  <FormControl fullWidth margin="dense">
                    <InputLabel>Distinciones</InputLabel>
                    <Select
                      multiple
                      label="Distinciones"
                      value={editForm.distinctionIds}
                      onChange={handleDistinctionChange}
                      disabled={isFieldDisabled("distinctionIds")}
                      renderValue={(selected) => {
                        // Muestra el texto de las distinciones
                        const selectedDist = availableDistinctions.filter((d) =>
                          selected.includes(d.id)
                        );
                        return selectedDist.map((x) => x.value).join(", ");
                      }}
                    >
                      {availableDistinctions.map((d) => (
                        <MenuItem key={d.id} value={d.id}>
                          <Checkbox checked={editForm.distinctionIds.includes(d.id)} />
                          <ListItemText primary={d.value} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </>
              )}

              {/* Descripción (siempre visible) */}
              <TextField
                label="Descripción"
                fullWidth
                multiline
                rows={3}
                margin="dense"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, description: e.target.value }))
                }
              />

              {/* Tabla de receta (solo si no es parcial) */}
              {!isPartial && (
                <>
                  <h3 className="text-lg font-semibold text-black mb-2 mt-4">Receta</h3>
                  <div className="max-w-full overflow-x-auto">
                    <table className="w-full table-auto">
                      <thead>
                        <tr className="bg-blue-900 uppercase text-center text-white">
                          <th className="px-4 py-4 text-center font-normal">Categoria</th>
                          <th className="px-4 py-4 text-center font-normal">Denominación</th>
                          <th className="px-4 py-4 text-center font-normal">Procedencia</th>
                          <th className="px-4 py-4 text-center font-normal">Color</th>
                          <th className="px-4 py-4 text-center font-normal">Proporción</th>
                          <th className="px-4 py-4 text-center font-normal">Eliminar</th>
                        </tr>
                      </thead>
                      <tbody>
                        {editForm.recipe.map((r, index) => (
                          <tr key={index} className="text-center">
                            <td className="border-b border-gray-200 px-4 py-3">
                              {r.fiber?.category?.value || "-"}
                            </td>
                            <td className="border-b border-gray-200 px-4 py-3">
                              {r.fiber?.denomination?.value || "-"}
                            </td>
                            <td className="border-b border-gray-200 px-4 py-3">
                              {r.fiber?.origin || "-"}
                            </td>
                            <td className="border-b border-gray-200 px-4 py-3">
                              {r.fiber?.color?.name || "Crudo"}
                            </td>
                            <td className="border-b border-gray-200 px-4 py-3">
                              <TextField
                                variant="outlined"
                                size="small"
                                type="number"
                                value={r.proportion || ""}
                                onChange={(e) =>
                                  handleProportionChange(r.fiber?.id, e.target.value)
                                }
                                disabled={isFieldDisabled("recipe")}
                              />
                            </td>
                            <td className="border-b border-gray-200 px-4 py-3">
                              <IconButton
                                disabled={isFieldDisabled("recipe")}
                                style={{ color: isFieldDisabled("recipe") ? "#aaa" : "#d32f2f" }}
                                onClick={() => handleDeleteSelectedFibra(r.fiber?.id)}
                              >
                                <Close />
                              </IconButton>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Agregar fibra */}
                    <IconButton
                      onClick={() => setShowFiberDialog(true)}
                      style={{ color: "#1976d2" }}
                      disabled={isFieldDisabled("recipe")}
                    >
                      <Add />
                    </IconButton>
                  </div>
                </>
              )}
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            onClick={handleEditClose}
            variant="contained"
            style={{ backgroundColor: "#d32f2f", color: "#fff" }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleEditSave}
            variant="contained"
            style={{ backgroundColor: "#1976d2", color: "#fff" }}
          >
            Guardar
          </Button>
        </DialogActions>

        {/* Diálogo de fibras para la receta */}
        <Dialog
          open={showFiberDialog}
          onClose={handleFiberDialogClose}
          fullScreen={isSmallScreen}
          maxWidth="md"
          PaperProps={{
            sx: {
              ...( !isSmallScreen && !isMediumScreen && {
                marginLeft: "280px", 
                maxWidth: "calc(100% - 280px)", 
              }),
              maxHeight: "calc(100% - 64px)",
              overflowY: "auto",
            },
          }}
        >
          <DialogTitle>Fibras Disponibles</DialogTitle>
          <DialogContent>
            <TextField
              variant="outlined"
              placeholder="Buscar fibra..."
              value={fiberSearchTerm}
              onChange={(e) => setFiberSearchTerm(e.target.value)}
              size="small"
              style={{ width: "50%" }}
            />
            <Button
              onClick={handleReloadFibras}
              style={{ backgroundColor: "#1976d2", color: "#fff", marginLeft: "8px" }}
            >
              Recargar Fibras
            </Button>

            <div className="max-w-full overflow-x-auto mt-4">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-blue-900 uppercase text-white text-center">
                    <th className="px-4 py-4">Categoria</th>
                    <th className="px-4 py-4">Denominación</th>
                    <th className="px-4 py-4">Procedencia</th>
                    <th className="px-4 py-4">Color</th>
                    <th className="px-4 py-4">Seleccionar</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFibras
                    .slice(
                      fiberPage * fiberRowsPerPage,
                      fiberPage * fiberRowsPerPage + fiberRowsPerPage
                    )
                    .map((fibra) => {
                      const isSelected = editForm.recipe.some(
                        (r) => r.fiber?.id === fibra.id
                      );
                      return (
                        <tr
                          key={fibra.id}
                          className={`text-center ${
                            isSelected ? "bg-green-100" : ""
                          }`}
                        >
                          <td className="border-b border-gray-300 px-4 py-5">
                            {fibra.category?.value || "-"}
                          </td>
                          <td className="border-b border-gray-300 px-4 py-5">
                            {fibra.denomination?.value || "-"}
                          </td>
                          <td className="border-b border-gray-300 px-4 py-5">
                            {fibra.origin || "-"}
                          </td>
                          <td className="border-b border-gray-300 px-4 py-5">
                            {fibra.color?.name || "Crudo"}
                          </td>
                          <td className="border-b border-gray-300 px-4 py-5">
                            {!isSelected ? (
                              <IconButton
                                style={{ color: "#1976d2" }}
                                onClick={() => handleAddFiber(fibra)}
                                disabled={isFieldDisabled("recipe")}
                              >
                                <Add />
                              </IconButton>
                            ) : (
                              <span className="text-gray-500">
                                Seleccionada
                              </span>
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
              page={fiberPage}
              onPageChange={(_, newPage) => setFiberPage(newPage)}
              rowsPerPage={fiberRowsPerPage}
              onRowsPerPageChange={(e) =>
                setFiberRowsPerPage(parseInt(e.target.value, 10))
              }
              rowsPerPageOptions={[5, 10, 15]}
            />
            <Button
              onClick={handleFiberDialogClose}
              variant="contained"
              style={{ backgroundColor: "#d32f2f", color: "#fff" }}
            >
              Cerrar
            </Button>
          </DialogActions>
        </Dialog>
      </Dialog>
    </div>
  );
};

export default Hilados;

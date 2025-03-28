"use client";

import React, { useState, useEffect } from "react";
import {
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  Menu,
  TablePagination,
  MenuItem,
  FormControlLabel,
  Switch,
  Tooltip,
  Autocomplete,
} from "@mui/material";
import {
  Edit,
  PowerSettingsNew,
  Add,
  FilterList,
  Search,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { Fiber, Fibra, MecsaColor } from "../../../models/models";

// Importa tus casos de uso existentes
import {
  handleFetchFibras,
  updateFiberStatus,
  handleUpdateFiber,
  handleFetchFiberCategories,
  handleFetchCountries,
  handleFetchColors,
  handleFetchDenominationFibers,
} from "../../use-cases/fibra";

// Para denominaciones
type FiberDenomination = {
  id: number;
  value: string;
};

const Fibras: React.FC = () => {
  const router = useRouter();

  // Estados
  const [fibras, setFibras] = useState<Fiber[]>([]);
  const [categories, setCategories] = useState<{ id: number; value: string }[]>(
    []
  );
  const [isColorEnabled, setIsColorEnabled] = useState(false);
  const [countries, setCountries] = useState<{ id: string; name: string }[]>([]);
  const [colors, setColors] = useState<MecsaColor[]>([]);
  const [denominations, setDenominations] = useState<FiberDenomination[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Paginación
  const [pagina, setPagina] = useState(0);
  const [filasPorPagina, setFilasPorPagina] = useState(10);

  // Diálogo de edición
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedFibra, setSelectedFibra] = useState<Fibra | null>(null);

  // Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [denominationFilter, setDenominationFilter] = useState("");
  const [originFilter, setOriginFilter] = useState("");
  const [includeInactive, setIncludeInactive] = useState(false);

  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [showEditColumn, setShowEditColumn] = useState(false);
  const [showDisableColumn, setShowDisableColumn] = useState(false);

  const [color, setColor] = useState<string>("");

  // ---------------------------------------------------------------------------
  // 1) Cargar datos
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        await handleFetchFibras(setFibras, setLoading, includeInactive);
        await handleFetchFiberCategories(setCategories);
        await handleFetchCountries(setCountries);
        await handleFetchColors(setColors);
        await handleFetchDenominationFibers(setDenominations);
      } catch (err) {
        console.error("Error al cargar datos:", err);
        setError("Error al cargar datos");
      }
    };
    fetchData();
  }, []);

  // Si cambia el switch "Mostrar inactivos"
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await handleFetchFibras(setFibras, setLoading, includeInactive);
    };
    fetchData();
  }, [includeInactive]);

  // ---------------------------------------------------------------------------
  // 2) Handlers de menú y snackbar
  // ---------------------------------------------------------------------------
  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };
  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setSelectedFibra(null);
  };

  const handleToggleEditColumn = () => {
    setShowEditColumn(!showEditColumn);
  };
  const handleToggleDisableColumn = () => {
    setShowDisableColumn(!showDisableColumn);
  };

  // ---------------------------------------------------------------------------
  // 3) Crear y editar fibras
  // ---------------------------------------------------------------------------
  const handleCrearFibra = () => {
    router.push("/operaciones/fibras/crear-fibra");
  };

  // Al hacer clic en Editar
  const handleEditFibra = (fibra: Fiber) => {
    if (!fibra.updateCheck?.updatable) {
      const reason = fibra.updateCheck?.message || "No se puede editar";
      setSnackbarMessage(reason);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    setSelectedFibra({
      ...fibra,
      categoryId: fibra.category?.id || 0,
      colorId: fibra.color?.id || "",
      denominationId: fibra.denomination?.id ?? null,
      origin: fibra.origin || "",
      category: fibra.category || { id: 0, value: "" },
      color: fibra.color || {
        id: "",
        name: "",
        sku: "",
        hexadecimal: "",
        isActive: true,
      },
    });
    setIsColorEnabled(!!fibra.color);
    setColor(fibra.color?.id || "");
    setOpenEditDialog(true);
  };

  const handleSaveFibra = async () => {
    if (selectedFibra) {
      const payload = {
        categoryId: selectedFibra.categoryId || null,
        denominationId: selectedFibra.denominationId || null,
        origin: selectedFibra.origin || null,
        colorId: isColorEnabled ? color : null,
      };

      try {
        await handleUpdateFiber(
          selectedFibra.id,
          payload,
          setFibras,
          setSnackbarMessage,
          setSnackbarSeverity,
          setSnackbarOpen
        );
        setSnackbarMessage("Fibra actualizada correctamente");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);

        // Refrescamos la lista
        await handleFetchFibras(setFibras, setLoading, includeInactive);
        setOpenEditDialog(false);
      } catch (error: any) {
        setSnackbarMessage(error.message || "Error al guardar la fibra.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    }
  };

  // Deshabilitar
  const handleDeshabilitarFibra = async (fibra: Fiber) => {
    try {
      setLoading(true);
      await updateFiberStatus(
        fibra.id,
        !fibra.isActive,
        setFibras,
        setSnackbarMessage,
        setSnackbarSeverity,
        setSnackbarOpen
      );
    } catch (err) {
      console.error("Error al deshabilitar fibra:", err);
      setSnackbarMessage("Error al deshabilitar la fibra");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 4) Filtros
  // ---------------------------------------------------------------------------
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };
  const handleCategoryFilterChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCategoryFilter(event.target.value);
  };
  const handleDenominationFilterChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setDenominationFilter(event.target.value);
  };
  const handleOriginFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setOriginFilter(event.target.value);
  };
  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIncludeInactive(event.target.checked);
  };

  // ---------------------------------------------------------------------------
  // 5) Filtrado en la tabla
  // ---------------------------------------------------------------------------
  const filteredFibras = fibras.filter((fibra) => {
    const categoryValue = fibra.category?.value || "";
    const denominationText = fibra.denomination?.value || "";
    let originText = "Sin procedencia";
    if (fibra.origin) {
      const found = countries.find((c) => c.id === fibra.origin);
      originText = found?.name || "Desconocido";
    }

    // Filtro de búsqueda general
    const matchesSearch =
      !searchTerm ||
      [categoryValue, denominationText, originText].some((val) =>
        val.toLowerCase().includes(searchTerm.toLowerCase())
      );

    // Filtros específicos
    const matchesCategory =
      !categoryFilter ||
      categoryValue.toLowerCase().includes(categoryFilter.toLowerCase());

    const matchesDenomination =
      !denominationFilter ||
      denominationText.toLowerCase().includes(denominationFilter.toLowerCase());

    const matchesOrigin =
      !originFilter ||
      originText.toLowerCase().includes(originFilter.toLowerCase());

    return (
      matchesSearch && matchesCategory && matchesDenomination && matchesOrigin
    );
  });

  // ---------------------------------------------------------------------------
  // Render principal
  // ---------------------------------------------------------------------------
  return (
    <div className="space-y-5">
      {error && <div className="text-red-500">{error}</div>}

      <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default sm:px-7.5 xl:pb-1">
        {/* Barra de búsqueda, Filtros y switch */}
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

            <Button
              startIcon={<FilterList />}
              variant="outlined"
              onClick={handleFilterClick}
            >
              Filtros
            </Button>
            <Menu
              anchorEl={filterAnchorEl}
              open={Boolean(filterAnchorEl)}
              onClose={handleFilterClose}
            >
              <div className="p-4 space-y-2" style={{ maxWidth: "300px" }}>
                <TextField
                  label="Categoría"
                  variant="outlined"
                  value={categoryFilter}
                  onChange={handleCategoryFilterChange}
                  placeholder="Buscar por categoría..."
                  size="small"
                  fullWidth
                />
                <TextField
                  label="Variedad"
                  variant="outlined"
                  value={denominationFilter}
                  onChange={handleDenominationFilterChange}
                  placeholder="Buscar por variedad..."
                  size="small"
                  fullWidth
                />
                <TextField
                  label="Procedencia"
                  variant="outlined"
                  value={originFilter}
                  onChange={handleOriginFilterChange}
                  placeholder="Buscar por procedencia..."
                  size="small"
                  fullWidth
                />
              </div>
            </Menu>
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

          {/* Botones de acción */}
          <div className="space-x-2">
            <Button
              startIcon={<Add />}
              variant="contained"
              style={{ backgroundColor: "#1976d2", color: "#fff" }}
              onClick={handleCrearFibra}
            >
              CREAR
            </Button>
            <Button
              startIcon={<Edit />}
              variant="contained"
              style={{ backgroundColor: "#1976d2", color: "#fff" }}
              onClick={handleToggleEditColumn}
            >
              Editar
            </Button>
            <Button
              startIcon={<PowerSettingsNew />}
              variant="contained"
              style={{ backgroundColor: "#d32f2f", color: "#fff" }}
              onClick={handleToggleDisableColumn}
            >
              Deshabilitar
            </Button>
          </div>
        </div>

        {/* Tabla de fibras */}
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-blue-900 uppercase text-center">
                <th className="px-4 py-4 text-center font-normal text-white">
                  ID
                </th>
                <th className="px-4 py-4 text-center font-normal text-white">
                  Categoría
                </th>
                <th className="px-4 py-4 text-center font-normal text-white">
                  Variedad
                </th>
                <th className="px-4 py-4 text-center font-normal text-white">
                  Procedencia
                </th>
                <th className="px-4 py-4 text-center font-normal text-white">
                  Color
                </th>
                <th className="px-4 py-4 text-center font-normal text-white">
                  Estado
                </th>
                {showEditColumn && (
                  <th className="px-4 py-4 text-center font-normal text-white">
                    Editar
                  </th>
                )}
                {showDisableColumn && (
                  <th className="px-4 py-4 text-center font-normal text-white">
                    Deshabilitar
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="pt-5 pb-5 text-center text-black">
                    Cargando...
                  </td>
                </tr>
              ) : filteredFibras.length > 0 ? (
                filteredFibras
                  .slice(
                    pagina * filasPorPagina,
                    pagina * filasPorPagina + filasPorPagina
                  )
                  .map((fibra) => {
                    // Category
                    const categoryText = fibra.category?.value || "-";
                    // Denomination
                    const denominationText =
                      fibra.denomination?.value || "-";
                    // Origin
                    let originText = "-";
                    if (fibra.origin) {
                      const foundCountry = countries.find(
                        (c) => c.id === fibra.origin
                      );
                      originText = foundCountry?.name || "Desconocido";
                    }
                    // Color
                    const colorText = fibra.color?.name || "Crudo";

                    // Revisa updateCheck.updatable
                    const canEdit = fibra.updateCheck?.updatable === true;

                    return (
                      <tr key={fibra.id} className="text-center text-black">
                        <td className="border-b border-gray-300 px-4 py-5">
                          {fibra.id}
                        </td>
                        <td className="border-b border-gray-300 px-4 py-5">
                          {categoryText}
                        </td>
                        <td className="border-b border-gray-300 px-4 py-5">
                          {denominationText}
                        </td>
                        <td className="border-b border-gray-300 px-4 py-5">
                          {originText}
                        </td>
                        <td className="border-b border-gray-300 px-4 py-5">
                          {colorText}
                        </td>
                        <td className="border-b border-gray-300 px-4 py-5">
                          <span
                            className={` ${
                              fibra.isActive ? "text-green-500" : "text-red-500"
                            }`}
                          >
                            {fibra.isActive ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                        {showEditColumn && (
                          <td className="border-b border-gray-300 px-4 py-5">
                            <Tooltip
                              title={
                                canEdit
                                  ? "Fibra editable"
                                  : fibra.updateCheck?.message || "No se puede editar"
                              }
                              arrow
                            >
                              <span>
                                <IconButton
                                  onClick={() => handleEditFibra(fibra)}
                                  disabled={!canEdit}
                                  sx={{
                                    color: canEdit ? "#1976d2" : "gray",
                                  }}
                                >
                                  <Edit />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </td>
                        )}
                        {showDisableColumn && (
                          <td className="border-b border-gray-300 px-4 py-5">
                            <IconButton
                              onClick={() => handleDeshabilitarFibra(fibra)}
                            >
                              <PowerSettingsNew />
                            </IconButton>
                          </td>
                        )}
                      </tr>
                    );
                  })
              ) : (
                <tr>
                  <td colSpan={8} className="pt-5 pb-5 text-center">
                    No existen fibras
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={filteredFibras.length}
          rowsPerPage={filasPorPagina}
          page={pagina}
          onPageChange={(_, newPage) => setPagina(newPage)}
          onRowsPerPageChange={(event) =>
            setFilasPorPagina(parseInt(event.target.value, 10))
          }
          labelRowsPerPage="Filas por página:"
        />
      </div>

      {/* Diálogo de edición */}
      <Dialog
        open={openEditDialog}
        onClose={handleCloseEditDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Editar Fibra</DialogTitle>
        <DialogContent>
          {selectedFibra && (
            <>
              {/* CATEGORÍA */}
              <Autocomplete
                options={categories}
                getOptionLabel={(option) => option.value}
                value={categories.find(
                  (option) => option.id === selectedFibra.categoryId
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Categoría"
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
                  setSelectedFibra((prev) => ({
                    ...prev,
                    categoryId: newValue ? newValue.id : 0,
                  }));
                }}
              />

              {/* VARIEDAD / DENOMINACIÓN */}
              <Autocomplete
                options={denominations}
                getOptionLabel={(option) => option.value}
                value={denominations.find(
                  (option) => option.id === selectedFibra.denominationId
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Variedad/Marca"
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
                  setSelectedFibra((prev) => ({
                    ...prev,
                    denominationId: newValue ? newValue.id : null,
                  }));
                }}
              />

              {/* PROCEDENCIA */}
              <Autocomplete
                options={countries}
                getOptionLabel={(option) => option.name}
                value={countries.find(
                  (option) => option.id === selectedFibra.origin
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Procedencia"
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
                  setSelectedFibra((prev) => ({
                    ...prev,
                    origin: newValue ? newValue.id : "",
                  }));
                }}
              />

              <FormControlLabel
                label="¿Fibra con color?"
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

              {/* COLOR */}
              {isColorEnabled && (
                <Autocomplete
                  options={colors}
                  getOptionLabel={(option) => option.name}
                  value={colors.find(
                    (option) => option.id === selectedFibra.colorId
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
                    setSelectedFibra((prev) => ({
                      ...prev,
                      colorId: newValue ? newValue.id : "",
                    }));
                  }}
                />
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog} 
            variant="contained"
            style={{ backgroundColor: "#d32f2f", color: "#fff" }}>
            Cancelar
          </Button>
          <Button onClick={handleSaveFibra}
            variant="contained"
            style={{ backgroundColor: "#1976d2", color: "#fff" }}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar de notificaciones */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: "100%", alignItems: "center" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Fibras;

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
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { Edit, PowerSettingsNew, Add, FilterList, Search } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { Fiber, Fibra, MecsaColor } from "../../../models/models";
import {
  handleFetchFibras,
  updateFiberStatus,
  handleUpdateFiber,
  handleFetchFiberCategories,
  handleFetchCountries,
  handleFetchColors,
} from "../../use-cases/fibra";

const Fibras: React.FC = () => {
  const router = useRouter();
  const [fibras, setFibras] = useState<Fiber[]>([]);
  const [categories, setCategories] = useState<{ id: number; value: string }[]>([]);
  const [countries, setCountries] = useState<{ id: string; name: string }[]>([]);
  const [colors, setColors] = useState<MecsaColor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagina, setPagina] = useState(0);
  const [filasPorPagina, setFilasPorPagina] = useState(10);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedFibra, setSelectedFibra] = useState<Fibra | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [denominationFilter, setDenominationFilter] = useState("");
  const [originFilter, setOriginFilter] = useState("");
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [showEditColumn, setShowEditColumn] = useState(true);
  const [showDisableColumn, setShowDisableColumn] = useState(true);
  const [includeInactive, setIncludeInactive] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      await handleFetchFibras(setFibras, setLoading, includeInactive);
      await handleFetchFiberCategories(setCategories);
      await handleFetchCountries(setCountries);
      await handleFetchColors(setColors);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await handleFetchFibras(setFibras, setLoading, includeInactive);
    };
    fetchData();
  }, [includeInactive]); // Agrega includeInactive como dependencia
  

  const handleEditFibra = (fibra: Fiber) => {
    setSelectedFibra({
      ...fibra,
      categoryId: fibra.category?.id || 0,
      colorId: fibra.color?.id || "",
      origin: fibra.origin || "",
      category: fibra.category || { id: 0, value: "" },
      color: fibra.color || { id: "", name: "", sku: "", hexadecimal: "", isActive: true },
    });
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setSelectedFibra(null);
  };

  const handleSaveFibra = async () => {
    if (selectedFibra) {
      const payload = {
        categoryId: selectedFibra.categoryId || null,
        denomination: selectedFibra.denomination?.toUpperCase() || null,
        origin: selectedFibra.origin || null,
        colorId: selectedFibra.colorId || null,
      };
  
      try {
        // Llama al servicio para actualizar la fibra
        await handleUpdateFiber(selectedFibra.id, payload, setFibras, setSnackbarMessage, setSnackbarSeverity, setSnackbarOpen);
        
        // Éxito
        setSnackbarMessage("Fibra actualizada correctamente");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
  
        // Actualiza la lista de fibras
        await handleFetchFibras(setFibras, setLoading, includeInactive);
        
        // Cierra el cuadro de diálogo
        setOpenEditDialog(false);
      } catch (error: any) {
        // Manejo del error
        setSnackbarMessage(error.message || "Error al guardar la fibra.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    }
  };
  
  
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

  const handleCrearFibra = () => {
    router.push("/operaciones-new/fibras/crear-fibra");
  };

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleToggleEditColumn = () => {
    setShowEditColumn(!showEditColumn);
  };

  const handleToggleDisableColumn = () => {
    setShowDisableColumn(!showDisableColumn);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleCategoryFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCategoryFilter(event.target.value);
  };

  const handleDenominationFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDenominationFilter(event.target.value);
  };

  const handleOriginFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setOriginFilter(event.target.value);
  };

  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIncludeInactive(event.target.checked);
  }

  const filteredFibras = fibras.filter((fibra) => {
    const categoryValue = fibra.category?.value || "";
    const denominationValue = fibra.denomination || "";
    const originValue = fibra.origin || "";

    return (
      (searchTerm === "" ||
        Object.values({ ...fibra, categoryValue, denominationValue, originValue })
          .filter((value) => typeof value === "string")
          .some((value) => value.toLowerCase().includes(searchTerm.toLowerCase()))) &&
      (categoryFilter === "" ||
        categoryValue.toLowerCase().includes(categoryFilter.toLowerCase())) &&
      (denominationFilter === "" ||
        denominationValue.toLowerCase().includes(denominationFilter.toLowerCase())) &&
      (originFilter === "" ||
        originValue.toLowerCase().includes(originFilter.toLowerCase()))
    );
  });

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <div className="space-y-5">
      {error && <div className="text-red-500">{error}</div>}

      <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default sm:px-7.5 xl:pb-1">
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

        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-blue-900 uppercase text-center">
                <th className="px-4 py-4 text-center font-normal text-white">ID</th>
                <th className="px-4 py-4 text-center font-normal text-white">Categoría</th>
                <th className="px-4 py-4 text-center font-normal text-white">Variedad</th>
                <th className="px-4 py-4 text-center font-normal text-white">Procedencia</th>
                <th className="px-4 py-4 text-center font-normal text-white">Color</th>
                <th className="px-4 py-4 text-center font-normal text-white">Estado</th>
                {showEditColumn && (
                  <th className="px-4 py-4 text-center font-normal text-white">Editar</th>
                )}
                {showDisableColumn && (
                  <th className="px-4 py-4 text-center font-normal text-white">Deshabilitar</th>
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
                  .slice(pagina * filasPorPagina, pagina * filasPorPagina + filasPorPagina)
                  .map((fibra) => (
                    <tr key={fibra.id} className="text-center text-black" >
                      <td className="border-b border-gray-300 px-4 py-5">{fibra.id}</td>
                      <td className="border-b border-gray-300 px-4 py-5">{fibra.category?.value || "Sin categoría"}</td>
                      <td className="border-b border-gray-300 px-4 py-5">{fibra.denomination || "Sin variedad"}</td>
                      <td className="border-b border-gray-300 px-4 py-5">{fibra.origin || "Sin procedencia"}</td>
                      <td className="border-b border-gray-300 px-4 py-5">{fibra.color?.name || "Sin color"}</td>
                      <td className="border-b border-gray-300 px-4 py-5">
                        <span
                          className={`text-sm ${
                            fibra.isActive ? "text-green-500" : "text-red-500"
                          }`}
                        >
                          {fibra.isActive ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      {showEditColumn && (
                        <td className="border-b border-gray-300 px-4 py-5">
                          <IconButton onClick={() => handleEditFibra(fibra)}>
                            <Edit />
                          </IconButton>
                        </td>
                      )}
                      {showDisableColumn && (
                        <td className="border-b border-gray-300 px-4 py-5">
                          <IconButton onClick={() => handleDeshabilitarFibra(fibra)}>
                            <PowerSettingsNew />
                          </IconButton>
                        </td>
                      )}
                    </tr>
                  ))
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
          onRowsPerPageChange={(event) => setFilasPorPagina(parseInt(event.target.value, 10))}
          labelRowsPerPage="Filas por página:"
        />
      </div>

      <Dialog open={openEditDialog} onClose={handleCloseEditDialog} fullWidth maxWidth="sm">
        <DialogTitle>Editar Fibra</DialogTitle>
        <DialogContent>
          {selectedFibra && (
            <>
              {/* Select para Categoría */}
              <TextField
              margin="dense"
              label="Categoría"
              fullWidth
              variant="outlined"
              select
              value={selectedFibra?.categoryId || ""}
              onChange={(e) =>
                setSelectedFibra({
                  ...selectedFibra,
                  categoryId: parseInt(e.target.value as string, 10),
                })
              }
            >
              <MenuItem value="">Sin categoria</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.value}
                </MenuItem>
              ))}
            </TextField>
              {/* Campo de texto para Variedad */}
              <TextField
                margin="dense"
                label="Variedad"
                fullWidth
                variant="outlined"
                value={selectedFibra.denomination || ""}
                onChange={(e) =>
                  setSelectedFibra({ ...selectedFibra, denomination: e.target.value })
                }
              />
              {/* Select para País/Procedencia */}
              <TextField
              margin="dense"
              label="Procedencia"
              fullWidth
              variant="outlined"
              select
              value={selectedFibra?.origin || ""}
              onChange={(e) =>
                setSelectedFibra({ ...selectedFibra, origin: e.target.value })
              }
            >
              <MenuItem value="">Sin procedencia</MenuItem>
              {countries.map((country) => (
                <MenuItem key={country.id} value={country.id}>
                  {country.name}
                </MenuItem>
              ))}
            </TextField>
              {/* Select para Color */}
              <TextField
              margin="dense"
              label="Color"
              fullWidth
              variant="outlined"
              select
              value={selectedFibra?.colorId || ""}
              onChange={(e) =>
                setSelectedFibra((prev) => ({
                  ...prev!,
                  colorId: e.target.value,
                }))
              }
            >
              <MenuItem value="">Sin color</MenuItem>
              {colors.map((color) => (
                <MenuItem key={color.id} value={color.id}>
                  {color.name}
                </MenuItem>
              ))}
            </TextField>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleSaveFibra} color="primary">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

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
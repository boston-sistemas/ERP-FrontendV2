"use client";

import React, { useState, useEffect, use } from "react";
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
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Menu,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { Edit, PowerSettingsNew, Add, Search, FilterList, Close, Visibility } from "@mui/icons-material";
import { fetchHilados, updateYarnStatus, fetchSpinningMethods, updateYarn } from "../../services/hiladoService";
import { handleUpdateYarn } from "../../use-cases/hilado";
import { Yarn, Recipe, Fiber} from "../../../models/models";
import { useRouter } from "next/navigation";
import { fetchFibras } from "../../../fibras/services/fibraService";

const Hilados: React.FC = () => {
  const router = useRouter();
  const [hilados, setHilados] = useState<Yarn[]>([]);
  const [pagina, setPagina] = useState(0);
  const [filasPorPagina, setFilasPorPagina] = useState(10);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");
  const [editingYarn, setEditingYarn] = useState<Yarn | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showEditColumn, setShowEditColumn] = useState(true);
  const [showDisableColumn, setShowDisableColumn] = useState(true);
  const [selectedFibras, setSelectedFibras] = useState<Fiber[]>([]);
  const [availableFibras, setAvailableFibras] = useState<Fiber[]>([]);
  const [showAvailableFibers, setShowAvailableFibers] = useState(false);
  const [showFiberDialog, setShowFiberDialog] = useState(false);
  const [spinningMethods, setSpinningMethods] = useState<{ id: number; value: string }[]>([]);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [openRecipeDialog, setOpenRecipeDialog] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<any[]>([]); 
  const [page, setPage] = useState(0); // Página actual
  const [rowsPerPage, setRowsPerPage] = useState(5); // Filas por página
  const [editForm, setEditForm] = useState<{
    title: string;
    finish: string;
    description: string;
    recipe: Recipe[];
  }>({
    title: "",
    finish: "",
    description: "",
    recipe: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchHilados(includeInactive);
        const spinningMethods = await fetchSpinningMethods();
        const dataFibers = await fetchFibras(includeInactive);
        setAvailableFibras(dataFibers.fibers);
        setHilados(data.yarns); 
        setSpinningMethods(spinningMethods);
        console.log("Estado actualizado de hilados:", data.yarns); 
      } catch (error) {
        console.error("Error fetching hilados:", error);
        setSnackbarMessage("Error al cargar los datos de hilados.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    };
    fetchData();
  }, [includeInactive]);
  
  const handleOpenRecipeDialog = (recipe: any[]) => {
    setSelectedRecipe(recipe); // Guarda la receta seleccionada
    setOpenRecipeDialog(true); // Abre el diálogo
  };
  
  const handleCloseRecipeDialog = () => {
    setSelectedRecipe([]);
    setOpenRecipeDialog(false);
  };
  
  const handleEditClick = (yarn: Yarn) => {
    if (!yarn) {
      console.error("El objeto 'yarn' es nulo o indefinido");
      return;
    }
  
    setEditingYarn(yarn);
  
    setEditForm({
      title: yarn.yarnCount || "", // Verificar si yarnCount existe
      finish: yarn.spinningMethod?.id?.toString() || "", // Verificar si spinningMethod e id existen
      description: yarn.description || "", // Verificar si description existe
      recipe: yarn.recipe ? [...yarn.recipe] : [], // Validar recipe
    });
  
    setEditDialogOpen(true);
  };
  

  const handleEditClose = () => {
    setEditDialogOpen(false);
    setEditingYarn(null);
  };

  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIncludeInactive(event.target.checked);
  }

  const filteredFibras = availableFibras.filter((fibra) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      fibra.denomination?.toLowerCase().includes(searchLower) ||
      fibra.category?.value?.toLowerCase().includes(searchLower) ||
      fibra.origin?.toLowerCase().includes(searchLower) ||
      fibra.color?.name?.toLowerCase().includes(searchLower)
    );
  });
  

  const handleEditSave = async () => {
    if (editingYarn) {
      try {
        await updateYarn(editingYarn.id, {
          yarnCount: editForm.title,
          numberingSystem: "Ne",
          spinningMethodId: parseInt(editForm.finish, 10),
          colorId: editingYarn.color?.id || null,
          description: editForm.description,
          recipe: editForm.recipe.map((item) => ({
            fiberId: item.fiber!.id,
            proportion: item.proportion,
          })),
        });
  
        setSnackbarMessage("Hilado actualizado correctamente.");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        handleEditClose();
      } catch (error: any) {
        setSnackbarMessage(error.message);
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    }
  };  
  
  const handleToggleYarnStatus = async (id: string, isActive: boolean) => {
    try {
      await updateYarnStatus(id, !isActive);
      setHilados((prev) =>
        prev.map((hilado) =>
          hilado.id === id ? { ...hilado, isActive: !isActive } : hilado
        )
      );
      setSnackbarMessage(`Hilado ${!isActive ? "habilitado" : "deshabilitado"} correctamente.`);
      setSnackbarSeverity("success");
    } catch (error) {
      console.error("Error actualizando el estado del hilado:", error);
      setSnackbarMessage("Error al actualizar el estado del hilado.");
      setSnackbarSeverity("error");
    } finally {
      setSnackbarOpen(true);
    }
  };  

  const handleCrearHilado = () => {
    router.push("/operaciones-new/hilados/crear-hilado");
  }

  const filteredHilados = hilados.filter((h) => {
    const searchLower = searchTerm.toLowerCase();
    const searchableFields = [h.yarnCount, h.description, h.color?.name];
    return searchableFields.some((value) =>
      value?.toString().toLowerCase().includes(searchLower)
    );
  });  

  const handleAddFiber = (fibra: Fiber) => {
    const fiberExists = editForm.recipe.some((r) => r.fiber.id === fibra.id);

    if (!fiberExists) {
        setEditForm((prevEditForm) => ({
            ...prevEditForm,
            recipe: [
                ...prevEditForm.recipe,
                { proportion: 0, fiber: fibra }, // Inicializa la proporción a 0
            ],
        }));
    setSnackbarMessage("Fibra añadida correctamente");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
    }
};

  const handleDeleteSelectedFibra = (id: string) => {
    setEditForm((prevEditForm) => ({
        ...prevEditForm,
        recipe: prevEditForm.recipe.filter((r) => r.fiber.id !== id),
    }));
  };

  const handleProportionChange = (id: string, value: string) => {
    setEditForm((prevEditForm) => ({
        ...prevEditForm,
        recipe: prevEditForm.recipe.map((r) =>
            r.fiber.id === id ? { ...r, proportion: Number(value) } : r
        ),
    }));
  };

  const toggleAvailableFibers = () => {
    setShowAvailableFibers(!showAvailableFibers);
  };

  const handleFiberDialogClose = () => {
    setShowFiberDialog(false);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(event.target.value);
    };

  return (
    <div className="space-y-5">
      <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default sm:px-7.5 xl:pb-1">
        {/* Barra superior dentro del contenedor de la tabla */}
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
            <Button startIcon={<Add />} variant="contained" style={{ backgroundColor: "#1976d2", color: "#fff" }} onClick={handleCrearHilado}>
              CREAR
            </Button>
            <Button
              startIcon={<Edit />}
              variant="contained"
              style={{ backgroundColor: "#1976d2", color: "#fff" }}
              color="primary"
              onClick={() => setShowEditColumn((prev) => !prev)}
            >
              {showEditColumn ? "Ocultar Editar" : "Mostrar Editar"}
            </Button>
            <Button
              startIcon={<PowerSettingsNew />}
              variant="contained"
              style={{ backgroundColor: "#d32f2f", color: "#fff" }}
              color="error"
              onClick={() => setShowDisableColumn((prev) => !prev)}
            >
              {showDisableColumn ? "Ocultar Deshabilitar" : "Mostrar Deshabilitar"}
            </Button>
          </div>
        </div>
  
        {/* Tabla principal */}
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-blue-900 uppercase text-center text-white">
                <th className="px-4 py-4 font-normal">CÓDIGO DE BARRAS</th>
                <th className="px-4 py-4 font-normal">DESCRIPCIÓN</th>
                <th className="px-4 py-4 font-normal">ID</th>
                <th className="px-4 py-4 font-normal">código de unidad de inventario</th>
                <th className="px-4 py-4 font-normal">sistema de numeración</th>
                <th className="px-4 py-4 font-normal">NÚMERO DE HILOS</th>
                <th className="px-4 py-4 font-normal">Acabado de tejido</th>
                <th className="px-4 py-4 font-normal">RECETA</th>
                <th className="px-4 py-4 font-normal">Estado</th>
                {showEditColumn && <th className="px-4 py-4 font-normal">Editar</th>}
                {showDisableColumn && <th className="px-4 py-4 font-normal">Deshabilitar</th>}
              </tr>
            </thead>
            <tbody>
              {filteredHilados.length > 0 ? (
                filteredHilados
                  .slice(pagina * filasPorPagina, pagina * filasPorPagina + filasPorPagina)
                  .map((hilado) => (
                    <tr key={hilado.id} className="text-center text-black">
                      <td className="border-b border-gray-300 px-4 py-5">{hilado.barcode}</td>
                      <td className="border-b border-gray-300 px-4 py-5">{hilado.description}</td>
                      <td className="border-b border-gray-300 px-4 py-5">{hilado.id}</td>
                      <td className="border-b border-gray-300 px-4 py-5">{hilado.inventoryUnitCode}</td>
                      <td className="border-b border-gray-300 px-4 py-5">{hilado.numberingSystem}</td>
                      <td className="border-b border-gray-300 px-4 py-5">{hilado.yarnCount}</td>
                      <td className="border-b border-gray-300 px-4 py-5">{hilado.spinningMethod?.value || "-"}</td>
                      <td className="border-b border-gray-300 px-4 py-5">
                        <IconButton onClick={() => handleOpenRecipeDialog(hilado.recipe)}>
                          <Visibility />
                        </IconButton>
                      </td>
                      <td className="border-b border-gray-300 px-4 py-5">
                        <span
                          className={`text-sm ${
                            hilado.isActive ? "text-green-500 font-normal" : "text-red-500 font-normal"
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
                          <IconButton onClick={() => handleToggleYarnStatus(hilado.id, hilado.isActive)}>
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
            count={filteredHilados.length}
            rowsPerPage={filasPorPagina}
            page={pagina}
            onPageChange={(_, newPage) => setPagina(newPage)}
            onRowsPerPageChange={(e) => setFilasPorPagina(parseInt(e.target.value, 10))}
          />
        </div>
      </div>
      {/* Diálogo de receta */}
      <Dialog open={openRecipeDialog} onClose={handleCloseRecipeDialog} maxWidth="md" fullWidth>
      <DialogContent>
        <h3 className="text-lg font-semibold text-black mb-4">Receta del Hilado</h3>
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-blue-900 uppercase text-center text-white">
                <th className="px-4 py-4 text-center font-normal">Categoria</th>
                <th className="px-4 py-4 text-center font-normal">Denominación</th>
                <th className="px-4 py-4 text-center font-normal">Procedencia</th>
                <th className="px-4 py-4 text-center font-normal">Color</th>
                <th className="px-4 py-4 text-center font-normal">Proporción (%)</th>
              </tr>
            </thead>
            <tbody>
              {selectedRecipe.length > 0 ? (
                selectedRecipe.map((item, index) => (
                  <tr key={index} className="text-center text-black">
                    <td className="border-b border-gray-300 px-4 py-5">
                      {item.fiber?.category?.value || "Sin denominación"}
                    </td>
                    <td className="border-b border-gray-300 px-4 py-5">
                      {item.fiber?.denomination || "Sin categoría"}
                    </td>
                    <td className="border-b border-gray-300 px-4 py-5">
                      {item.fiber?.origin || "Sin procedencia"}
                    </td>
                    <td className="border-b border-gray-300 px-4 py-5">
                      {item.fiber?.color?.name || "Sin color"}
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
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={snackbarSeverity} onClose={() => setSnackbarOpen(false)}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
  
      {/* Dialog para edición */}
      <Dialog open={editDialogOpen} onClose={handleEditClose} maxWidth="md" fullWidth>
      <DialogTitle>Editar Hilado</DialogTitle>
      <DialogContent>
        <TextField
          label="Título"
          fullWidth
          margin="dense"
          value={editForm.title}
          onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
        />
        <div className="mt-4">
        <label htmlFor="spinningMethod" className="block text-sm font-medium text-gray-700 mb-1">
          Método de Hilado
        </label>
        <Select
        id="spinningMethod"
        value={editForm.finish} // Aquí se refleja el ID del método seleccionado
        onChange={(e) => setEditForm({ ...editForm, finish: e.target.value })}
        displayEmpty
        fullWidth
        variant="outlined"
        sx={{
          backgroundColor: "white",
          borderRadius: "4px",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        }}
      >
        <MenuItem value="">
          <em>Sin método de hilado</em>
        </MenuItem>
        {spinningMethods.map((method) => (
          <MenuItem key={method.id} value={method.id}>
            {method.value}
          </MenuItem>
        ))}
      </Select>
      </div>
        <TextField
          label="Descripción"
          fullWidth
          multiline
          rows={3}
          margin="dense"
          value={editForm.description}
          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
        />
        {/* Tabla de receta */}
        <h3 className="text-lg font-semibold text-black dark:text-white mb-2">Receta</h3>
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-blue-900 uppercase text-center">
                <th className="px-4 py-4 text-center font-normal text-white">Denominación</th>
                <th className="px-4 py-4 text-center font-normal text-white">Categoría</th>
                <th className="px-4 py-4 text-center font-normal text-white">Procedencia</th>
                <th className="px-4 py-4 text-center font-normal text-white">Color</th>
                <th className="px-4 py-4 text-center font-normal text-white">Proporción</th>
                <th className="px-4 py-4 text-center font-normal text-white">Eliminar</th>
              </tr>
            </thead>
            <tbody>
              {editForm.recipe.map((r, index) => (
                <tr key={index} className="text-center">
                  <td className="border-b border-[#eee] px-4 py-5">
                    {r.fiber?.denomination || "Sin denominación"}
                  </td>
                  <td className="border-b border-[#eee] px-4 py-5">
                    {r.fiber?.category?.value || "Sin categoría"}
                  </td>
                  <td className="border-b border-[#eee] px-4 py-5">
                    {r.fiber?.origin || "Sin procedencia"}
                  </td>
                  <td className="border-b border-[#eee] px-4 py-5">
                    {r.fiber?.color?.name || "Sin color"}
                  </td>
                  <td className="border-b border-[#eee] px-4 py-5">
                    <TextField
                      variant="outlined"
                      size="small"
                      value={r.proportion || ""}
                      onChange={(e) => handleProportionChange(r.fiber?.id, e.target.value)}
                      placeholder="Proporción"
                      type="number"
                    />
                  </td>
                  <td className="border-b border-[#eee] px-4 py-5">
                    <IconButton
                      style={{ backgroundColor: "#ffff", color: "#d32f2f" }}
                      onClick={() => handleDeleteSelectedFibra(r.fiber?.id)}
                    >
                      <Close />
                    </IconButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <IconButton onClick={() => setShowFiberDialog(true)} style={{ color: "#1976d2" }}>
            <Add />
          </IconButton>
        </div>
      </DialogContent>
        {/* Diálogo de fibras disponibles */}
<Dialog open={showFiberDialog} onClose={() => setShowFiberDialog(false)} maxWidth="md" fullWidth>
  <DialogContent>
    <h3 className="text-lg font-semibold text-black dark:text-white mb-4">Fibras Disponibles</h3>
    <div className="mb-4 flex justify-between items-center">
      {/* Buscador */}
      <TextField
        variant="outlined"
        placeholder="Buscar..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        size="small"
        style={{ width: "50%" }}
      />
    </div>
    <div className="max-w-full overflow-x-auto">
      <table className="w-full table-auto">
        <thead>
          <tr className="bg-blue-900 uppercase text-center">
            <th className="px-4 py-4 text-center font-normal text-white">Denominación</th>
            <th className="px-4 py-4 text-center font-normal text-white">Categoría</th>
            <th className="px-4 py-4 text-center font-normal text-white">Procedencia</th>
            <th className="px-4 py-4 text-center font-normal text-white">Color</th>
            <th className="px-4 py-4 text-center font-normal text-white">Seleccionar</th>
          </tr>
        </thead>
        <tbody>
          {filteredFibras
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) // Aplicar paginación
            .map((fibra) => {
              const isSelected = editForm.recipe.some((r) => r.fiber?.id === fibra.id);
              return (
                <tr key={fibra.id} className="text-center">
                  <td className="border-b border-[#eee] px-4 py-5">{fibra.denomination || "Sin denominación"}</td>
                  <td className="border-b border-[#eee] px-4 py-5">{fibra.category?.value || "Sin categoría"}</td>
                  <td className="border-b border-[#eee] px-4 py-5">{fibra.origin || "Sin procedencia"}</td>
                  <td className="border-b border-[#eee] px-4 py-5">{fibra.color?.name || "Sin color"}</td>
                  <td className="border-b border-[#eee] px-4 py-5">
                    {!isSelected ? (
                      <IconButton
                        style={{ backgroundColor: "#ffff", color: "#1976d2" }}
                        onClick={() => handleAddFiber(fibra)}
                      >
                        <Add />
                      </IconButton>
                    ) : (
                      <span className="text-gray-500">Seleccionada</span>
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
    {/* Paginación */}
    <TablePagination
      component="div"
      count={filteredFibras.length}
      page={page}
      onPageChange={(event, newPage) => setPage(newPage)}
      rowsPerPage={rowsPerPage}
      onRowsPerPageChange={(event) => setRowsPerPage(parseInt(event.target.value, 10))}
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
        <DialogActions>
          <Button onClick={handleEditClose} variant = "contained" style={{backgroundColor: "#d32f2f", color: "#fff"}}>
            Cancelar
          </Button>
          <Button onClick={handleEditSave} variant="contained" style={{backgroundColor: "#1976d2", color: "#fff"}}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
  
};

export default Hilados;

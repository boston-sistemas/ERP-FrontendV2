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
} from "@mui/material";
import { Edit, PowerSettingsNew, Add, FilterList, Search } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { Fibra } from "../../../models/models";
import {
  handleFetchFibras,
  updateFiberStatus,
  handleUpdateFiber,
  handleFetchFiberCategories,
  handleFetchCountries,
} from "../../use-cases/fibra";

const Fibras: React.FC = () => {
  const router = useRouter();
  const [fibras, setFibras] = useState<Fibra[]>([]);
  const [categories, setCategories] = useState<{ id: number; value: string }[]>([]);
  const [countries, setCountries] = useState<{ id: string; name: string }[]>([]);
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
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      await handleFetchFibras(setFibras, setLoading, setError);
      await handleFetchFiberCategories(setCategories, setError);
      await handleFetchCountries(setCountries, setError);
    };
    fetchData();
  }, []);

  const handleEditFibra = (fibra: Fibra) => {
    setSelectedFibra({
      ...fibra, 
      categoryId: fibra.category?.id || 0, 
      colorId: fibra.color?.id || "",
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
        categoryId: selectedFibra.categoryId,
        denomination: selectedFibra.denomination,
        origin: selectedFibra.origin,
        colorId: selectedFibra.colorId,
      };
      await handleUpdateFiber(
        selectedFibra.id,
        payload,
        setFibras,
        setSnackbarMessage,
        setSnackbarSeverity,
        setSnackbarOpen
      );
      setOpenEditDialog(false);
    }
  };

  const handleDeshabilitarFibra = async (fibra: Fibra) => {
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

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredFibras = fibras.filter((fibra) => {
    const categoryValue = fibra.category?.value || "";
    const denominationValue = fibra.denomination || "";
    const originValue = fibra.origin || "";

    return (
      (searchTerm === "" ||
        Object.values({ ...fibra, categoryValue, denominationValue, originValue })
          .filter((value) => typeof value === "string")
          .some((value) =>
            value.toLowerCase().includes(searchTerm.toLowerCase())
          ))
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
                <th className="px-4 py-4 text-center font-normal text-white">Editar</th>
                <th className="px-4 py-4 text-center font-normal text-white">Deshabilitar</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="pt-5 pb-5 text-center">
                    Cargando...
                  </td>
                </tr>
              ) : filteredFibras.length > 0 ? (
                filteredFibras
                  .slice(pagina * filasPorPagina, pagina * filasPorPagina + filasPorPagina)
                  .map((fibra) => (
                    <tr key={fibra.id} className="text-center">
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
                      <td className="border-b border-gray-300 px-4 py-5">
                        <IconButton onClick={() => handleEditFibra(fibra)}>
                          <Edit />
                        </IconButton>
                      </td>
                      <td className="border-b border-gray-300 px-4 py-5">
                        <IconButton onClick={() => handleDeshabilitarFibra(fibra)}>
                          <PowerSettingsNew />
                        </IconButton>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan={7} className="pt-5 pb-5 text-center">
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
              <Select
                fullWidth
                value={selectedFibra.categoryId || ""}
                onChange={(e) =>
                  setSelectedFibra({
                    ...selectedFibra,
                    categoryId: parseInt(e.target.value as string, 10),
                  })
                }
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.value}
                  </MenuItem>
                ))}
              </Select>
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
              <Select
                fullWidth
                value={selectedFibra.origin || ""}
                onChange={(e) =>
                  setSelectedFibra({ ...selectedFibra, origin: e.target.value })
                }
              >
                {countries.map((country) => (
                  <MenuItem key={country.id} value={country.name}>
                    {country.name}
                  </MenuItem>
                ))}
              </Select>
              <TextField
                margin="dense"
                label="Color ID"
                fullWidth
                variant="outlined"
                value={selectedFibra.colorId || ""}
                onChange={(e) =>
                  setSelectedFibra({ ...selectedFibra, colorId: e.target.value })
                }
              />
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

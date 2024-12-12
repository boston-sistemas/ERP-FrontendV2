"use client";

import React, { useState, useEffect } from "react";
import {
  TablePagination,
  IconButton,
  Button,
  TextField,
  Menu,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Visibility,
  Add,
  Edit,
  PowerSettingsNew,
  FilterList,
  Search,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { fetchHilados, updateYarnStatus } from "../../services/hiladoService";
import { Yarn } from "../../../models/models";

const Hilados: React.FC = () => {
  const [hilados, setHilados] = useState<Yarn[]>([]);
  const [pagina, setPagina] = useState(0);
  const [filasPorPagina, setFilasPorPagina] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [skuFilter, setSkuFilter] = useState("");
  const [tituloFilter, setTituloFilter] = useState("");
  const [acabadoFilter, setAcabadoFilter] = useState("");
  const [colorTenidoFilter, setColorTenidoFilter] = useState("");
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [mostrarEditar, setMostrarEditar] = useState(true);
  const [mostrarDeshabilitar, setMostrarDeshabilitar] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchHilados();
        setHilados(data.yarns);
      } catch (error) {
        console.error("Error fetching hilados:", error);
      }
    };
    fetchData();
  }, []);

  const handleCreateClick = () => {
    router.push("/operaciones-new/hilados/crear-hilado");
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

  const handleSkuFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSkuFilter(event.target.value);
  };

  const handleTituloFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTituloFilter(event.target.value);
  };

  const handleAcabadoFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAcabadoFilter(event.target.value);
  };

  const handleColorTenidoFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setColorTenidoFilter(event.target.value);
  };

  const handleToggleYarnStatus = async (id: string, isActive: boolean) => {
    try {
      await updateYarnStatus(id, !isActive);
      setHilados((prev) =>
        prev.map((hilado) =>
          hilado.id === id ? { ...hilado, isActive: !isActive } : hilado
        )
      );
      setSnackbarMessage(`Hilado ${!isActive ? "habilitado" : "deshabilitado"} correctamente`);
      setSnackbarSeverity("success");
    } catch (error) {
      console.error("Error actualizando el estado del hilado:", error);
      setSnackbarMessage("Error al actualizar el estado del hilado");
      setSnackbarSeverity("error");
    } finally {
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const filteredHilados = hilados.filter((hilado) =>
    (searchTerm === "" ||
      hilado.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (skuFilter === "" || hilado.barcode.toString().includes(skuFilter)) &&
    (tituloFilter === "" || hilado.description.toLowerCase().includes(tituloFilter.toLowerCase())) &&
    (acabadoFilter === "" || hilado.spinningMethod.value.toLowerCase().includes(acabadoFilter.toLowerCase())) &&
    (colorTenidoFilter === "" || hilado.color?.name?.toLowerCase().includes(colorTenidoFilter.toLowerCase()))
  );

  const toggleMostrarEditar = () => {
    setMostrarEditar(!mostrarEditar);
  };

  const toggleMostrarDeshabilitar = () => {
    setMostrarDeshabilitar(!mostrarDeshabilitar);
  };

  return (
    <div className="space-y-5">
      <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <div className="max-w-full overflow-x-auto">
          <div className="flex items-center justify-between gap-2 mb-4">
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
                <div className="p-4 space-y-2" style={{ maxWidth: "300px", margin: "0 auto" }}>
                  <TextField
                    label="SKU"
                    variant="outlined"
                    value={skuFilter}
                    onChange={handleSkuFilterChange}
                    placeholder="Buscar por SKU..."
                    size="small"
                    fullWidth
                  />
                  <TextField
                    label="Título"
                    variant="outlined"
                    value={tituloFilter}
                    onChange={handleTituloFilterChange}
                    placeholder="Buscar por Título..."
                    size="small"
                    fullWidth
                  />
                  <TextField
                    label="Acabado"
                    variant="outlined"
                    value={acabadoFilter}
                    onChange={handleAcabadoFilterChange}
                    placeholder="Buscar por Acabado..."
                    size="small"
                    fullWidth
                  />
                  <TextField
                    label="Color Teñido"
                    variant="outlined"
                    value={colorTenidoFilter}
                    onChange={handleColorTenidoFilterChange}
                    placeholder="Buscar por Color Teñido..."
                    size="small"
                    fullWidth
                  />
                </div>
              </Menu>
            </div>
            <div className="flex items-center gap-2">
              <Button
                startIcon={<Add />}
                variant="contained"
                style={{ backgroundColor: "#1976d2", color: "#fff" }}
                onClick={handleCreateClick}
              >
                CREAR
              </Button>
              <Button
                startIcon={<Edit />}
                variant="contained"
                style={{ backgroundColor: "#0288d1", color: "#fff" }}
                onClick={toggleMostrarEditar}
              >
                {mostrarEditar ? "Ocultar Editar" : "Mostrar Editar"}
              </Button>
              <Button
                startIcon={<PowerSettingsNew />}
                variant="contained"
                style={{ backgroundColor: "#d32f2f", color: "#fff" }}
                onClick={toggleMostrarDeshabilitar}
              >
                {mostrarDeshabilitar ? "Ocultar Deshabilitar" : "Mostrar Deshabilitar"}
              </Button>
            </div>
          </div>

          <table className="w-full table-auto">
            <thead>
              <tr className="bg-blue-900 uppercase text-center">
                <th className="px-4 py-4 text-center font-normal text-white">SKU</th>
                <th className="px-4 py-4 text-center font-normal text-white">Título</th>
                <th className="px-4 py-4 text-center font-normal text-white">Acabado</th>
                <th className="px-4 py-4 text-center font-normal text-white">Color Teñido</th>
                <th className="px-4 py-4 text-center font-normal text-white">Estado</th>
                {mostrarEditar && <th className="px-4 py-4 text-center font-normal text-white">Editar</th>}
                {mostrarDeshabilitar && <th className="px-4 py-4 text-center font-normal text-white">Deshabilitar</th>}
              </tr>
            </thead>
            <tbody>
              {filteredHilados
                .slice(pagina * filasPorPagina, pagina * filasPorPagina + filasPorPagina)
                .map((hilado) => (
                  <tr key={hilado.id} className="text-center">
                    <td className="border-b border-gray-300 px-4 py-5">{hilado.barcode}</td>
                    <td className="border-b border-gray-300 px-4 py-5">{hilado.description}</td>
                    <td className="border-b border-gray-300 px-4 py-5">{hilado.spinningMethod.value}</td>
                    <td className="border-b border-gray-300 px-4 py-5">{hilado.color?.name || "-"}</td>
                    <td className="border-b border-gray-300 px-4 py-5">
                      <span className={hilado.isActive ? "text-green-500" : "text-red-500"}>
                        {hilado.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    {mostrarEditar && (
                      <td className="border-b border-gray-300 px-4 py-5">
                        <IconButton>
                          <Edit />
                        </IconButton>
                      </td>
                    )}
                    {mostrarDeshabilitar && (
                      <td className="border-b border-gray-300 px-4 py-5">
                        <IconButton onClick={() => handleToggleYarnStatus(hilado.id, hilado.isActive)}>
                          <PowerSettingsNew />
                        </IconButton>
                      </td>
                    )}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
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
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Hilados;

"use client";

import React, { useState } from "react";
import {
  TablePagination,
  IconButton,
  Button,
  TextField,
  Menu,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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

const FibrasData = [
  { id: 1, categoria: "ALGODON", variedad: "TANGUIS", procedencia: "PER", color: "-", hilado: "-", estado: "Activo" },
  { id: 2, categoria: "ALGODON", variedad: "PIMA", procedencia: "PER", color: "-", hilado: "-", estado: "Activo" },
  { id: 3, categoria: "ALGODON", variedad: "UPLAND", procedencia: "USA", color: "-", hilado: "-", estado: "Inactivo" },
  { id: 4, categoria: "ELASTANO", variedad: "LYCRA", procedencia: "-", color: "-", hilado: "-", estado: "Activo" },
  { id: 5, categoria: "POLIESTER", variedad: "-", procedencia: "-", color: "NEGRO", hilado: "-", estado: "Inactivo" },
  { id: 6, categoria: "POLIESTER", variedad: "-", procedencia: "-", color: "BLANCO", hilado: "-", estado: "Activo" },
];

const Fibras: React.FC = () => {
  const [fibras, setFibras] = useState(FibrasData);
  const [pagina, setPagina] = useState(0);
  const [filasPorPagina, setFilasPorPagina] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoriaFilter, setCategoriaFilter] = useState("");
  const [procedenciaFilter, setProcedenciaFilter] = useState("");
  const [variedadFilter, setVariedadFilter] = useState("");
  const [colorFilter, setColorFilter] = useState("");
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [mostrarEditar, setMostrarEditar] = useState(false);
  const [mostrarDeshabilitar, setMostrarDeshabilitar] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openHiladosDialog, setOpenHiladosDialog] = useState(false);
  const [currentFibra, setCurrentFibra] = useState({
    id: 0,
    categoria: "",
    variedad: "",
    procedencia: "",
    color: "",
    hilado: "",
    estado: ""
  });

  const router = useRouter();

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleCategoriaFilterChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
    setCategoriaFilter(event.target.value);
  };

  const handleProcedenciaFilterChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
    setProcedenciaFilter(event.target.value);
  };

  const handleVariedadFilterChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
    setVariedadFilter(event.target.value);
  };

  const handleColorFilterChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
    setColorFilter(event.target.value);
  };

  const filteredFibras = fibras.filter((fibra) =>
    (Object.values(fibra).some(value =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )) &&
    (categoriaFilter === "" || fibra.categoria.toLowerCase().includes(categoriaFilter.toLowerCase())) &&
    (procedenciaFilter === "" || fibra.procedencia.toLowerCase().includes(procedenciaFilter.toLowerCase())) &&
    (variedadFilter === "" || fibra.variedad.toLowerCase().includes(variedadFilter.toLowerCase())) &&
    (colorFilter === "" || fibra.color.toLowerCase().includes(colorFilter.toLowerCase()))
  );

  const toggleMostrarEditar = () => {
    setMostrarEditar(!mostrarEditar);
  };

  const toggleMostrarDeshabilitar = () => {
    setMostrarDeshabilitar(!mostrarDeshabilitar);
  };

  // Manejo del diálogo de edición
  const handleEditClick = (fibra: React.SetStateAction<{ id: number; categoria: string; variedad: string; procedencia: string; color: string; hilado: string; estado: string; }>) => {
    setCurrentFibra(fibra);
    setOpenEditDialog(true);
  };

  const handleEditDialogClose = () => {
    setOpenEditDialog(false);
  };

  const handleEditSave = () => {
    setFibras((prevFibras) =>
      prevFibras.map((fibra) =>
        fibra.id === currentFibra.id ? { ...fibra, ...currentFibra } : fibra
      )
    );
    setOpenEditDialog(false);
  };

  const handleEditChange = (field: string, value: string) => {
    setCurrentFibra((prevFibra) => ({
      ...prevFibra,
      [field]: value,
    }));
  };

  const handleCreateClick = () => {
    router.push("/operaciones-new/fibras/crear-fibra");
  };

  const handleHiladoClick = () => {
    setOpenHiladosDialog(true);
  };

  const handleHiladosDialogClose = () => {
    setOpenHiladosDialog(false);
  };

  return (
    <div className="space-y-5">
      <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <div className="max-w-full overflow-x-auto">
          <div className="flex items-center justify-between gap-2 mb-4">
            {/* Contenedor de Búsqueda y Filtros a la Izquierda */}
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
                    label="Categoría"
                    variant="outlined"
                    value={categoriaFilter}
                    onChange={handleCategoriaFilterChange}
                    placeholder="Buscar por categoría..."
                    size="small"  
                    fullWidth
                  />
                  <TextField
                    label="Procedencia"
                    variant="outlined"
                    value={procedenciaFilter}
                    onChange={handleProcedenciaFilterChange}
                    placeholder="Buscar por procedencia..."
                    size="small" 
                    fullWidth
                  />
                  <TextField
                    label="Variedad"
                    variant="outlined"
                    value={variedadFilter}
                    onChange={handleVariedadFilterChange}
                    placeholder="Buscar por variedad..."
                    size="small" 
                    fullWidth
                  />
                  <TextField
                    label="Color"
                    variant="outlined"
                    value={colorFilter}
                    onChange={handleColorFilterChange}
                    placeholder="Buscar por color..."
                    size="small" 
                    fullWidth
                  />
                </div>
              </Menu>
            </div>

            {/* Botones de Acciones a la Derecha */}
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
                style={{ backgroundColor: "#1976d2", color: "#fff" }}
                onClick={toggleMostrarEditar}
              >
                EDITAR
              </Button>
              <Button
                startIcon={<PowerSettingsNew />}
                variant="contained"
                style={{ backgroundColor: "#d32f2f", color: "#fff" }}
                onClick={toggleMostrarDeshabilitar}
              >
                DESHABILITAR
              </Button>
            </div>
          </div>

          <table className="w-full table-auto">
            <thead>
              <tr className="bg-blue-900 uppercase text-center">
                {["ID", "Categoría", "Variedad/Marca", "Procedencia", "Color", "Hilado", "Estado"].map((col, index) => (
                  <th key={index} className="px-4 py-4 text-center font-normal text-white">
                    {col}
                  </th>
                ))}
                {mostrarEditar && ( 
                  <th className="px-4 py-4 text-center font-normal text-white">Editar</th>
                )}
                {mostrarDeshabilitar && (
                  <th className="px-4 py-4 text-center font-normal text-white">Deshabilitar</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredFibras.slice(pagina * filasPorPagina, pagina * filasPorPagina + filasPorPagina).map((fibra) => (
                <tr key={fibra.id} className="text-center">
                  <td className="border-b border-[#eee] px-4 py-5">{fibra.id}</td>
                  <td className="border-b border-[#eee] px-4 py-5">{fibra.categoria}</td>
                  <td className="border-b border-[#eee] px-4 py-5">{fibra.variedad}</td>
                  <td className="border-b border-[#eee] px-4 py-5">{fibra.procedencia}</td>
                  <td className="border-b border-[#eee] px-4 py-5">{fibra.color}</td>
                  <td className="border-b border-[#eee] px-4 py-5">
                    <IconButton className="text-inherit" onClick={handleHiladoClick}>
                      <Visibility />
                    </IconButton>
                  </td>
                  <td className="border-b border-[#eee] px-4 py-5">
                    <span className={`text-sm ${fibra.estado === "Activo" ? "text-green-500" : "text-red-500"}`}>{fibra.estado}</span>
                  </td>
                  {mostrarEditar && ( 
                    <td className="border-b border-[#eee] px-4 py-5">
                      <IconButton className="text-inherit" onClick={() => handleEditClick(fibra)}>
                        <Edit />
                      </IconButton>
                    </td>
                  )}
                  {mostrarDeshabilitar && (
                    <td className="border-b border-[#eee] px-4 py-5">
                      <IconButton className="text-inherit" onClick={() => {}}>
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
          count={filteredFibras.length}
          rowsPerPage={filasPorPagina}
          page={pagina}
          onPageChange={() => {}}
          onRowsPerPageChange={() => {}}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`}
          sx={{ color: (theme) => (theme.palette.mode === "dark" ? "#ffffff" : "inherit") }}
        />
      </div>

      {/* Dialogo de Edición */}
      <Dialog open={openEditDialog} onClose={handleEditDialogClose}>
        <DialogTitle>Editar Fibra</DialogTitle>
        <DialogContent>
          <TextField
            label="Categoría"
            fullWidth
            value={currentFibra.categoria}
            onChange={(e) => handleEditChange("categoria", e.target.value)}
            margin="dense"
          />
          <TextField
            label="Variedad"
            fullWidth
            value={currentFibra.variedad}
            onChange={(e) => handleEditChange("variedad", e.target.value)}
            margin="dense"
          />
          <TextField
            label="Procedencia"
            fullWidth
            value={currentFibra.procedencia}
            onChange={(e) => handleEditChange("procedencia", e.target.value)}
            margin="dense"
          />
          <TextField
            label="Color"
            fullWidth
            value={currentFibra.color}
            onChange={(e) => handleEditChange("color", e.target.value)}
            margin="dense"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditDialogClose} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleEditSave} color="primary">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialogo de Hilados */}
      <Dialog open={openHiladosDialog} onClose={handleHiladosDialogClose}>
        <DialogTitle>Hilados</DialogTitle>
        <DialogContent>
          {/* Listar los hilados asociadoss */}
          <p>HILADOS</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleHiladosDialogClose} color="primary">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Fibras;

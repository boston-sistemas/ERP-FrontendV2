"use client";

import React, { useState } from "react";
import {
  TablePagination,
  IconButton,
  Button,
  TextField,
  Menu,
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

const HiladosData = [
  { id: 1, sku: "H001", titulo: "Hilado A", acabado: "Mate", colorTenido: "Rojo", estado: "Activo", receta: "-", tejido: "Algodón" },
  { id: 2, sku: "H002", titulo: "Hilado B", acabado: "Brillante", colorTenido: "Azul", estado: "Activo", receta: "-", tejido: "Lana" },
  { id: 3, sku: "H003", titulo: "Hilado C", acabado: "Satinado", colorTenido: "Verde", estado: "Inactivo", receta: "-", tejido: "Poliéster" },
  { id: 4, sku: "H004", titulo: "Hilado D", acabado: "Mate", colorTenido: "Negro", estado: "Activo", receta: "-", tejido: "Lino" },
  { id: 5, sku: "H005", titulo: "Hilado E", acabado: "Brillante", colorTenido: "Amarillo", estado: "Inactivo", receta: "-", tejido: "Seda" },
  { id: 6, sku: "H006", titulo: "Hilado F", acabado: "Satinado", colorTenido: "Blanco", estado: "Activo", receta: "-", tejido: "Rayón" },
];

const Hilados: React.FC = () => {
  const [hilados, setHilados] = useState(HiladosData);
  const [pagina, setPagina] = useState(0);
  const [filasPorPagina, setFilasPorPagina] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [skuFilter, setSkuFilter] = useState("");
  const [tituloFilter, setTituloFilter] = useState("");
  const [acabadoFilter, setAcabadoFilter] = useState("");
  const [colorTenidoFilter, setColorTenidoFilter] = useState("");
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [mostrarEditar, setMostrarEditar] = useState(false);
  const [mostrarDeshabilitar, setMostrarDeshabilitar] = useState(false);

  const router = useRouter();

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

  const handleSkuFilterChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
    setSkuFilter(event.target.value);
  };

  const handleTituloFilterChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
    setTituloFilter(event.target.value);
  };

  const handleAcabadoFilterChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
    setAcabadoFilter(event.target.value);
  };

  const handleColorTenidoFilterChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
    setColorTenidoFilter(event.target.value);
  };

  const filteredHilados = hilados.filter((hilado) =>
    (Object.values(hilado).some(value =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )) &&
    (skuFilter === "" || hilado.sku.toLowerCase().includes(skuFilter.toLowerCase())) &&
    (tituloFilter === "" || hilado.titulo.toLowerCase().includes(tituloFilter.toLowerCase())) &&
    (acabadoFilter === "" || hilado.acabado.toLowerCase().includes(acabadoFilter.toLowerCase())) &&
    (colorTenidoFilter === "" || hilado.colorTenido.toLowerCase().includes(colorTenidoFilter.toLowerCase()))
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
                style={{ backgroundColor: "#0288d1", color: "#fff" }}
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
                {["SKU", "Título", "Acabado", "Color Teñido", "Estado", "Receta", "Tejido"].map((col, index) => (
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
              {filteredHilados.slice(pagina * filasPorPagina, pagina * filasPorPagina + filasPorPagina).map((hilado, index) => (
                <tr key={index} className="text-center">
                  <td className="border-b border-[#eee] px-4 py-5">{hilado.sku}</td>
                  <td className="border-b border-[#eee] px-4 py-5">{hilado.titulo}</td>
                  <td className="border-b border-[#eee] px-4 py-5">{hilado.acabado}</td>
                  <td className="border-b border-[#eee] px-4 py-5">{hilado.colorTenido}</td>
                  <td className="border-b border-[#eee] px-4 py-5">
                    <span className={`text-sm ${hilado.estado === "Activo" ? "text-green-500" : "text-red-500"}`}>{hilado.estado}</span>
                  </td>
                  <td className="border-b border-[#eee] px-4 py-5">
                    <IconButton className="text-inherit">
                      <Visibility />
                    </IconButton>
                  </td>
                  <td className="border-b border-[#eee] px-4 py-5">
                    <IconButton className="text-inherit">
                      <Visibility />
                    </IconButton>
                  </td>
                  {mostrarEditar && ( 
                    <td className="border-b border-[#eee] px-4 py-5">
                      <IconButton className="text-inherit">
                        <Edit />
                      </IconButton>
                    </td>
                  )}
                  {mostrarDeshabilitar && (
                    <td className="border-b border-[#eee] px-4 py-5">
                      <IconButton className="text-inherit">
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
          onPageChange={() => {}}
          onRowsPerPageChange={() => {}}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`}
          sx={{ color: (theme) => (theme.palette.mode === "dark" ? "#ffffff" : "inherit") }}
        />
      </div>
    </div>
  );
};

export default Hilados;

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

const TejidosData = [
  { id: 1, familia: "JLL", densidad: 135, ancho: 90, desagujado: "1x1", estado: "Activo", receta: "-" },
  { id: 2, familia: "RIB", densidad: 165, ancho: 78, desagujado: "1x1", estado: "Activo", receta: "-" },
  { id: 3, familia: "J2C", densidad: 160, ancho: 80, desagujado: "1x1", estado: "Inactivo", receta: "-" },
  { id: 4, familia: "JLK", densidad: 190, ancho: 90, desagujado: "1x1", estado: "Activo", receta: "-" },
  { id: 5, familia: "JLL", densidad: 135, ancho: 90, desagujado: "1x1", estado: "Inactivo", receta: "-" },
];

const Tejidos: React.FC = () => {
  const [tejidos, setTejidos] = useState(TejidosData);
  const [pagina, setPagina] = useState(0);
  const [filasPorPagina, setFilasPorPagina] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [familiaFilter, setFamiliaFilter] = useState("");
  const [densidadFilter, setDensidadFilter] = useState("");
  const [anchoFilter, setAnchoFilter] = useState("");
  const [desagujadoFilter, setDesagujadoFilter] = useState("");
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [mostrarEditar, setMostrarEditar] = useState(false);
  const [mostrarDeshabilitar, setMostrarDeshabilitar] = useState(false);

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleFamiliaFilterChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
    setFamiliaFilter(event.target.value);
  };

  const handleDensidadFilterChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
    setDensidadFilter(event.target.value);
  };

  const handleAnchoFilterChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
    setAnchoFilter(event.target.value);
  };

  const handleDesagujadoFilterChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
    setDesagujadoFilter(event.target.value);
  };

  const filteredTejidos = tejidos.filter((tejido) =>
    (Object.values(tejido).some(value =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )) &&
    (familiaFilter === "" || tejido.familia.toLowerCase().includes(familiaFilter.toLowerCase())) &&
    (densidadFilter === "" || tejido.densidad.toString().toLowerCase().includes(densidadFilter.toLowerCase())) &&
    (anchoFilter === "" || tejido.ancho.toString().toLowerCase().includes(anchoFilter.toLowerCase())) &&
    (desagujadoFilter === "" || tejido.desagujado.toLowerCase().includes(desagujadoFilter.toLowerCase()))
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
                    label="Familia"
                    variant="outlined"
                    value={familiaFilter}
                    onChange={handleFamiliaFilterChange}
                    placeholder="Buscar por Familia..."
                    size="small"  
                    fullWidth
                  />
                  <TextField
                    label="Densidad"
                    variant="outlined"
                    value={densidadFilter}
                    onChange={handleDensidadFilterChange}
                    placeholder="Buscar por Densidad..."
                    size="small" 
                    fullWidth
                  />
                  <TextField
                    label="Ancho"
                    variant="outlined"
                    value={anchoFilter}
                    onChange={handleAnchoFilterChange}
                    placeholder="Buscar por Ancho..."
                    size="small"  
                    fullWidth
                  />
                  <TextField
                    label="Desagujado"
                    variant="outlined"
                    value={desagujadoFilter}
                    onChange={handleDesagujadoFilterChange}
                    placeholder="Buscar por Desagujado..."
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
                {["ID", "Familia", "Densidad", "Ancho", "Desagujado", "Estado", "Receta"].map((col, index) => (
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
              {filteredTejidos.slice(pagina * filasPorPagina, pagina * filasPorPagina + filasPorPagina).map((tejido, index) => (
                <tr key={index} className="text-center">
                  <td className="border-b border-[#eee] px-4 py-5">{tejido.id}</td>
                  <td className="border-b border-[#eee] px-4 py-5">{tejido.familia}</td>
                  <td className="border-b border-[#eee] px-4 py-5">{tejido.densidad}</td>
                  <td className="border-b border-[#eee] px-4 py-5">{tejido.ancho}</td>
                  <td className="border-b border-[#eee] px-4 py-5">{tejido.desagujado}</td>
                  <td className="border-b border-[#eee] px-4 py-5">
                    <span className={`text-sm ${tejido.estado === "Activo" ? "text-green-500" : "text-red-500"}`}>{tejido.estado}</span>
                  </td>
                  {/* Columna Receta con ícono de Visualizar */}
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
          count={filteredTejidos.length}
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

export default Tejidos;

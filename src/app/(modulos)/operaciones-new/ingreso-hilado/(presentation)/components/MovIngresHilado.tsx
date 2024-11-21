"use client";

import React, { useState } from "react";
import {
  TablePagination,
  IconButton,
  Button,
  TextField,
  Menu,
} from "@mui/material";
import { Visibility, Add, FilterList, Search } from "@mui/icons-material";
import { useRouter } from "next/navigation"; // Importa useRouter

const HiladosData = [
  {
    nroOC: "OC001",
    nroIngreso: "ING001",
    proveedor: "Proveedor A",
    fecha: "2024-11-21",
    loteProveedor: "Lote001",
    loteMecsa: "LM001",
  },
  {
    nroOC: "OC002",
    nroIngreso: "ING002",
    proveedor: "Proveedor B",
    fecha: "2024-11-20",
    loteProveedor: "Lote002",
    loteMecsa: "LM002",
  },
  {
    nroOC: "OC003",
    nroIngreso: "ING003",
    proveedor: "Proveedor C",
    fecha: "2024-11-19",
    loteProveedor: "Lote003",
    loteMecsa: "LM003",
  },
  {
    nroOC: "OC004",
    nroIngreso: "ING004",
    proveedor: "Proveedor D",
    fecha: "2024-11-18",
    loteProveedor: "Lote004",
    loteMecsa: "LM004",
  },
];

const MovIngresoHilado: React.FC = () => {
  const router = useRouter(); // Hook de Next.js para redireccionar
  const [hilados, setHilados] = useState(HiladosData);
  const [pagina, setPagina] = useState(0);
  const [filasPorPagina, setFilasPorPagina] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleCreateMovIngresoHilado = () => {
    router.push("/operaciones-new/ingreso-hilado/crear-mov-ingreso-hilado");
  };

  const filteredHilados = hilados.filter((hilado) =>
    Object.values(hilado).some((value) =>
      value.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="space-y-5">
      <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <h2 className="text-xl font-semibold mb-4">Ingreso de Hilado</h2>
        <div className="max-w-full overflow-x-auto">
          <div className="flex items-center justify-between gap-2 mb-4">
            {/* Contenedor de Búsqueda y Filtros */}
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
                    label="Proveedor"
                    variant="outlined"
                    placeholder="Filtrar por proveedor..."
                    size="small"
                    fullWidth
                  />
                  <TextField
                    label="Fecha"
                    type="date"
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                    size="small"
                    fullWidth
                  />
                </div>
              </Menu>
            </div>

            {/* Botón Agregar */}
            <div className="flex items-center gap-2">
              <Button
                startIcon={<Add />}
                variant="contained"
                style={{ backgroundColor: "#1976d2", color: "#fff" }}
                onClick={handleCreateMovIngresoHilado} // Llama a la función de redirección
              >
                CREAR
              </Button>
            </div>
          </div>

          <table className="w-full table-auto">
            <thead>
              <tr className="bg-blue-900 uppercase text-center">
                {[
                  "Nro O/C",
                  "Nro Ingreso",
                  "Proveedor de la O/C",
                  "Fecha",
                  "Lte. Provee.",
                  "Lte. Mecsa",
                  "Detalles/Edición",
                ].map((col, index) => (
                  <th
                    key={index}
                    className="px-4 py-4 text-center font-normal text-white"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredHilados
                .slice(
                  pagina * filasPorPagina,
                  pagina * filasPorPagina + filasPorPagina
                )
                .map((hilado, index) => (
                  <tr key={index} className="text-center">
                    <td className="border-b border-[#eee] px-4 py-5">
                      {hilado.nroOC}
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5">
                      {hilado.nroIngreso}
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5">
                      {hilado.proveedor}
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5">
                      {hilado.fecha}
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5">
                      {hilado.loteProveedor}
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5">
                      {hilado.loteMecsa}
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5">
                      <IconButton color="primary">
                        <Visibility />
                      </IconButton>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={hilados.length}
          rowsPerPage={filasPorPagina}
          page={pagina}
          onPageChange={(_, newPage) => setPagina(newPage)}
          onRowsPerPageChange={(e) =>
            setFilasPorPagina(parseInt(e.target.value, 10))
          }
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
          }
          sx={{
            color: (theme) =>
              theme.palette.mode === "dark" ? "#ffffff" : "inherit",
          }}
        />
      </div>
    </div>
  );
};

export default MovIngresoHilado;

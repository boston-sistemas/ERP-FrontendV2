"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Button,
  Menu,
  Collapse,
  IconButton,
} from "@mui/material";
import { FilterList, Search, KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";

const OrdenesCompraData = [
  {
    nroOC: "0012300370",
    proveedor: "P02409",
    razonSocial: "GRUPO INDUSTRIAL SAN IGNACIO SOCIEDAD ANÓNIMA",
    fechaEmision: "11/12/2023",
    fechaVencimiento: "18/12/2023",
    detalles: [
      {
        codigo: "H301CM20SI",
        descripcion: "Hilado 30/1 Melange 20% SAN IGNACIO",
        unid: "KG",
        cantidad: "10,000.00",
        cantAtendida: "8,530.78",
      },
    ],
  },
  {
    nroOC: "0012400105",
    proveedor: "P02517",
    razonSocial: "TEXCOPE S.A.C.",
    fechaEmision: "26/04/2024",
    fechaVencimiento: "03/05/2024",
    detalles: [],
  },
  {
    nroOC: "0012400105",
    proveedor: "P02517",
    razonSocial: "TEXCOPE S.A.C.",
    fechaEmision: "26/04/2024",
    fechaVencimiento: "03/05/2024",
    detalles: [],
  },
  {
    nroOC: "0012400105",
    proveedor: "P02517",
    razonSocial: "TEXCOPE S.A.C.",
    fechaEmision: "26/04/2024",
    fechaVencimiento: "03/05/2024",
    detalles: [],
  }
];

const OrdenesCompra: React.FC = () => {
  const [ordenesCompra, setOrdenesCompra] = useState(OrdenesCompraData);
  const [pagina, setPagina] = useState(0);
  const [filasPorPagina, setFilasPorPagina] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [expandedRows, setExpandedRows] = useState<number[]>([]);

  const [filters, setFilters] = useState({
    proveedor: "",
    razonSocial: "",
    fechaEmision: "",
    fechaVencimiento: "",
  });

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const toggleRowExpansion = (index: number) => {
    setExpandedRows((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const filteredOrdenes = ordenesCompra.filter((orden) => {
    return (
      (searchTerm === "" ||
        Object.values(orden)
          .join(" ")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) &&
      (filters.proveedor === "" ||
        orden.proveedor.toLowerCase().includes(filters.proveedor.toLowerCase())) &&
      (filters.razonSocial === "" ||
        orden.razonSocial
          .toLowerCase()
          .includes(filters.razonSocial.toLowerCase())) &&
      (filters.fechaEmision === "" ||
        orden.fechaEmision === filters.fechaEmision) &&
      (filters.fechaVencimiento === "" ||
        orden.fechaVencimiento === filters.fechaVencimiento)
    );
  });

  return (
    <div className="space-y-5">
      <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <h2 className="text-xl font-semibold mb-4 text-black">Órdenes de Compra</h2>
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
                    value={filters.proveedor}
                    onChange={(e) => handleFilterChange("proveedor", e.target.value)}
                  />
                  <TextField
                    label="Razón Social"
                    variant="outlined"
                    placeholder="Filtrar por razón social..."
                    size="small"
                    fullWidth
                    value={filters.razonSocial}
                    onChange={(e) =>
                      handleFilterChange("razonSocial", e.target.value)
                    }
                  />
                  <TextField
                    label="Fecha Emisión"
                    type="date"
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                    size="small"
                    fullWidth
                    value={filters.fechaEmision}
                    onChange={(e) =>
                      handleFilterChange("fechaEmision", e.target.value)
                    }
                  />
                  <TextField
                    label="Fecha Vencimiento"
                    type="date"
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                    size="small"
                    fullWidth
                    value={filters.fechaVencimiento}
                    onChange={(e) =>
                      handleFilterChange("fechaVencimiento", e.target.value)
                    }
                  />
                </div>
              </Menu>
            </div>
          </div>

          {/* Tabla de Órdenes de Compra */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow className="bg-blue-900">
                  {[
                    "No. O/C",
                    "Proveedor",
                    "Nombre o Razón Social",
                    "Fecha Emisión",
                    "Fecha Vcmto.",
                    "Detalles",
                  ].map((col, index) => (
                    <TableCell
                      key={index}
                      className="text-white text-center font-bold"
                    >
                      {col}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredOrdenes
                  .slice(
                    pagina * filasPorPagina,
                    pagina * filasPorPagina + filasPorPagina
                  )
                  .map((orden, index) => (
                    <>
                      <TableRow key={index}>
                        <TableCell className="text-center">{orden.nroOC}</TableCell>
                        <TableCell className="text-center">{orden.proveedor}</TableCell>
                        <TableCell className="text-center">{orden.razonSocial}</TableCell>
                        <TableCell className="text-center">{orden.fechaEmision}</TableCell>
                        <TableCell className="text-center">{orden.fechaVencimiento}</TableCell>
                        <TableCell className="text-center">
                          <IconButton onClick={() => toggleRowExpansion(index)}>
                            {expandedRows.includes(index) ? (
                              <KeyboardArrowUp />
                            ) : (
                              <KeyboardArrowDown />
                            )}
                          </IconButton>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={6} style={{ padding: 0 }}>
                          <Collapse in={expandedRows.includes(index)} timeout="auto" unmountOnExit>
                            <TableContainer>
                              <Table>
                                <TableHead>
                                  <TableRow className="bg-blue-900">
                                    {[
                                      "Código",
                                      "Descripción",
                                      "Unid",
                                      "Cantidad",
                                      "Cant. Atendida",
                                    ].map((col, idx) => (
                                      <TableCell
                                        key={idx}
                                        className="text-white text-center font-bold"
                                      >
                                        {col}
                                      </TableCell>
                                    ))}
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {orden.detalles.map((detalle, idx) => (
                                    <TableRow key={idx}>
                                      <TableCell className="text-center">{detalle.codigo}</TableCell>
                                      <TableCell className="text-center">{detalle.descripcion}</TableCell>
                                      <TableCell className="text-center">{detalle.unid}</TableCell>
                                      <TableCell className="text-center">{detalle.cantidad}</TableCell>
                                      <TableCell className="text-center">{detalle.cantAtendida}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={filteredOrdenes.length}
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
        />
      </div>
    </div>
  );
};

export default OrdenesCompra;

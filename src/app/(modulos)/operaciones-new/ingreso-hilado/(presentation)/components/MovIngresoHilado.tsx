﻿"use client";

import React, { useState, useEffect } from "react";
import {
  TablePagination,
  IconButton,
  Button,
  TextField,
  Menu,
} from "@mui/material";
import { Visibility, Add, FilterList, Search } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { YarnPurchaseEntry } from "../../../models/models";
import { fetchYarnPurchaseEntries } from "../../services/movIngresoHiladoService";

const MovIngresoHilado: React.FC = () => {
  const router = useRouter();
  const [hilados, setHilados] = useState<YarnPurchaseEntry[]>([]);
  const [pagina, setPagina] = useState(0);
  const [filasPorPagina, setFilasPorPagina] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Cargar datos del servicio
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetchYarnPurchaseEntries(
          2024, // Cambia el periodo si es dinámico
          filasPorPagina,
          pagina * filasPorPagina
        );
        setHilados(response.yarnPurchaseEntries); // Asigna los datos de hilados
      } catch (error) {
        console.error("Error al cargar los datos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [pagina, filasPorPagina]);

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

  const handleDetailsClick = (entryNumber: string) => {
    router.push(`/operaciones-new/ingreso-hilado/detalles-mov-ingreso-hilado/${entryNumber}`);
  };

  const filteredHilados = hilados.filter((hilado) =>
    Object.values(hilado).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
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

            {/* Botón Crear */}
            <div className="flex items-center gap-2">
              <Button
                startIcon={<Add />}
                variant="contained"
                style={{ backgroundColor: "#1976d2", color: "#fff" }}
                onClick={handleCreateMovIngresoHilado}
              >
                CREAR
              </Button>
            </div>
          </div>

          {/* Tabla de Movimientos */}
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-blue-900 uppercase text-center">
                {[
                  "Nro Ingreso",
                  "Periodo",
                  "Fecha",
                  "Hora",
                  "Proveedor",
                  "Estado",
                  "Nro O/C",
                  "Lote Proveedor",
                  "Lote Mecsa",
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
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="text-center py-4">
                    Cargando datos...
                  </td>
                </tr>
              ) : filteredHilados.length > 0 ? (
                filteredHilados.map((hilado, index) => (
                  <tr key={index} className="text-center">
                    <td className="border-b border-[#eee] px-4 py-5">
                      {hilado.entryNumber}
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5">
                      {hilado.period}
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5">
                      {hilado.creationDate}
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5">
                      {hilado.creationTime}
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5">
                      {hilado.supplierCode}
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5">
                      {hilado.statusFlag}
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5">
                      {hilado.purchaseOrderNumber}
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5">
                      {hilado.supplierBatch}
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5">
                      {hilado.mecsaBatch}
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5">
                      <IconButton
                        color="primary"
                        onClick={() => handleDetailsClick(hilado.entryNumber)}
                      >
                        <Visibility />
                      </IconButton>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="text-center py-4">
                    No se encontraron resultados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
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
        />
      </div>
    </div>
  );
};

export default MovIngresoHilado;
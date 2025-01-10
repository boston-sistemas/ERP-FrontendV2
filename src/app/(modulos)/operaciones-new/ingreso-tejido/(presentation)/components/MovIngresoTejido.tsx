"use client";

import React, { useState, useEffect } from "react";
import {
  TablePagination,
  IconButton,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { Visibility, Add, Close, Search } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { WeavingServiceEntry } from "../../../models/models";
import { fetchWeavingServiceEntries, fetchWeavingServiceEntryById, annulWeavingServiceEntry, checkWeavingServiceEntryIsUpdatable } from "../../services/IngresoTejidoService";

const MovIngresoTejido: React.FC = () => {
    const router = useRouter();
    const [entries, setEntries] = useState<WeavingServiceEntry[]>([]);
    const [pagina, setPagina] = useState(0);
    const [filasPorPagina, setFilasPorPagina] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [includeInactive, setIncludeInactive] = useState(false);
    const [period, setPeriod] = useState(2024);
  
    useEffect(() => {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const response = await fetchWeavingServiceEntries(
            period,
            filasPorPagina,
            pagina * filasPorPagina,
            includeInactive
          );
          setEntries(response.weavingServiceEntries || []);
        } catch (error) {
          console.error("Error al cargar los datos:", error);
        } finally {
          setIsLoading(false);
        }
      };
  
      fetchData();
    }, [pagina, filasPorPagina, includeInactive, period]);
  
    const handleCreateEntry = () => {
      router.push("/operaciones-new/ingreso-tejido/crear-mov-ingreso-tejido");
    };
  
    const handleViewDetails = (entryNumber: string, period: number) => {
      router.push(`/operaciones-new/ingreso-tejido/detalles-mov-ingreso-tejido/${entryNumber}?period=${period}`);
    };
  
    const filteredEntries = entries.filter((entry) =>
      Object.values(entry).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  
    return (
      <div className="space-y-5">
        <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default sm:px-7.5 xl:pb-1">
          <div className="max-w-full overflow-x-auto">
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center border border-gray-300 rounded-md px-2">
                  <Search />
                  <TextField
                    variant="standard"
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      disableUnderline: true,
                    }}
                  />
                </div>
                <FormControlLabel
                  control={
                    <Switch
                      checked={includeInactive}
                      onChange={(e) => setIncludeInactive(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Mostrar inactivos"
                />
                <div className="flex items-center gap-2">
                  <Typography variant="body2" className="font-semibold">
                    Período:
                  </Typography>
                  <Select
                    value={period}
                    onChange={(e) => setPeriod(Number(e.target.value))}
                    displayEmpty
                    variant="outlined"
                    size="small"
                    style={{ width: "120px", backgroundColor: "#fff" }}
                  >
                    {[2023, 2024, 2025].map((year) => (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  startIcon={<Add />}
                  variant="contained"
                  style={{ backgroundColor: "#1976d2", color: "#fff" }}
                  onClick={handleCreateEntry}
                >
                  CREAR
                </Button>
              </div>
            </div>
  
            <table className="w-full h-full border-collapse table-auto">
              <thead>
                <tr className="bg-blue-900 uppercase text-center">
                  {[
                    "Nro Ingreso",
                    "Periodo",
                    "Fecha",
                    "Hora",
                    "Proveedor",
                    "Estado",
                    "Detalles",
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
                    <td colSpan={7} className="text-center py-4">
                      Cargando datos...
                    </td>
                  </tr>
                ) : filteredEntries.length > 0 ? (
                  filteredEntries.map((entry, index) => (
                    <tr key={index} className="text-center">
                      <td className="border-b border-[#eee] px-4 py-5">
                        {entry.entryNumber}
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5">
                        {entry.period}
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5">
                        {entry.creationDate}
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5">
                        {entry.creationTime}
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5">
                        {entry.supplierCode}
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5">
                        {entry.statusFlag}
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5">
                        <IconButton
                          color="primary"
                          onClick={() => handleViewDetails(entry.entryNumber, entry.period)}
                        >
                          <Visibility />
                        </IconButton>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-4">
                      No se encontraron resultados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
  
          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={entries.length}
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
  
  export default MovIngresoTejido;
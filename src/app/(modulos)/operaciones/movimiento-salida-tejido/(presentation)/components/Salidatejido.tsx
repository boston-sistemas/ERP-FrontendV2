"use client";

import React, { useState } from "react";
import {
  TablePagination,
  IconButton,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  Typography,
  Dialog,
  DialogContent,
  DialogActions,
  Menu,
} from "@mui/material";
import { Visibility, Add, FilterList } from "@mui/icons-material";
import { useRouter } from "next/navigation";

const PRIMARY_COLOR = "#1976d2";
const ERROR_COLOR = "#d32f2f";

const getCurrentYear = () => new Date().getFullYear();
const generateYearOptions = (startYear: number) => {
  const currentYear = getCurrentYear();
  return Array.from({ length: currentYear - startYear + 1 }, (_, i) => startYear + i);
};

const SalidaTejido: React.FC = () => {
  const router = useRouter();
  const [pagina, setPagina] = useState(0);
  const [filasPorPagina, setFilasPorPagina] = useState(10);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [period, setPeriod] = useState(getCurrentYear());
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleCreateSalidaTejido = () => {
    router.push("/operaciones/movimiento-salida-tejido/crear");
  };

  const handleAdvancedSearchClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleAdvancedSearchClose = () => {
    setAnchorEl(null);
  };

  return (
    <div className="space-y-5">
      <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <div className="max-w-full overflow-x-auto">
          <div className="flex items-center justify-start gap-2 mb-4">
            <Button
              startIcon={<FilterList />}
              variant="outlined"
              onClick={handleAdvancedSearchClick}
            >
              Filtrar por fecha
            </Button>

            <FormControlLabel
              control={
                <Switch
                  checked={includeInactive}
                  onChange={(e) => setIncludeInactive(e.target.checked)}
                  color="primary"
                />
              }
              label="Mostrar anulados"
            />

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
              {generateYearOptions(2023).map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>

            <Button
              startIcon={<Add />}
              variant="contained"
              style={{ backgroundColor: PRIMARY_COLOR, color: "#fff", marginLeft: 'auto' }}
              onClick={handleCreateSalidaTejido}
            >
              CREAR
            </Button>
          </div>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleAdvancedSearchClose}
          >
            <div className="p-4 space-y-2" style={{ maxWidth: "300px" }}>
              <TextField
                label="Fecha Inicio"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <TextField
                label="Fecha Fin"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </div>
          </Menu>

          <table className="w-full table-auto">
            <thead>
              <tr className="bg-blue-900 uppercase text-center">
                {[
                  "Nro Salida",
                  "Periodo",
                  "Fecha",
                  "Cliente",
                  "Estado",
                  "Nro Pedido",
                  "Lote",
                  "Detalles/Edición"
                ].map((col, index) => (
                  <th key={index} className="px-4 py-4 text-center font-normal text-white">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={8} className="text-center py-4">
                  No se encontraron resultados.
                </td>
              </tr>
            </tbody>
          </table>

          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={0}
            rowsPerPage={filasPorPagina}
            page={pagina}
            onPageChange={(_, newPage) => setPagina(newPage)}
            onRowsPerPageChange={(e) => setFilasPorPagina(parseInt(e.target.value, 10))}
            labelRowsPerPage="Filas por página:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
            }
          />
        </div>
      </div>
    </div>
  );
};

export default SalidaTejido;

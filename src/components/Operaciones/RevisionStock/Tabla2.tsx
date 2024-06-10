"use client"

import React, { useState } from "react";
import { IconButton, Collapse } from "@mui/material";
import { ColorDeEstadoOrden } from "@/components/Parametros/ColorDeEstadoOrden";
import TablaExpandida from "./TablaExpandida";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { Orden } from "./RevisionStock";
import { TablePagination } from '@mui/material';
import { MAX_HEIGHT, minWidths2 } from "@/components/Parametros/Parametros";
import "@/css/checkbox.css";

const columns = [
  "Orden",
  "Fecha",
  "Tejeduria",
  "Programado (kg)",
  "Consumido (kg)",
  "Restante (kg)",
  "Merma",
  "Progreso",
  "Saldo Recogido"
];

interface Color {
  nombre: string;
  descripcion: string | null;
  color_id: number;
}

interface Tabla2Props {
  data: Orden[];
  loading: boolean;
}

const Tabla2: React.FC<Tabla2Props> = ({ data, loading}) => {
  const [filasSeleccionadas, setFilasSeleccionadas] = useState<boolean[]>(new Array(data.length).fill(false));
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [filasExpandidas, setFilasExpandidas] = useState<number[]>([]);
  const [pagina, setPagina] = useState(0);
  const [filasPorPagina, setFilasPorPagina] = useState(10);

  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setFilasSeleccionadas(new Array(data.length).fill(newSelectAll));
  };

  const handleSelectFila = (index: number) => {
    const newfilasSeleccionadas = [...filasSeleccionadas];
    newfilasSeleccionadas[index] = !newfilasSeleccionadas[index];
    setFilasSeleccionadas(newfilasSeleccionadas);
    setSelectAll(newfilasSeleccionadas.every(row => row));
  };

  const handleExpandirFila= (index: number) => {
    if (filasExpandidas.includes(index)) {
      setFilasExpandidas(filasExpandidas.filter(rowIndex => rowIndex !== index));
    } else {
      setFilasExpandidas([...filasExpandidas, index]);
    }
  };

  const handleCambiarPagina = (event: any, newPage: any) => {
    setPagina(newPage);
  };
  
  const handleCambiarFilasPorPagina = (event: any) => {
    setFilasPorPagina(parseInt(event.target.value, 10));
    setPagina(0); 
  };

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
        Ordenes de Servicio - Cerradas
      </h4>
      <div className="max-w-full overflow-x-auto" style={{ maxHeight: MAX_HEIGHT, overflowY: 'auto' }}>
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-blue-900 uppercase text-center dark:bg-meta-4">
              <th className="px-4 py-4 font-normal text-white dark:text-white">
                <input
                  type="checkbox"
                  className="checkbox-large"
                  checked={selectAll}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="px-4 py-4 font-normal text-white dark:text-white"></th>
              {columns.map((column, index) => (
                <th key={index} className={`px-4 py-4 text-center font-normal text-white dark:text-zinc-100 ${minWidths2[index + 1]}`}>
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length + 2} className="pt-5 pb-5 text-center text-black dark:text-white">
                  Cargando...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 2} className="pt-5 pb-5 text-center text-black dark:text-white">
                  No existen datos para esta consulta
                </td>
              </tr>
            ) : (
              data
                .slice(pagina * filasPorPagina, pagina * filasPorPagina + filasPorPagina)
                .map((data, index) => (
                <React.Fragment key={index}>
                  <tr className={`${filasSeleccionadas[index] ? "bg-blue-100 dark:bg-blue-900" : ""} text-center`}>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                      <input
                        type="checkbox"
                        className="checkbox-large"
                        checked={filasSeleccionadas[index]}
                        onChange={() => handleSelectFila(index)}
                      />
                    </td>
                    <td className="border-b border-[#eee] px-8 py-5 dark:border-strokedark">
                      <IconButton 
                        onClick={() => handleExpandirFila(index)} 
                        className="text-inherit dark:text-black"
                      >
                        {filasExpandidas.includes(index) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                      <p className="font-normal text-black dark:text-white">{data.orden}</p>
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                      <p className="font-normal text-black dark:text-white">{data.fecha}</p>
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                      <p className="font-normal text-black dark:text-white">{data.tejeduria}</p>
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                      <p className="font-normal text-black dark:text-white">{data.programado} kg</p>
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                      <p className="font-normal text-black dark:text-white">{data.consumido} kg</p>
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                      <p className="font-normal text-black dark:text-white">{data.restante} kg</p>
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                      <p className="font-normal text-black dark:text-white">{data.merma}</p>
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                      <p className="font-normal text-black dark:text-white">{data.progreso}</p>
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                      <p
                        className={`inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium ${ColorDeEstadoOrden(
                          data.estado
                        )}`}
                      >
                        {data.estado}
                      </p>
                    </td>
                  </tr>
                  <tr className="bg-gray-100 dark:bg-gray-700">
                    <td colSpan={columns.length + 2} className="p-0">
                      <Collapse in={filasExpandidas.includes(index)} timeout="auto" unmountOnExit>
                        <TablaExpandida data={data.expandida} />
                      </Collapse>
                    </td>
                  </tr>
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
      <TablePagination
      rowsPerPageOptions={[10, 25, 50]}
      component="div"
      count={data.length}
      rowsPerPage={filasPorPagina}
      page={pagina}
      onPageChange={handleCambiarPagina}
      onRowsPerPageChange={handleCambiarFilasPorPagina}
      labelRowsPerPage="Filas por página:"
      labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`}
      sx={{ color: (theme) => theme.palette.mode === 'dark' ? '#ffffff' : 'inherit'}}
      />
    </div>
  );
};

export default Tabla2;

"use client"

import React, { useState, useEffect } from "react";
import instance from "@/config/AxiosConfig";
import { IconButton, Collapse } from "@mui/material";
import { ColorDeEstadoOrden } from "@/components/Parametros/ColorDeEstadoOrden";
import TablaExpandida from "./TablaExpandida";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { Orden } from "./ProgramacionATintoreria";
import { TablePagination } from '@mui/material';
import { MAX_HEIGHT, minWidths1, TIMEOUTFETCH } from "@/components/Parametros/TablasStock";
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
  "Estado",
];

interface Tabla1Props {
  data: Orden[];
  loading: boolean;
  fetchData: () => void;
}

const Tabla1: React.FC<Tabla1Props> = ({ data, loading, fetchData }) => {
  const [filasSeleccionadas, setFilasSeleccionadas] = useState<boolean[]>(new Array(data.length).fill(false));
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [filasExpandidas, setFilasExpandidas] = useState<number[]>([]);
  const [pagina, setPagina] = useState(0);
  const [filasPorPagina, setFilasPorPagina] = useState(10);
  const [mensajeError, setMensajeError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [enviando, setEnviando] = useState<boolean>(false);
  const [desvaneciendo, setDesvaneciendo] = useState<boolean>(false);

  useEffect(() => {
    if (mensajeError || mensajeExito) {
      const timer = setTimeout(() => setDesvaneciendo(true), 4000);
      const timer2 = setTimeout(() => {
        setMensajeError(null);
        setMensajeExito(null);
        setDesvaneciendo(false);
      }, 5000);
      return () => {
        clearTimeout(timer);
        clearTimeout(timer2);
      };
    }
  }, [mensajeError, mensajeExito]);

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

  const handleCerrarOrden = async () => {
    setEnviando(true);

    const ordenesSeleccionadas = data.filter((_, index) => filasSeleccionadas[index]).map((item) => ({
      orden_servicio_tejeduria_id: item.orden,
      estado: "CERRADO",
    }));

    if (ordenesSeleccionadas.length === 0) {
      setMensajeError("Ninguna orden seleccionada. Por favor, seleccione las órdenes que desea cerrar.");
      setEnviando(false);
      return;
    }

    const detallesOrden = ordenesSeleccionadas.map((orden) => `OS: ${orden.orden_servicio_tejeduria_id}`).join(", ");

    setMensajeError(null); // Resetear mensaje de error si todo está correcto

    try {
      await instance.put('/operations/v1/revision-stock/ordenes', { ordenes: ordenesSeleccionadas });
      setMensajeExito(detallesOrden);
      setFilasSeleccionadas(new Array(data.length).fill(false)); // Resetear selección
      setSelectAll(false); // Deseleccionar todo
      fetchData(); // Actualizar datos
    } catch (error) {
      setMensajeError(`Error cerrando las órdenes. Conflictos: ${detallesOrden}`);
    }

    setEnviando(false);
  };

  return (
    <div>
      <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
          Ordenes de Servicio - Pendientes
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
                  <th key={index} className={`px-4 py-4 text-center font-normal text-white dark:text-zinc-100 ${minWidths1[index + 1]}`}>
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
                          className="text-inherit dark:text-white w-10"
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
      <button
        onClick={handleCerrarOrden}
        className={`mt-4 w-full border border-gray-300 px-5 py-3 text-white transition ${enviando ? 'bg-blue-600' : 'bg-blue-800 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 dark:bg-blue-500 dark:hover:bg-blue-400`}
        disabled={enviando}
      >
        Agregar Partida
      </button>
      {mensajeError && (
        <div className={`flex w-full border-l-6 border-warning bg-warning bg-opacity-[15%] px-7 py-8 shadow-md dark:bg-[#1B1B24] dark:bg-opacity-30 md:p-9 mt-4 transition-opacity duration-1000 ${desvaneciendo ? 'opacity-0' : 'opacity-100'}`}>
          <div className="mr-5 flex h-9 w-9 items-center justify-center rounded-lg bg-warning bg-opacity-30">
            <svg
              width="19"
              height="16"
              viewBox="0 0 19 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1.50493 16H17.5023C18.6204 16 19.3413 14.9018 18.8354 13.9735L10.8367 0.770573C10.2852 -0.256858 8.70677 -0.256858 8.15528 0.770573L0.156617 13.9735C-0.334072 14.8998 0.386764 16 1.50493 16ZM10.7585 12.9298C10.7585 13.6155 10.2223 14.1433 9.45583 14.1433C8.6894 14.1433 8.15311 13.6155 8.15311 12.9298V12.9015C8.15311 12.2159 8.6894 11.688 9.45583 11.688C10.2223 11.688 10.7585 12.2159 10.7585 12.9015V12.9298ZM8.75236 4.01062H10.2548C10.6674 4.01062 10.9127 4.33826 10.8671 4.75288L10.2071 10.1186C10.1615 10.5049 9.88572 10.7455 9.50142 10.7455C9.11929 10.7455 8.84138 10.5028 8.79579 10.1186L8.13574 4.75288C8.09449 4.33826 8.33984 4.01062 8.75236 4.01062Z"
                fill="#FBBF24"
              ></path>
            </svg>
          </div>
          <div className="w-full">
            <h5 className="mb-3 text-lg font-semibold text-[#9D5425]">
              {mensajeError.includes("Ninguna orden seleccionada") ? "Ninguna orden seleccionada" : "Error cerrando las órdenes"}
            </h5>
            <p className="leading-relaxed text-[#D0915C]">
              {mensajeError.includes("Ninguna orden seleccionada") 
                ? "Por favor, seleccione las órdenes que desea cerrar."
                : `Conflictos: ${mensajeError.split('Conflictos: ')[1]}`}
            </p>
          </div>
        </div>
      )}
      {mensajeExito && (
        <div className={`flex w-full border-l-6 border-[#34D399] bg-[#34D399] bg-opacity-[15%] px-7 py-8 shadow-md dark:bg-[#1B1B24] dark:bg-opacity-30 md:p-9 mt-4 transition-opacity duration-1000 ${desvaneciendo ? 'opacity-0' : 'opacity-100'}`}>
          <div className="mr-5 flex h-9 w-9 items-center justify-center rounded-lg bg-[#34D399]">
            <svg
              width="16"
              height="12"
              viewBox="0 0 16 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15.2984 0.826822L15.2868 0.811827L15.2741 0.797751C14.9173 0.401867 14.3238 0.400754 13.9657 0.794406L5.91888 9.45376L2.05667 5.2868C1.69856 4.89287 1.10487 4.89389 0.747996 5.28987C0.417335 5.65675 0.417335 6.22337 0.747996 6.59026L0.747959 6.59029L0.752701 6.59541L4.86742 11.0348C5.14445 11.3405 5.52858 11.5 5.89581 11.5C6.29242 11.5 6.65178 11.3355 6.92401 11.035L15.2162 2.11161C15.5833 1.74452 15.576 1.18615 15.2984 0.826822Z"
                fill="white"
                stroke="white"
              ></path>
            </svg>
          </div>
          <div className="w-full">
            <h5 className="mb-3 text-lg font-semibold text-black dark:text-[#34D399] ">
              Reporte enviado correctamente
            </h5>
            <p className="text-base leading-relaxed text-body">
              Se actualizaron las órdenes, {mensajeExito}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tabla1;

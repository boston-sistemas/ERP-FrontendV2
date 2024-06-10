"use client";

import React, { useState, useEffect } from "react";
import instance from "@/config/AxiosConfig";
import { TablePagination } from "@mui/material";
import { ColorDeEstadoOrden } from "@/components/Parametros/ColorDeEstadoOrden";
import { Suborden } from "./ReporteStock";
import { MAX_HEIGHT, TIMEOUTFETCH } from "@/components/Parametros/Parametros";
import "@/css/checkbox.css";

const columns = [
  "OS",
  "Tejido",
  "Ancho",
  "Programado (kg)",
  "Consumido (kg)",
  "Restante (kg)",
  "Rollos",
  "Peso",
  "Progreso",
  "Estado",
];

const minWidths3 = [
  "min-w-[110px]",  // OS
  "min-w-[110px]",  // Tejido
  "min-w-[120px]",  // Ancho
  "min-w-[110px]",  // Programado (kg)
  "min-w-[110px]",  // Consumido (kg)
  "min-w-[110px]",  // Restante (kg)
  "min-w-[50px]",  // Rollos
  "min-w-[50px]",  // Peso
  "min-w-[110px]",  // Progreso
  "min-w-[110px]",  // Estado
];

interface Tabla1Props {
  data: Suborden[];
  loading: boolean;
  fetchData: () => void;
}

const Tabla1: React.FC<Tabla1Props> = ({ data, loading, fetchData }) => {
  const [pagina, setPagina] = useState(0);
  const [filasPorPagina, setFilasPorPagina] = useState(10);
  const [rollos, setRollos] = useState<number[]>([]);
  const [peso, setPeso] = useState<number[]>([]);
  const [mensajeError, setMensajeError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [desvaneciendo, setDesvaneciendo] = useState<boolean>(false);
  const [enviando, setEnviando] = useState<boolean>(false);

  useEffect(() => {
    setRollos(new Array(data.length).fill(0));
    setPeso(new Array(data.length).fill(0));
  }, [data]);

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

  const handleCambiarPagina = (event: any, newPage: any) => {
    setPagina(newPage);
  };

  const handleCambiarFilasPorPagina = (event: any) => {
    setFilasPorPagina(parseInt(event.target.value, 10));
    setPagina(0);
  };

  const handleRollosCambio = (index: number, value: number) => {
    if (value >= 0) {
      const newRollos = [...rollos];
      newRollos[index] = value;
      setRollos(newRollos);
    }
  };

  const handlePesoCambio = (index: number, value: number) => {
    if (value >= 0) {
      const newPeso = [...peso];
      newPeso[index] = value;
      setPeso(newPeso);
    }
  };

  const handleEnviarStock = async () => {
    setEnviando(true);
    const subordenesSeleccionadas = data.map((item, index) => {
      if ((rollos[index] > 0 && peso[index] <= 0) || (rollos[index] <= 0 && peso[index] > 0)) {
        setMensajeError(`Debe ingresar tanto el número de rollos como el peso mayor a 0.`);
        setEnviando(false);
        return null;
      }
      return {
        orden_servicio_tejeduria_id: item.os,
        crudo_id: `${item.tejido}${item.ancho}`,
        reporte_tejeduria_nro_rollos: rollos[index],
        reporte_tejeduria_cantidad_kg: peso[index],
        estado: item.estado,
      };
    }).filter((suborden): suborden is NonNullable<typeof suborden> => suborden !== null);

    if (subordenesSeleccionadas.length !== data.length) {
      setMensajeError("Debe ingresar tanto el número de rollos como el peso mayor a 0.");
      setEnviando(false);
      return;
    }

    const detallesOrden = subordenesSeleccionadas.map((suborden) => `OS: ${suborden.orden_servicio_tejeduria_id}, Tejido: ${suborden.crudo_id.slice(0, -2)}, Ancho: ${suborden.crudo_id.slice(-2)}`).join(", ");

    setMensajeError(null); // Resetear mensaje de error si todo está correcto

    try {
      await instance.put('/operations/v1/reporte-stock/subordenes', { subordenes: subordenesSeleccionadas });
      setRollos(new Array(data.length).fill(0));
      setPeso(new Array(data.length).fill(0));
      setMensajeExito(detallesOrden);
      fetchData();
    } catch (error) {
      setMensajeError(`Error enviando los datos. Conflictos: ${detallesOrden}`);
    }

    setTimeout(() => setEnviando(false), TIMEOUTFETCH);
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
                {columns.map((column, index) => (
                  <th key={index} className={`px-4 py-4 text-center font-normal text-white dark:text-zinc-100 ${minWidths3[index]}`}>
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="pt-5 pb-5 text-center text-black dark:text-white">
                    Cargando...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="pt-5 pb-5 text-center text-black dark:text-white">
                    No existen datos para esta consulta
                  </td>
                </tr>
              ) : (
                data
                  .slice(pagina * filasPorPagina, pagina * filasPorPagina + filasPorPagina)
                  .map((item, index) => (
                    <React.Fragment key={index}>
                      <tr className="text-center">
                        <td className="text-black border-b border-[#eee] px-4 py-5 dark:text-white dark:border-strokedark">{item.os}</td>
                        <td className="text-black border-b border-[#eee] px-4 py-5 dark:text-white dark:border-strokedark">{item.tejido}</td>
                        <td className="text-black border-b border-[#eee] px-4 py-5 dark:text-white dark:border-strokedark">{item.ancho}</td>
                        <td className="text-black border-b border-[#eee] px-4 py-5 dark:text-white dark:border-strokedark">{item.programado} kg</td>
                        <td className="text-black border-b border-[#eee] px-4 py-5 dark:text-white dark:border-strokedark">{item.consumido} kg</td>
                        <td className="text-black border-b border-[#eee] px-4 py-5 dark:text-white dark:border-strokedark">{item.restante} kg</td>
                        <td className="text-black border-b border-[#eee] px-4 py-5 dark:text-white dark:border-strokedark">
                          <input
                            type="number"
                            value={rollos[index] || 0}
                            onChange={(e) => handleRollosCambio(index, parseInt(e.target.value))}
                            className="w-20 border-[1.5px] border-neutral-500 bg-transparent px-3 py-1.5 text-center text-black outline-none transition focus:border-blue-800 active:border-blue-800 disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-blue-800"
                            min="0"
                          />
                        </td>
                        <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                          <input
                            type="number"
                            value={peso[index] || 0}
                            onChange={(e) => handlePesoCambio(index, parseFloat(e.target.value))}
                            className="w-30 border-[1.5px] border-neutral-500 bg-transparent px-3 py-1.5 text-center text-black outline-none transition focus:border-blue-800 active:border-blue-800 disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-blue-800"
                            min="0"
                          />
                        </td>
                        <td className="text-black dark:text-white border-b border-[#eee] px-4 py-5 dark:border-strokedark">{item.progreso}</td>
                        <td className="text-black dark:text-white border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                          <p className={`inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium ${ColorDeEstadoOrden(item.estado)}`}>
                            {item.estado}
                          </p>
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
          sx={{ color: (theme) => theme.palette.mode === 'dark' ? '#ffffff' : 'inherit' }}
        />
      </div>
      <button
        onClick={handleEnviarStock}
        className={`mt-4 w-full border border-gray-300 px-5 py-3 text-white transition ${enviando ? 'bg-blue-600' : 'bg-blue-800 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 dark:bg-blue-500 dark:hover:bg-blue-400`}
        disabled={enviando}
      >
        Enviar Stock
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
              Error enviando los datos
            </h5>
            <p className="leading-relaxed text-[#D0915C]">
              {mensajeError}
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

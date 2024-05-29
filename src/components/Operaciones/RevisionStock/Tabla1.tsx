"use client"

import React, { useState } from "react";
import { ColorDeEstadoOrden } from "@/components/Parametros/ColorDeEstadoOrden";
import { Data } from "./Datos";
import TablaExpandida from "./TablaExpandida";
import "@/css/checkbox.css";

const columns = [
  "Orden",
  "Fecha",
  "Programado (kg)",
  "Consumido (kg)",
  "Restante (kg)",
  "Merma",
  "Progreso",
  "Estado",
];

const minWidths = [
  "min-w-[40px]",   // Checkbox
  "min-w-[110px]",  // Orden
  "min-w-[110px]",  // Fecha
  "min-w-[110px]",  // Programado (kg)
  "min-w-[110px]",  // Consumido (kg)
  "min-w-[110px]",  // Restante (kg)
  "min-w-[110px]",  // Merma
  "min-w-[110px]",  // Progreso
  "min-w-[110px]"   // Estado
];

const Tabla1 = () => {
  const [filasSeleccionadas, setFilasSeleccionadas] = useState<boolean[]>(new Array(Data.length).fill(false));
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [expandedRows, setExpandedRows] = useState<number[]>([]);

  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setFilasSeleccionadas(new Array(Data.length).fill(newSelectAll));
  };

  const handleSelectRow = (index: number) => {
    const newfilasSeleccionadas = [...filasSeleccionadas];
    newfilasSeleccionadas[index] = !newfilasSeleccionadas[index];
    setFilasSeleccionadas(newfilasSeleccionadas);
    setSelectAll(newfilasSeleccionadas.every(row => row));
  };

  const handleExpandRow = (index: number) => {
    if (expandedRows.includes(index)) {
      setExpandedRows(expandedRows.filter(rowIndex => rowIndex !== index));
    } else {
      setExpandedRows([...expandedRows, index]);
    }
  };

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
        Avance de Ordenes de Servicio
      </h4>
      <div className="max-w-full overflow-x-auto">
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
                <th key={index} className={`px-4 py-4 text-center font-normal text-white dark:text-zinc-100 ${minWidths[index + 1]}`}>
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Data.map((data, index) => (
              <React.Fragment key={index}>
                <tr className={`${filasSeleccionadas[index] ? "bg-gray-100 dark:bg-gray-700" : ""} text-center`}>
                  <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                    <input
                      type="checkbox"
                      className="checkbox-large"
                      checked={filasSeleccionadas[index]}
                      onChange={() => handleSelectRow(index)}
                    />
                  </td>
                  <td className="border-b border-[#eee] px-8 py-5 dark:border-strokedark">
                    <button onClick={() => handleExpandRow(index)}>
                      {expandedRows.includes(index) ? "-" : "+"}
                    </button>
                  </td>
                  <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                    <p className="font-normal text-black dark:text-white">{data.orden}</p>
                  </td>
                  <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                    <p className="font-normal text-black dark:text-white">{data.fecha}</p>
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
                {expandedRows.includes(index) && (
                  <tr className="bg-gray-100 dark:bg-gray-700">
                    <td colSpan={columns.length + 2} className="p-0">
                      <TablaExpandida data={data.expandida} />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Tabla1;

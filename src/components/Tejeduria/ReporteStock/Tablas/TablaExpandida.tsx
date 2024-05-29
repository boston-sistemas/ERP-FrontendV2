import React from "react";
import { ColorDeEstadoOrden } from "@/components/Parametros/ColorDeEstadoOrden";

interface ExpandidaProps {
  data: any;
}

const columnsExpandida = [
  "Tejido",
  "Ancho",
  "Hilandería",
  "Programado (kg)",
  "Consumido (kg)",
  "Restante (kg)",
  "Rollos",
  "Peso (kg)",
  "Estado"
];

const minWidthsExpandida = [
  "min-w-[110px]", // Tejido
  "min-w-[110px]", // Ancho
  "min-w-[110px]", // Hilandería
  "min-w-[110px]", // Programado (kg)
  "min-w-[110px]", // Consumido (kg)
  "min-w-[110px]", // Restante (kg)
  "min-w-[110px]", // Rollos
  "min-w-[110px]", // Peso (kg)
  "min-w-[110px]"  // Estado
];

const TablaExpandida = ({ data }: ExpandidaProps) => {
  return (
    <div className="px-4 py-5">
      <table className="w-full table-auto">
        <thead>
          <tr className="bg-gray text-center dark:bg-meta-4">
            {columnsExpandida.map((column, index) => (
              <th key={index} className={`px-4 py-4 font-light text-sm text-black dark:text-white ${minWidthsExpandida[index]}`}>
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="text-center">
            <td className="text-sm font-normal border-b border-[#eee] px-4 py-2 dark:border-strokedark">{data.tejido}</td>
            <td className="text-sm font-normal border-b border-[#eee] px-4 py-2 dark:border-strokedark">{data.ancho}</td>
            <td className="text-sm font-normal border-b border-[#eee] px-4 py-2 dark:border-strokedark">{data.hilanderia}</td>
            <td className="text-sm font-normal border-b border-[#eee] px-4 py-2 dark:border-strokedark">{data.programado}</td>
            <td className="text-sm font-normal border-b border-[#eee] px-4 py-2 dark:border-strokedark">{data.consumido}</td>
            <td className="text-sm font-normal border-b border-[#eee] px-4 py-2 dark:border-strokedark">{data.restante}</td>
            <td className="text-sm font-normal border-b border-[#eee] px-4 py-2 dark:border-strokedark">{data.rollos}</td>
            <td className="text-sm font-normal border-b border-[#eee] px-4 py-2 dark:border-strokedark">{data.peso}</td>
            <td className="text-sm font-normal border-b border-[#eee] px-4 py-2 dark:border-strokedark">
                <p
                    className={`inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium ${ColorDeEstadoOrden(
                    data.estado
                    )}`}
                >
                    {data.estado}
                </p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default TablaExpandida;

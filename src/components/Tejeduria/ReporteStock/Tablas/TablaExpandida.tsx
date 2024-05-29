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
  "min-w-[80px]",  // Ancho
  "min-w-[120px]", // Hilandería
  "min-w-[100px]", // Programado (kg)
  "min-w-[100px]", // Consumido (kg)
  "min-w-[100px]", // Restante (kg)
  "min-w-[80px]",  // Rollos
  "min-w-[100px]", // Peso (kg)
  "min-w-[100px]"  // Estado
];

const TablaExpandida = ({ data }: ExpandidaProps) => {
  return (
    <div className="px-4 py-5">
      <table className="w-full table-auto">
        <thead>
          <tr className="bg-gray text-left dark:bg-meta-4">
            {columnsExpandida.map((column, index) => (
              <th key={index} className={`px-4 py-4 font-light text-black dark:text-white ${minWidthsExpandida[index]}`}>
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="text-base border-b border-[#eee] px-4 py-2 dark:border-strokedark">{data.tejido}</td>
            <td className="text-base border-b border-[#eee] px-4 py-2 dark:border-strokedark">{data.ancho}</td>
            <td className="text-base border-b border-[#eee] px-4 py-2 dark:border-strokedark">{data.hilanderia}</td>
            <td className="text-base border-b border-[#eee] px-4 py-2 dark:border-strokedark">{data.programado}</td>
            <td className="text-base border-b border-[#eee] px-4 py-2 dark:border-strokedark">{data.consumido}</td>
            <td className="text-base border-b border-[#eee] px-4 py-2 dark:border-strokedark">{data.restante}</td>
            <td className="text-base border-b border-[#eee] px-4 py-2 dark:border-strokedark">{data.rollos}</td>
            <td className="text-base border-b border-[#eee] px-4 py-2 dark:border-strokedark">{data.peso}</td>
            <td className="text-base border-b border-[#eee] px-4 py-2 dark:border-strokedark">
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


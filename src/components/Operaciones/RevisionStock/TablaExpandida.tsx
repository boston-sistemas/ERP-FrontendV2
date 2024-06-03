import React from "react";
import { ColorDeEstadoOrden } from "@/components/Parametros/ColorDeEstadoOrden";

interface ExpandidaProps {
  data: any;
}

const columnsExpandida = [
  "Suborden",
  "Programado (kg)",
  "Consumido (kg)",
  "Restante (kg)",
  "Merma",
  "Progreso",
  "Estado"
];

const minWidthsExpandida = [
  "min-w-[110px]", // Suborden
  "min-w-[110px]", // Programado (kg)
  "min-w-[110px]", // Consumido (kg)
  "min-w-[110px]", // Restante (kg)
  "min-w-[110px]", // Merma
  "min-w-[110px]", // Progreso
  "min-w-[110px]", // Estado
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
          {data.map((suborden: any, index: any) => (
            <tr key={index} className="text-center">
              <td className="text-sm font-normal border-b border-t px-4 py-2 dark:border-white">{suborden.suborden}</td>
              <td className="text-sm font-normal border-b border-t px-4 py-2 dark:border-white">{suborden.programado}</td>
              <td className="text-sm font-normal border-b border-t px-4 py-2 dark:border-white">{suborden.consumido}</td>
              <td className="text-sm font-normal border-b border-t px-4 py-2 dark:border-white">{suborden.restante}</td>
              <td className="text-sm font-normal border-b border-t px-4 py-2 dark:border-white">{suborden.merma}</td>
              <td className="text-sm font-normal border-b border-t px-4 py-2 dark:border-white">{suborden.progreso}</td>
              <td className="text-sm font-normal border-b border-t px-4 py-2 dark:border-white">
                <p
                  className={`inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium ${ColorDeEstadoOrden(
                    suborden.estado
                  )}`}
                >
                  {suborden.estado}
                </p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TablaExpandida;

import React, { useEffect, useState } from "react";
import { ColorDeEstadoOrden } from "@/components/Parametros/ColorDeEstadoOrden";
import { Suborden } from "./ProgramacionTintoreria";

interface ExpandidaProps {
  data: Suborden[];
  onSeleccionar: (suborden: Suborden, seleccionado: boolean) => void;
  subordenesSeleccionadas: Suborden[];
}

const columnsExpandida = [
  "Tejido",
  "Densidad",
  "Ancho",
  "Fibras",
  "Rollos",
  "Cantidad",
  "kg_por_rollo",
  "Estado"
];

const minWidthsExpandida = [
  "min-w-[50px]", // Tejido
  "min-w-[50px]", // Densidad
  "min-w-[50px]",  // Ancho
  "min-w-[110px]", // Fibras
  "min-w-[110px]", // Rollos
  "min-w-[110px]", // Cantidad
  "min-w-[110px]", // kg_por_rollo
  "min-w-[130px]", // Estado
];

const TablaExpandida = ({ data, onSeleccionar, subordenesSeleccionadas}: ExpandidaProps) => {
  const [selecciones, setSelecciones] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const nuevasSelecciones: Record<string, boolean> = {};
    subordenesSeleccionadas.forEach(suborden => {
      const idSuborden = `${suborden.tejido}-${suborden.densidad}-${suborden.ancho}`;
      nuevasSelecciones[idSuborden] = true;
    });
    setSelecciones(nuevasSelecciones);
  }, [subordenesSeleccionadas]);

  const manejarSeleccion = (suborden: Suborden) => {
    const idSuborden = `${suborden.tejido}-${suborden.densidad}-${suborden.ancho}`;
    const nuevoEstado = !selecciones[idSuborden];
    setSelecciones({ ...selecciones, [idSuborden]: nuevoEstado });
    onSeleccionar(suborden, nuevoEstado);
  };

  return (
    <div className="px-4 py-5">
      <table className="w-full table-auto">
        <thead>
          <tr className="bg-gray text-center dark:bg-meta-4">
            <th className="w-10 font-light text-sm text-black dark:text-white"></th>
            {columnsExpandida.map((column, index) => (
              <th key={index} className={`px-4 py-4 font-light text-sm text-black dark:text-white ${minWidthsExpandida[index]}`}>
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((suborden, index) => {
            const idSuborden = `${suborden.tejido}-${suborden.densidad}-${suborden.ancho}`;
            return (
              <tr key={index} className="text-center">
                <td className="text-sm font-normal border-b border-t px-4 py-2 dark:border-white">
                  <input
                    type="checkbox"
                    className="checkbox-large"
                    checked={selecciones[idSuborden] || false}
                    onChange={() => manejarSeleccion(suborden)}
                  />
                </td>
                <td className="text-sm font-normal border-b border-t px-4 py-2 dark:border-white">{suborden.tejido}</td>
                <td className="text-sm font-normal border-b border-t px-4 py-2 dark:border-white">{suborden.densidad}</td>
                <td className="text-sm font-normal border-b border-t px-4 py-2 dark:border-white">{suborden.ancho}</td>
                <td className="text-sm font-normal border-b border-t px-4 py-2 dark:border-white">{suborden.fibra}</td>
                <td className="text-sm font-normal border-b border-t px-4 py-2 dark:border-white">{suborden.rollos}</td>
                <td className="text-sm font-normal border-b border-t px-4 py-2 dark:border-white">{suborden.cantidad}</td>
                <td className="text-sm font-normal border-b border-t px-4 py-2 dark:border-white">{suborden.kg_por_rollo}</td>
                <td className="text-sm font-normal border-b border-t px-4 py-2 dark:border-white">
                  <p className={`inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium ${ColorDeEstadoOrden(suborden.estado)}`}>
                    {suborden.estado}
                  </p>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TablaExpandida;

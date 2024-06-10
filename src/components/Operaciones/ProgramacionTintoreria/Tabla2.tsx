"use client";

import React, { useEffect, useState } from "react";
import { Select, MenuItem } from "@mui/material";
import { roundToTwo } from "./ProgramacionTintoreria";

interface Suborden {
  tejido: string;
  densidad: string;
  ancho: string;
  fibra: string;
  rollos: number;
  cantidad: number;
  kg_por_rollo: number;
  estado: string;
}

interface Color {
  nombre: string;
  descripcion: string | null;
  color_id: number;
}

interface Orden {
  hilanderia: string;
  rollos: number;
  peso: number;
  orden: string;
  fecha: string;
  estado: string;
  expandida: Suborden[];
}

interface Partida {
  id: number;
  hilanderia: string;
  suborden: string;
  a_disponer: number;
  rollos: number;
  peso: number;
  kg_por_rollo: number;
  tintoreria: string;
  color: string;
}

interface Tabla2Props {
  data: Orden[];
  loading: boolean;
  colores: Color[];
  partidas: Partida[];
}

const columns = [
  "Partida",
  "Hilanderia",
  "Suborden",
  "A Disponer",
  "Rollos",
  "Peso",
  "Tintoreria",
  "Color"
];

const Tabla2: React.FC<Tabla2Props> = ({ data, loading, colores, partidas }) => {
  const [localPartidas, setLocalPartidas] = useState<Partida[]>(partidas);

  const handleRollosChange = (index: number, value: number) => {
    const newPartidas = [...localPartidas];
    newPartidas[index].rollos = value;
    newPartidas[index].peso = roundToTwo(value * newPartidas[index].kg_por_rollo);
    setLocalPartidas(newPartidas);
  };

  const handleColorChange = (index: number, value: string) => {
    const newPartidas = [...localPartidas];
    newPartidas[index].color = value;
    setLocalPartidas(newPartidas);
  };

  useEffect(() => {
    setLocalPartidas(partidas);
  }, [partidas]);

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
        Partidas
      </h4>
      <div className="max-w-full overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-blue-900 uppercase text-center dark:bg-meta-4">
              {columns.map((column, index) => (
                <th key={index} className="px-4 py-4 text-center font-normal text-white dark:text-zinc-100">
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
            ) : localPartidas.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="pt-5 pb-5 text-center text-black dark:text-white">
                  No existen partidas para mostrar
                </td>
              </tr>
            ) : (
              localPartidas.map((partida, index) => (
                <tr key={index} className="text-center">
                  <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                    {partida.id}
                  </td>
                  <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                    {partida.hilanderia}
                  </td>
                  <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                    {partida.suborden}
                  </td>
                  <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                    {partida.a_disponer}
                  </td>
                  <td className="w-20 text-center border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                    <input
                      type="number"
                      value={partida.rollos}
                      onChange={(e) => handleRollosChange(index, parseInt(e.target.value))}
                      className="w-full border border-gray-300 px-2 py-1 rounded dark:bg-boxdark dark:text-white"
                    />
                  </td>
                  <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                    {partida.peso}
                  </td>
                  <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                    {partida.tintoreria}
                  </td>
                  <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                    <Select
                      value={partida.color}
                      onChange={(e) => handleColorChange(index, e.target.value as string)}
                      displayEmpty
                      className="w-50 h-12 border border-gray-300 px-2 py-1 rounded dark:bg-boxdark dark:text-white"
                    >
                      <MenuItem value="" disabled>Selecciona color</MenuItem>
                      {colores.map(color => (
                        <MenuItem key={color.color_id} value={color.nombre}>
                          {color.nombre}
                        </MenuItem>
                      ))}
                    </Select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Tabla2;
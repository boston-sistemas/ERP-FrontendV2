"use client";

import React, { useState, useEffect } from "react";
import instance from "@/config/AxiosConfig";
import Tabla1 from "./Tabla1";
import Tabla2 from "./Tabla2";
import { TIMEOUT } from "@/components/Parametros/Parametros";
import { Select, MenuItem, Card, CardContent, Typography } from "@mui/material";
import { TbTruckDelivery } from "react-icons/tb";

interface Detalle {
  tejido: string;
  densidad: string;
  ancho: string;
  fibra: string;
  rollos: number;
  cantidad: number;
  kg_por_rollo: number;
  estado: string;
}

export interface Orden {
  hilanderia: string;
  rollos: number;
  peso: number;
  orden: string;
  fecha: string;
  estado: string;
  expandida: Detalle[];
}

interface Color {
  nombre: string;
  descripcion: string | null;
  color_id: number;
}

export interface Suborden {
  tejido: string;
  densidad: string;
  ancho: string;
  fibra: string;
  rollos: number;
  cantidad: number;
  kg_por_rollo: number;
  estado: string;
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

export const roundToTwo = (num: number) => Math.round(num * 100) / 100;

const calculateGlobalState = (detalles: any[]): string => {
  const estados = detalles.map((detalle: { estado: string }) => detalle.estado);
  if (estados.every(estado => estado === "LISTO")) {
    return "LISTO";
  }
  if (estados.some(estado => estado === "DETENIDO")) {
    return "DETENIDO";
  }
  if (estados.some(estado => estado === "EN CURSO")) {
    return "EN CURSO";
  }
  return "NO INICIADO";
};

const processOrderData = (orders: any[]): Orden[] => {
  return orders.map(order => {
    const totalRollos = order.detalles.reduce((sum: number, detalle: { reporte_tejeduria_nro_rollos: number }) => sum + detalle.reporte_tejeduria_nro_rollos, 0);
    const totalPeso = order.detalles.reduce((sum: number, detalle: { reporte_tejeduria_cantidad_kg: string }) => sum + parseFloat(detalle.reporte_tejeduria_cantidad_kg), 0);
    const estado = calculateGlobalState(order.detalles);

    return {
      orden: order.orden_servicio_tejeduria_id,
      hilanderia: "POR DEFINIR",
      fecha: order.fecha.slice(0, 10),
      rollos: totalRollos,
      peso: totalPeso,
      estado: estado,
      expandida: order.detalles.map((detalle: { crudo_id: string; reporte_tejeduria_nro_rollos: number; reporte_tejeduria_cantidad_kg: string; estado: string }) => ({
        tejido: detalle.crudo_id.slice(0, 3),
        densidad: detalle.crudo_id.slice(3, 6),
        ancho: detalle.crudo_id.slice(-2),
        fibra: "POR DEFINIR",
        rollos: detalle.reporte_tejeduria_nro_rollos,
        cantidad: roundToTwo(parseFloat(detalle.reporte_tejeduria_cantidad_kg)),
        kg_por_rollo: roundToTwo(parseFloat(detalle.reporte_tejeduria_cantidad_kg) / detalle.reporte_tejeduria_nro_rollos),
        estado: detalle.estado
      }))
    };
  });
};

const ProgramacionTintoreria: React.FC = () => {
  const [pendienteData, setPendienteData] = useState<Orden[]>([]);
  const [cerradaData, setCerradaData] = useState<Orden[]>([]);
  const [loading, setLoading] = useState(false);
  const [tejeduria, setTejeduria] = useState('');
  const [tintoreria, setTintoreria] = useState('');
  const [tejedurias, setTejedurias] = useState<{ proveedor_id: string; razon_social: string; alias: string }[]>([]);
  const [tintorerias, setTintorerias] = useState<{ proveedor_id: string; razon_social: string; alias: string }[]>([]);
  const [colores, setColores] = useState<Color[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [partidas, setPartidas] = useState<Partida[]>([]);

  const fetchData = async (tejeduriaId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await instance.get(`/operations/v1/programacion-tintoreria/${tejeduriaId}/stock`);
      const data = response.data;
      const pendienteData = processOrderData(data.ordenes);
      const cerradaData = processOrderData(data.ordenes_cerradas || []);
      setPendienteData(pendienteData);
      setCerradaData(cerradaData);
    } catch (error) {
      console.error('Error fetching data', error);
      setError('Error fetching data');
    } finally {
      setTimeout(() => setLoading(false), TIMEOUT);
    }
  };

  const handleParametrosTejTinCol = async () => {
    try {
      const response = await instance.get('/operations/v1/programacion-tintoreria');
      const data = response.data;
      setTejedurias(data.tejedurias);
      setTintorerias(data.tintorerias);
      setColores(data.colores);
    } catch (error) {
      console.error('Error fetching parametros', error);
      setError('Error fetching parametros');
    }
  };

  useEffect(() => {
    handleParametrosTejTinCol();
  }, []);

  const handleTejeduriaChange = (alias: string) => {
    setTejeduria(alias);
    setPendienteData([]);
    setCerradaData([]);
    setError(null);
  };

  const handleUltimoStock = () => {
    if (tejeduria) {
      const selectedTejeduria = tejedurias.find(t => t.alias === tejeduria);
      if (selectedTejeduria) {
        fetchData(selectedTejeduria.proveedor_id);
      }
    } else {
      setError('Por favor, selecciona una tejeduría');
    }
  };

  const handleAgregarPartida = (subordenesSeleccionadas: Suborden[]) => {
    const nuevasPartidas = subordenesSeleccionadas.map((suborden, index) => ({
      id: partidas.length + index + 1,
      hilanderia: 'POR DEFINIR',
      suborden: `${suborden.tejido}-${suborden.densidad}-${suborden.ancho}`,
      a_disponer: suborden.rollos,
      rollos: 0,
      peso: 0,
      kg_por_rollo: suborden.kg_por_rollo,
      tintoreria: tintoreria,
      color: ''
    }));
    setPartidas([...partidas, ...nuevasPartidas]);
  };

  return (
    <div className="space-y-5">
      <div className="overflow-x-auto mb-6">
        <div className="flex items-start space-x-6 min-w-max">
          <Card className="dark:bg-boxdark">
            <CardContent className="flex flex-col items-start space-y-2">
              <Typography variant="subtitle1" className="dark:text-white">Tejeduría</Typography>
              <div>
                <Select
                  value={tejeduria}
                  onChange={(e) => handleTejeduriaChange(e.target.value)}
                  displayEmpty
                  className="w-60 h-12 rounded border-[1.5px] border-stroke bg-transparent px-2 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                >
                  <MenuItem value="" disabled>Selecciona una opción</MenuItem>
                  {tejedurias.map(tejeduria => (
                    <MenuItem key={tejeduria.proveedor_id} value={tejeduria.alias}>{tejeduria.alias}</MenuItem>
                  ))}
                </Select>
                <button
                  onClick={handleUltimoStock}
                  className="ml-5 bg-black border border-gray-300 text-white px-5 py-3 transition duration-200 ease-in-out hover:bg-neutral-600"
                >
                  Obtener Último Stock
                </button>
              </div>
            </CardContent>
          </Card>
          <TbTruckDelivery className="mt-9 text-6xl text-black dark:text-neutral-300" />
          <Card className="dark:bg-boxdark">
            <CardContent className="flex flex-col items-start space-y-2">
              <Typography variant="subtitle1" className="dark:text-white">Tintorería</Typography>
              <div>
                <Select
                  value={tintoreria}
                  onChange={(e) => setTintoreria(e.target.value)}
                  displayEmpty
                  className="w-60 h-12 rounded border-[1.5px] border-stroke bg-transparent px-2 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                >
                  <MenuItem value="" disabled>Selecciona una opción</MenuItem>
                  {tintorerias.map(tintoreria => (
                    <MenuItem key={tintoreria.proveedor_id} value={tintoreria.alias}>{tintoreria.alias}</MenuItem>
                  ))}
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      {error && (
        <div className="text-red-500">{error}</div>
      )}
      <Tabla1 data={pendienteData} loading={loading} fetchData={() => fetchData(tejeduria)} handleAgregarPartida={handleAgregarPartida} />
      <Tabla2 data={cerradaData} loading={loading} colores={colores} partidas={partidas} />
    </div>
  );
};

export default ProgramacionTintoreria;
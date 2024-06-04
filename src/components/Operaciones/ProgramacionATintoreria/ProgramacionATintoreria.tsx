"use client"

import React, { useState, useEffect } from "react";
import instance from "@/config/AxiosConfig";
import Tabla1 from "./Tabla1";
import Tabla2 from "./Tabla2";
import { TIMEOUT } from "@/components/Parametros/TablasStock";
import { Select, MenuItem, Card, CardContent, Typography } from "@mui/material";
import { TbTruckDelivery } from "react-icons/tb";


interface Detalle {
  tejido: string;
  ancho: string;
  programado: number;
  consumido: number;
  restante: number;
  merma: string;
  progreso: string;
  estado: string;
}

export interface Orden {
  orden: string;
  fecha: string;
  tejeduria: string;
  programado: number;
  consumido: number;
  restante: number;
  merma: string;
  progreso: string;
  estado: string;
  expandida: Detalle[];
}

const roundToTwo = (num: number) => Math.round(num * 100) / 100;

const calculateGlobalState = (detalles: any[]): string => {
  const estados = detalles.map((detalle: { estado: string; }) => detalle.estado);
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
    const totalProgramado = roundToTwo(order.detalles.reduce((sum: number, detalle: { cantidad_kg: string; }) => sum + parseFloat(detalle.cantidad_kg), 0));
    const totalConsumido = roundToTwo(order.detalles.reduce((sum: number, detalle: { reporte_tejeduria_cantidad_kg: string; }) => sum + parseFloat(detalle.reporte_tejeduria_cantidad_kg), 0));
    const totalRestante = roundToTwo(totalProgramado - totalConsumido);
    const totalMerma = ((totalRestante / totalProgramado) * 100).toFixed(2) + "%";
    const totalProgreso = ((totalConsumido / totalProgramado) * 100).toFixed(2) + "%";
    const estado = calculateGlobalState(order.detalles);

    return {
      orden: order.orden_servicio_tejeduria_id,
      fecha: order.fecha.slice(0, -9),
      tejeduria: order.tejeduria_id,
      programado: roundToTwo(totalProgramado),
      consumido: roundToTwo(totalConsumido),
      restante: roundToTwo(totalRestante),
      merma: totalMerma,
      progreso: totalProgreso,
      estado: estado,
      expandida: order.detalles.map((detalle: { crudo_id: any; cantidad_kg: any; reporte_tejeduria_cantidad_kg: any; estado: any; }) => ({
        tejido: detalle.crudo_id.slice(0, -2),
        ancho: detalle.crudo_id.slice(-2),
        programado: roundToTwo(parseFloat(detalle.cantidad_kg)),
        consumido: roundToTwo(parseFloat(detalle.reporte_tejeduria_cantidad_kg)),
        restante: roundToTwo(parseFloat(detalle.cantidad_kg) - parseFloat(detalle.reporte_tejeduria_cantidad_kg)),
        merma: ((parseFloat(detalle.cantidad_kg) - parseFloat(detalle.reporte_tejeduria_cantidad_kg)) / parseFloat(detalle.cantidad_kg) * 100).toFixed(2) + "%",
        progreso: (parseFloat(detalle.reporte_tejeduria_cantidad_kg) / parseFloat(detalle.cantidad_kg) * 100).toFixed(2) + "%",
        estado: detalle.estado
      }))
    };
  });
};

const ProgramacionATintoreria: React.FC = () => {
  const [pendienteData, setPendienteData] = useState<Orden[]>([]);
  const [cerradaData, setCerradaData] = useState<Orden[]>([]);
  const [loading, setLoading] = useState(true);
  const [tejeduria, setTejeduria] = useState('');
  const [tintoreria, setTintoreria] = useState('');

  const fetchData = async () => {
    try {
      const response = await instance.get('/operations/v1/revision-stock');
      const data = response.data;
      const pendienteData = processOrderData(data.ordenes_pendientes);
      const cerradaData = processOrderData(data.ordenes_cerradas);
      setPendienteData(pendienteData);
      setCerradaData(cerradaData);
    } catch (error) {
      console.error('Error fetching data', error);
    }
    setTimeout(() => setLoading(false), TIMEOUT);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUltimoStock = () => {
    // Función para obtener el último stock
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
                  onChange={(e) => setTejeduria(e.target.value)}
                  displayEmpty
                  className="w-60 h-12 rounded border-[1.5px] border-stroke bg-transparent px-2 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                >
                  <MenuItem value="" disabled>Selecciona una opción</MenuItem>
                  <MenuItem value="FRA">FRA</MenuItem>
                  <MenuItem value="RSA">RSA</MenuItem>
                  {/* Agregar TEJEDURIAS */}
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
          <TbTruckDelivery className="text-6xl text-black dark:text-neutral-300" />
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
                  <MenuItem value="Color y Textura">Color y Textura</MenuItem>
                  <MenuItem value="Tricot">Tricot</MenuItem>
                  {/* Agregar TINTORERIAS */}
                </Select>
              </div>           
            </CardContent>
          </Card>
        </div>
      </div>
      <Tabla1 data={pendienteData} loading={loading} fetchData={fetchData} />
      <Tabla2 data={cerradaData} loading={loading} />
    </div>
  );
  
  
};

export default ProgramacionATintoreria;

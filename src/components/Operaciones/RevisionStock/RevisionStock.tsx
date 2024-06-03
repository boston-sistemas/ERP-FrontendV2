"use client"

import React, { useState, useEffect } from "react";
import instance from "@/config/AxiosConfig";
import Tabla1 from "./Tabla1";
import Tabla2 from "./Tabla2";
import { TIMEOUT } from "@/components/Parametros/TablasStock";

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
      fecha: "2024-05-28",
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

const RevisionStock: React.FC = () => {
  const [pendienteData, setPendienteData] = useState<Orden[]>([]);
  const [cerradaData, setCerradaData] = useState<Orden[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchData();
  }, []);

  return (
    <div className="space-y-10">
      <Tabla1 data={pendienteData} loading={loading} />
      <Tabla2 data={cerradaData} loading={loading} />
    </div>
  );
};

export default RevisionStock;

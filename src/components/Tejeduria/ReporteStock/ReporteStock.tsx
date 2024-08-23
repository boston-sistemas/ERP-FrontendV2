"use client";

import React, { useState, useEffect } from "react";
import instance from "@/infrastructure/config/AxiosConfig";
import Tabla1 from "./Tabla1";
import { TIMEOUT } from "@/components/Parametros/Parametros";

export interface Suborden {
  os: string;
  tejido: string;
  ancho: string;
  programado: number;
  consumido: number;
  restante: number;
  rollos: number;
  peso: number;
  progreso: string;
  estado: string;
}

const roundToTwo = (num: number) => Math.round(num * 100) / 100;

const processOrderData = (ordenes: any[]): Suborden[] => {
  return ordenes.flatMap((orden) => {
    return orden.detalles.map((detalle: { programado_kg: string; reporte_tejeduria_cantidad_kg: string; crudo_id: string | any[]; orden_servicio_tejeduria_id: any; reporte_tejeduria_nro_rollos: any; estado: any; }) => {
      const programado = roundToTwo(parseFloat(detalle.programado_kg));
      const consumido = roundToTwo(parseFloat(detalle.reporte_tejeduria_cantidad_kg));
      const restante = roundToTwo(programado - consumido);
      const progreso = ((consumido / programado) * 100).toFixed(2) + "%";
      const tejido = detalle.crudo_id.slice(0, -2);
      const ancho = detalle.crudo_id.slice(-2);

      return {
        os: detalle.orden_servicio_tejeduria_id,
        tejido: tejido,
        ancho: ancho,
        programado: programado,
        consumido: consumido,
        rollos: detalle.reporte_tejeduria_nro_rollos,
        peso: detalle.reporte_tejeduria_cantidad_kg,
        restante: restante,
        progreso: progreso,
        estado: detalle.estado
      };
    });
  });
};

const ReporteStock: React.FC = () => {
  const [data, setData] = useState<Suborden[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      console.log("fetching");
      const response = await instance.get("/operations/v1/reporte-stock");
      const ordenes = response.data.ordenes;
      const processedData = processOrderData(ordenes);
      // Ordena los datos por algún campo consistente, por ejemplo 'os'
      const sortedData = processedData.sort((a, b) => a.tejido.localeCompare(b.tejido));
      setData(sortedData);
    } catch (error) {
      console.error("Error fetching data", error);
    }
    setTimeout(() => setLoading(false), TIMEOUT);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-10">
      <Tabla1 data={data} loading={loading} fetchData={fetchData} />
    </div>
  );
};

export default ReporteStock;

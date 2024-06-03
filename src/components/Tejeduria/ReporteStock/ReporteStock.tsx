"use client"

import React, { useState, useEffect } from "react";
import instance from "@/config/AxiosConfig";
import Tabla1 from "./Tabla1";
import { TIMEOUT } from "@/components/Parametros/TablasStock"
export interface Suborden {
  suborden: string;
  programado: number;
  consumido: number;
  restante: number;
  merma: string;
  progreso: string;
  estado: string;
}

const roundToTwo = (num: number) => Math.round(num * 100) / 100;

const processOrderData = (subordenes: any[]): Suborden[] => {
  return subordenes.map(suborden => {
    const programado = roundToTwo(parseFloat(suborden.cantidad_kg));
    const consumido = roundToTwo(parseFloat(suborden.reporte_tejeduria_cantidad_kg));
    const restante = roundToTwo(programado - consumido);
    const merma = ((restante / programado) * 100).toFixed(2) + "%";
    const progreso = ((consumido / programado) * 100).toFixed(2) + "%";

    return {
      suborden: suborden.crudo_id,
      programado: programado,
      consumido: consumido,
      restante: restante,
      merma: merma,
      progreso: progreso,
      estado: suborden.estado
    };
  });
};

const ReporteStock: React.FC = () => {
  const [data, setData] = useState<Suborden[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await instance.get('/operations/v1/reporte-stock');
        const subordenes = response.data.subordenes;
        const processedData = processOrderData(subordenes);
        setData(processedData);
      } catch (error) {
        console.error('Error fetching data', error);
      }
      setTimeout(() => setLoading(false), TIMEOUT); 
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-10">
      <Tabla1 data={data} loading={loading} />
    </div>
  );
};

export default ReporteStock;

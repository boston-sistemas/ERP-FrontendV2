"use client"

import React, { useState, useEffect } from "react";
import instance from "@/config/AxiosConfig";
import Tabla1 from "./Tabla1";
import { TIMEOUT } from "@/components/Parametros/TablasStock"

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

const processOrderData = (subordenes: any[]): Suborden[] => {
  return subordenes.map(suborden => {
    const programado = roundToTwo(parseFloat(suborden.cantidad_kg));
    const consumido = roundToTwo(parseFloat(suborden.reporte_tejeduria_cantidad_kg));
    const restante = roundToTwo(programado - consumido);
    const progreso = ((consumido / programado) * 100).toFixed(2) + "%";
    const tejido = suborden.crudo_id.slice(0, -2);
    const ancho = suborden.crudo_id.slice(-2);

    return {
      os: suborden.orden_servicio_tejeduria_id,
      tejido: tejido,
      ancho: ancho,
      programado: programado,
      consumido: consumido,
      rollos: 0,
      peso: 0,
      restante: restante,
      progreso: progreso,
      estado: suborden.estado
    };
  });
};

const ReporteStock: React.FC = () => {
  const [data, setData] = useState<Suborden[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      console.log("fetching");
      const response = await instance.get('/operations/v1/reporte-stock');
      const subordenes = response.data.subordenes;
      const processedData = processOrderData(subordenes);
      setData(processedData);
    } catch (error) {
      console.error('Error fetching data', error);
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
